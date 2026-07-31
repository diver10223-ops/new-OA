package com.smartoa.audit;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.atomic.AtomicLong;

@Service
public class AuditService {
    private final JdbcTemplate db; private final HttpServletRequest request;
    private static final AtomicLong IDS = new AtomicLong(System.currentTimeMillis());
    public AuditService(JdbcTemplate db, HttpServletRequest request) { this.db=db; this.request=request; }
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(long operator, String module, String operation, Long businessId, boolean success, String error, long duration) {
        try {
            db.update("insert into sys_operation_log(id,operator_id,module,operation,request_method,request_uri,success,error_message,duration_ms) values(?,?,?,?,?,?,?,?,?)",
                IDS.incrementAndGet(), operator, module, operation + (businessId == null ? "" : ":" + businessId),
                request.getMethod(), request.getRequestURI(), success ? 1 : 0, error, duration);
        } catch (RuntimeException ignored) { /* Audit is intentionally best-effort and isolated from the core transaction. */ }
    }
}
