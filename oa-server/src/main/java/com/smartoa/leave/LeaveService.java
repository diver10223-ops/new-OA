package com.smartoa.leave;

import com.smartoa.approval.ApprovalService;
import com.smartoa.audit.AuditService;
import com.smartoa.authorization.CurrentUserService;
import com.smartoa.common.BusinessException;
import com.smartoa.common.PageResult;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class LeaveService {
    private final JdbcTemplate db; private final CurrentUserService users; private final ApprovalService approvals; private final AuditService audit;
    private static final AtomicLong IDS=new AtomicLong(System.currentTimeMillis());
    public LeaveService(JdbcTemplate db,CurrentUserService users,ApprovalService approvals,AuditService audit){this.db=db;this.users=users;this.approvals=approvals;this.audit=audit;}
    public record Command(String leaveType, OffsetDateTime startTime, OffsetDateTime endTime, String reason) {}
    @Transactional public long create(Command c){var u=users.current();long start=System.currentTimeMillis(),id=IDS.incrementAndGet();validate(c);try{
        db.update("insert into leave_application(id,application_no,applicant_id,department_id,leave_type,start_time,end_time,duration,reason,business_status,version) values(?,?,?,?,?,?,?,?,?,'DRAFT',0)",id,"LV"+id,u.id(),u.departmentId(),c.leaveType(),Timestamp.from(c.startTime().toInstant()),Timestamp.from(c.endTime().toInstant()),duration(c),c.reason().trim());
        audit.record(u.id(),"LEAVE","CREATE",id,true,null,System.currentTimeMillis()-start);return id;}catch(RuntimeException e){audit.record(u.id(),"LEAVE","CREATE",id,false,e.getMessage(),System.currentTimeMillis()-start);throw e;}}
    @Transactional public void update(long id,Command c){var u=users.current();validate(c);ownDraft(id,u.id());db.update("update leave_application set leave_type=?,start_time=?,end_time=?,duration=?,reason=?,version=version+1,updated_at=current_timestamp where id=?",c.leaveType(),Timestamp.from(c.startTime().toInstant()),Timestamp.from(c.endTime().toInstant()),duration(c),c.reason().trim(),id);audit.record(u.id(),"LEAVE","UPDATE",id,true,null,0);}
    @Transactional public void delete(long id){var u=users.current();ownDraft(id,u.id());db.update("delete from leave_application where id=?",id);audit.record(u.id(),"LEAVE","DELETE",id,true,null,0);}
    @Transactional public void submit(long id){var u=users.current();Map<String,Object> row=ownDraft(id,u.id());long instance=approvals.create("LEAVE",id,u);if(db.update("update leave_application set business_status='SUBMITTED',approval_instance_id=?,version=version+1,updated_at=current_timestamp where id=? and business_status='DRAFT'",instance,id)!=1)throw new BusinessException(40911,"该申请已提交");audit.record(u.id(),"LEAVE","SUBMIT",id,true,null,0);}
    @Transactional public void withdraw(long id){var u=users.current();Map<String,Object> row=own(id,u.id());if(!"SUBMITTED".equals(row.get("business_status")))throw new BusinessException(40912,"仅审批中申请可撤回");approvals.withdraw(((Number)row.get("approval_instance_id")).longValue(),u.id());audit.record(u.id(),"LEAVE","WITHDRAW",id,true,null,0);}
    public PageResult<Map<String,Object>> list(int page,int size,String status,String type,String start,String end){var u=users.current();StringBuilder where=new StringBuilder(" where l.applicant_id=?");List<Object>a=new ArrayList<>(List.of(u.id()));if(status!=null&&!status.isBlank()){where.append(" and l.business_status=?");a.add(status);}if(type!=null&&!type.isBlank()){where.append(" and l.leave_type=?");a.add(type);}if(start!=null&&!start.isBlank()){where.append(" and l.start_time>=?");a.add(Timestamp.valueOf(start+" 00:00:00"));}if(end!=null&&!end.isBlank()){where.append(" and l.end_time<=?");a.add(Timestamp.valueOf(end+" 23:59:59"));}long total=db.queryForObject("select count(*) from leave_application l"+where,Long.class,a.toArray());a.add(size);a.add(page*size);return new PageResult<>(page,size,total,db.queryForList("select l.id,l.application_no applicationNo,l.leave_type leaveType,l.start_time startTime,l.end_time endTime,l.duration,l.reason,l.business_status businessStatus,l.approval_instance_id approvalInstanceId,l.created_at createdAt from leave_application l"+where+" order by l.created_at desc limit ? offset ?",a.toArray()));}
    public Map<String,Object> detail(long id){var u=users.current();Map<String,Object> r=own(id,u.id());r.remove("version");return r;}
    private void validate(Command c){if(c.startTime()==null||c.endTime()==null||!c.startTime().isBefore(c.endTime()))throw new BusinessException(40011,"开始时间必须早于结束时间");if(c.reason()==null||c.reason().trim().isEmpty()||c.reason().length()>500)throw new BusinessException(40012,"请假原因必填且不超过500字");Integer n=db.queryForObject("select count(*) from sys_dictionary where dict_type='LEAVE_TYPE' and item_code=? and status=1",Integer.class,c.leaveType());if(n==0)throw new BusinessException(40013,"无效的请假类型");}
    private BigDecimal duration(Command c){return BigDecimal.valueOf(Duration.between(c.startTime(),c.endTime()).toMinutes()).divide(BigDecimal.valueOf(60),2,RoundingMode.HALF_UP);}
    private Map<String,Object> ownDraft(long id,long uid){Map<String,Object>r=own(id,uid);if(!"DRAFT".equals(r.get("business_status")))throw new BusinessException(40901,"仅草稿可编辑或删除");return r;}
    private Map<String,Object> own(long id,long uid){List<Map<String,Object>> rows=db.queryForList("select l.*,u.display_name applicant_name,d.name department_name from leave_application l join sys_user u on u.id=l.applicant_id join sys_department d on d.id=l.department_id where l.id=?",id);if(rows.isEmpty())throw new BusinessException(40402,"请假申请不存在",HttpStatus.NOT_FOUND);Map<String,Object>r=rows.get(0);if(((Number)r.get("applicant_id")).longValue()!=uid)throw new BusinessException(40311,"无权访问该请假申请",HttpStatus.FORBIDDEN);return r;}
}
