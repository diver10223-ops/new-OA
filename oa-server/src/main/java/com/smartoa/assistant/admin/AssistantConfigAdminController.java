package com.smartoa.assistant.admin;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/assistant-config")
@PreAuthorize("hasRole('ADMIN')")
public class AssistantConfigAdminController {
    private final AssistantConfigAdminService service;
    private final ObjectMapper json;
    public AssistantConfigAdminController(AssistantConfigAdminService service, ObjectMapper json) { this.service = service; this.json = json; }

    @GetMapping("/mock") public AssistantConfigAdminService.ConfigDocument read() throws Exception { return service.read(); }
    @PutMapping("/mock/validate") public ResponseEntity<AssistantConfigAdminService.ValidationResult> validate(@RequestBody ContentRequest request) {
        var result = service.validate(request.content()); return ResponseEntity.status(result.valid() ? 200 : 422).body(result);
    }
    @PutMapping("/mock") public AssistantConfigAdminService.ConfigDocument save(@RequestBody SaveRequest request) throws Exception { return service.save(request.content(), request.checksum()); }
    @GetMapping("/metrics/{code}/references") public java.util.List<AssistantConfigAdminService.MetricReference> references(@PathVariable String code) throws Exception { return service.references(code); }
    @GetMapping("/menu") public JsonNode menu() throws Exception { return json.readTree(Files.readString(Path.of("assistant-config", "admin-menu.json"))); }

    @ExceptionHandler(AssistantConfigAdminService.ChecksumConflictException.class)
    ResponseEntity<Map<String, String>> conflict() { return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "配置已被其他操作修改，请重新加载后再保存")); }
    @ExceptionHandler(AssistantConfigAdminService.InvalidConfigException.class)
    ResponseEntity<AssistantConfigAdminService.ValidationResult> invalid(AssistantConfigAdminService.InvalidConfigException e) { return ResponseEntity.unprocessableEntity().body(e.result()); }
    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<Map<String, String>> badRequest(IllegalArgumentException e) { return ResponseEntity.badRequest().body(Map.of("message", e.getMessage())); }
    public record ContentRequest(String content) {}
    public record SaveRequest(String content, String checksum) {}
}
