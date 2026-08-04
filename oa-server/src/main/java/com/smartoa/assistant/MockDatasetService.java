package com.smartoa.assistant;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartoa.common.BusinessException;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MockDatasetService {
    private static final int UNKNOWN_INDICATOR = 40410;
    private static final int UNKNOWN_ORG = 40411;
    private final ObjectMapper json = new ObjectMapper();
    private final Map<String, Object> datasets = new ConcurrentHashMap<>();
    private final Map<String, Object> snapshot = new ConcurrentHashMap<>();
    private final Path mockDirectory;

    public MockDatasetService() {
        this(Path.of("assistant-config", "mocks"));
    }

    MockDatasetService(Path mockDirectory) {
        this.mockDirectory = mockDirectory;
    }

    @PostConstruct
    public void init() throws Exception {
        datasets.clear();
        if (!Files.isDirectory(mockDirectory)) {
            return;
        }
        File[] files = mockDirectory.toFile().listFiles(File::isFile);
        if (files != null) {
            for (File file : files) {
                datasets.put(file.getName(), json.readValue(file, Map.class));
            }
        }
        snapshot.clear();
        snapshot.putAll(datasets);
    }

    public Object getMock(String key) {
        return datasets.get(key);
    }

    public Map<String, Object> getAll() {
        return datasets;
    }

    public void resetAll() {
        datasets.clear();
        datasets.putAll(snapshot);
    }

    public Object getCurrentValue(String indicatorCode, String org) {
        return orgData(indicatorCode, org).get("current");
    }

    public Object getPreviousValue(String indicatorCode, String org) {
        return orgData(indicatorCode, org).get("previous");
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getTrend(String indicatorCode, String org) {
        return (List<Map<String, Object>>) orgData(indicatorCode, org).get("trend");
    }

    /** Backward-compatible adapter for the current planner: A=current, B=previous. */
    public Object getIndicatorValue(String indicatorCode, String mode, String org) {
        if ("A".equalsIgnoreCase(mode)) {
            return getCurrentValue(indicatorCode, org);
        }
        if ("B".equalsIgnoreCase(mode)) {
            return getPreviousValue(indicatorCode, org);
        }
        throw new BusinessException(40010, "unknown comparison mode [" + mode + "]");
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> orgData(String indicatorCode, String org) {
        Map<String, Object> indicator = indicator(indicatorCode);
        Map<String, Object> orgData = (Map<String, Object>) indicator.get("orgData");
        Object values = orgData.get(org);
        if (!(values instanceof Map<?, ?>)) {
            throw new BusinessException(UNKNOWN_ORG,
                    "unknown org [" + org + "] for indicator [" + indicatorCode + "]");
        }
        return (Map<String, Object>) values;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> indicator(String indicatorCode) {
        Object rawDataset = datasets.get("deposit.json");
        if (!(rawDataset instanceof Map<?, ?> dataset)
                || !(dataset.get("indicators") instanceof List<?> indicators)) {
            throw new BusinessException(UNKNOWN_INDICATOR, "unknown indicator [" + indicatorCode + "]");
        }
        for (Object value : indicators) {
            Map<String, Object> indicator = new LinkedHashMap<>((Map<String, Object>) value);
            if (indicatorCode.equals(indicator.get("code"))) {
                return indicator;
            }
        }
        throw new BusinessException(UNKNOWN_INDICATOR, "unknown indicator [" + indicatorCode + "]");
    }
}
