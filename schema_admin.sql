-- Healthcare Admin Database
CREATE DATABASE IF NOT EXISTS healthcare_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE healthcare_admin;

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

CREATE TABLE IF NOT EXISTS specializations (
  id          CHAR(36)     NOT NULL,
  name        VARCHAR(100) NOT NULL,
  description TEXT         NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_specializations_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

CREATE TABLE IF NOT EXISTS hospital_services (
  id              CHAR(36)      NOT NULL,
  name            VARCHAR(100)  NOT NULL,
  description     TEXT          NULL,
  icon_name       VARCHAR(50)   NOT NULL DEFAULT 'Heart',
  color_gradient  VARCHAR(120)  NOT NULL DEFAULT 'from-primary-400 to-primary-600',
  bg_class        VARCHAR(120)  NOT NULL DEFAULT 'bg-primary-50',
  availability    VARCHAR(100)  NOT NULL DEFAULT 'Mon-Fri',
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
  patient_count   INT           NOT NULL DEFAULT 0,
  doctor_count    INT           NOT NULL DEFAULT 0,
  sort_order      INT           NOT NULL DEFAULT 0,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_hs_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS system_settings (
  id          CHAR(36)     NOT NULL,
  key_name    VARCHAR(100) NOT NULL,
  value       TEXT         NOT NULL,
  description VARCHAR(500) NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ss_key (key_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Seed default hospital services ──────────────────────────────────────────
INSERT IGNORE INTO hospital_services (id, name, description, icon_name, color_gradient, bg_class, availability, is_active, patient_count, doctor_count, sort_order) VALUES
  (UUID(), 'Cardiology',       'Heart and cardiovascular system care with cutting-edge diagnostics',    'Heart',       'from-red-400 to-rose-600',        'bg-red-50 dark:bg-red-950/30',         'Mon–Sat', 1, 2400, 8,  1),
  (UUID(), 'Neurology',        'Brain, spine, and nervous system treatment',                           'Brain',       'from-violet-400 to-purple-600',   'bg-violet-50 dark:bg-violet-950/30',   'Mon–Fri', 1, 1800, 6,  2),
  (UUID(), 'Orthopedics',      'Bone, joint, and musculoskeletal care',                               'Bone',        'from-orange-400 to-amber-600',    'bg-orange-50 dark:bg-orange-950/30',   'Mon–Sat', 1, 3100, 10, 3),
  (UUID(), 'Pediatrics',       'Child and adolescent healthcare specialists',                          'Baby',        'from-pink-400 to-fuchsia-600',    'bg-pink-50 dark:bg-pink-950/30',       'Mon–Sat', 1, 4200, 12, 4),
  (UUID(), 'Ophthalmology',    'Complete eye care from routine exams to complex surgeries',           'Eye',         'from-cyan-400 to-teal-600',       'bg-cyan-50 dark:bg-cyan-950/30',       'Mon–Fri', 1, 1500, 5,  5),
  (UUID(), 'Oncology',         'Compassionate cancer diagnosis and treatment',                         'Microscope',  'from-emerald-400 to-green-600',   'bg-emerald-50 dark:bg-emerald-950/30', 'Mon–Fri', 1, 900,  7,  6),
  (UUID(), 'Immunology',       'Allergy, immunotherapy and autoimmune conditions',                     'Syringe',     'from-yellow-400 to-orange-500',   'bg-yellow-50 dark:bg-yellow-950/30',   'Tue–Thu', 1, 1100, 4,  7),
  (UUID(), 'Emergency',        '24/7 emergency and trauma care rapid response',                        'HeartPulse',  'from-red-500 to-red-700',         'bg-red-50 dark:bg-red-950/30',         '24/7',    1, 6000, 20, 8),
  (UUID(), 'Lab & Diagnostics','Blood tests, imaging, and complete diagnostic services',              'FlaskConical','from-indigo-400 to-blue-600',     'bg-indigo-50 dark:bg-indigo-950/30',   'Mon–Sat', 1, 8500, 15, 9);

-- ─── Seed default system settings ────────────────────────────────────────────
INSERT IGNORE INTO system_settings (id, key_name, value, description) VALUES
  (UUID(), 'hospital_name',         'HealthCare+',                     'Display name of the hospital'),
  (UUID(), 'hospital_address',      '123 Medical Center Dr, Suite 400','Hospital street address'),
  (UUID(), 'hospital_phone',        '+1 (800) HEALTH-1',               'Primary contact phone'),
  (UUID(), 'hospital_email',        'care@healthcare-plus.com',        'Primary contact email'),
  (UUID(), 'appointment_slot_mins', '30',                              'Default appointment slot duration in minutes'),
  (UUID(), 'max_advance_days',      '90',                              'How many days ahead patients can book'),
  (UUID(), 'cancellation_hours',    '24',                              'Minimum hours before appointment to allow cancellation'),
  (UUID(), 'emergency_number',      '911',                             'Emergency contact number shown to patients');
