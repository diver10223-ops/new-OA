package com.smartoa;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.util.concurrent.CompletableFuture;

@SpringBootTest
@AutoConfigureMockMvc
class CoreBusinessFlowTest {
    @Autowired
    MockMvc mvc;
    @Autowired
    ObjectMapper json;
    @Autowired
    JdbcTemplate db;

    @MockBean
    PasswordEncoder passwordEncoder;

    @BeforeEach
    void setupAuthMock() {
        when(passwordEncoder.matches(ArgumentMatchers.any(CharSequence.class), ArgumentMatchers.anyString()))
                .thenAnswer(invocation -> {
                    CharSequence raw = invocation.getArgument(0);
                    return raw != null && "password".contentEquals(raw);
                });
    }

    @Test
    void leaveSupportsDraftEditSubmitApproveAndRejectWithPermissionBoundaries() throws Exception {
        String employee = token("employee"), manager = token("manager"), project = token("project");
        long approved = createLeave(employee, "待修改");
        mvc.perform(put("/api/leave-applications/{id}", approved).header("Authorization", employee)
                        .contentType(MediaType.APPLICATION_JSON).content(leaveJson("修改后")))
                .andExpect(status().isOk());
        submitLeave(employee, approved);
        long task = pendingTask("LEAVE", approved);

        mvc.perform(get("/api/leave-applications/{id}", approved).header("Authorization", project))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value(40311));
        mvc.perform(post("/api/approval/tasks/{id}/approve", task).header("Authorization", project)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"comment\":\"越权\"}"))
                .andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value(40302));
        decide(manager, task, true).andExpect(status().isOk());
        assertThat(dbStatus("leave_application", approved)).isEqualTo("EFFECTIVE");
        decide(manager, task, true).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value(40902));
        mvc.perform(post("/api/leave-applications/{id}/withdraw", approved).header("Authorization", employee))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value(40912));

        long rejected = createLeave(employee, "拒绝流程"); submitLeave(employee, rejected);
        decide(manager, pendingTask("LEAVE", rejected), false).andExpect(status().isOk());
        assertThat(dbStatus("leave_application", rejected)).isEqualTo("REJECTED");
    }

    @Test
    void withdrawalClosesPendingTaskAndSynchronizesLeaveState() throws Exception {
        String employee = token("employee"), manager = token("manager");
        long id = createLeave(employee, "撤回流程"); submitLeave(employee, id);
        long task = pendingTask("LEAVE", id);
        mvc.perform(post("/api/leave-applications/{id}/withdraw", id).header("Authorization", employee))
                .andExpect(status().isOk());
        assertThat(dbStatus("leave_application", id)).isEqualTo("CANCELLED");
        assertThat(db.queryForObject("select status from approval_task where id=?", String.class, task)).isEqualTo("CANCELLED");
        decide(manager, task, true).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value(40902));
    }

    @Test
    void projectApprovalIsStrictlySerialAndFinalCallbackEstablishesProject() throws Exception {
        String employee = token("employee"), manager = token("manager"), reviewer = token("project");
        long id = createProject(employee, "串行立项"); submitProject(employee, id);
        long first = pendingTask("PROJECT", id);
        assertThat(taskCount(id, "PROJECT_REVIEW")).isZero();
        decide(manager, first, true).andExpect(status().isOk());
        assertThat(dbStatus("project_application", id)).isEqualTo("SUBMITTED");
        assertThat(taskCount(id, "PROJECT_REVIEW")).isEqualTo(1);
        long second = pendingTask("PROJECT", id);
        decide(reviewer, second, true).andExpect(status().isOk());
        assertThat(dbStatus("project_application", id)).isEqualTo("ESTABLISHED");
    }

    @Test
    void firstProjectRejectionDoesNotCreateReviewTask() throws Exception {
        String employee = token("employee"), manager = token("manager");
        long id = createProject(employee, "初审拒绝"); submitProject(employee, id);
        decide(manager, pendingTask("PROJECT", id), false).andExpect(status().isOk());
        assertThat(dbStatus("project_application", id)).isEqualTo("REJECTED");
        assertThat(taskCount(id, "PROJECT_REVIEW")).isZero();
    }

    @Test
    void projectCanBeWithdrawnBeforeFirstDecision() throws Exception {
        String employee = token("employee"), manager = token("manager");
        long id = createProject(employee, "撤回立项"); submitProject(employee, id);
        long task = pendingTask("PROJECT", id);
        mvc.perform(post("/api/project-applications/{id}/withdraw", id).header("Authorization", employee))
                .andExpect(status().isOk());
        assertThat(dbStatus("project_application", id)).isEqualTo("CANCELLED");
        assertThat(db.queryForObject("select status from approval_task where id=?", String.class, task)).isEqualTo("CANCELLED");
        decide(manager, task, true).andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value(40902));
    }

    @Test
    void optimisticLockConflictRollsBackTaskDecision() throws Exception {
        String employee = token("employee"), manager = token("manager");
        long id = createLeave(employee, "并发冲突"); submitLeave(employee, id);
        long task = pendingTask("LEAVE", id);
        var first = CompletableFuture.supplyAsync(() -> decisionStatus(manager, task));
        var second = CompletableFuture.supplyAsync(() -> decisionStatus(manager, task));
        assertThat(java.util.List.of(first.get(), second.get())).containsExactlyInAnyOrder(200, 400);
        assertThat(db.queryForObject("select status from approval_task where id=?", String.class, task)).isEqualTo("APPROVED");
        assertThat(dbStatus("leave_application", id)).isEqualTo("EFFECTIVE");
    }

    private String token(String username) throws Exception {
        String body = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"" + username + "\",\"password\":\"password\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return "Bearer " + json.readTree(body).path("data").path("token").asText();
    }

    private long createLeave(String auth, String reason) throws Exception {
        String body = mvc.perform(post("/api/leave-applications").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON).content(leaveJson(reason)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.id").isNumber())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(body).path("data").path("id").asLong();
    }

    private String leaveJson(String reason) {
        return "{\"leaveType\":\"ANNUAL\",\"startTime\":\"2030-01-01T09:00:00Z\",\"endTime\":\"2030-01-01T18:00:00Z\",\"reason\":\"" + reason + "\"}";
    }

    private void submitLeave(String auth, long id) throws Exception {
        mvc.perform(post("/api/leave-applications/{id}/submit", id).header("Authorization", auth))
                .andExpect(status().isOk());
    }

    private long createProject(String auth, String name) throws Exception {
        String request = "{\"projectName\":\"" + name + "\",\"projectOwner\":\"张员工\",\"plannedStartDate\":\"2030-02-01\",\"plannedEndDate\":\"2030-03-01\",\"budget\":1000,\"summary\":\"验收流程\"}";
        String body = mvc.perform(post("/api/project-applications").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return json.readTree(body).path("data").path("id").asLong();
    }

    private void submitProject(String auth, long id) throws Exception {
        mvc.perform(post("/api/project-applications/{id}/submit", id).header("Authorization", auth))
                .andExpect(status().isOk());
    }

    private org.springframework.test.web.servlet.ResultActions decide(String auth, long task, boolean approve) throws Exception {
        return mvc.perform(post("/api/approval/tasks/{id}/{action}", task, approve ? "approve" : "reject")
                .header("Authorization", auth).contentType(MediaType.APPLICATION_JSON).content("{\"comment\":\"验收意见\"}"));
    }

    private int decisionStatus(String auth, long task) {
        try {
            return decide(auth, task, true).andReturn().getResponse().getStatus();
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }

    private long pendingTask(String type, long businessId) {
        return db.queryForObject("select t.id from approval_task t join approval_instance i on i.id=t.instance_id where i.business_type=? and i.business_id=? and t.status='PENDING'", Long.class, type, businessId);
    }

    private String dbStatus(String table, long id) {
        return db.queryForObject("select business_status from " + table + " where id=?", String.class, id);
    }

    private int taskCount(long businessId, String node) {
        return db.queryForObject("select count(*) from approval_task t join approval_instance i on i.id=t.instance_id where i.business_type='PROJECT' and i.business_id=? and t.node_code=?", Integer.class, businessId, node);
    }
}