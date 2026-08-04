package com.smartoa.assistant.admin;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.smartoa.assistant.MockDatasetService;
import com.smartoa.assistant.RegistryLoader;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class AssistantConfigAdminService {
    private static final Map<String, Spec> SPECS = Map.of(
            "intents", new Spec("intents.yml", "intents", "id", "YAML"),
            "scenarios", new Spec("scenarios.yml", "scenarios", "id", "YAML"),
            "skills", new Spec("skills.yml", "skills", "id", "YAML"),
            "templates", new Spec("templates.yml", "templates", "id", "YAML"),
            "policies", new Spec("policies.yml", "policies", "id", "YAML"),
            "deposit", new Spec("mocks/deposit.json", "indicators", "code", "JSON"));

    private final ObjectMapper json = new ObjectMapper();
    private final ObjectMapper yaml = new ObjectMapper(new YAMLFactory());
    private final RegistryLoader registryLoader;
    private final MockDatasetService mockDatasetService;
    private final Path root = Path.of("assistant-config").toAbsolutePath().normalize();
    private volatile Instant lastLoadedAt = Instant.now();
    private volatile Map<String, Object> lastSave = Map.of();

    public AssistantConfigAdminService(RegistryLoader registryLoader, MockDatasetService mockDatasetService) {
        this.registryLoader = registryLoader;
        this.mockDatasetService = mockDatasetService;
    }

    public List<Map<String, Object>> list() throws IOException {
        List<Map<String, Object>> result = new ArrayList<>();
        for (var entry : SPECS.entrySet()) {
            Path path = safePath(entry.getKey());
            Map<String, Object> data = parse(entry.getValue(), Files.readString(path));
            result.add(Map.of("key", entry.getKey(), "file", entry.getValue().file(), "format", entry.getValue().format(),
                    "count", collection(data, entry.getValue().top()).size(), "checksum", checksum(path),
                    "updatedAt", Files.getLastModifiedTime(path).toInstant().toString()));
        }
        return result.stream().sorted((a, b) -> a.get("key").toString().compareTo(b.get("key").toString())).toList();
    }

    public Map<String, Object> get(String key) throws IOException {
        Spec spec = spec(key); Path path = safePath(key); String content = Files.readString(path);
        return Map.of("key", key, "file", spec.file(), "format", spec.format(), "data", parse(spec, content),
                "content", content, "checksum", checksum(path), "updatedAt", Files.getLastModifiedTime(path).toInstant().toString());
    }

    public Map<String, Object> validate(String key, String content) throws IOException {
        List<Map<String, String>> errors = new ArrayList<>();
        Map<String, Map<String, Object>> all = new LinkedHashMap<>();
        for (String candidate : SPECS.keySet()) {
            try {
                all.put(candidate, candidate.equals(key) ? parse(spec(key), content)
                        : parse(spec(candidate), Files.readString(safePath(candidate))));
            } catch (Exception e) {
                errors.add(error(key, "", "syntax", e.getMessage()));
                return validationResult(errors, List.of(), Map.of());
            }
        }
        validateIds(key, all.get(key), spec(key), errors);
        validateTemplates(all.get("templates"), errors);
        validateDeposit(all.get("deposit"), errors);
        Map<String, Object> references = buildReferences(all, errors);
        return validationResult(errors, List.of(), references);
    }

    public synchronized Map<String, Object> save(String key, SaveRequest request) throws Exception {
        Path target = safePath(key);
        if (!checksum(target).equals(request.expectedChecksum())) throw new ChecksumConflictException();
        Map<String, Object> validation = validate(key, request.content());
        if (!Boolean.TRUE.equals(validation.get("valid"))) throw new InvalidDraftException(validation);
        Path temp = Files.createTempFile(target.getParent(), ".assistant-admin-", ".tmp");
        Path backups = root.resolve(".backups"); Files.createDirectories(backups);
        Path backup = backups.resolve(spec(key).file().replace('/', '_') + "." + System.currentTimeMillis() + ".bak");
        Files.copy(target, backup, StandardCopyOption.COPY_ATTRIBUTES);
        try {
            Files.writeString(temp, request.content(), StandardCharsets.UTF_8);
            move(temp, target);
            try { registryLoader.load(); mockDatasetService.init(); }
            catch (Exception reloadFailure) {
                Files.copy(backup, target, StandardCopyOption.REPLACE_EXISTING);
                registryLoader.load(); mockDatasetService.init();
                throw new IllegalStateException("配置重新加载失败，已恢复旧文件: " + reloadFailure.getMessage(), reloadFailure);
            }
        } finally { Files.deleteIfExists(temp); }
        lastLoadedAt = Instant.now();
        lastSave = Map.of("key", key, "changeNote", request.changeNote(), "savedAt", lastLoadedAt.toString(), "success", true);
        return Map.of("key", key, "checksum", checksum(target), "updatedAt", Files.getLastModifiedTime(target).toInstant().toString(),
                "backup", backup.getFileName().toString(), "loaded", true);
    }

    public Map<String, Object> summary() throws IOException {
        Map<String, Integer> counts = new LinkedHashMap<>();
        for (Map<String, Object> item : list()) counts.put(item.get("key").toString(), (Integer) item.get("count"));
        Map<?, ?> deposit = (Map<?, ?>) get("deposit").get("data");
        counts.put("users", deposit.get("users") instanceof List<?> v ? v.size() : 0);
        Set<String> orgs = new LinkedHashSet<>();
        if (deposit.get("users") instanceof List<?> users) for (Object u : users) if (u instanceof Map<?, ?> m) orgs.add(String.valueOf(m.get("org")));
        counts.put("organizations", orgs.size());
        return Map.of("counts", counts, "loaded", true, "lastLoadedAt", lastLoadedAt.toString(), "lastSave", lastSave);
    }

    public Map<String, Object> references() throws IOException {
        Map<String, Map<String, Object>> all = new LinkedHashMap<>();
        for (String key : SPECS.keySet()) all.put(key, parse(spec(key), Files.readString(safePath(key))));
        return buildReferences(all, new ArrayList<>());
    }

    private Map<String, Object> buildReferences(Map<String, Map<String, Object>> all, List<Map<String, String>> errors) {
        Map<String, Set<String>> known = new LinkedHashMap<>();
        for (String key : List.of("intents", "skills", "templates", "policies")) known.put(key, ids(all.get(key), key, "id"));
        List<Map<String, Object>> edges = new ArrayList<>();
        for (Map<String, Object> scenario : collection(all.get("scenarios"), "scenarios")) {
            String sid = String.valueOf(scenario.getOrDefault("id", ""));
            ref(edges, errors, known.get("intents"), "intent", scenario.get("intent"), sid);
            ref(edges, errors, known.get("templates"), "template", scenario.get("template"), sid);
            refs(edges, errors, known.get("skills"), "skill", scenario.get("skills"), sid);
            refs(edges, errors, known.get("policies"), "policy", scenario.get("policies"), sid);
        }
        return Map.of("edges", edges, "counts", Map.of("edges", edges.size(), "scenarios", collection(all.get("scenarios"), "scenarios").size()));
    }

    private void ref(List<Map<String, Object>> edges, List<Map<String, String>> errors, Set<String> known, String type, Object value, String sid) {
        String target = value instanceof String ? (String) value : "";
        if (!known.contains(target)) errors.add(error("scenarios", sid, type, "引用不存在: " + target));
        else edges.add(Map.of("fromType", "scenario", "from", sid, "toType", type, "to", target));
    }
    private void refs(List<Map<String, Object>> e, List<Map<String, String>> errors, Set<String> known, String type, Object values, String sid) {
        if (!(values instanceof List<?> list)) { errors.add(error("scenarios", sid, type + "s", "必须是数组")); return; }
        for (Object value : list) ref(e, errors, known, type, value, sid);
    }
    private void validateIds(String key, Map<String, Object> data, Spec spec, List<Map<String, String>> errors) {
        Object raw = data.get(spec.top());
        if (!(raw instanceof List<?>)) { errors.add(error(key, "", spec.top(), "顶层字段必须是数组")); return; }
        Set<String> seen = new LinkedHashSet<>();
        for (Map<String, Object> item : collection(data, spec.top())) {
            Object id = item.get(spec.id()); String value = id instanceof String ? ((String) id).trim() : "";
            if (value.isEmpty()) errors.add(error(key, "", spec.id(), "ID 不能为空"));
            else if (!seen.add(value)) errors.add(error(key, value, spec.id(), "ID 重复"));
        }
    }
    private void validateTemplates(Map<String, Object> data, List<Map<String, String>> errors) {
        for (Map<String, Object> item : collection(data, "templates")) if (!(item.get("view") instanceof String))
            errors.add(error("templates", String.valueOf(item.get("id")), "view", "view 必须是文本"));
    }
    private void validateDeposit(Map<String, Object> data, List<Map<String, String>> errors) {
        validateIds("deposit", data, spec("deposit"), errors);
        for (Map<String, Object> indicator : collection(data, "indicators")) {
            String code = String.valueOf(indicator.get("code"));
            if (!(indicator.get("orgData") instanceof Map<?, ?> orgs)) { errors.add(error("deposit", code, "orgData", "必须是对象")); continue; }
            for (var org : orgs.entrySet()) {
                if (!(org.getValue() instanceof Map<?, ?> values) || !(values.get("trend") instanceof List<?> trend)) { errors.add(error("deposit", code, "orgData." + org.getKey(), "必须包含 trend 数组")); continue; }
                for (Object point : trend) if (!(point instanceof Map<?, ?> p) || !(p.get("period") instanceof String) || !(p.get("value") instanceof Number))
                    errors.add(error("deposit", code, "trend", "趋势点必须包含文本 period 和数值 value"));
            }
        }
    }
    private Set<String> ids(Map<String, Object> root, String top, String id) { Set<String> result = new LinkedHashSet<>(); for (Map<String,Object> x : collection(root, top)) if (x.get(id) instanceof String s) result.add(s); return result; }
    @SuppressWarnings("unchecked") private List<Map<String, Object>> collection(Map<String, Object> root, String top) { Object value = root.get(top); if (!(value instanceof List<?>)) return List.of(); return (List<Map<String,Object>>)(List<?>)value; }
    @SuppressWarnings("unchecked") private Map<String, Object> parse(Spec spec, String content) throws JsonProcessingException { Object value = ("JSON".equals(spec.format()) ? json : yaml).readValue(content, Object.class); if (!(value instanceof Map<?,?>)) throw new IllegalArgumentException("顶层必须是对象"); return (Map<String,Object>) value; }
    private Map<String, Object> validationResult(List<Map<String,String>> errors, List<?> warnings, Map<String,Object> refs) { return Map.of("valid", errors.isEmpty(), "errors", errors, "warnings", warnings, "references", refs); }
    private Map<String,String> error(String config, String id, String field, String message) { return Map.of("config", config, "entryId", id, "field", field, "message", message == null ? "解析失败" : message); }
    private Spec spec(String key) { Spec value = SPECS.get(key); if (value == null) throw new IllegalArgumentException("不允许的配置 key"); return value; }
    private Path safePath(String key) throws IOException { Path base = root.toRealPath(LinkOption.NOFOLLOW_LINKS); Path path = root.resolve(spec(key).file()).normalize(); if (!path.startsWith(root) || Files.isSymbolicLink(path) || !path.toRealPath(LinkOption.NOFOLLOW_LINKS).startsWith(base)) throw new IllegalArgumentException("配置路径不安全"); return path; }
    private String checksum(Path path) throws IOException { try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(Files.readAllBytes(path))); } catch (Exception e) { throw new IOException(e); } }
    private void move(Path source, Path target) throws IOException { Files.move(source, target, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING); }
    private record Spec(String file, String top, String id, String format) {}
    @JsonIgnoreProperties(ignoreUnknown = false)
    public record SaveRequest(String content, String expectedChecksum, String changeNote) { public SaveRequest { if (content == null || expectedChecksum == null || changeNote == null || expectedChecksum.isBlank() || changeNote.isBlank()) throw new IllegalArgumentException("仅允许且必须提供 content、expectedChecksum、changeNote，校验和与变更说明不能为空"); } }
    public static class ChecksumConflictException extends RuntimeException {}
    public static class InvalidDraftException extends RuntimeException { private final Map<String,Object> result; InvalidDraftException(Map<String,Object> result) { this.result=result; } public Map<String,Object> result(){return result;} }
}
