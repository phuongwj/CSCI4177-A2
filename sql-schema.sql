-- Minimal schema: only what POST /groups and GET /groups need.
-- MySQL version — run this in your MySQL client or via mysql CLI.
 
-- MySQL doesn't auto-generate UUIDs by default; UUIDs are generated
-- in application code (Node crypto.randomUUID()) and passed in as strings.
-- CHAR(36) stores the standard UUID string format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

CREATE DATABASE expensetracker;
USE expensetracker;
 
CREATE TABLE user (
  id              CHAR(36)      PRIMARY KEY,
  email           VARCHAR(255)  NOT NULL UNIQUE,
  password_hash   VARCHAR(255)  NOT NULL,
  first_name      VARCHAR(100)  NOT NULL,
  last_name       VARCHAR(100)  NOT NULL,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
 
CREATE TABLE user_group (
  id          CHAR(36)      PRIMARY KEY,
  name        VARCHAR(150)  NOT NULL,
  created_by  CHAR(36)      NOT NULL,
  join_code   VARCHAR(8)    NOT NULL UNIQUE,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES user(id)
);
 
CREATE TABLE group_member (
  group_id   CHAR(36)     NOT NULL,
  user_id    CHAR(36)     NOT NULL,
  role       VARCHAR(20)  NOT NULL DEFAULT 'member',
  joined_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (group_id, user_id),
  FOREIGN KEY (group_id) REFERENCES user_group(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES user(id)    ON DELETE CASCADE,
  CONSTRAINT chk_role CHECK (role IN ('leader', 'member'))
);

-- ── Placeholder data ─────────────────────────────────────────────
-- Password for both seeded users is "Password123!"
-- Hash below is a real bcrypt hash of that string (cost factor 10).
 
INSERT INTO user (id, email, password_hash, first_name, last_name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'alice@university.edu',
   '$2b$10$BVUk1Ryj3DVb6p7m3Zev5.t7n4cGLB5taL2bDBAYNLKxpvJv/IHRa', 'Alice', 'Smith'),
  ('22222222-2222-2222-2222-222222222222', 'bob@university.edu',
   '$2b$10$BVUk1Ryj3DVb6p7m3Zev5.t7n4cGLB5taL2bDBAYNLKxpvJv/IHRa', 'Bob', 'Lee');
 
-- one pre-existing group with Alice as leader, so GET /groups has data to return
INSERT INTO user_group (id, name, created_by, join_code) VALUES
  ('33333333-3333-3333-3333-333333333333', 'Roommates',
   '11111111-1111-1111-1111-111111111111', 'AB3X9K2P');
 
INSERT INTO group_member (group_id, user_id, role) VALUES
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'leader');
