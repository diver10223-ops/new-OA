package com.smartoa.approval;

import com.smartoa.common.ApiResponse;
import com.smartoa.common.PageResult;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController @RequestMapping("/api/approval")
public class ApprovalController {
    private final ApprovalService service; public ApprovalController(ApprovalService service){this.service=service;}
    public record Decision(@Size(max=500,message="审批意见不能超过500字") String comment){}
    @Operation(summary="查询我的待办") @GetMapping("/tasks/pending")
    ApiResponse<PageResult<Map<String,Object>>> pending(@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="10")int size){return ApiResponse.ok(service.tasks(false,page,Math.min(size,100),null));}
    @Operation(summary="查询我的已办") @GetMapping("/tasks/completed")
    ApiResponse<PageResult<Map<String,Object>>> completed(@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="10")int size,@RequestParam(required=false)String status){return ApiResponse.ok(service.tasks(true,page,Math.min(size,100),status));}
    @Operation(summary="审批实例和时间线") @GetMapping("/instances/{id}") ApiResponse<Map<String,Object>> detail(@PathVariable long id){return ApiResponse.ok(service.detail(id));}
    @PreAuthorize("hasAnyRole('DEPT_MANAGER','ADMIN')") @PostMapping("/tasks/{id}/approve") ApiResponse<Void> approve(@PathVariable long id,@Valid @RequestBody(required=false) Decision d){service.decide(id,true,d==null?null:d.comment());return ApiResponse.ok(null);}
    @PreAuthorize("hasAnyRole('DEPT_MANAGER','ADMIN')") @PostMapping("/tasks/{id}/reject") ApiResponse<Void> reject(@PathVariable long id,@Valid @RequestBody Decision d){service.decide(id,false,d.comment());return ApiResponse.ok(null);}
}
