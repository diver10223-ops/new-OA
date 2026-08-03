package com.smartoa.assistant;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ExecutionTraceService {
    public static class Trace {
        public String id;
        public Instant created = Instant.now();
        public String text;
        public Map<String,Object> plan;
        public Map<String,Object> result;
        public String confirmToken; // for write ops
    }

    private final ConcurrentHashMap<String, Trace> traces = new ConcurrentHashMap<>();

    public Trace create(String text, Map<String,Object> plan) {
        Trace t = new Trace();
        t.id = UUID.randomUUID().toString();
        t.text = text;
        t.plan = plan;
        traces.put(t.id, t);
        return t;
    }

    public Trace get(String id) {
        return traces.get(id);
    }

    public void saveResult(String id, Map<String,Object> result) {
        Trace t = traces.get(id);
        if (t!=null) t.result = result;
    }

    public void setConfirmToken(String id, String token) {
        Trace t = traces.get(id);
        if (t!=null) t.confirmToken = token;
    }

    public boolean validateToken(String id, String token) {
        Trace t = traces.get(id);
        return t!=null && token!=null && token.equals(t.confirmToken);
    }
}
