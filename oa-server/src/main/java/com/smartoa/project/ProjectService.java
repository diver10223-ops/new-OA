package com.smartoa.project;

import com.smartoa.approval.ApprovalService;
import com.smartoa.audit.AuditService;
import com.smartoa.authorization.CurrentUserService;
import com.smartoa.common.BusinessException;
import com.smartoa.common.DatabaseIdGenerator;
import com.smartoa.common.PageResult;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProjectService {
    private static final String SELECT = "select p.*,u.display_name applicant_name,d.name department_name " +
            "from project_application p join sys_user u on u.id=p.applicant_id " +
            "join sys_department d on d.id=p.department_id";
    private final JdbcTemplate jdbc;
    private final CurrentUserService users;
    private final ApprovalService approvals;
    private final AuditService audit;
    private final DatabaseIdGenerator ids;

    public ProjectService(JdbcTemplate jdbc, CurrentUserService users, ApprovalService approvals,
            AuditService audit, DatabaseIdGenerator ids) {
        this.jdbc = jdbc; this.users = users; this.approvals = approvals; this.audit = audit; this.ids = ids;
    }

    @Transactional
    public long create(ProjectDtos.Request request) {
        validate(request);
        var user = users.current();
        long id = ids.nextId();
        String number = "PJ" + id;
        int changed = jdbc.update("insert into project_application(id,application_no,applicant_id," +
                        "department_id,owner_department_id,project_name,project_code,project_owner," +
                        "planned_start_date,planned_end_date,budget,summary,business_status,version) " +
                        "values(?,?,?,?,?,?,?,?,?,?,?,?,'DRAFT',0)", id, number, user.id(), user.departmentId(),
                user.departmentId(), request.projectName().trim(), number, request.projectOwner().trim(),
                Date.valueOf(request.plannedStartDate()), Date.valueOf(request.plannedEndDate()),
                request.budget(), request.summary().trim());
        if (changed != 1) throw new BusinessException(40930, "创建立项申请失败");
        audit.record(user.id(), "PROJECT", "CREATE", id, true, null, 0);
        return id;
    }

    @Transactional
    public void update(long id, ProjectDtos.Request request) {
        validate(request); var user = users.current(); require(id, user.id(), ProjectStatus.DRAFT);
        int changed = jdbc.update("update project_application set project_name=?,project_owner=?," +
                        "planned_start_date=?,planned_end_date=?,budget=?,summary=?,version=version+1," +
                        "updated_at=current_timestamp where id=? and applicant_id=? and business_status='DRAFT'",
                request.projectName().trim(), request.projectOwner().trim(), Date.valueOf(request.plannedStartDate()),
                Date.valueOf(request.plannedEndDate()), request.budget(), request.summary().trim(), id, user.id());
        if (changed != 1) throw new BusinessException(40931, "立项申请状态已变化");
        audit.record(user.id(), "PROJECT", "UPDATE", id, true, null, 0);
    }

    @Transactional
    public void delete(long id) {
        var user = users.current(); require(id, user.id(), ProjectStatus.DRAFT);
        if (jdbc.update("delete from project_application where id=? and applicant_id=? and business_status='DRAFT'",
                id, user.id()) != 1) throw new BusinessException(40931, "立项申请状态已变化");
        audit.record(user.id(), "PROJECT", "DELETE", id, true, null, 0);
    }

    @Transactional
    public void submit(long id) {
        var user = users.current(); require(id, user.id(), ProjectStatus.DRAFT);
        long instanceId = approvals.create("PROJECT", id, user);
        if (jdbc.update("update project_application set business_status='SUBMITTED',approval_instance_id=?," +
                "version=version+1,updated_at=current_timestamp where id=? and applicant_id=? and business_status='DRAFT'",
                instanceId, id, user.id()) != 1) throw new BusinessException(40931, "立项申请已提交");
        audit.record(user.id(), "PROJECT", "SUBMIT", id, true, null, 0);
    }

    @Transactional
    public void withdraw(long id) {
        var user = users.current(); var project = require(id, user.id(), ProjectStatus.SUBMITTED);
        approvals.withdraw(project.approvalInstanceId(), user.id());
        audit.record(user.id(), "PROJECT", "WITHDRAW", id, true, null, 0);
    }

    @Transactional
    public void close(long id) {
        var user = users.current(); require(id, user.id(), ProjectStatus.ESTABLISHED);
        if (jdbc.update("update project_application set business_status='CLOSED',version=version+1," +
                "updated_at=current_timestamp where id=? and applicant_id=? and business_status='ESTABLISHED'",
                id, user.id()) != 1) throw new BusinessException(40931, "立项申请状态已变化");
        audit.record(user.id(), "PROJECT", "CLOSE", id, true, null, 0);
    }

    public ProjectDtos.Response detail(long id) { return require(id, users.current().id(), null); }

    public PageResult<ProjectDtos.Response> list(int page, int size, String status, String keyword) {
        validatePage(page, size); var user = users.current();
        StringBuilder where = new StringBuilder(" where p.applicant_id=?");
        List<Object> args = new ArrayList<>(List.of(user.id()));
        if (status != null && !status.isBlank()) { ProjectStatus.valueOf(status); where.append(" and p.business_status=?"); args.add(status); }
        if (keyword != null && !keyword.isBlank()) { where.append(" and (p.project_name like ? or p.project_code like ?)"); args.add("%" + keyword + "%"); args.add("%" + keyword + "%"); }
        long total = jdbc.queryForObject("select count(*) from project_application p" + where, Long.class, args.toArray());
        args.add(size); args.add(page * size);
        List<ProjectDtos.Response> items = jdbc.query(SELECT + where + " order by p.created_at desc limit ? offset ?", this::map, args.toArray());
        return new PageResult<>(page, size, total, items);
    }

    private ProjectDtos.Response require(long id, long userId, ProjectStatus expected) {
        List<ProjectDtos.Response> rows = jdbc.query(SELECT + " where p.id=?", this::map, id);
        if (rows.isEmpty()) throw new BusinessException(40430, "立项申请不存在", HttpStatus.NOT_FOUND);
        var row = rows.get(0);
        if (row.applicantId() != userId) throw new BusinessException(40330, "无权访问该立项申请", HttpStatus.FORBIDDEN);
        if (expected != null && row.businessStatus() != expected) throw new BusinessException(40930, "当前状态不允许此操作");
        return row;
    }

    private ProjectDtos.Response map(java.sql.ResultSet rs, int n) throws java.sql.SQLException {
        Number approval = (Number) rs.getObject("approval_instance_id");
        return new ProjectDtos.Response(rs.getLong("id"), rs.getString("application_no"), rs.getLong("applicant_id"),
                rs.getString("applicant_name"), rs.getLong("department_id"), rs.getString("department_name"),
                rs.getString("project_name"), rs.getString("project_code"), rs.getString("project_owner"),
                rs.getDate("planned_start_date").toLocalDate(), rs.getDate("planned_end_date").toLocalDate(),
                rs.getBigDecimal("budget"), rs.getString("summary"), ProjectStatus.valueOf(rs.getString("business_status")),
                approval == null ? null : approval.longValue(), rs.getTimestamp("created_at").toLocalDateTime(),
                rs.getTimestamp("updated_at").toLocalDateTime());
    }

    private void validate(ProjectDtos.Request r) {
        if (!r.plannedStartDate().isBefore(r.plannedEndDate()))
            throw new BusinessException(40030, "计划开始日期必须早于结束日期");
    }
    private void validatePage(int page, int size) {
        if (page < 0 || size < 1 || size > 100) throw new BusinessException(40002, "分页参数范围为 page>=0 且 1<=size<=100");
    }
}
