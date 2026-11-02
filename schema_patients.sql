-- Healthcare Patients Database
CREATE DATABASE IF NOT EXISTS healthcare_patients CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE healthcare_patients;

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
  UNIQUE KEY uq_patients_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
