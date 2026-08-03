package com.smartoa.assistant;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ExecutionPlanner {
    private final RegistryLoader loader;
    private final MockDatasetService mockService;
    private final ExecutionTraceService traceService;

    public ExecutionPlanner(RegistryLoader loader, MockDatasetService mockService, ExecutionTraceService traceService) {
        this.loader = loader;
        this.mockService = mockService;
        this.traceService = traceService;
    }

    // very simple rule-based NL mapping
    public Map<String,Object> plan(String text, String userId, String mode) {
        Map<String,Object> plan = new LinkedHashMap<>();
        plan.put("text", text);
        plan.put("userId", userId);
        // naive keyword detection
        if (text.contains("存贷比") || text.contains("存贷")) {
            plan.put("scenario", "loan_deposit_ratio_ab");
            plan.put("indicator", "loan_deposit_ratio");
        } else if (text.contains("日均") || text.contains("日均存款")) {
            plan.put("scenario", "deposit_balance_standard");
            plan.put("indicator", "avg_deposit");
        } else {
            // default deposit balance
            plan.put("scenario", "deposit_balance_standard");
            plan.put("indicator", "deposit_balance");
        }
        plan.put("mode", mode==null?"A":mode);
        // determine org from simple tokens
        if (text.contains("分行") || text.contains("本分行")) {
            plan.put("org", "BRANCH_001");
        } else {
            plan.put("org", "HEADQUARTERS");
        }
        return plan;
    }

    public Map<String,Object> executePlan(Map<String,Object> plan) {
        String indicator = (String)plan.get("indicator");
        String mode = (String)plan.get("mode");
        String org = (String)plan.get("org");
        Object value = mockService.getIndicatorValue(indicator, mode, org);
        Map<String,Object> res = new HashMap<>();
        res.put("indicator", indicator);
        res.put("mode", mode);
        res.put("org", org);
        res.put("value", value);
        res.put("rawMockKey", "deposit.json");
        return res;
    }

    public String generateConfirmToken() {
        return UUID.randomUUID().toString();
    }
}
