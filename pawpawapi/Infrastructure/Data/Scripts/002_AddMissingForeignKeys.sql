-- =========================================================
-- Fix Missing Primary Key on appointments Table
-- =========================================================
-- The appointments table was created without a PRIMARY KEY
-- This script adds it so that foreign keys can reference it
-- =========================================================

-- Add PRIMARY KEY to appointments table if it doesn't exist
DO $$
BEGIN
    -- Check if primary key already exists
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'appointments_pkey'
            AND conrelid = 'public.appointments'::regclass
    ) THEN
        -- Add the primary key
        ALTER TABLE public.appointments
            ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);
        
        RAISE NOTICE 'PRIMARY KEY added to appointments table';
    ELSE
        RAISE NOTICE 'PRIMARY KEY already exists on appointments table';
    END IF;
END $$;

-- Verify the primary key was added
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    'appointments' as table_name
FROM pg_constraint
WHERE conname = 'appointments_pkey'
    AND conrelid = 'public.appointments'::regclass;

DO
$$
BEGIN
    -- ✅ Step 1: Drop NOT NULL constraint only if it exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'visit_invoices'
          AND column_name = 'clinic_id'
          AND is_nullable = 'NO'
    ) THEN
        RAISE NOTICE 'Dropping NOT NULL constraint on clinic_id...';
        EXECUTE 'ALTER TABLE visit_invoices ALTER COLUMN clinic_id DROP NOT NULL';
    ELSE
        RAISE NOTICE 'clinic_id column is already nullable. Skipping...';
    END IF;

    -- ✅ Step 2: Replace zero UUIDs with NULL
    IF EXISTS (
        SELECT 1 FROM visit_invoices
        WHERE clinic_id = '00000000-0000-0000-0000-000000000000'
    ) THEN
        RAISE NOTICE 'Updating zero UUIDs to NULL...';
        UPDATE visit_invoices
        SET clinic_id = NULL
        WHERE clinic_id = '00000000-0000-0000-0000-000000000000';
    ELSE
        RAISE NOTICE 'No zero UUIDs found. Skipping update...';
    END IF;

END
$$;

-- =========================================================
-- Summary
-- =========================================================
-- This script adds the missing PRIMARY KEY constraint to the
-- appointments table, which is required before other tables
-- can create foreign keys referencing appointments.id
-- =========================================================



-- =========================================================
-- Script to Add Missing Foreign Key Constraints
-- =========================================================
-- This script adds foreign key constraints that were missing
-- from the original table creation script.
-- Run this script after all tables have been created.
-- =========================================================

-- =========================================================
-- STEP 0: Fix Missing Primary Key on appointments Table
-- =========================================================
-- The appointments table was created without a PRIMARY KEY
-- We need to add it first before creating foreign keys
-- =========================================================

DO $$
BEGIN
    -- Check if primary key already exists
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'appointments_pkey'
            AND conrelid = 'public.appointments'::regclass
    ) THEN
        -- Add the primary key
        ALTER TABLE public.appointments
            ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);
        
        RAISE NOTICE 'PRIMARY KEY added to appointments table';
    ELSE
        RAISE NOTICE 'PRIMARY KEY already exists on appointments table';
    END IF;
END $$;

-- =========================================================
-- STEP 1: Add Foreign Key Constraints
-- =========================================================

DO
$$
BEGIN
    -- 1. appointments → patients
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_appointments_patient'
    ) THEN
        ALTER TABLE public.appointments
            ADD CONSTRAINT fk_appointments_patient
            FOREIGN KEY (patient_id)
            REFERENCES public.patients (id)
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;

    -- 2. appointments → appointment_type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_appointments_appointment_type'
    ) THEN
        ALTER TABLE public.appointments
            ADD CONSTRAINT fk_appointments_appointment_type
            FOREIGN KEY (appointment_type_id)
            REFERENCES public.appointment_type (appointment_type_id)
            ON UPDATE NO ACTION
            ON DELETE NO ACTION;
    END IF;

    -- 3. visits → appointments
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_visits_appointment'
    ) THEN
        ALTER TABLE public.visits
            ADD CONSTRAINT fk_visits_appointment
            FOREIGN KEY (appointment_id)
            REFERENCES public.appointments (id)
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;

    -- 4. visits → patients
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_visits_patient'
    ) THEN
        ALTER TABLE public.visits
            ADD CONSTRAINT fk_visits_patient
            FOREIGN KEY (patient_id)
            REFERENCES public.patients (id)
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;

    -- 5. medical_history_details → patients
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_medical_history_details_patient'
    ) THEN
        ALTER TABLE public.medical_history_details
            ADD CONSTRAINT fk_medical_history_details_patient
            FOREIGN KEY (patient_id)
            REFERENCES public.patients (id)
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;

    -- 6. medical_records → patients
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_medical_records_patient'
    ) THEN
        ALTER TABLE public.medical_records
            ADD CONSTRAINT fk_medical_records_patient
            FOREIGN KEY (patient_id)
            REFERENCES public.patients (id)
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;

    -- 7. medical_records → appointments
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_medical_records_appointment'
    ) THEN
        ALTER TABLE public.medical_records
            ADD CONSTRAINT fk_medical_records_appointment
            FOREIGN KEY (appointment_id)
            REFERENCES public.appointments (id)
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;

    -- 8. prescriptions → patients
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_prescriptions_patient'
    ) THEN
        ALTER TABLE public.prescriptions
            ADD CONSTRAINT fk_prescriptions_patient
            FOREIGN KEY (patient_id)
            REFERENCES public.patients (id)
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;

    -- 9. deworming_checkout → visits
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_deworming_checkout_visit'
    ) THEN
        ALTER TABLE public.deworming_checkout
            ADD CONSTRAINT fk_deworming_checkout_visit
            FOREIGN KEY (visit_id)
            REFERENCES public.visits (id)
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;

    -- 10. deworming_intake → visits
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_deworming_intake_visit'
    ) THEN
        ALTER TABLE public.deworming_intake
            ADD CONSTRAINT fk_deworming_intake_visit
            FOREIGN KEY (visit_id)
            REFERENCES public.visits (id)
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;

    -- 11. deworming_medication → visits
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_deworming_medication_visit'
    ) THEN
        ALTER TABLE public.deworming_medication
            ADD CONSTRAINT fk_deworming_medication_visit
            FOREIGN KEY (visit_id)
            REFERENCES public.visits (id)
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;

    -- 12. deworming_notes → visits
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_deworming_notes_visit'
    ) THEN
        ALTER TABLE public.deworming_notes
            ADD CONSTRAINT fk_deworming_notes_visit
            FOREIGN KEY (visit_id)
            REFERENCES public.visits (id)
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;

    -- 13. emergency_discharge → visits
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_emergency_discharge_visit'
    ) THEN
        ALTER TABLE public.emergency_discharge
            ADD CONSTRAINT fk_emergency_discharge_visit
            FOREIGN KEY (visit_id)
            REFERENCES public.visits (id)
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;

    -- 14. emergency_prescription → visits
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_emergency_prescription_visit'
    ) THEN
        ALTER TABLE public.emergency_prescription
            ADD CONSTRAINT fk_emergency_prescription_visit
            FOREIGN KEY (visit_id)
            REFERENCES public.visits (id)
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;

    -- 15. emergency_procedures → visits
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_emergency_procedures_visit'
    ) THEN
        ALTER TABLE public.emergency_procedures
            ADD CONSTRAINT fk_emergency_procedures_visit
            FOREIGN KEY (visit_id)
            REFERENCES public.visits (id)
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;

    -- 16. emergency_triage → visits
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_emergency_triage_visit'
    ) THEN
        ALTER TABLE public.emergency_triage
            ADD CONSTRAINT fk_emergency_triage_visit
            FOREIGN KEY (visit_id)
            REFERENCES public.visits (id)
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;

    -- 17. emergency_vitals → visits
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_emergency_vitals_visit'
    ) THEN
        ALTER TABLE public.emergency_vitals
            ADD CONSTRAINT fk_emergency_vitals_visit
            FOREIGN KEY (visit_id)
            REFERENCES public.visits (id)
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;

    -- 18. surgery_detail → visits
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_surgery_detail_visit'
    ) THEN
        ALTER TABLE public.surgery_detail
            ADD CONSTRAINT fk_surgery_detail_visit
            FOREIGN KEY (visit_id)
            REFERENCES public.visits (id)
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;

    -- 19. surgery_discharge → visits
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_surgery_discharge_visit'
    ) THEN
        ALTER TABLE public.surgery_discharge
            ADD CONSTRAINT fk_surgery_discharge_visit
            FOREIGN KEY (visit_id)
            REFERENCES public.visits (id)
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;

    -- 20. surgery_post_op → visits
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_surgery_post_op_visit'
    ) THEN
        ALTER TABLE public.surgery_post_op
            ADD CONSTRAINT fk_surgery_post_op_visit
            FOREIGN KEY (visit_id)
            REFERENCES public.visits (id)
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;

    -- 21. surgery_pre_op → visits
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_surgery_pre_op_visit'
    ) THEN
        ALTER TABLE public.surgery_pre_op
            ADD CONSTRAINT fk_surgery_pre_op_visit
            FOREIGN KEY (visit_id)
            REFERENCES public.visits (id)
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;

    -- 22. prescription_product_mapping → products
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_prescription_product_mapping_product'
    ) THEN
        ALTER TABLE public.prescription_product_mapping
            ADD CONSTRAINT fk_prescription_product_mapping_product
            FOREIGN KEY (product_id)
            REFERENCES public.products (id)
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;

    -- 23. inventory → suppliers
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_inventory_supplier'
    ) THEN
        ALTER TABLE public.inventory
            ADD CONSTRAINT fk_inventory_supplier
            FOREIGN KEY (supplier_id)
            REFERENCES public.suppliers (id)
            ON UPDATE NO ACTION
            ON DELETE SET NULL;
    END IF;

    -- 24. purchase_order_items → suppliers
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_purchase_order_items_supplier'
    ) THEN
        ALTER TABLE public.purchase_order_items
            ADD CONSTRAINT fk_purchase_order_items_supplier
            FOREIGN KEY (supplier_id)
            REFERENCES public.suppliers (id)
            ON UPDATE NO ACTION
            ON DELETE SET NULL;
    END IF;

    -- 25. purchase_order_receiving_history → users
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_purchase_order_receiving_history_received_by'
    ) THEN
        ALTER TABLE public.purchase_order_receiving_history
            ADD CONSTRAINT fk_purchase_order_receiving_history_received_by
            FOREIGN KEY (received_by)
            REFERENCES public.users (id)
            ON UPDATE NO ACTION
            ON DELETE SET NULL;
    END IF;

    -- 26. visit_invoices → clinics
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_visit_invoices_clinic'
    ) THEN
        ALTER TABLE public.visit_invoices
            ADD CONSTRAINT fk_visit_invoices_clinic
            FOREIGN KEY (clinic_id)
            REFERENCES public.clinics (id)
            ON UPDATE NO ACTION
            ON DELETE CASCADE;
    END IF;

    -- 27. screen_access → company
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_screen_access_company'
    ) THEN
        ALTER TABLE public.screen_access
            ADD CONSTRAINT fk_screen_access_company
            FOREIGN KEY (company_id)
            REFERENCES public.company (id)
            ON UPDATE CASCADE
            ON DELETE CASCADE;
    END IF;

    -- 28. client_registrations → users
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_client_registrations_approved_by'
    ) THEN
        ALTER TABLE public.client_registrations
            ADD CONSTRAINT fk_client_registrations_approved_by
            FOREIGN KEY (approved_by)
            REFERENCES public.users (id)
            ON UPDATE NO ACTION
            ON DELETE SET NULL;
    END IF;

END
$$;

-- =========================================================
-- Create Indexes for Foreign Key Columns (for performance)
-- =========================================================

-- Indexes for appointments table
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id
    ON public.appointments USING btree (patient_id ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_appointments_appointment_type_id
    ON public.appointments USING btree (appointment_type_id ASC NULLS LAST);

-- Indexes for visits table
CREATE INDEX IF NOT EXISTS idx_visits_appointment_id
    ON public.visits USING btree (appointment_id ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_visits_patient_id
    ON public.visits USING btree (patient_id ASC NULLS LAST);

-- Index for medical_history_details table
CREATE INDEX IF NOT EXISTS idx_medical_history_details_patient_id
    ON public.medical_history_details USING btree (patient_id ASC NULLS LAST);

-- Index for medical_records table
CREATE INDEX IF NOT EXISTS idx_medical_records_appointment_id
    ON public.medical_records USING btree (appointment_id ASC NULLS LAST);

-- Index for prescriptions table (patient_id already has an index)

-- Indexes for deworming tables
CREATE INDEX IF NOT EXISTS idx_deworming_checkout_visit_id
    ON public.deworming_checkout USING btree (visit_id ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_deworming_intake_visit_id
    ON public.deworming_intake USING btree (visit_id ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_deworming_medication_visit_id
    ON public.deworming_medication USING btree (visit_id ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_deworming_notes_visit_id
    ON public.deworming_notes USING btree (visit_id ASC NULLS LAST);

-- Indexes for emergency tables
CREATE INDEX IF NOT EXISTS idx_emergency_discharge_visit_id
    ON public.emergency_discharge USING btree (visit_id ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_emergency_prescription_visit_id
    ON public.emergency_prescription USING btree (visit_id ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_emergency_procedures_visit_id
    ON public.emergency_procedures USING btree (visit_id ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_emergency_triage_visit_id
    ON public.emergency_triage USING btree (visit_id ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_emergency_vitals_visit_id
    ON public.emergency_vitals USING btree (visit_id ASC NULLS LAST);

-- Indexes for surgery tables
CREATE INDEX IF NOT EXISTS idx_surgery_detail_visit_id
    ON public.surgery_detail USING btree (visit_id ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_surgery_discharge_visit_id
    ON public.surgery_discharge USING btree (visit_id ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_surgery_post_op_visit_id
    ON public.surgery_post_op USING btree (visit_id ASC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_surgery_pre_op_visit_id
    ON public.surgery_pre_op USING btree (visit_id ASC NULLS LAST);

-- Index for prescription_product_mapping table
CREATE INDEX IF NOT EXISTS idx_prescription_product_mapping_product_id
    ON public.prescription_product_mapping USING btree (product_id ASC NULLS LAST);

-- Index for inventory table
CREATE INDEX IF NOT EXISTS idx_inventory_supplier_id
    ON public.inventory USING btree (supplier_id ASC NULLS LAST);

-- Index for purchase_order_items table
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_supplier_id
    ON public.purchase_order_items USING btree (supplier_id ASC NULLS LAST);

-- Index for purchase_order_receiving_history table (received_by already has an index from base script)

-- Index for visit_invoices table
CREATE INDEX IF NOT EXISTS idx_visit_invoices_clinic_id
    ON public.visit_invoices USING btree (clinic_id ASC NULLS LAST);

-- Index for screen_access table
CREATE INDEX IF NOT EXISTS idx_screen_access_company_id
    ON public.screen_access USING btree (company_id ASC NULLS LAST);

-- Index for client_registrations table
CREATE INDEX IF NOT EXISTS idx_client_registrations_approved_by
    ON public.client_registrations USING btree (approved_by ASC NULLS LAST);

-- =========================================================
-- Script Summary
-- =========================================================
-- Total Foreign Keys Added: 28
-- Total Indexes Added: 33
-- 
-- Foreign Key Relationships Added:
-- 1. appointments → patients
-- 2. appointments → appointment_type
-- 3. visits → appointments
-- 4. visits → patients
-- 5. medical_history_details → patients
-- 6. medical_records → patients
-- 7. medical_records → appointments
-- 8. prescriptions → patients
-- 9. deworming_checkout → visits
-- 10. deworming_intake → visits
-- 11. deworming_medication → visits
-- 12. deworming_notes → visits
-- 13. emergency_discharge → visits
-- 14. emergency_prescription → visits
-- 15. emergency_procedures → visits
-- 16. emergency_triage → visits
-- 17. emergency_vitals → visits
-- 18. surgery_detail → visits
-- 19. surgery_discharge → visits
-- 20. surgery_post_op → visits
-- 21. surgery_pre_op → visits
-- 22. prescription_product_mapping → products
-- 23. inventory → suppliers
-- 24. purchase_order_items → suppliers
-- 25. purchase_order_receiving_history → users (received_by)
-- 26. visit_invoices → clinics
-- 27. screen_access → company
-- 28. client_registrations → users (approved_by)
-- =========================================================

-- =========================================================
-- Company: allow same name after soft delete (existing DBs)
-- Drop old unique on name; enforce uniqueness only when is_active = true.
-- =========================================================
ALTER TABLE public.company
    DROP CONSTRAINT IF EXISTS uq_company_name;

CREATE UNIQUE INDEX IF NOT EXISTS uq_company_name_active
    ON public.company (name)
    WHERE (is_active = true);

-- =========================================================
-- Users: email unique per company (existing DBs)
-- Drop global unique on email; enforce unique (email, company_id).
-- =========================================================
ALTER TABLE public.users
    DROP CONSTRAINT IF EXISTS users_email_key;

ALTER TABLE public.users
    DROP CONSTRAINT IF EXISTS users_email_company_key;

ALTER TABLE public.users
    ADD CONSTRAINT users_email_company_key UNIQUE (email, company_id);

-- =========================================================
-- Clients: email unique per company (existing DBs)
-- Drop global unique on email; enforce unique (email, company_id).
-- =========================================================
ALTER TABLE public.clients
    DROP CONSTRAINT IF EXISTS clients_email_key;

ALTER TABLE public.clients
    DROP CONSTRAINT IF EXISTS clients_email_company_key;

ALTER TABLE public.clients
    ADD CONSTRAINT clients_email_company_key UNIQUE (email, company_id);

