package com.smartoa.assistant.admin;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class AssistantConfigAdminService {
    private static final Pattern CODE = Pattern.compile("^[a-z][a-z0-9_]{1,63}$");
    private static final Set<String> ROOT_FIELDS = Set.of("users", "indicators", "candidates");
    private static final Set<String> INDICATOR_FIELDS = Set.of("code", "name", "unit", "calculation", "updatedAt", "orgData");
    private static final Set<String> ORG_FIELDS = Set.of("current", "previous", "trend");
    private static final Set<String> TREND_FIELDS = Set.of("period", "value");
    private final ObjectMapper json;
    private final RegistryLoader registries;
    private final MockDatasetService mocks;
    private final Path file;

    public AssistantConfigAdminService(ObjectMapper json, RegistryLoader registries, MockDatasetService mocks) {
        this(json, registries, mocks, Path.of("assistant-config", "mocks", "deposit.json"));
    }

    AssistantConfigAdminService(ObjectMapper json, RegistryLoader registries, MockDatasetService mocks, Path file) {
        this.json = json; this.registries = registries; this.mocks = mocks; this.file = file;
    }

    public ConfigDocument read() throws IOException {
        String content = Files.readString(file, StandardCharsets.UTF_8);
        return new ConfigDocument(content, checksum(content), Files.getLastModifiedTime(file).toInstant().toString());
    }

    public ValidationResult validate(String content) {
        List<ValidationError> errors = new ArrayList<>();
        JsonNode root;
        try { root = json.readTree(content); }
        catch (Exception e) { return new ValidationResult(false, List.of(new ValidationError("$", "JSON 解析失败: " + e.getMessage()))); }
        if (root == null || !root.isObject()) return fail("$", "根节点必须为对象");
        unknown(root, ROOT_FIELDS, "$", errors);
        if (!root.path("users").isArray()) errors.add(error("users", "必须为数组"));
        JsonNode indicators = root.path("indicators");
        if (!indicators.isArray()) errors.add(error("indicators", "必须为数组"));
        Set<String> codes = new HashSet<>();
        if (indicators.isArray()) for (int i = 0; i < indicators.size(); i++) validateIndicator(indicators.get(i), i, codes, errors);
        JsonNode candidates = root.path("candidates");
        if (!candidates.isObject()) errors.add(error("candidates", "必须为对象"));
        else candidates.fields().forEachRemaining(entry -> {
            String base = "candidates." + entry.getKey(); JsonNode values = entry.getValue();
            if (!values.isArray()) errors.add(error(base, "必须为数组"));
            else for (int i = 0; i < values.size(); i++) {
                JsonNode value = values.get(i);
                if (!value.isTextual() || !codes.contains(value.asText())) errors.add(error(base + "[" + i + "]", "引用的指标编码不存在"));
            }
        });
        return new ValidationResult(errors.isEmpty(), errors);
    }

    private void validateIndicator(JsonNode n, int index, Set<String> codes, List<ValidationError> errors) {
        String p = "indicators[" + index + "]";
        if (!n.isObject()) { errors.add(error(p, "必须为对象")); return; }
        unknown(n, INDICATOR_FIELDS, p, errors);
        String code = required(n, "code", p, errors);
        if (code != null && !CODE.matcher(code).matches()) errors.add(error(p + ".code", "必须以小写字母开头且仅含小写字母、数字、下划线，长度 2-64"));
        if (code != null && !codes.add(code)) errors.add(error(p + ".code", "指标编码重复"));
        required(n, "name", p, errors); required(n, "unit", p, errors); required(n, "calculation", p, errors);
        String updated = required(n, "updatedAt", p, errors);
        if (updated != null) try { Instant.parse(updated); } catch (DateTimeParseException e) { errors.add(error(p + ".updatedAt", "必须为有效 ISO-8601 时间")); }
        JsonNode orgData = n.path("orgData");
        if (!orgData.isObject()) { errors.add(error(p + ".orgData", "必须为对象")); return; }
        orgData.fields().forEachRemaining(org -> validateOrg(org.getKey(), org.getValue(), p + ".orgData", errors));
    }

    private void validateOrg(String key, JsonNode n, String base, List<ValidationError> errors) {
        String p = base + "." + key;
        if (key.isBlank()) errors.add(error(base, "机构编码不能为空"));
        if (!n.isObject()) { errors.add(error(p, "必须为对象")); return; }
        unknown(n, ORG_FIELDS, p, errors); finite(n.get("current"), p + ".current", errors); finite(n.get("previous"), p + ".previous", errors);
        JsonNode trend = n.path("trend");
        if (!trend.isArray()) { errors.add(error(p + ".trend", "必须为数组")); return; }
        Set<String> periods = new HashSet<>();
        for (int i = 0; i < trend.size(); i++) {
            JsonNode point = trend.get(i); String tp = p + ".trend[" + i + "]";
            if (!point.isObject()) { errors.add(error(tp, "必须为对象")); continue; }
            unknown(point, TREND_FIELDS, tp, errors); String period = required(point, "period", tp, errors);
            if (period != null && !periods.add(period)) errors.add(error(tp + ".period", "同一机构下期间必须唯一"));
            finite(point.get("value"), tp + ".value", errors);
        }
    }

    private String required(JsonNode n, String field, String p, List<ValidationError> errors) {
        JsonNode value = n.get(field);
        if (value == null || !value.isTextual() || value.asText().trim().isEmpty()) { errors.add(error(p + "." + field, "必填且必须为非空文本")); return null; }
        return value.asText().trim();
    }
    private void finite(JsonNode n, String p, List<ValidationError> errors) { if (n == null || !n.isNumber() || !Double.isFinite(n.asDouble())) errors.add(error(p, "必须为有限数值")); }
    private void unknown(JsonNode n, Set<String> allowed, String p, List<ValidationError> errors) { Iterator<String> names = n.fieldNames(); while (names.hasNext()) { String name = names.next(); if (!allowed.contains(name)) errors.add(error(p + "." + name, "禁止未知字段")); } }
    private ValidationResult fail(String p, String m) { return new ValidationResult(false, List.of(error(p, m))); }
    private ValidationError error(String p, String m) { return new ValidationError(p, m); }

    public synchronized ConfigDocument save(String content, String expectedChecksum) throws Exception {
        ValidationResult result = validate(content); if (!result.valid()) throw new InvalidConfigException(result);
        ConfigDocument current = read(); if (expectedChecksum == null || !current.checksum().equals(expectedChecksum)) throw new ChecksumConflictException();
        Path backup = file.resolveSibling(file.getFileName() + ".bak"); Path temp = Files.createTempFile(file.getParent(), "deposit-", ".tmp");
        Files.copy(file, backup, StandardCopyOption.REPLACE_EXISTING); Files.writeString(temp, content, StandardCharsets.UTF_8);
        try {
            try { Files.move(temp, file, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING); }
            catch (AtomicMoveNotSupportedException e) { Files.move(temp, file, StandardCopyOption.REPLACE_EXISTING); }
            try { registries.load(); mocks.reload(); }
            catch (Exception loadFailure) { Files.copy(backup, file, StandardCopyOption.REPLACE_EXISTING); registries.load(); mocks.reload(); throw loadFailure; }
            return read();
        } finally { Files.deleteIfExists(temp); }
    }

    public List<MetricReference> references(String code) throws IOException {
        if (!CODE.matcher(code).matches()) throw new IllegalArgumentException("指标编码格式不合法");
        JsonNode root = json.readTree(read().content()); JsonNode metric = null;
        for (JsonNode item : root.path("indicators")) if (code.equals(item.path("code").asText())) metric = item;
        if (metric == null) throw new IllegalArgumentException("指标不存在");
        String name = metric.path("name").asText(); List<MetricReference> refs = new ArrayList<>();
        root.path("candidates").fields().forEachRemaining(e -> { for (JsonNode v : e.getValue()) if (code.equals(v.asText())) refs.add(new MetricReference("deposit.json", e.getKey(), "严格引用", code, true, "候选列表直接引用指标编码")); });
        scanRegistry("intents.yml", registries.getRegistry("intents.yml"), name, refs);
        Object scenarios = registries.getRegistry("scenarios.yml"); if (scenarios != null) refs.add(new MetricReference("scenarios.yml", "指标查询场景", "间接能力", "indicator", false, "场景通过指标查询能力间接使用；当前仅完成已知配置引用检查"));
        if (metric.path("orgData").size() > 0) refs.add(new MetricReference("deposit.json", code, "数据影响", metric.path("orgData").size() + " 个机构", false, "删除会移除当前 Mock 机构及趋势数据"));
        return refs;
    }
    private void scanRegistry(String source, Object value, String name, List<MetricReference> refs) {
        if (value == null || name.isBlank()) return; String text;
        try { text = json.writeValueAsString(value); } catch (Exception e) { return; }
        if (text.contains(name)) refs.add(new MetricReference(source, "意图示例/关键词", "文本关联", name, false, "名称文本命中，属于可能引用"));
    }
    private String checksum(String content) { try { byte[] bytes = MessageDigest.getInstance("SHA-256").digest(content.getBytes(StandardCharsets.UTF_8)); return java.util.HexFormat.of().formatHex(bytes); } catch (Exception e) { throw new IllegalStateException(e); } }

    public record ConfigDocument(String content, String checksum, String updatedAt) {}
    public record ValidationError(String path, String message) {}
    public record ValidationResult(boolean valid, List<ValidationError> errors) {}
    public record MetricReference(String source, String object, String type, String match, boolean blocksDeletion, String note) {}
    public static class ChecksumConflictException extends RuntimeException {}
    public static class InvalidConfigException extends RuntimeException { private final ValidationResult result; InvalidConfigException(ValidationResult r) { this.result = r; } public ValidationResult result() { return result; } }
}
