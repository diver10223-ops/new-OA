package com.smartoa.assistant;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AskLeaderHtmlIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    void servesLeaderPageWithoutAuthentication() throws Exception {
        mvc.perform(get("/ask-leader.html"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
                .andExpect(content().string(org.hamcrest.Matchers.allOf(
                        org.hamcrest.Matchers.containsString("行长经营问数台"),
                        org.hamcrest.Matchers.containsString("demo_leader"),
                        org.hamcrest.Matchers.containsString("/api/assistant/execute"),
                        org.hamcrest.Matchers.containsString("查看执行轨迹"))));
    }

    @Test
    void executesHeadquartersQueryAndReturnsSevenOrderedTraceStages() throws Exception {
        String body = mvc.perform(post("/api/assistant/execute")
                        .header("X-User-Id", "demo_leader")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"text\":\"总部存款余额是多少\",\"org\":\"HEADQUARTERS\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.result.org").value("HEADQUARTERS"))
                .andExpect(jsonPath("$.result.value").exists())
                .andExpect(jsonPath("$.traceId").isNotEmpty())
                .andReturn().getResponse().getContentAsString();
        JsonNode response = objectMapper.readTree(body);
        String traceBody = mvc.perform(get("/api/assistant/trace/{id}", response.get("traceId").asText())
                        .header("X-User-Id", "demo_leader"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        List<String> stages = objectMapper.readTree(traceBody).get("stages").findValuesAsText("stage");
        assertThat(stages).containsExactly("INPUT_RECEIVED", "INTENT_MATCHED", "SLOTS_EXTRACTED",
                "SCENARIO_SELECTED", "SKILL_EXECUTED", "TEMPLATE_SELECTED", "RESULT_CREATED");
    }
}
