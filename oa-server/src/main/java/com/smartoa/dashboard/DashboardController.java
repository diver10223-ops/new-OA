package com.smartoa.dashboard;
import com.smartoa.common.ApiResponse; import org.springframework.web.bind.annotation.*; import java.util.Map;
@RestController @RequestMapping("/api") public class DashboardController { @GetMapping("/health") ApiResponse<Map<String,String>> health(){return ApiResponse.ok(Map.of("status","UP","service","smart-oa"));} @GetMapping("/dashboard/statistics") ApiResponse<Map<String,Integer>> stats(){return ApiResponse.ok(Map.of("pending",3,"completed",12,"applications",5,"messages",2));}}
