package com.smartoa.assistant;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class AssistantControllerTest {
    private AssistantController controller;
    private ExecutionTraceService traces;

    @BeforeEach void setUp() throws Exception {
        RegistryLoader registry = new RegistryLoader(Path.of("..", "assistant-config")); registry.load();
        MockDatasetService data = new MockDatasetService(Path.of("..", "assistant-config", "mocks")); data.init();
        traces = new ExecutionTraceService();
        controller = new AssistantController(registry, new ExecutionPlanner(registry, data, traces), traces, data);
    }

    @Test void returnsStableResponseAndCompleteOrderedTrace() {
        AssistantResponse response = controller.execute(new AssistantRequest("本分行存款余额是多少", null), null).getBody();
        assertThat(response).isNotNull();
        assertThat(response.status()).isEqualTo("success");
        assertThat(response.slots()).containsKeys("indicator", "org", "time");
        assertThat(response.matchedRules()).isNotEmpty();
        assertThat(response.result()).containsKey("value");
        assertThat(traces.get(response.traceId()).stages).extracting(ExecutionTraceService.TraceEvent::stage)
                .containsExactly(ExecutionTraceService.Stage.values());
    }

    @Test void permissionIsDeniedAndUnknownOrgIsBusinessError() {
        AssistantResponse denied = controller.execute(
                new AssistantRequest("总部存款余额是多少", null), "demo_branch_manager").getBody();
        assertThat(denied.status()).isEqualTo("denied");
        assertThat(denied.result()).isEmpty();
        AssistantResponse unknown = controller.execute(
                new AssistantRequest("存款余额是多少", "UNKNOWN"), "demo_leader").getBody();
        assertThat(unknown.status()).isEqualTo("error");
        assertThat(unknown.error()).containsKeys("code", "message");
    }
}
