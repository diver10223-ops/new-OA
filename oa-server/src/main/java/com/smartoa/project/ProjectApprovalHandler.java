package com.smartoa.project;

import com.smartoa.approval.ApprovalBusinessHandler;
import com.smartoa.common.BusinessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class ProjectApprovalHandler implements ApprovalBusinessHandler {
    private final JdbcTemplate jdbc;

    public ProjectApprovalHandler(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public String businessType() { return "PROJECT"; }
    public void approved(long id) { transition(id, "ESTABLISHED"); }
    public void rejected(long id) { transition(id, "REJECTED"); }
    public void withdrawn(long id) { transition(id, "CANCELLED"); }

    private void transition(long id, String status) {
        if (jdbc.update("update project_application set business_status=?,version=version+1," +
                "updated_at=current_timestamp where id=? and business_status='SUBMITTED'", status, id) != 1) {
            throw new BusinessException(40933, "立项申请状态冲突");
        }
    }
}
