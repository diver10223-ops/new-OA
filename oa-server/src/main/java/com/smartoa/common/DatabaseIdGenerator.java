package com.smartoa.common;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Transactional, database-backed identifier allocation shared by all modules. */
@Component
public class DatabaseIdGenerator {
    private final JdbcTemplate jdbc;

    public DatabaseIdGenerator(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional
    public long nextId() {
        return nextId("global");
    }

    @Transactional
    public long nextId(String sequence) {
        Long value = jdbc.queryForObject(
                "select next_value from oa_sequence where sequence_name=? for update", Long.class, sequence);
        if (value == null || jdbc.update(
                "update oa_sequence set next_value=? where sequence_name=? and next_value=?",
                value + 1, sequence, value) != 1) {
            throw new BusinessException(40909, "编号生成并发冲突");
        }
        return value;
    }
}
