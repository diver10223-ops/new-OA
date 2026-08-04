package com.smartoa.assistant.admin;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/assistant-config")
@PreAuthorize("hasRole('ADMIN')")
public class AssistantConfigAdminController {
    private final AssistantConfigAdminService service;
    public AssistantConfigAdminController(AssistantConfigAdminService service) { this.service = service; }

    @GetMapping public Object list() throws Exception { return Map.of("configs", service.list()); }
    @GetMapping("/summary") public Object summary() throws Exception { return service.summary(); }
    @GetMapping("/references") public Object references() throws Exception { return service.references(); }
    @GetMapping("/{key}") public Object get(@PathVariable String key) throws Exception { return service.get(key); }
    @PostMapping("/{key}/validate") public Object validate(@PathVariable String key, @RequestBody Map<String,Object> body) throws Exception {
        Object content = body.get("content"); if (!(content instanceof String text)) throw new IllegalArgumentException("content 必须是文本"); return service.validate(key, text);
    }
    @PutMapping("/{key}") public Object save(@PathVariable String key, @RequestBody AssistantConfigAdminService.SaveRequest request) throws Exception { return service.save(key, request); }
    @ExceptionHandler(AssistantConfigAdminService.ChecksumConflictException.class)
    ResponseEntity<?> conflict() { return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "配置已被其他操作修改，请重新加载")); }
    @ExceptionHandler(AssistantConfigAdminService.InvalidDraftException.class)
    ResponseEntity<?> invalid(AssistantConfigAdminService.InvalidDraftException e) { return ResponseEntity.badRequest().body(e.result()); }
}
