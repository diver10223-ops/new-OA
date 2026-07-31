INSERT INTO sys_department VALUES (1,NULL,'数字化中心','DIGITAL',1,1),(2,1,'研发部','RD',1,1),(3,1,'项目管理部','PMO',2,1);
INSERT INTO sys_role VALUES (1,'EMPLOYEE','普通员工',1),(2,'DEPT_MANAGER','部门负责人',1),(3,'PROJECT_MANAGER','项目管理人员',1),(4,'ADMIN','系统管理员',1);
INSERT INTO sys_user(id,department_id,username,password_hash,display_name,email,status) VALUES
(1,2,'employee','${passwordHash}','张员工','employee@example.com',1),(2,2,'manager','${passwordHash}','李经理','manager@example.com',1),(3,3,'project','${passwordHash}','王项目','project@example.com',1),(4,1,'admin','${passwordHash}','系统管理员','admin@example.com',1);
INSERT INTO sys_user_role VALUES (1,1),(2,2),(3,3),(4,4);
INSERT INTO sys_menu VALUES (1,NULL,'工作台','/dashboard','dashboard:view','MENU',1,1),(2,NULL,'统一审批','/approval',NULL,'DIRECTORY',2,1),(3,2,'我的待办','/approval/pending','approval:task:view','MENU',1,1),(4,2,'我的已办','/approval/completed','approval:task:view','MENU',2,1),(5,NULL,'我的申请','/applications',NULL,'DIRECTORY',3,1),(6,5,'请假申请','/leave','leave:view','MENU',1,1),(7,5,'立项申请','/project','project:view','MENU',2,1),(8,NULL,'系统管理','/system','system:view','MENU',9,1);
INSERT INTO sys_role_menu SELECT 1,id FROM sys_menu WHERE id<=7; INSERT INTO sys_role_menu SELECT 2,id FROM sys_menu WHERE id<=7; INSERT INTO sys_role_menu SELECT 3,id FROM sys_menu WHERE id<=7; INSERT INTO sys_role_menu SELECT 4,id FROM sys_menu;
INSERT INTO sys_dictionary VALUES (1,'LEAVE_TYPE','ANNUAL','年假','ANNUAL',1,1),(2,'LEAVE_TYPE','SICK','病假','SICK',2,1),(3,'APPROVAL_STATUS','PENDING','审批中','PENDING',1,1),(4,'APPROVAL_STATUS','APPROVED','已通过','APPROVED',2,1);
