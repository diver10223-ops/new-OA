package com.smartoa.project;

import com.smartoa.common.ApiResponse;
import com.smartoa.common.PageResult;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/project-applications")
@PreAuthorize("isAuthenticated()")
public class ProjectController {
    private final ProjectService service;
    public ProjectController(ProjectService service) { this.service = service; }

    @Operation(summary = "创建立项草稿")
    @PostMapping public ApiResponse<Map<String, Long>> create(@Valid @RequestBody ProjectDtos.Request request) {
        return ApiResponse.ok(Map.of("id", service.create(request)));
    }
    @PutMapping("/{id}") public ApiResponse<Void> update(@PathVariable long id, @Valid @RequestBody ProjectDtos.Request r) { service.update(id, r); return ApiResponse.ok(null); }
    @DeleteMapping("/{id}") public ApiResponse<Void> delete(@PathVariable long id) { service.delete(id); return ApiResponse.ok(null); }
    @GetMapping public ApiResponse<PageResult<ProjectDtos.Response>> list(@RequestParam(defaultValue="0") @Min(0) int page, @RequestParam(defaultValue="10") @Min(1) @Max(100) int size, @RequestParam(required=false) String status, @RequestParam(required=false) String keyword) { return ApiResponse.ok(service.list(page,size,status,keyword)); }
    @GetMapping("/{id}") public ApiResponse<ProjectDtos.Response> detail(@PathVariable long id) { return ApiResponse.ok(service.detail(id)); }
    @PostMapping("/{id}/submit") public ApiResponse<Void> submit(@PathVariable long id) { service.submit(id); return ApiResponse.ok(null); }
    @PostMapping("/{id}/withdraw") public ApiResponse<Void> withdraw(@PathVariable long id) { service.withdraw(id); return ApiResponse.ok(null); }
    @PostMapping("/{id}/close") public ApiResponse<Void> close(@PathVariable long id) { service.close(id); return ApiResponse.ok(null); }
}
