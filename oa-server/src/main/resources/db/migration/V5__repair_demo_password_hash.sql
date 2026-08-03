-- Repair only untouched demo credentials created by V2. User-changed passwords are preserved.
UPDATE sys_user
SET password_hash = '${passwordHash}'
WHERE username IN ('employee', 'manager', 'project', 'admin')
  AND password_hash = '$2a$10$7EqJtq98hPqEX7fNZaFWoO5u5P6Bdb2ZJXJYl0vQefTnCikH8eRrW';
