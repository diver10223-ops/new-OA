package com.smartoa.assistant.admin;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.smartoa.assistant.MockDatasetService;
import com.smartoa.assistant.RegistryLoader;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class AssistantConfigAdminService {
    private static final Map<String, String> FILES = Map.of(
            "intents", "intents.yml", "scenarios", "scenarios.yml", "skills", "skills.yml",
            "templates", "templates.yml", "policies", "policies.yml", "mock", "mocks/deposit.json");
    private final ObjectMapper json = new ObjectMapper();
    private final ObjectMapper yaml = new ObjectMapper(new YAMLFactory());
    private final Path root = Path.of("assistant-config");
    private final RegistryLoader loader;
    private final MockDatasetService mocks;
    private volatile Map<String, Object> lastSave = Map.of();

    public AssistantConfigAdminService(RegistryLoader loader, MockDatasetService mocks) {
        this.loader = loader;
        this.mocks = mocks;
    }

    public List<Map<String, Object>> list() throws IOException {
        List<Map<String, Object>> result = new ArrayList<>();
        for (String key : FILES.keySet().stream().sorted().toList()) result.add(metadata(key));
        return result;
    }

    public Map<String, Object> read(String key) throws IOException {
        Path path = path(key); String content = Files.readString(path);
        Map<String, Object> result = new LinkedHashMap<>(metadata(key));
        result.put("content", content); return result;
    }

    public Map<String, Object> validate(String key, String content) {
        List<String> errors = new ArrayList<>();
        try { mapper(key).readTree(content); } catch (Exception e) { errors.add(e.getMessage()); }
        return Map.of("valid", errors.isEmpty(), "errors", errors);
    }

    public synchronized Map<String, Object> save(String key, String content, String expectedChecksum) throws Exception {
        Map<String, Object> validation = validate(key, content);
        if (!Boolean.TRUE.equals(validation.get("valid"))) throw new InvalidConfigException(validation);
        Path target = path(key); String current = Files.readString(target);
        if (!checksum(current).equals(expectedChecksum)) throw new ChecksumConflictException();
        Path backupDir = root.resolve(".backups"); Files.createDirectories(backupDir);
        Path backup = backupDir.resolve(target.getFileName() + "." + System.currentTimeMillis() + ".bak");
        Files.copy(target, backup, StandardCopyOption.REPLACE_EXISTING);
        Path temp = Files.createTempFile(target.getParent(), target.getFileName().toString(), ".tmp");
        try {
            Files.writeString(temp, content, StandardCharsets.UTF_8);
            move(temp, target);
            try { loader.load(); mocks.init(); }
            catch (Exception loadFailure) { Files.copy(backup, target, StandardCopyOption.REPLACE_EXISTING); loader.load(); mocks.init(); throw loadFailure; }
            lastSave = Map.of("configKey", key, "savedAt", Instant.now().toString(), "success", true);
            return read(key);
        } finally { Files.deleteIfExists(temp); }
    }

    public Map<String, Object> summary() throws IOException {
        Map<String, Object> counts = new LinkedHashMap<>();
        for (String key : FILES.keySet()) {
            JsonNode tree = mapper(key).readTree(Files.readString(path(key)));
            int count = 0;
            if (tree.isObject()) for (JsonNode value : tree) if (value.isArray()) count += value.size();
            counts.put(key, count);
        }
        JsonNode mock = json.readTree(Files.readString(path("mock")));
        counts.put("demoUsers", mock.path("users").size());
        Set<String> orgs = new java.util.HashSet<>(); mock.path("users").forEach(u -> orgs.add(u.path("org").asText()));
        counts.put("demoOrgs", orgs.size()); counts.put("indicators", mock.path("indicators").size());
        return Map.of("loaded", !loader.getAll().isEmpty(), "lastLoadedAt", Instant.ofEpochMilli(latestModified()).toString(),
                "lastSave", lastSave, "counts", counts, "configs", list());
    }

    public Map<String, Object> references() throws IOException {
        JsonNode scenarios = yaml.readTree(Files.readString(path("scenarios"))).path("scenarios");
        Map<String, Set<String>> known = Map.of("intent", ids("intents", "intents"), "skills", ids("skills", "skills"),
                "template", ids("templates", "templates"), "policies", ids("policies", "policies"));
        List<Map<String, Object>> links = new ArrayList<>(); List<String> missing = new ArrayList<>();
        scenarios.forEach(s -> {
            String scenario = s.path("id").asText(); checkLink(links, missing, scenario, "intent", s.path("intent").asText(), known.get("intent"));
            checkLink(links, missing, scenario, "template", s.path("template").asText(), known.get("template"));
            s.path("skills").forEach(v -> checkLink(links, missing, scenario, "skill", v.asText(), known.get("skills")));
            s.path("policies").forEach(v -> checkLink(links, missing, scenario, "policy", v.asText(), known.get("policies")));
        });
        return Map.of("references", links, "missing", missing, "valid", missing.isEmpty());
    }

    private void checkLink(List<Map<String,Object>> links, List<String> missing, String from, String type, String to, Set<String> known) {
        boolean valid = known.contains(to); links.add(Map.of("scenario", from, "type", type, "target", to, "valid", valid));
        if (!valid) missing.add(from + " -> " + type + ":" + to);
    }
    private Set<String> ids(String key, String array) throws IOException { Set<String> out = new java.util.HashSet<>(); yaml.readTree(Files.readString(path(key))).path(array).forEach(v -> out.add(v.path("id").asText())); return out; }
    private long latestModified() throws IOException { long max=0; for(String key:FILES.keySet()) max=Math.max(max, Files.getLastModifiedTime(path(key)).toMillis()); return max; }
    private Map<String,Object> metadata(String key) throws IOException { Path p=path(key); String c=Files.readString(p); return Map.of("configKey",key,"checksum",checksum(c),"updatedAt",Files.getLastModifiedTime(p).toInstant().toString()); }
    private ObjectMapper mapper(String key) { return "mock".equals(key) ? json : yaml; }
    private Path path(String key) { String file=FILES.get(key); if(file==null) throw new UnknownConfigException(); return root.resolve(file); }
    private void move(Path from, Path to) throws IOException { try { Files.move(from,to,StandardCopyOption.ATOMIC_MOVE,StandardCopyOption.REPLACE_EXISTING); } catch(AtomicMoveNotSupportedException e) { Files.move(from,to,StandardCopyOption.REPLACE_EXISTING); } }
    static String checksum(String content) { try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(content.getBytes(StandardCharsets.UTF_8))); } catch(Exception e) { throw new IllegalStateException(e); } }
    public static class UnknownConfigException extends RuntimeException {}
    public static class ChecksumConflictException extends RuntimeException {}
    public static class InvalidConfigException extends RuntimeException { public final Map<String,Object> validation; InvalidConfigException(Map<String,Object> v){validation=v;} }
}
