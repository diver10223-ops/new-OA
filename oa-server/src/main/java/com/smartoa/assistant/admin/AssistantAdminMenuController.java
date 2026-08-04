package com.smartoa.assistant.admin;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/assistant-config")
@PreAuthorize("hasRole('ADMIN')")
public class AssistantAdminMenuController {
    private final AssistantAdminMenuService service;
    public AssistantAdminMenuController(AssistantAdminMenuService service){this.service=service;}
    @GetMapping("/menu") public Object menu() throws Exception{return service.response();}
}
