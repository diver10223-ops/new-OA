package com.smartoa.leave;

import com.smartoa.approval.ApprovalBusinessHandler;
import com.smartoa.common.BusinessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component public class LeaveApprovalHandler implements ApprovalBusinessHandler {
    private final JdbcTemplate db; public LeaveApprovalHandler(JdbcTemplate db){this.db=db;}
    public String businessType(){return "LEAVE";}
    public void approved(long id){transition(id,"EFFECTIVE");}
    public void rejected(long id){transition(id,"REJECTED");}
    public void withdrawn(long id){transition(id,"CANCELLED");}
    private void transition(long id,String target){if(db.update("update leave_application set business_status=?,version=version+1,updated_at=current_timestamp where id=? and business_status='SUBMITTED'",target,id)!=1)throw new BusinessException(40913,"请假单状态冲突");}
}
