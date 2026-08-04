package com.smartoa.assistant;

import java.util.List;
import java.util.Map;

public record AssistantResponse(
        String traceId, String intent, String scenario, String status,
        Map<String, String> slots, List<String> matchedRules, String template,
        Map<String, Object> result, List<Map<String, Object>> candidates,
        List<String> suggestions, Map<String, Object> error) {
}
