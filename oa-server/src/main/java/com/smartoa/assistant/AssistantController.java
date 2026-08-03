package com.smartoa.assistant;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/assistant")
public class AssistantController {

    private final RegistryLoader loader;
    private final ExecutionPlanner planner;
    private final ExecutionTraceService traceService;
    private final MockDatasetService mockService;

    public AssistantController(RegistryLoader loader, ExecutionPlanner planner, ExecutionTraceService traceService, MockDatasetService mockService) {
        this.loader = loader;
        this.planner = planner;
        this.traceService = traceService;
        this.mockService = mockService;
    }

    @PostMapping("/execute")
    public ResponseEntity<?> execute(@RequestBody Map<String,Object> req, @RequestHeader(value="X-User-Id", required=false) String userId) {
        String text = (String) req.getOrDefault("text","");
        String mode = (String) req.getOrDefault("mode","A");
        Map<String,Object> plan = planner.plan(text, userId==null?"demo_branch_manager":userId, mode);
        ExecutionTraceService.Trace trace = traceService.create(text, plan);
        // simulate permission guard: if user org != target org and not HEADQUARTERS then deny value
        String org = (String)plan.get("org");
        boolean allowed = true;
        if ("BRANCH_001".equals(org) && "demo_branch_manager".equals(userId)==false && userId!=null && !userId.contains("demo")) {
            allowed = false;
        }
        Map<String,Object> result = planner.executePlan(plan);
        if (!allowed) {
            result.put("value", null);
            result.put("denied", true);
            result.put("reason", "no_permission");
        } else {
            result.put("denied", false);
        }
        traceService.saveResult(trace.id, result);
        Map<String,Object> resp = Map.of("traceId", trace.id, "result", result);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/continue")
    public ResponseEntity<?> cont(@RequestBody Map<String,Object> req) {
        String traceId = (String) req.get("traceId");
        String token = (String) req.get("token");
        if (!traceService.validateToken(traceId, token)) {
            return ResponseEntity.status(400).body(Map.of("error","invalid_token"));
        }
        // in demo, write ops update in-memory mock (not implemented here, placeholder)
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/config/{name}")
    public ResponseEntity<?> config(@PathVariable String name) {
        Object c = loader.getRegistry(name);
        if (c==null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(c);
    }

    @PostMapping("/mock/reset")
    public ResponseEntity<?> mockReset() {
        mockService.resetAll();
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/trace/{id}")
    public ResponseEntity<?> trace(@PathVariable String id) {
        ExecutionTraceService.Trace t = traceService.get(id);
        if (t==null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(t);
    }
}
