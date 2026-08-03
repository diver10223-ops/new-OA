package com.smartoa.leave;

import com.smartoa.common.ApiResponse;import com.smartoa.common.PageResult;import io.swagger.v3.oas.annotations.Operation;import jakarta.validation.Valid;import jakarta.validation.constraints.*;import org.springframework.security.access.prepost.PreAuthorize;import org.springframework.web.bind.annotation.*;
import java.time.OffsetDateTime;import java.util.Map;

@RestController @RequestMapping("/api/leave-applications") @PreAuthorize("isAuthenticated()")
public class LeaveController {
 private final LeaveService service;public LeaveController(LeaveService service){this.service=service;}
 public record Request(@NotBlank(message="请选择请假类型")String leaveType,@NotNull(message="请选择开始时间")OffsetDateTime startTime,@NotNull(message="请选择结束时间")OffsetDateTime endTime,@NotBlank(message="请假原因不能为空")@Size(max=500,message="请假原因不超过500字")String reason){LeaveService.Command command(){return new LeaveService.Command(leaveType,startTime,endTime,reason);}}
 @Operation(summary="创建请假草稿")@PostMapping ApiResponse<Map<String,Long>> create(@Valid@RequestBody Request r){return ApiResponse.ok(Map.of("id",service.create(r.command())));}
 @PutMapping("/{id}")ApiResponse<Void> update(@PathVariable long id,@Valid@RequestBody Request r){service.update(id,r.command());return ApiResponse.ok(null);}
 @DeleteMapping("/{id}")ApiResponse<Void> delete(@PathVariable long id){service.delete(id);return ApiResponse.ok(null);}
 @GetMapping ApiResponse<PageResult<Map<String,Object>>> list(@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="10")int size,@RequestParam(required=false)String status,@RequestParam(required=false)String leaveType,@RequestParam(required=false)String startDate,@RequestParam(required=false)String endDate){return ApiResponse.ok(service.list(page,Math.min(size,100),status,leaveType,startDate,endDate));}
 @GetMapping("/{id}")ApiResponse<Map<String,Object>> detail(@PathVariable long id){return ApiResponse.ok(service.detail(id));}
 @PostMapping("/{id}/submit")ApiResponse<Void> submit(@PathVariable long id){service.submit(id);return ApiResponse.ok(null);}
 @PostMapping("/{id}/withdraw")ApiResponse<Void> withdraw(@PathVariable long id){service.withdraw(id);return ApiResponse.ok(null);}
}
