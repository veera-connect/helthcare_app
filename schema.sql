-- Healthcare App — Full Schema
-- Run against MySQL 8.4:  mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS healthcare_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE healthcare_db;

-- ─── users ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                    CHAR(36)     NOT NULL,
  email                 VARCHAR(255) NOT NULL,
  hashed_password       VARCHAR(255) NOT NULL,
  role                  ENUM('admin','doctor','patient','receptionist') NOT NULL,
  is_active             TINYINT(1)   NOT NULL DEFAULT 1,
  is_verified           TINYINT(1)   NOT NULL DEFAULT 0,
  failed_login_attempts INT          NOT NULL DEFAULT 0,
  created_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at            DATETIME     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY ix_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── specializations ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS specializations (
  id          CHAR(36)     NOT NULL,
  name        VARCHAR(100) NOT NULL,
  description TEXT         NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_specializations_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── patients ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
  id                      CHAR(36)     NOT NULL,
  user_id                 CHAR(36)     NOT NULL,
  first_name              VARCHAR(100) NOT NULL,
  last_name               VARCHAR(100) NOT NULL,
  date_of_birth           DATE         NULL,
  gender                  ENUM('male','female','other','prefer_not_to_say') NULL,
  phone                   VARCHAR(20)  NULL,
  address                 TEXT         NULL,
  blood_group             ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown') NOT NULL DEFAULT 'Unknown',
  emergency_contact_name  VARCHAR(200) NULL,
  emergency_contact_phone VARCHAR(20)  NULL,
  created_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at              DATETIME     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_patients_user_id (user_id),
  CONSTRAINT fk_patients_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── doctors ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctors (
  id                  CHAR(36)     NOT NULL,
  user_id             CHAR(36)     NOT NULL,
  first_name          VARCHAR(100) NOT NULL,
  last_name           VARCHAR(100) NOT NULL,
  license_number      VARCHAR(100) NOT NULL,
  phone               VARCHAR(20)  NULL,
  bio                 TEXT         NULL,
  years_of_experience INT          NULL,
  consultation_fee    DOUBLE       NULL,
  is_available        TINYINT(1)   NOT NULL DEFAULT 1,
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at          DATETIME     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_doctors_user_id (user_id),
  UNIQUE KEY uq_doctors_license (license_number),
  CONSTRAINT fk_doctors_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── doctor_specializations (junction) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctor_specializations (
  doctor_id         CHAR(36) NOT NULL,
  specialization_id CHAR(36) NOT NULL,
  PRIMARY KEY (doctor_id, specialization_id),
  CONSTRAINT fk_ds_doctor         FOREIGN KEY (doctor_id)         REFERENCES doctors         (id) ON DELETE CASCADE,
  CONSTRAINT fk_ds_specialization FOREIGN KEY (specialization_id) REFERENCES specializations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── doctor_availabilities ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctor_availabilities (
  id                    CHAR(36)   NOT NULL,
  doctor_id             CHAR(36)   NOT NULL,
  day_of_week           INT        NOT NULL,   -- 0=Monday … 6=Sunday
  start_time            VARCHAR(5) NOT NULL,   -- "09:00"
  end_time              VARCHAR(5) NOT NULL,   -- "17:00"
  slot_duration_minutes INT        NOT NULL DEFAULT 30,
  created_at            DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_da_doctor FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── appointments ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS appointments (
  id                  CHAR(36)     NOT NULL,
  patient_id          CHAR(36)     NOT NULL,
  doctor_id           CHAR(36)     NOT NULL,
  scheduled_at        DATETIME     NOT NULL,
  duration_minutes    INT          NOT NULL DEFAULT 30,
  status              ENUM('scheduled','confirmed','cancelled','completed','no_show') NOT NULL DEFAULT 'scheduled',
  reason              VARCHAR(500) NULL,
  notes               TEXT         NULL,
  cancellation_reason VARCHAR(500) NULL,
  cancelled_at        DATETIME     NULL,
  created_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_appt_patient_status   (patient_id, status),
  KEY ix_appt_doctor_scheduled (doctor_id, scheduled_at),
  CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
  CONSTRAINT fk_appt_doctor  FOREIGN KEY (doctor_id)  REFERENCES doctors  (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── medical_records ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medical_records (
  id             CHAR(36)     NOT NULL,
  patient_id     CHAR(36)     NOT NULL,
  doctor_id      CHAR(36)     NULL,
  appointment_id CHAR(36)     NULL,
  record_type    ENUM('consultation','lab_report','prescription','imaging','surgery','discharge_summary','other') NOT NULL,
  title          VARCHAR(200) NOT NULL,
  description    TEXT         NULL,
  diagnosis      TEXT         NULL,
  treatment      TEXT         NULL,
  record_date    DATE         NOT NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at     DATETIME     NULL,
  PRIMARY KEY (id),
  KEY ix_medical_record_patient (patient_id),
  CONSTRAINT fk_mr_patient     FOREIGN KEY (patient_id)     REFERENCES patients     (id) ON DELETE CASCADE,
  CONSTRAINT fk_mr_doctor      FOREIGN KEY (doctor_id)      REFERENCES doctors      (id) ON DELETE SET NULL,
  CONSTRAINT fk_mr_appointment FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── prescriptions ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prescriptions (
  id                CHAR(36)     NOT NULL,
  medical_record_id CHAR(36)     NOT NULL,
  medication_name   VARCHAR(200) NOT NULL,
  dosage            VARCHAR(100) NOT NULL,
  frequency         VARCHAR(100) NOT NULL,
  duration          VARCHAR(100) NULL,
  instructions      TEXT         NULL,
  start_date        DATE         NULL,
  end_date          DATE         NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_rx_medical_record FOREIGN KEY (medical_record_id) REFERENCES medical_records (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── medical_documents ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medical_documents (
  id                CHAR(36)     NOT NULL,
  patient_id        CHAR(36)     NOT NULL,
  medical_record_id CHAR(36)     NULL,
  file_name         VARCHAR(255) NOT NULL,
  file_path         VARCHAR(500) NOT NULL,
  mime_type         VARCHAR(100) NOT NULL,
  file_size_bytes   INT          NOT NULL,
  description       VARCHAR(500) NULL,
  created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        DATETIME     NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_md_patient        FOREIGN KEY (patient_id)        REFERENCES patients       (id) ON DELETE CASCADE,
  CONSTRAINT fk_md_medical_record FOREIGN KEY (medical_record_id) REFERENCES medical_records (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── audit_logs ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id            CHAR(36)     NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actor_id      CHAR(36)     NULL,
  action        ENUM('create','read','update','delete','login','logout','login_failed','password_reset','file_upload','ai_query') NOT NULL,
  resource_type VARCHAR(100) NULL,
  resource_id   VARCHAR(100) NULL,
  ip_address    VARCHAR(45)  NULL,
  user_agent    VARCHAR(500) NULL,
  details       TEXT         NULL,
  PRIMARY KEY (id),
  KEY ix_audit_actor    (actor_id),
  KEY ix_audit_resource (resource_type, resource_id),
  KEY ix_audit_created  (created_at),
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
