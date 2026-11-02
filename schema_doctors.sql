-- Healthcare Doctors Database
CREATE DATABASE IF NOT EXISTS healthcare_doctors CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE healthcare_doctors;

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
  UNIQUE KEY uq_doctors_license (license_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS doctor_specializations (
  doctor_id         CHAR(36) NOT NULL,
  specialization_id CHAR(36) NOT NULL,
  PRIMARY KEY (doctor_id, specialization_id),
  CONSTRAINT fk_ds_doctor FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS doctor_availabilities (
  id                    CHAR(36)   NOT NULL,
  doctor_id             CHAR(36)   NOT NULL,
  day_of_week           INT        NOT NULL,
  start_time            VARCHAR(5) NOT NULL,
  end_time              VARCHAR(5) NOT NULL,
  slot_duration_minutes INT        NOT NULL DEFAULT 30,
  created_at            DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_da_doctor FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  CONSTRAINT fk_appt_doctor FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  CONSTRAINT fk_mr_doctor      FOREIGN KEY (doctor_id)      REFERENCES doctors      (id) ON DELETE SET NULL,
  CONSTRAINT fk_mr_appointment FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  CONSTRAINT fk_md_medical_record FOREIGN KEY (medical_record_id) REFERENCES medical_records (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
