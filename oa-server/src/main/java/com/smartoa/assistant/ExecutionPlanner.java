package com.smartoa.assistant;

import com.smartoa.common.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExecutionPlanner {
    private static final Map<String, List<String>> INDICATOR_ALIASES = Map.of(
            "deposit_balance", List.of("存款余额"),
            "avg_deposit", List.of("平均存款", "日均存款", "日均"),
            "loan_deposit_ratio", List.of("贷款占比", "存贷比"));

    private final RegistryLoader loader;
    private final MockDatasetService data;

    public ExecutionPlanner(RegistryLoader loader, MockDatasetService data, ExecutionTraceService ignored) {
        this.loader = loader;
        this.data = data;
    }

    public ExecutionPlan plan(AssistantRequest request, String userId) {
        String text = request.text();
        List<String> exact = matchedIndicators(text);
        String intent = matchIntent(text, exact.isEmpty());
        String org = request.org() != null && !request.org().isBlank() ? request.org() : extractOrg(text);
        List<String> rules = new ArrayList<>();
        rules.add("intent:" + intent);
        if (request.org() != null && !request.org().isBlank()) rules.add("org:explicit");
        else if (org != null) rules.add("org:text");

        String scenarioId;
        String status;
        if (exact.size() > 1) {
            scenarioId = "indicator_candidates";
            status = "candidate";
            rules.add("indicator:multiple_exact");
        } else if (exact.isEmpty()) {
            scenarioId = "indicator_default_prompt";
            status = "unsupported";
            rules.add("indicator:none");
        } else {
            scenarioId = scenarioForIntent(intent).get("id").toString();
            status = "planned";
            rules.add("indicator:exact:" + exact.get(0));
        }
        Map<String, Object> scenario = scenario(scenarioId);
        Map<String, String> slots = new LinkedHashMap<>();
        if (exact.size() == 1) slots.put("indicator", exact.get(0));
        if (exact.size() > 1) slots.put("indicators", String.join(",", exact));
        if (org != null) slots.put("org", org);
        slots.put(intent.equals("compare_indicator") ? "comparisonPeriod" :
                intent.equals("trend_indicator") ? "timeRange" : "time", period(text, intent));
        return new ExecutionPlan(text, userId, intent, scenarioId, Map.copyOf(slots), List.copyOf(rules),
                stringList(scenario.get("skills")), scenario.get("template").toString(),
                stringList(scenario.get("policies")).get(0), status);
    }

    public ExecutionResult execute(ExecutionPlan plan) {
        if ("unsupported".equals(plan.status())) return new ExecutionResult(Map.of(), List.of());
        if ("candidate".equals(plan.status())) return new ExecutionResult(Map.of(), candidates(plan.slots().get("indicators")));
        String org = plan.slots().getOrDefault("org", userOrg(plan.userId()));
        authorize(plan.userId(), org); // Deliberately before every protected dataset value read.
        String indicator = plan.slots().get("indicator");
        String skill = plan.skills().get(0);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("indicator", indicator);
        result.put("org", org);
        if ("read_indicator".equals(skill)) {
            result.put("value", data.getCurrentValue(indicator, org));
        } else if ("compare_indicator".equals(skill)) {
            BigDecimal current = decimal(data.getCurrentValue(indicator, org));
            BigDecimal previous = decimal(data.getPreviousValue(indicator, org));
            BigDecimal difference = current.subtract(previous);
            result.put("current", current);
            result.put("previous", previous);
            result.put("difference", difference);
            result.put("changeRate", previous.signum() == 0 ? null : difference.divide(previous, 8, RoundingMode.HALF_UP));
            if (previous.signum() == 0) result.put("changeRateNote", "previous is zero; changeRate is undefined");
        } else if ("read_trend".equals(skill)) {
            List<Map<String, Object>> trend = new ArrayList<>(data.getTrend(indicator, org));
            trend.sort(Comparator.comparing(point -> point.get("period").toString()));
            result.put("trend", trend);
        } else throw new BusinessException(50020, "unsupported skill [" + skill + "]");
        return new ExecutionResult(result, List.of());
    }

    private String matchIntent(String text, boolean noIndicator) {
        if (matchesIntent(text, "trend_indicator")) return "trend_indicator";
        if (matchesIntent(text, "compare_indicator")) return "compare_indicator";
        return "query_indicator";
    }

    private boolean matchesIntent(String text, String id) {
        return loader.entries("intents.yml", "intents").stream().filter(i -> id.equals(i.get("id")))
                .flatMap(i -> ((List<?>) i.get("keywords")).stream()).anyMatch(k -> text.contains(k.toString()));
    }

    private List<String> matchedIndicators(String text) {
        List<String> exact = INDICATOR_ALIASES.entrySet().stream()
                .filter(e -> e.getValue().stream().anyMatch(text::contains)).map(Map.Entry::getKey).sorted().toList();
        if (!exact.isEmpty()) return exact; // Exact aliases always outrank the broad deposit-family match.
        if (text.contains("存款")) {
            @SuppressWarnings("unchecked")
            Map<String, Object> root = (Map<String, Object>) data.getMock("deposit.json");
            @SuppressWarnings("unchecked")
            Map<String, List<String>> configured = (Map<String, List<String>>) root.get("candidates");
            return configured.getOrDefault("deposit_case", List.of());
        }
        return List.of();
    }

    private String extractOrg(String text) {
        if (text.contains("总部")) return "HEADQUARTERS";
        if (text.contains("本分行") || text.contains("分行")) return "BRANCH_001";
        return null;
    }

    private String period(String text, String intent) {
        if ("trend_indicator".equals(intent)) return text.contains("近三个月") ? "LAST_3_MONTHS" : "AVAILABLE";
        if ("compare_indicator".equals(intent)) return "PREVIOUS";
        return "CURRENT";
    }

    private Map<String, Object> scenarioForIntent(String intent) {
        return loader.entries("scenarios.yml", "scenarios").stream()
                .filter(s -> intent.equals(s.get("intent")) && "standard".equals(s.get("mode"))).findFirst()
                .orElseThrow(() -> new IllegalStateException("no standard scenario for intent [" + intent + "]"));
    }

    private Map<String, Object> scenario(String id) {
        return loader.entries("scenarios.yml", "scenarios").stream().filter(s -> id.equals(s.get("id"))).findFirst()
                .orElseThrow(() -> new IllegalStateException("unknown scenario [" + id + "]"));
    }

    private List<Map<String, Object>> candidates(String codes) {
        List<String> selected = codes == null ? List.of() : List.of(codes.split(","));
        return indicatorEntries().stream().filter(i -> selected.contains(i.get("code")))
                .map(i -> Map.<String, Object>of("code", i.get("code"), "name", i.get("name"), "unit", i.get("unit"))).toList();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> indicatorEntries() {
        Map<String, Object> root = (Map<String, Object>) data.getMock("deposit.json");
        return (List<Map<String, Object>>) (List<?>) root.get("indicators");
    }

    @SuppressWarnings("unchecked")
    private String userOrg(String userId) {
        Map<String, Object> root = (Map<String, Object>) data.getMock("deposit.json");
        return ((List<Map<String, Object>>) (List<?>) root.get("users")).stream()
                .filter(u -> userId.equals(u.get("id"))).map(u -> u.get("org").toString()).findFirst().orElse(null);
    }

    private void authorize(String userId, String targetOrg) {
        String ownOrg = userOrg(userId);
        if (ownOrg == null || targetOrg == null) throw new BusinessException(40411, "unknown org [" + targetOrg + "]");
        if (!"HEADQUARTERS".equals(ownOrg) && !ownOrg.equals(targetOrg))
            throw new BusinessException(40320, "no permission for org [" + targetOrg + "]", HttpStatus.FORBIDDEN);
    }

    private BigDecimal decimal(Object value) { return new BigDecimal(value.toString()); }
    private List<String> stringList(Object value) { return ((List<?>) value).stream().map(Object::toString).toList(); }
    public record ExecutionResult(Map<String, Object> result, List<Map<String, Object>> candidates) {}
}
