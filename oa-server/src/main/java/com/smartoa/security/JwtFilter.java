package com.smartoa.security;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private final JwtService jwt;
    private final JdbcTemplate db;
    private final boolean demoMode;

    public JwtFilter(JwtService jwt, JdbcTemplate db,
                     @Value("${app.demo-mode:false}") boolean demoMode) {
        this.jwt = jwt;
        this.db = db;
        this.demoMode = demoMode;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        if (demoMode) {
            chain.doFilter(req, res);
            return;
        }

        String h = req.getHeader("Authorization");
        if (h != null && h.startsWith("Bearer ")) {
            try {
                String u = jwt.parse(h.substring(7));
                var authorities = db.queryForList(
                        "select r.code from sys_role r join sys_user_role ur on ur.role_id=r.id join sys_user su on su.id=ur.user_id where su.username=?",
                        String.class, u).stream().map(r -> new SimpleGrantedAuthority("ROLE_" + r)).toList();
                SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(u, null, authorities));
            } catch (Exception ignored) {
            }
        }
        chain.doFilter(req, res);
    }
}
