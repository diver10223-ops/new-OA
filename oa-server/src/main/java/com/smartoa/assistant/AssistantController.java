package com.smartoa.assistant;

import com.smartoa.common.BusinessException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assistant")
public class AssistantController {
    private final RegistryLoader loader;
    private final ExecutionPlanner planner;
    private final ExecutionTraceService traces;
    private final MockDatasetService mocks;

    public AssistantController(RegistryLoader loader, ExecutionPlanner planner, ExecutionTraceService traces,
                               MockDatasetService mocks) {
        this.loader = loader; this.planner = planner; this.traces = traces; this.mocks = mocks;
    }

    @PostMapping("/execute")
    public ResponseEntity<AssistantResponse> execute(@Valid @RequestBody AssistantRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId) {
        String userId = headerUserId == null || headerUserId.isBlank() ? "demo_branch_manager" : headerUserId;
        ExecutionPlan plan = planner.plan(request, userId);
        ExecutionTraceService.Trace trace = traces.create(plan);
        AssistantResponse response;
        try {
            ExecutionPlanner.ExecutionResult execution = planner.execute(plan);
            String status = "planned".equals(plan.status()) ? "success" : plan.status();
            response = response(trace.id, plan, status, execution.result(), execution.candidates(), Map.of());
        } catch (BusinessException exception) {
            String status = exception.status().value() == 403 ? "denied" : "error";
            response = response(trace.id, plan, status, Map.of(), List.of(),
                    Map.of("code", exception.code(), "message", exception.getMessage()));
        } catch (RuntimeException exception) {
            response = response(trace.id, plan, "error", Map.of(), List.of(),
                    Map.of("code", 50000, "message", exception.getMessage()));
        }
        traces.complete(trace.id, response, plan.skills());
        return ResponseEntity.ok(response);
    }

    private AssistantResponse response(String id, ExecutionPlan plan, String status, Map<String, Object> result,
                                       List<Map<String, Object>> candidates, Map<String, Object> error) {
        List<String> suggestions = "unsupported".equals(status)
                ? List.of("存款余额是多少", "平均存款比上期增加多少", "贷款占比近三个月趋势") : List.of();
        return new AssistantResponse(id, plan.intent(), plan.scenario(), status, plan.slots(),
                plan.matchedRules(), plan.template(), result, candidates, suggestions, error);
    }

    @PostMapping("/continue")
    public ResponseEntity<?> cont(@RequestBody Map<String, Object> req) {
        if (!traces.validateToken((String) req.get("traceId"), (String) req.get("token")))
            return ResponseEntity.badRequest().body(Map.of("error", "invalid_token"));
        return ResponseEntity.ok(Map.of("ok", true));
    }
    @GetMapping("/config/{name}") public ResponseEntity<?> config(@PathVariable String name) {
        Object value = loader.getRegistry(name); return value == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(value);
    }
    @PostMapping("/mock/reset") public Map<String, Object> reset() { mocks.resetAll(); return Map.of("ok", true); }
    @GetMapping("/trace/{id}") public ResponseEntity<?> trace(@PathVariable String id) {
        ExecutionTraceService.Trace trace = traces.get(id); return trace == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(trace);
    }
}
