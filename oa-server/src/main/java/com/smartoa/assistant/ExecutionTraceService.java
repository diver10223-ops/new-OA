package com.smartoa.assistant;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ExecutionTraceService {
    public enum Stage { INPUT_RECEIVED, INTENT_MATCHED, SLOTS_EXTRACTED, SCENARIO_SELECTED,
        SKILL_EXECUTED, TEMPLATE_SELECTED, RESULT_CREATED }
    public record TraceEvent(Stage stage, Instant at, Map<String, Object> details) {}
    public static class Trace {
        public String id;
        public Instant created = Instant.now();
        public String text;
        public ExecutionPlan plan;
        public AssistantResponse response;
        public final List<TraceEvent> stages = new ArrayList<>();
        public String confirmToken;
    }

    private final ConcurrentHashMap<String, Trace> traces = new ConcurrentHashMap<>();

    public Trace create(ExecutionPlan plan) {
        Trace trace = new Trace();
        trace.id = UUID.randomUUID().toString();
        trace.text = plan.text();
        trace.plan = plan;
        add(trace, Stage.INPUT_RECEIVED, Map.of("text", plan.text()));
        add(trace, Stage.INTENT_MATCHED, Map.of("intent", plan.intent(), "matchedRules", plan.matchedRules()));
        add(trace, Stage.SLOTS_EXTRACTED, Map.of("slots", plan.slots()));
        add(trace, Stage.SCENARIO_SELECTED, Map.of("scenario", plan.scenario()));
        traces.put(trace.id, trace);
        return trace;
    }

    public void complete(String id, AssistantResponse response, List<String> skills) {
        Trace trace = traces.get(id);
        if (trace == null) return;
        add(trace, Stage.SKILL_EXECUTED, Map.of("skills", skills));
        add(trace, Stage.TEMPLATE_SELECTED, Map.of("template", response.template()));
        add(trace, Stage.RESULT_CREATED, Map.of("status", response.status()));
        trace.response = response;
    }

    private void add(Trace trace, Stage stage, Map<String, Object> details) {
        trace.stages.add(new TraceEvent(stage, Instant.now(), details));
    }
    public Trace get(String id) { return traces.get(id); }
    public void setConfirmToken(String id, String token) { Trace t = traces.get(id); if (t != null) t.confirmToken = token; }
    public boolean validateToken(String id, String token) { Trace t = traces.get(id); return t != null && token != null && token.equals(t.confirmToken); }
}
