package com.smartoa.assistant;

import java.util.List;
import java.util.Map;

public record ExecutionPlan(
        String text, String userId, String intent, String scenario,
        Map<String, String> slots, List<String> matchedRules, List<String> skills,
        String template, String policy, String status) {
}
