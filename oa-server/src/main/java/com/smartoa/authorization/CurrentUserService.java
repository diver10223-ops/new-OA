package com.smartoa.authorization;

import com.smartoa.common.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CurrentUserService {
    private final JdbcTemplate db;
    public CurrentUserService(JdbcTemplate db) { this.db = db; }
    public User current() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) throw new BusinessException(40100, "未登录或登录已过期", HttpStatus.UNAUTHORIZED);
        return find(auth.getName());
    }
    public User find(String username) {
        User base = db.queryForObject("select id,username,display_name,department_id from sys_user where username=? and status=1",
            (rs,n) -> new User(rs.getLong("id"), rs.getString("username"), rs.getString("display_name"),
                rs.getLong("department_id"), List.of()), username);
        List<String> roles = db.queryForList("select r.code from sys_role r join sys_user_role ur on ur.role_id=r.id where ur.user_id=?", String.class, base.id());
        return new User(base.id(), base.username(), base.displayName(), base.departmentId(), roles);
    }
    public record User(long id, String username, String displayName, long departmentId, List<String> roles) {
        public boolean hasRole(String role) { return roles.contains(role); }
    }
}
