package com.smartoa.approval;

import com.smartoa.authorization.CurrentUserService;
import com.smartoa.common.BusinessException;
import com.smartoa.common.PageResult;
import com.smartoa.audit.AuditService;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ApprovalService {
    private final JdbcTemplate db; private final CurrentUserService users; private final AuditService audit;
    private final Map<String,ApprovalBusinessHandler> handlers;
    private static final AtomicLong IDS = new AtomicLong(System.currentTimeMillis());
    public ApprovalService(JdbcTemplate db, CurrentUserService users, AuditService audit, List<ApprovalBusinessHandler> handlers) {
        this.db=db; this.users=users; this.audit=audit; this.handlers=new HashMap<>(); handlers.forEach(h -> this.handlers.put(h.businessType(),h));
    }
    @Transactional
    public long create(String type, long businessId, CurrentUserService.User applicant) {
        long assignee = resolveAssignee(applicant); long instance=IDS.incrementAndGet(), task=IDS.incrementAndGet();
        db.update("insert into approval_instance(id,business_type,business_id,applicant_id,status,current_node,version) values(?,?,?,?,?,?,0)", instance,type,businessId,applicant.id(),"PENDING","DEPARTMENT_MANAGER");
        db.update("insert into approval_task(id,instance_id,assignee_id,node_code,node_name,status) values(?,?,?,?,?,?)",task,instance,assignee,"DEPARTMENT_MANAGER","部门负责人审批","PENDING");
        return instance;
    }
    private long resolveAssignee(CurrentUserService.User applicant) {
        List<Long> managers = db.queryForList("select u.id from sys_user u join sys_user_role ur on ur.user_id=u.id join sys_role r on r.id=ur.role_id where u.department_id=? and u.id<>? and u.status=1 and r.code='DEPT_MANAGER' order by u.id", Long.class, applicant.departmentId(), applicant.id());
        if (!managers.isEmpty()) return managers.get(0);
        List<Long> admins = db.queryForList("select u.id from sys_user u join sys_user_role ur on ur.user_id=u.id join sys_role r on r.id=ur.role_id where u.id<>? and u.status=1 and r.code='ADMIN' order by u.id",Long.class,applicant.id());
        if (admins.isEmpty()) throw new BusinessException(40910, "无法找到合法审批人"); return admins.get(0);
    }
    public PageResult<Map<String,Object>> tasks(boolean completed, int page, int size, String result) {
        var user=users.current(); String condition=completed ? "t.status<>'PENDING'" : "t.status='PENDING'";
        List<Object> args=new ArrayList<>(List.of(user.id()));
        if (completed && result != null && !result.isBlank()) { condition += " and t.status=?"; args.add(result); }
        String from=" from approval_task t join approval_instance i on i.id=t.instance_id join sys_user u on u.id=i.applicant_id where t.assignee_id=? and "+condition;
        long total=db.queryForObject("select count(*)"+from,Long.class,args.toArray()); args.add(size);args.add(page*size);
        List<Map<String,Object>> items=db.queryForList("select t.id,i.id instanceId,i.business_type businessType,i.business_id businessId,u.display_name applicantName,t.node_name nodeName,t.status,t.created_at createdAt,t.handled_at handledAt"+from+" order by t.created_at desc limit ? offset ?",args.toArray());
        return new PageResult<>(page,size,total,items);
    }
    public Map<String,Object> detail(long instanceId) {
        var user=users.current();
        Map<String,Object> instance=one("select i.*,u.display_name applicant_name from approval_instance i join sys_user u on u.id=i.applicant_id where i.id=?",instanceId);
        long applicant=((Number)instance.get("applicant_id")).longValue();
        Integer assigned=db.queryForObject("select count(*) from approval_task where instance_id=? and assignee_id=?",Integer.class,instanceId,user.id());
        if(applicant!=user.id() && assigned==0 && !user.hasRole("ADMIN")) throw new BusinessException(40301,"无权查看该审批",HttpStatus.FORBIDDEN);
        instance.put("timeline",db.queryForList("select id,node_code nodeCode,node_name nodeName,assignee_id assigneeId,status,comment_text comment,created_at createdAt,handled_at handledAt from approval_task where instance_id=? order by created_at",instanceId)); return instance;
    }
    @Transactional
    public void decide(long taskId, boolean approve, String comment) {
        long start=System.currentTimeMillis(); var user=users.current(); String action=approve?"APPROVE":"REJECT";
        try {
            Map<String,Object> row=one("select t.status task_status,t.assignee_id,i.id instance_id,i.status instance_status,i.applicant_id,i.business_type,i.business_id,i.version from approval_task t join approval_instance i on i.id=t.instance_id where t.id=?",taskId);
            if(((Number)row.get("assignee_id")).longValue()!=user.id()) throw new BusinessException(40302,"该任务未分配给当前用户",HttpStatus.FORBIDDEN);
            if(((Number)row.get("applicant_id")).longValue()==user.id()) throw new BusinessException(40303,"不得审批自己的申请",HttpStatus.FORBIDDEN);
            if(!"PENDING".equals(row.get("task_status"))||!"PENDING".equals(row.get("instance_status"))) throw new BusinessException(40902,"审批任务已处理");
            String result=approve?"APPROVED":"REJECTED";
            if(db.update("update approval_task set status=?,comment_text=?,handled_at=? where id=? and status='PENDING'",result,comment,Timestamp.from(Instant.now()),taskId)!=1) throw new BusinessException(40902,"审批任务已处理");
            int version=((Number)row.get("version")).intValue();
            if(db.update("update approval_instance set status=?,current_node=null,version=version+1,updated_at=?,completed_at=? where id=? and status='PENDING' and version=?",result,Timestamp.from(Instant.now()),Timestamp.from(Instant.now()),row.get("instance_id"),version)!=1) throw new BusinessException(40903,"审批并发冲突");
            ApprovalBusinessHandler handler=handlers.get(row.get("business_type").toString()); if(handler==null) throw new BusinessException(50010,"未找到业务回调");
            if(approve)handler.approved(((Number)row.get("business_id")).longValue()); else handler.rejected(((Number)row.get("business_id")).longValue());
            audit.record(user.id(),"APPROVAL",action,taskId,true,null,System.currentTimeMillis()-start);
        } catch(RuntimeException ex) { audit.record(user.id(),"APPROVAL",action,taskId,false,ex.getMessage(),System.currentTimeMillis()-start); throw ex; }
    }
    @Transactional
    public void withdraw(long instanceId, long applicantId) {
        Map<String,Object> row=one("select * from approval_instance where id=?",instanceId);
        if(((Number)row.get("applicant_id")).longValue()!=applicantId) throw new BusinessException(40304,"仅申请人可撤回",HttpStatus.FORBIDDEN);
        if(!"PENDING".equals(row.get("status"))) throw new BusinessException(40904,"当前审批不可撤回");
        db.update("update approval_task set status='CANCELLED',handled_at=? where instance_id=? and status='PENDING'",Timestamp.from(Instant.now()),instanceId);
        db.update("update approval_instance set status='WITHDRAWN',current_node=null,version=version+1,updated_at=?,completed_at=? where id=? and status='PENDING'",Timestamp.from(Instant.now()),Timestamp.from(Instant.now()),instanceId);
    }
    private Map<String,Object> one(String sql,Object...args) { List<Map<String,Object>> rows=db.queryForList(sql,args); if(rows.isEmpty())throw new BusinessException(40401,"数据不存在",HttpStatus.NOT_FOUND); return rows.get(0); }
}
