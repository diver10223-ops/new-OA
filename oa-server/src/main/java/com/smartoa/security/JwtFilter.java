package com.smartoa.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String auth = request.getHeader("Authorization");

        if (StringUtils.hasText(auth) && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);

            try {
                String username = parseUsername(token);
                if (StringUtils.hasText(username)) {
                    List<SimpleGrantedAuthority> authorities = switch (username) {
                        case "admin" -> List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
                        case "manager" -> List.of(new SimpleGrantedAuthority("ROLE_MANAGER"));
                        case "project" -> List.of(new SimpleGrantedAuthority("ROLE_PROJECT"));
                        default -> List.of(new SimpleGrantedAuthority("ROLE_EMPLOYEE"));
                    };

                    var authentication = new UsernamePasswordAuthenticationToken(username, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception ignored) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private String parseUsername(String token) {
        // 兼容 demo token
        if (token.startsWith("demo-") && token.length() > 5) {
            return token.substring(5);
        }
        // 兼容你项目当前 JwtService.parse(token) -> String
        return jwtService.parse(token);
    }
}