package com.smartoa.assistant.admin;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/assistant-config")
@PreAuthorize("hasRole('ADMIN')")
public class AssistantConfigAdminController {
    private final AssistantConfigAdminService service;
    public AssistantConfigAdminController(AssistantConfigAdminService service) { this.service = service; }
    @GetMapping public Object list() throws Exception { return service.list(); }
    @GetMapping("/summary") public Object summary() throws Exception { return service.summary(); }
    @GetMapping("/references") public Object references() throws Exception { return service.references(); }
    @GetMapping("/{key}") public Object read(@PathVariable String key) throws Exception { return service.read(key); }
    @PostMapping("/{key}/validate") public Object validate(@PathVariable String key, @RequestBody Map<String,Object> body) { return service.validate(key, String.valueOf(body.getOrDefault("content", ""))); }
    @PutMapping("/{key}") public Object save(@PathVariable String key, @RequestBody Map<String,Object> body) throws Exception { return service.save(key, String.valueOf(body.getOrDefault("content", "")), String.valueOf(body.getOrDefault("checksum", ""))); }
    @ExceptionHandler(AssistantConfigAdminService.UnknownConfigException.class) ResponseEntity<?> unknown() { return ResponseEntity.notFound().build(); }
    @ExceptionHandler(AssistantConfigAdminService.ChecksumConflictException.class) ResponseEntity<?> conflict() { return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "配置已被其他操作修改，请重新加载后再保存")); }
    @ExceptionHandler(AssistantConfigAdminService.InvalidConfigException.class) ResponseEntity<?> invalid(AssistantConfigAdminService.InvalidConfigException e) { return ResponseEntity.badRequest().body(e.validation); }
}
