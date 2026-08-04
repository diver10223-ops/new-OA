package com.smartoa.assistant;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class ExecutionPlannerTest {
    private RegistryLoader registry;
    private ExecutionPlanner planner;

    @BeforeEach void setUp() throws Exception {
        registry = new RegistryLoader(Path.of("..", "assistant-config")); registry.load();
        MockDatasetService data = new MockDatasetService(Path.of("..", "assistant-config", "mocks")); data.init();
        planner = new ExecutionPlanner(registry, data, new ExecutionTraceService());
    }

    @Test void plansThreeConfiguredIntentPaths() {
        assertPlan("本分行存款余额是多少", "query_indicator", "deposit_balance", "query_indicator_standard");
        assertPlan("总部平均存款比上期增加多少", "compare_indicator", "avg_deposit", "compare_indicator_standard");
        assertPlan("贷款占比近三个月趋势", "trend_indicator", "loan_deposit_ratio", "trend_indicator_standard");
    }

    @Test void appliesCandidateUnsupportedAndExplicitOrgRules() {
        assertThat(plan("存款余额和平均存款是多少", null).status()).isEqualTo("candidate");
        ExecutionPlan unsupported = plan("今天天气怎么样", null);
        assertThat(unsupported.status()).isEqualTo("unsupported");
        assertThat(unsupported.template()).isEqualTo("default_prompt");
        assertThat(plan("总部存款余额是多少", "BRANCH_001").slots()).containsEntry("org", "BRANCH_001");
    }

    @Test void calculatesComparisonAndSortsTrend() {
        var comparison = planner.execute(plan("总部平均存款比上期增加多少", null)).result();
        assertThat(comparison.get("difference")).isEqualTo(new BigDecimal("500000"));
        assertThat(comparison.get("changeRate")).isEqualTo(new BigDecimal("0.01265823"));
        var trend = (java.util.List<java.util.Map<String, Object>>) planner.execute(
                plan("总部贷款占比近三个月趋势", null)).result().get("trend");
        assertThat(trend).extracting(p -> p.get("period")).containsExactly("2026-05", "2026-06", "2026-07");
    }

    @Test void everyPlanReferenceExistsInRegistry() {
        ExecutionPlan plan = plan("总部存款余额是多少", null);
        assertThat(ids("intents.yml", "intents")).contains(plan.intent());
        assertThat(ids("scenarios.yml", "scenarios")).contains(plan.scenario());
        assertThat(ids("skills.yml", "skills")).containsAll(plan.skills());
        assertThat(ids("templates.yml", "templates")).contains(plan.template());
        assertThat(ids("policies.yml", "policies")).contains(plan.policy());
    }

    private void assertPlan(String text, String intent, String indicator, String scenario) {
        ExecutionPlan plan = plan(text, null);
        assertThat(plan.intent()).isEqualTo(intent); assertThat(plan.scenario()).isEqualTo(scenario);
        assertThat(plan.slots()).containsEntry("indicator", indicator);
    }
    private ExecutionPlan plan(String text, String org) { return planner.plan(new AssistantRequest(text, org), "demo_leader"); }
    private java.util.List<String> ids(String file, String key) {
        return registry.entries(file, key).stream().map(e -> e.get("id").toString()).toList();
    }
}
