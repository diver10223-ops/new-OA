CREATE TABLE oa_sequence (
    sequence_name VARCHAR(50) PRIMARY KEY,
    next_value BIGINT NOT NULL
);

INSERT INTO oa_sequence(sequence_name, next_value) VALUES ('global', 10000);
INSERT INTO oa_sequence(sequence_name, next_value) VALUES ('audit', 10000);

ALTER TABLE project_application ADD COLUMN application_no VARCHAR(40);
ALTER TABLE project_application ADD COLUMN department_id BIGINT;
ALTER TABLE project_application ADD COLUMN project_owner VARCHAR(100);
ALTER TABLE project_application ADD COLUMN planned_start_date DATE;
ALTER TABLE project_application ADD COLUMN planned_end_date DATE;
ALTER TABLE project_application ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE project_application ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX uk_project_application_no ON project_application(application_no);
CREATE UNIQUE INDEX uk_project_code ON project_application(project_code);
CREATE INDEX idx_project_applicant_created ON project_application(applicant_id, created_at);
CREATE INDEX idx_project_status ON project_application(business_status);

ALTER TABLE sys_operation_log ADD COLUMN business_id BIGINT;
ALTER TABLE sys_operation_log ADD COLUMN trace_id VARCHAR(64);
