package com.smartoa.assistant;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MockDatasetService {
    private final ObjectMapper json = new ObjectMapper();
    private final Map<String,Object> datasets = new ConcurrentHashMap<>();
    private final Map<String,Object> snapshot = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() throws Exception {
        File dir = new File("assistant-config/mocks");
        if (!dir.exists()) return;
        for (File f : dir.listFiles()) {
            if (f.isFile()) {
                Map m = json.readValue(f, Map.class);
                datasets.put(f.getName(), m);
            }
        }
        snapshot.putAll(datasets);
    }

    public Object getMock(String key) {
        return datasets.get(key);
    }

    public Map<String,Object> getAll() {
        return datasets;
    }

    public void resetAll() {
        datasets.clear();
        datasets.putAll(snapshot);
    }

    // convenience: get indicator value
    public Object getIndicatorValue(String indicatorId, String mode, String org) {
        try {
            Map<String,Object> indicators = (Map) datasets.get("deposit.json");
            Map m = (Map) indicators.get("indicators");
            Map in = (Map) m.get(indicatorId);
            Map modeMap = (Map) in.get(mode);
            Object v = modeMap.get(org);
            return v;
        } catch (Exception e) {
            return null;
        }
    }
}
