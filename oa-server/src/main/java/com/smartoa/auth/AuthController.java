package com.smartoa.auth;

import com.smartoa.common.ApiResponse;
import com.smartoa.security.JwtService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final JdbcTemplate db;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final boolean demoMode;

    public AuthController(JdbcTemplate db,
                          PasswordEncoder encoder,
                          JwtService jwt,
                          @Value("${app.demo-mode:true}") boolean demoMode) {
        this.db = db;
        this.encoder = encoder;
        this.jwt = jwt;
        this.demoMode = demoMode;
    }

    public record Login(@NotBlank(message = "用户名不能为空") String username,
                        @NotBlank(message = "密码不能为空") String password) {
    }

@PostMapping("/auth/login")
ApiResponse<Map<String, Object>> login(@Valid @RequestBody Login body) {
    List<Map<String, Object>> rows = db.queryForList(
            "select username,password_hash,display_name from sys_user where username=? and status=1",
            body.username());

    if (rows.isEmpty()) {
        throw new IllegalArgumentException("用户名或密码错误");
    }

    if (!demoMode) {
        String hash = (String) rows.get(0).get("password_hash");
        if (!encoder.matches(body.password(), hash)) {
            throw new IllegalArgumentException("用户名或密码错误");
        }
    }

    return ApiResponse.ok(Map.of(
            "token", jwt.create(body.username()),
            "tokenType", "Bearer",
            "expiresIn", 7200
    ));
}

    @GetMapping("/users/me")
    ApiResponse<Map<String, Object>> me(Principal p) {
        String username = p != null ? p.getName() : "admin";
        Map<String, Object> u = db.queryForMap(
                "select u.id,u.username,u.display_name as displayName,d.name as department " +
                        "from sys_user u left join sys_department d on d.id=u.department_id " +
                        "where u.username=?",
                username);

        List<String> roles = db.queryForList(
                "select r.code from sys_role r " +
                        "join sys_user_role ur on ur.role_id=r.id " +
                        "join sys_user u on u.id=ur.user_id " +
                        "where u.username=?",
                String.class,
                username);

        u.put("roles", roles);
        u.put("permissions", List.of("dashboard:view"));
        return ApiResponse.ok(u);
    }
}