-- =============================================================
--  ScrapWale - Complete Database Setup for Supabase (PostgreSQL)
--
--  HOW TO RUN:
--    Supabase Dashboard → SQL Editor → paste entire file → Run
--
--  Safe to run multiple times — drops everything and rebuilds.
--  Column names are 100% identical to the application code.
-- =============================================================


-- =============================================================
-- STEP 1: Drop existing objects cleanly (reverse FK order)
--         CASCADE handles any leftover constraints automatically
-- =============================================================
DROP TABLE IF EXISTS "scrapData"        CASCADE;
DROP TABLE IF EXISTS "scrapCollection"  CASCADE;
DROP TABLE IF EXISTS "userRequest"      CASCADE;
DROP TABLE IF EXISTS "scrapDetails"     CASCADE;
DROP TABLE IF EXISTS "users"            CASCADE;

DROP FUNCTION IF EXISTS set_updated_at() CASCADE;


-- =============================================================
-- STEP 2: Recreate the updated_at trigger function
-- =============================================================
CREATE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================
-- TABLE 1: users
--
-- Exact columns used in code:
--   id, name, email, mobile_No, address, role, password
-- =============================================================
CREATE TABLE "users" (
  id          SERIAL        PRIMARY KEY,
  "mobile_No" VARCHAR(15)   NOT NULL,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL,
  address     TEXT          NOT NULL,
  role        VARCHAR(20)   NOT NULL
                CHECK (role IN ('admin', 'agent', 'factory', 'call_agent')),
  password    VARCHAR(255)  NOT NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_users_mobile_no UNIQUE ("mobile_No")
);

CREATE INDEX idx_users_role ON "users" (role);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON "users"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================
-- TABLE 2: scrapDetails
--
-- Exact columns used in code:
--   id, category, type, price
-- =============================================================
CREATE TABLE "scrapDetails" (
  id          SERIAL        PRIMARY KEY,
  category    VARCHAR(100)  NOT NULL,
  type        VARCHAR(100)  NOT NULL,
  price       NUMERIC(10,2) NOT NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_scrapdetails_type_col UNIQUE (type)
);

CREATE INDEX idx_scrapdetails_category ON "scrapDetails" (category);

CREATE TRIGGER trg_scrapdetails_updated_at
  BEFORE UPDATE ON "scrapDetails"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================
-- TABLE 3: userRequest
--
-- Exact columns used in code:
--   id, name, mobile_No, address, email, pickUp_Date,
--   time_slot, description, status,
--   call_agent_id, call_agent_notes, call_approved_at,
--   accepted_agent_id, agent_accepted_at, collected_at
-- =============================================================
CREATE TABLE "userRequest" (
  id                  SERIAL        PRIMARY KEY,
  name                VARCHAR(100)  NOT NULL,
  "mobile_No"         VARCHAR(15)   NOT NULL,
  address             TEXT          NOT NULL,
  email               VARCHAR(150)  NOT NULL,
  "pickUp_Date"       DATE          NOT NULL,
  time_slot           VARCHAR(50)   NOT NULL,
  description         TEXT          NOT NULL,
  status              VARCHAR(50)   DEFAULT 'Pending',

  call_agent_id       INT           REFERENCES "users" (id) ON DELETE SET NULL ON UPDATE CASCADE,
  call_agent_notes    TEXT,
  call_approved_at    TIMESTAMPTZ,

  accepted_agent_id   INT           REFERENCES "users" (id) ON DELETE SET NULL ON UPDATE CASCADE,
  agent_accepted_at   TIMESTAMPTZ,
  collected_at        TIMESTAMPTZ,

  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_userrequest_status         ON "userRequest" (status);
CREATE INDEX idx_userrequest_call_agent_id  ON "userRequest" (call_agent_id);
CREATE INDEX idx_userrequest_accepted_agent ON "userRequest" (accepted_agent_id);

CREATE TRIGGER trg_userrequest_updated_at
  BEFORE UPDATE ON "userRequest"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================
-- TABLE 4: scrapCollection
--
-- Exact columns used in code:
--   id (VARCHAR e.g. COLL-20250518-123),
--   agentname, agent_MobileNo,
--   customername, customer_MobileNo, customerEmail,
--   address, totalamount, paymentstatus, dateNtime,
--   approval_status, factory_employee_id, factory_notes,
--   collected_at
-- =============================================================
CREATE TABLE "scrapCollection" (
  id                   VARCHAR(30)   PRIMARY KEY,
  agentname            VARCHAR(100)  NOT NULL,
  "agent_MobileNo"     VARCHAR(15)   NOT NULL,
  customername         VARCHAR(100)  NOT NULL,
  "customer_MobileNo"  VARCHAR(15)   NOT NULL,
  "customerEmail"      VARCHAR(150)  NOT NULL,
  address              TEXT          NOT NULL,
  totalamount          NUMERIC(12,2) NOT NULL,
  paymentstatus        VARCHAR(50)   NOT NULL,
  "dateNtime"          TIMESTAMPTZ   NOT NULL,

  approval_status      VARCHAR(20)   NOT NULL DEFAULT 'pending'
                         CHECK (approval_status IN ('pending', 'collected')),
  factory_employee_id  INT           REFERENCES "users" (id) ON DELETE SET NULL ON UPDATE CASCADE,
  factory_notes        TEXT,
  collected_at         TIMESTAMPTZ,

  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scrapcollection_agent_mobileno  ON "scrapCollection" ("agent_MobileNo");
CREATE INDEX idx_scrapcollection_approval_status ON "scrapCollection" (approval_status);
CREATE INDEX idx_scrapcollection_factory_emp_id  ON "scrapCollection" (factory_employee_id);
CREATE INDEX idx_scrapcollection_datentiime      ON "scrapCollection" ("dateNtime");

CREATE TRIGGER trg_scrapcollection_updated_at
  BEFORE UPDATE ON "scrapCollection"
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================
-- TABLE 5: scrapData
--
-- Exact columns used in code:
--   item_id, id (FK → scrapCollection.id),
--   category, type, weight, price, subtotal
-- =============================================================
CREATE TABLE "scrapData" (
  item_id    SERIAL        PRIMARY KEY,
  id         VARCHAR(30)   NOT NULL
               REFERENCES "scrapCollection" (id) ON DELETE CASCADE ON UPDATE CASCADE,
  category   VARCHAR(100)  NOT NULL,
  type       VARCHAR(100)  NOT NULL,
  weight     NUMERIC(10,3) NOT NULL,
  price      NUMERIC(10,2) NOT NULL,
  subtotal   NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scrapdata_id       ON "scrapData" (id);
CREATE INDEX idx_scrapdata_category ON "scrapData" (category);


-- =============================================================
-- SEED DATA
-- =============================================================

-- Default admin user
-- ⚠️  Replace hash before going live. Generate with:
--   node -e "require('bcrypt').hash('Admin@1234',12).then(console.log)"
INSERT INTO "users" (name, email, "mobile_No", address, role, password)
VALUES (
  'Admin',
  'admin@scrapwale.com',
  '9000000000',
  'Head Office',
  'admin',
  '$2b$12$REPLACE_WITH_REAL_BCRYPT_HASH_FOR_ADMIN'
);

-- Default factory manager
-- ⚠️  Replace hash before going live. Generate with:
--   node -e "require('bcrypt').hash('Factory@1234',12).then(console.log)"
INSERT INTO "users" (name, email, "mobile_No", address, role, password)
VALUES (
  'Factory Manager',
  'factory@scrapwale.com',
  '9876543210',
  'Factory Address',
  'factory',
  '$2b$12$REPLACE_WITH_REAL_BCRYPT_HASH_FOR_FACTORY'
);

-- Sample scrap price list
INSERT INTO "scrapDetails" (category, type, price) VALUES
  ('Metal',   'Iron',          5.00),
  ('Metal',   'Copper',       45.00),
  ('Metal',   'Aluminium',    20.00),
  ('Metal',   'Steel',         8.00),
  ('Paper',   'Newspaper',     2.00),
  ('Paper',   'Cardboard',     3.00),
  ('Paper',   'Books',         4.00),
  ('Plastic', 'PET Bottles',   6.00),
  ('Plastic', 'Hard Plastic',  5.00),
  ('Glass',   'Glass Bottles', 1.50),
  ('E-Waste', 'Mobile Phone', 50.00),
  ('E-Waste', 'Laptop',      200.00);

-- =============================================================
-- END OF SCRIPT
-- =============================================================
