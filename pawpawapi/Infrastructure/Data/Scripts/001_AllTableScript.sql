-- Corrected Table Creation Script - Part 1
-- Base tables with no dependencies
 
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
 
-- FUNCTION: public.update_updated_at_column()
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$BODY$;
 
ALTER FUNCTION public.update_updated_at_column()
    OWNER TO postgres;
 
-- Table: public.company
CREATE TABLE IF NOT EXISTS public.company
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    logo_url text COLLATE pg_catalog."default",
    registration_number character varying(100) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default",
    phone character varying(50) COLLATE pg_catalog."default",
    address jsonb,
    status character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT 'active'::character varying,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    domain_name character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT company_pkey PRIMARY KEY (id)
);
 
ALTER TABLE IF EXISTS public.company
    OWNER to postgres;
 
COMMENT ON COLUMN public.company.address
    IS 'JSONB object containing address details with street, city, state, postalCode, and country fields';
 
COMMENT ON COLUMN public.company.domain_name
    IS 'Company domain name for web presence';
 
-- Index: idx_company_is_active
CREATE INDEX IF NOT EXISTS idx_company_is_active
    ON public.company USING btree
    (is_active ASC NULLS LAST)
;
 
-- Index: idx_company_name
CREATE INDEX IF NOT EXISTS idx_company_name
    ON public.company USING btree
    (name COLLATE pg_catalog."default" ASC NULLS LAST)
;
 
-- Index: idx_company_status
CREATE INDEX IF NOT EXISTS idx_company_status
    ON public.company USING btree
    (status COLLATE pg_catalog."default" ASC NULLS LAST)
;

-- Unique company name only when active (allows re-using name after soft delete)
CREATE UNIQUE INDEX IF NOT EXISTS uq_company_name_active
    ON public.company (name)
    WHERE (is_active = true);
 
-- Table: public.appointment_type
CREATE TABLE IF NOT EXISTS public.appointment_type
(
    appointment_type_id uuid NOT NULL,
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    is_active boolean DEFAULT true,
    CONSTRAINT appointment_pkey PRIMARY KEY (appointment_type_id)
);
 
ALTER TABLE IF EXISTS public.appointment_type
    OWNER to postgres;
 
-- Table: public.doctor_slot
CREATE TABLE IF NOT EXISTS public.doctor_slot
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    day character varying(20) COLLATE pg_catalog."default" NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT doctor_slot_pkey PRIMARY KEY (id)
);
 
ALTER TABLE IF EXISTS public.doctor_slot
    OWNER to postgres;
 
-- Table: public.roles
CREATE TABLE IF NOT EXISTS public.roles
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text COLLATE pg_catalog."default" NOT NULL,
    value text COLLATE pg_catalog."default" NOT NULL,
    is_privileged boolean DEFAULT false,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_clinic_required boolean,
    colour_name character varying(50) COLLATE pg_catalog."default",
    priority integer NOT NULL DEFAULT 0,
    CONSTRAINT roles_pkey PRIMARY KEY (id)
);
 
ALTER TABLE IF EXISTS public.roles
    OWNER to postgres;
 
-- Table: public.screens
CREATE TABLE IF NOT EXISTS public.screens
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT screens_pkey PRIMARY KEY (id)
);
 
ALTER TABLE IF EXISTS public.screens
    OWNER to postgres;
 
-- Table: public.symptoms
CREATE TABLE IF NOT EXISTS public.symptoms
(
    id uuid NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    notes text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    iscomman boolean DEFAULT false,
    breed text COLLATE pg_catalog."default",
    CONSTRAINT symptoms_pkey PRIMARY KEY (id)
);
 
ALTER TABLE IF EXISTS public.symptoms
    OWNER to postgres;
 
-- Table: public.plans
CREATE TABLE IF NOT EXISTS public.plans
(
    id uuid NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    notes text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT plans_pkey PRIMARY KEY (id)
);
 
ALTER TABLE IF EXISTS public.plans
    OWNER to postgres;
 
-- Table: public.procedures
CREATE TABLE IF NOT EXISTS public.procedures
(
    id uuid NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    notes text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    type text COLLATE pg_catalog."default",
    proc_code character varying(20) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT procedures_pkey PRIMARY KEY (id)
);
 
ALTER TABLE IF EXISTS public.procedures
    OWNER to postgres;
 
-- Table: public.vaccination_master
CREATE TABLE IF NOT EXISTS public.vaccination_master
(
    id uuid NOT NULL,
    species character varying(32) COLLATE pg_catalog."default" NOT NULL,
    disease character varying(128) COLLATE pg_catalog."default" NOT NULL,
    vaccine_type character varying(128) COLLATE pg_catalog."default" NOT NULL,
    initial_dose character varying(64) COLLATE pg_catalog."default" NOT NULL,
    booster character varying(128) COLLATE pg_catalog."default" NOT NULL,
    revaccination_interval character varying(128) COLLATE pg_catalog."default" NOT NULL,
    notes text COLLATE pg_catalog."default",
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    vac_code character varying(64) COLLATE pg_catalog."default",
    CONSTRAINT vaccination_master_pkey PRIMARY KEY (id)
);
 
ALTER TABLE IF EXISTS public.vaccination_master
    OWNER to postgres;
 
-- Corrected Table Creation Script - Part 2
-- Second level tables (depend on base tables)
 
-- Table: public.clinics
CREATE TABLE IF NOT EXISTS public.clinics
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    address_line1 character varying(255) COLLATE pg_catalog."default",
    address_line2 character varying(255) COLLATE pg_catalog."default",
    city character varying(100) COLLATE pg_catalog."default",
    state character varying(50) COLLATE pg_catalog."default",
    postal_code character varying(20) COLLATE pg_catalog."default",
    country character varying(50) COLLATE pg_catalog."default" DEFAULT 'US'::character varying,
    phone character varying(20) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default",
    website character varying(255) COLLATE pg_catalog."default",
    tax_id character varying(50) COLLATE pg_catalog."default",
    license_number character varying(100) COLLATE pg_catalog."default",
    subscription_status character varying(50) COLLATE pg_catalog."default" DEFAULT 'trial'::character varying,
    subscription_expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean NOT NULL DEFAULT true,
    location_lat double precision,
    location_lng double precision,
    location_address text COLLATE pg_catalog."default",
    company_id uuid,
    CONSTRAINT clinics_pkey PRIMARY KEY (id),
    CONSTRAINT fk_clinics_company FOREIGN KEY (company_id)
        REFERENCES public.company (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.clinics
    OWNER to postgres;

-- Add is_active column for existing databases (if column doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'clinics' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.clinics
        ADD COLUMN is_active boolean NOT NULL DEFAULT true;
        
        -- Update any existing NULL values to true (safety measure)
        UPDATE public.clinics
        SET is_active = true
        WHERE is_active IS NULL;
    END IF;
END $$;

-- Index: idx_clinics_company_id
CREATE INDEX IF NOT EXISTS idx_clinics_company_id
    ON public.clinics USING btree
    (company_id ASC NULLS LAST)
;

-- Index: idx_clinics_is_active
CREATE INDEX IF NOT EXISTS idx_clinics_is_active
    ON public.clinics USING btree
    (is_active ASC NULLS LAST)
;

-- Trigger: update_clinics_updated_at
CREATE OR REPLACE TRIGGER update_clinics_updated_at
    BEFORE UPDATE
    ON public.clinics
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
 
-- Table: public.users
CREATE TABLE IF NOT EXISTS public.users
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password_hash character varying(255) COLLATE pg_catalog."default" NOT NULL,
    first_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    last_name character varying(100) COLLATE pg_catalog."default",
    role character varying(50) COLLATE pg_catalog."default",
    is_active boolean DEFAULT true,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    role_id uuid,
    company_id uuid,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_company_key UNIQUE (email, company_id),
    CONSTRAINT fk_users_company FOREIGN KEY (company_id)
        REFERENCES public.company (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_users_role_id FOREIGN KEY (role_id)
        REFERENCES public.roles (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);
 
ALTER TABLE IF EXISTS public.users
    OWNER to postgres;
 
-- Index: idx_users_company_id
CREATE INDEX IF NOT EXISTS idx_users_company_id
    ON public.users USING btree
    (company_id ASC NULLS LAST)
;
 
-- Trigger: update_users_updated_at
CREATE OR REPLACE TRIGGER update_users_updated_at
    BEFORE UPDATE
    ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
 
-- Table: public.clients
CREATE TABLE IF NOT EXISTS public.clients
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    first_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    last_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default",
    phone_primary character varying(20) COLLATE pg_catalog."default",
    phone_secondary character varying(20) COLLATE pg_catalog."default",
    address_line1 character varying(255) COLLATE pg_catalog."default",
    address_line2 character varying(255) COLLATE pg_catalog."default",
    city character varying(100) COLLATE pg_catalog."default",
    state character varying(50) COLLATE pg_catalog."default",
    postal_code character varying(20) COLLATE pg_catalog."default",
    emergency_contact_name character varying(200) COLLATE pg_catalog."default",
    emergency_contact_phone character varying(20) COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    is_active boolean DEFAULT true,
    is_premium boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    encrypted_password character varying(255) COLLATE pg_catalog."default",
    company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    CONSTRAINT clients_pkey PRIMARY KEY (id),
    CONSTRAINT clients_email_company_key UNIQUE (email, company_id),
    CONSTRAINT fk_clients_company FOREIGN KEY (company_id)
        REFERENCES public.company (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.clients
    OWNER to postgres;

-- Add is_premium column if it doesn't exist (for existing databases)
ALTER TABLE IF EXISTS public.clients
    ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false;
 
-- Index: idx_clients_company_id
CREATE INDEX IF NOT EXISTS idx_clients_company_id
    ON public.clients USING btree
    (company_id ASC NULLS LAST)
;
 
-- Trigger: update_clients_updated_at
CREATE OR REPLACE TRIGGER update_clients_updated_at
    BEFORE UPDATE
    ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
 
-- Table: public.client_registrations
CREATE TABLE IF NOT EXISTS public.client_registrations
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    first_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    last_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    phone_primary character varying(20) COLLATE pg_catalog."default" NOT NULL,
    phone_secondary character varying(20) COLLATE pg_catalog."default",
    address_line1 character varying(255) COLLATE pg_catalog."default",
    address_line2 character varying(255) COLLATE pg_catalog."default",
    city character varying(100) COLLATE pg_catalog."default",
    state character varying(50) COLLATE pg_catalog."default",
    postal_code character varying(20) COLLATE pg_catalog."default",
    emergency_contact_name character varying(200) COLLATE pg_catalog."default",
    emergency_contact_phone character varying(20) COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    status character varying(20) COLLATE pg_catalog."default" DEFAULT 'pending'::character varying,
    rejection_reason text COLLATE pg_catalog."default",
    approved_by uuid,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    company_id uuid,
    CONSTRAINT client_registrations_pkey PRIMARY KEY (id),
    CONSTRAINT client_registrations_email_key UNIQUE (email),
    CONSTRAINT fk_client_registrations_company FOREIGN KEY (company_id)
        REFERENCES public.company (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT client_registrations_status_check CHECK (status::text = ANY (ARRAY['pending'::character varying::text, 'approved'::character varying::text, 'rejected'::character varying::text]))
);
 
ALTER TABLE IF EXISTS public.client_registrations
    OWNER to postgres;
 
-- Index: idx_client_registrations_company_id
CREATE INDEX IF NOT EXISTS idx_client_registrations_company_id
    ON public.client_registrations USING btree
    (company_id ASC NULLS LAST)
;
 
-- Index: idx_client_registrations_created_at
CREATE INDEX IF NOT EXISTS idx_client_registrations_created_at
    ON public.client_registrations USING btree
    (created_at ASC NULLS LAST)
;
 
-- Index: idx_client_registrations_email
CREATE INDEX IF NOT EXISTS idx_client_registrations_email
    ON public.client_registrations USING btree
    (email COLLATE pg_catalog."default" ASC NULLS LAST)
;
 
-- Index: idx_client_registrations_status
CREATE INDEX IF NOT EXISTS idx_client_registrations_status
    ON public.client_registrations USING btree
    (status COLLATE pg_catalog."default" ASC NULLS LAST)
;
 
-- Trigger: update_client_registrations_updated_at
CREATE OR REPLACE TRIGGER update_client_registrations_updated_at
    BEFORE UPDATE
    ON public.client_registrations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
 
-- Table: public.products
CREATE TABLE IF NOT EXISTS public.products
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    generic_name character varying(255) COLLATE pg_catalog."default",
    category character varying(100) COLLATE pg_catalog."default",
    product_type character varying(50) COLLATE pg_catalog."default",
    ndc_number character varying(50) COLLATE pg_catalog."default",
    dosage_form character varying(100) COLLATE pg_catalog."default",
    unit_of_measure character varying(50) COLLATE pg_catalog."default",
    requires_prescription boolean DEFAULT false,
    controlled_substance_schedule character varying(50) COLLATE pg_catalog."default",
    storage_requirements text COLLATE pg_catalog."default",
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    reorder_threshold integer,
    product_number character varying(50) COLLATE pg_catalog."default",
    price numeric(12,2),
    brandname character varying(255) COLLATE pg_catalog."default",
    qr_code text COLLATE pg_catalog."default",
    barcode text COLLATE pg_catalog."default",
    qr_code_image_path text COLLATE pg_catalog."default",
    barcode_image_path text COLLATE pg_catalog."default",
    selling_price numeric(10,2),
    company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    CONSTRAINT products_pkey PRIMARY KEY (id),
    CONSTRAINT fk_products_company FOREIGN KEY (company_id)
        REFERENCES public.company (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.products
    OWNER to postgres;
 
COMMENT ON COLUMN public.products.reorder_threshold
    IS 'Minimum quantity before low stock alert';
 
COMMENT ON COLUMN public.products.qr_code
    IS 'QR code data/content';
 
COMMENT ON COLUMN public.products.barcode
    IS 'Barcode data/content';
 
COMMENT ON COLUMN public.products.qr_code_image_path
    IS 'Path to stored QR code image file';
 
COMMENT ON COLUMN public.products.barcode_image_path
    IS 'Path to stored barcode image file';
 
COMMENT ON COLUMN public.products.selling_price
    IS 'Selling price to customers (different from cost price)';
 
-- Index: idx_products_company_id
CREATE INDEX IF NOT EXISTS idx_products_company_id
    ON public.products USING btree
    (company_id ASC NULLS LAST)
;
 
-- Trigger: update_products_updated_at
CREATE OR REPLACE TRIGGER update_products_updated_at
    BEFORE UPDATE
    ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
 
-- Table: public.suppliers
CREATE TABLE IF NOT EXISTS public.suppliers
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    clinic_id uuid,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    contact_person character varying(200) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default",
    phone character varying(20) COLLATE pg_catalog."default",
    address_line1 character varying(255) COLLATE pg_catalog."default",
    address_line2 character varying(255) COLLATE pg_catalog."default",
    city character varying(100) COLLATE pg_catalog."default",
    state character varying(50) COLLATE pg_catalog."default",
    postal_code character varying(20) COLLATE pg_catalog."default",
    account_number character varying(100) COLLATE pg_catalog."default",
    payment_terms character varying(100) COLLATE pg_catalog."default",
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT suppliers_pkey PRIMARY KEY (id),
    CONSTRAINT suppliers_clinic_id_fkey FOREIGN KEY (clinic_id)
        REFERENCES public.clinics (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.suppliers
    OWNER to postgres;
 
-- Trigger: update_suppliers_updated_at
CREATE OR REPLACE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE
    ON public.suppliers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
 
-- Corrected Table Creation Script - Part 3
-- Third level tables (depend on second level tables)
 
-- Table: public.rooms
CREATE TABLE IF NOT EXISTS public.rooms
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    clinic_id uuid,
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    room_type character varying(50) COLLATE pg_catalog."default",
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT rooms_pkey PRIMARY KEY (id),
    CONSTRAINT rooms_clinic_id_fkey FOREIGN KEY (clinic_id)
        REFERENCES public.clinics (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT rooms_room_type_check CHECK (room_type::text = ANY (ARRAY['examination'::character varying::text, 'surgery'::character varying::text, 'isolation'::character varying::text, 'recovery'::character varying::text]))
);
 
ALTER TABLE IF EXISTS public.rooms
    OWNER to postgres;
 
-- Table: public.appointments
CREATE TABLE IF NOT EXISTS public.appointments
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    clinic_id uuid,
    patient_id uuid,
    client_id uuid,
    veterinarian_id uuid,
    room_id uuid,
    appointment_date date NOT NULL,
    appointment_type_id uuid,
    reason character varying(255) COLLATE pg_catalog."default",
    status character varying(50) COLLATE pg_catalog."default" DEFAULT 'scheduled'::character varying,
    notes text COLLATE pg_catalog."default",
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    room_slot_id uuid,
    is_registered boolean NOT NULL DEFAULT false,
    appointment_time_from time without time zone,
    appointment_time_to time without time zone,
    company_id uuid,
    CONSTRAINT appointments_client_id_fkey FOREIGN KEY (client_id)
        REFERENCES public.clients (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT appointments_clinic_id_fkey FOREIGN KEY (clinic_id)
        REFERENCES public.clinics (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT appointments_created_by_fkey FOREIGN KEY (created_by)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT appointments_room_id_fkey FOREIGN KEY (room_id)
        REFERENCES public.rooms (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT appointments_veterinarian_id_fkey FOREIGN KEY (veterinarian_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_appointments_company FOREIGN KEY (company_id)
        REFERENCES public.company (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL
);
 
ALTER TABLE IF EXISTS public.appointments
    OWNER to postgres;
 
COMMENT ON COLUMN public.appointments.is_registered
    IS 'Indicates whether the appointment is registered or not';
 
-- Index: idx_appointments_company_id
CREATE INDEX IF NOT EXISTS idx_appointments_company_id
    ON public.appointments USING btree
    (company_id ASC NULLS LAST)
;
 
-- Index: idx_appointments_date_clinic
CREATE INDEX IF NOT EXISTS idx_appointments_date_clinic
    ON public.appointments USING btree
    (appointment_date ASC NULLS LAST, clinic_id ASC NULLS LAST)
;
 
-- Index: idx_appointments_is_registered
CREATE INDEX IF NOT EXISTS idx_appointments_is_registered
    ON public.appointments USING btree
    (is_registered ASC NULLS LAST)
;
 
-- Index: idx_appointments_patient
CREATE INDEX IF NOT EXISTS idx_appointments_patient
    ON public.appointments USING btree
    (patient_id ASC NULLS LAST)
;
 
-- Index: idx_appointments_veterinarian
CREATE INDEX IF NOT EXISTS idx_appointments_veterinarian
    ON public.appointments USING btree
    (veterinarian_id ASC NULLS LAST)
;
 
-- Trigger: update_appointments_updated_at
CREATE OR REPLACE TRIGGER update_appointments_updated_at
    BEFORE UPDATE
    ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
 
-- Table: public.visits
CREATE TABLE IF NOT EXISTS public.visits
(
    id uuid NOT NULL,
    appointment_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_intake_completed boolean DEFAULT false,
    is_complaints_completed boolean DEFAULT false,
    is_vitals_completed boolean DEFAULT false,
    patient_id uuid,
    is_procedure_completed boolean DEFAULT false,
    is_plan_completed boolean DEFAULT false,
    is_prescription_completed boolean DEFAULT false,
    is_vaccination_detail_completed boolean DEFAULT false,
    is_emergency_triage_completed boolean DEFAULT false,
    is_emergency_vital_completed boolean DEFAULT false,
    is_emergency_procedure_completed boolean DEFAULT false,
    is_emergency_discharge_completed boolean DEFAULT false,
    is_surgery_pre_op_completed boolean DEFAULT false,
    is_surgery_details_completed boolean DEFAULT false,
    is_surgery_post_op_completed boolean DEFAULT false,
    is_surgery_discharge_completed boolean DEFAULT false,
    is_deworming_intake_completed boolean DEFAULT false,
    is_deworming_medication_completed boolean DEFAULT false,
    is_deworming_notes_completed boolean DEFAULT false,
    is_deworming_checkout_completed boolean DEFAULT false,
    CONSTRAINT visits_pkey PRIMARY KEY (id)
);
 
ALTER TABLE IF EXISTS public.visits
    OWNER to postgres;
 
-- Table: public.user_clinics
CREATE TABLE IF NOT EXISTS public.user_clinics
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid,
    clinic_id uuid,
    is_primary boolean DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_clinics_pkey PRIMARY KEY (id),
    CONSTRAINT user_clinics_user_id_clinic_id_key UNIQUE (user_id, clinic_id),
    CONSTRAINT user_clinics_clinic_id_fkey FOREIGN KEY (clinic_id)
        REFERENCES public.clinics (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT user_clinics_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.user_clinics
    OWNER to postgres;

-- Add is_active column for existing databases (if column doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_clinics' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.user_clinics
        ADD COLUMN is_active boolean NOT NULL DEFAULT true;
        
        -- Update any existing NULL values to true (safety measure)
        UPDATE public.user_clinics
        SET is_active = true
        WHERE is_active IS NULL;
    END IF;
END $$;

-- Index: idx_user_clinics_is_active
CREATE INDEX IF NOT EXISTS idx_user_clinics_is_active
    ON public.user_clinics USING btree
    (is_active ASC NULLS LAST)
;

-- Table: public.users_clinic_mapping
CREATE TABLE IF NOT EXISTS public.users_clinic_mapping
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    clinic_id uuid NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_clinic_mapping_pkey PRIMARY KEY (id),
    CONSTRAINT users_clinic_mapping_user_id_clinic_id_key UNIQUE (user_id, clinic_id),
    CONSTRAINT fk_users_clinic_mapping_clinic FOREIGN KEY (clinic_id)
        REFERENCES public.clinics (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_users_clinic_mapping_user FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.users_clinic_mapping
    OWNER to postgres;

-- Add is_active column for existing databases (if column doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users_clinic_mapping' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.users_clinic_mapping
        ADD COLUMN is_active boolean NOT NULL DEFAULT true;
        
        -- Update any existing NULL values to true (safety measure)
        UPDATE public.users_clinic_mapping
        SET is_active = true
        WHERE is_active IS NULL;
    END IF;
END $$;

-- Index: idx_users_clinic_mapping_clinic_id
CREATE INDEX IF NOT EXISTS idx_users_clinic_mapping_clinic_id
    ON public.users_clinic_mapping USING btree
    (clinic_id ASC NULLS LAST)
;
 
-- Index: idx_users_clinic_mapping_user_id
CREATE INDEX IF NOT EXISTS idx_users_clinic_mapping_user_id
    ON public.users_clinic_mapping USING btree
    (user_id ASC NULLS LAST)
;

-- Index: idx_users_clinic_mapping_is_active
CREATE INDEX IF NOT EXISTS idx_users_clinic_mapping_is_active
    ON public.users_clinic_mapping USING btree
    (is_active ASC NULLS LAST)
;
 
-- Table: public.user_doctor_slot
CREATE TABLE IF NOT EXISTS public.user_doctor_slot
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    slot_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    clinic_id uuid,
    CONSTRAINT user_doctor_slot_pkey PRIMARY KEY (id),
    CONSTRAINT user_slot_unique UNIQUE (user_id, slot_id, clinic_id),
    CONSTRAINT fk_slot FOREIGN KEY (slot_id)
        REFERENCES public.doctor_slot (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_user_doctor_slot_clinic FOREIGN KEY (clinic_id)
        REFERENCES public.clinics (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_user_doctor_slot_slot FOREIGN KEY (slot_id)
        REFERENCES public.doctor_slot (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_user_doctor_slot_user FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.user_doctor_slot
    OWNER to postgres;
 
-- Index: idx_user_doctor_slot_clinic_id
CREATE INDEX IF NOT EXISTS idx_user_doctor_slot_clinic_id
    ON public.user_doctor_slot USING btree
    (clinic_id ASC NULLS LAST)
;
 
-- Index: idx_user_doctor_slot_user_id
CREATE INDEX IF NOT EXISTS idx_user_doctor_slot_user_id
    ON public.user_doctor_slot USING btree
    (user_id ASC NULLS LAST)
;
 
-- Table: public.screen_access
CREATE TABLE IF NOT EXISTS public.screen_access
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    screen_id uuid NOT NULL,
    company_id uuid,
    role_id uuid NOT NULL,
    is_access_enable boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    clinic_id uuid,
    CONSTRAINT screen_access_pkey PRIMARY KEY (id),
    CONSTRAINT fk_screen_access_clinic FOREIGN KEY (clinic_id)
        REFERENCES public.clinics (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_screen_access_role FOREIGN KEY (role_id)
        REFERENCES public.roles (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_screen_access_screen FOREIGN KEY (screen_id)
        REFERENCES public.screens (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.screen_access
    OWNER to postgres;
 
-- Table: public.expenses
CREATE TABLE IF NOT EXISTS public.expenses
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    clinic_id uuid,
    date_of_expense timestamp with time zone NOT NULL,
    category character varying(100) COLLATE pg_catalog."default" NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_mode character varying(50) COLLATE pg_catalog."default" NOT NULL,
    paid_to character varying(200) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT expenses_pkey PRIMARY KEY (id),
    CONSTRAINT expenses_clinic_id_fkey FOREIGN KEY (clinic_id)
        REFERENCES public.clinics (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT expenses_amount_check CHECK (amount > 0::numeric)
);
 
ALTER TABLE IF EXISTS public.expenses
    OWNER to postgres;
 
COMMENT ON TABLE public.expenses
    IS 'Stores expense records for clinics';
 
COMMENT ON COLUMN public.expenses.id
    IS 'Unique identifier for the expense';
 
COMMENT ON COLUMN public.expenses.clinic_id
    IS 'Reference to the clinic this expense belongs to';
 
COMMENT ON COLUMN public.expenses.date_of_expense
    IS 'Date when the expense occurred';
 
COMMENT ON COLUMN public.expenses.category
    IS 'Category of the expense (e.g., Medical Supplies, Utilities, etc.)';
 
COMMENT ON COLUMN public.expenses.amount
    IS 'Amount of the expense';
 
COMMENT ON COLUMN public.expenses.payment_mode
    IS 'Payment method used (e.g., Cash, Card, Bank Transfer)';
 
COMMENT ON COLUMN public.expenses.paid_to
    IS 'Entity or person the payment was made to';
 
COMMENT ON COLUMN public.expenses.description
    IS 'Additional details about the expense';
 
COMMENT ON COLUMN public.expenses.created_at
    IS 'Timestamp when the record was created';
 
COMMENT ON COLUMN public.expenses.updated_at
    IS 'Timestamp when the record was last updated';
 
-- Index: idx_expenses_category
CREATE INDEX IF NOT EXISTS idx_expenses_category
    ON public.expenses USING btree
    (category COLLATE pg_catalog."default" ASC NULLS LAST)
;
 
-- Index: idx_expenses_clinic_id
CREATE INDEX IF NOT EXISTS idx_expenses_clinic_id
    ON public.expenses USING btree
    (clinic_id ASC NULLS LAST)
;
 
-- Index: idx_expenses_created_at
CREATE INDEX IF NOT EXISTS idx_expenses_created_at
    ON public.expenses USING btree
    (created_at ASC NULLS LAST)
;
 
-- Index: idx_expenses_date_of_expense
CREATE INDEX IF NOT EXISTS idx_expenses_date_of_expense
    ON public.expenses USING btree
    (date_of_expense ASC NULLS LAST)
;
 
-- Table: public.medical_records
CREATE TABLE IF NOT EXISTS public.medical_records
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    clinic_id uuid,
    patient_id uuid,
    appointment_id uuid,
    veterinarian_id uuid,
    visit_date date NOT NULL,
    chief_complaint text COLLATE pg_catalog."default",
    history text COLLATE pg_catalog."default",
    physical_exam_findings text COLLATE pg_catalog."default",
    diagnosis text COLLATE pg_catalog."default",
    treatment_plan text COLLATE pg_catalog."default",
    follow_up_instructions text COLLATE pg_catalog."default",
    weight_kg numeric(5,2),
    temperature_celsius numeric(4,1),
    heart_rate integer,
    respiratory_rate integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT medical_records_pkey PRIMARY KEY (id),
    CONSTRAINT medical_records_clinic_id_fkey FOREIGN KEY (clinic_id)
        REFERENCES public.clinics (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT medical_records_veterinarian_id_fkey FOREIGN KEY (veterinarian_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);
 
ALTER TABLE IF EXISTS public.medical_records
    OWNER to postgres;
 
-- Index: idx_medical_records_patient
CREATE INDEX IF NOT EXISTS idx_medical_records_patient
    ON public.medical_records USING btree
    (patient_id ASC NULLS LAST)
;
 
-- Trigger: update_medical_records_updated_at
CREATE OR REPLACE TRIGGER update_medical_records_updated_at
    BEFORE UPDATE
    ON public.medical_records
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
 
-- Table: public.medical_history_details
CREATE TABLE IF NOT EXISTS public.medical_history_details
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    chronic_conditions_notes text COLLATE pg_catalog."default",
    surgeries_notes text COLLATE pg_catalog."default",
    current_medications_notes text COLLATE pg_catalog."default",
    general_notes text COLLATE pg_catalog."default",
    is_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    patient_id uuid,
    CONSTRAINT medical_history_details_pkey PRIMARY KEY (id)
);
 
ALTER TABLE IF EXISTS public.medical_history_details
    OWNER to postgres;
 
-- Table: public.prescriptions
CREATE TABLE IF NOT EXISTS public.prescriptions
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    clinic_id uuid,
    patient_id uuid,
    medical_record_id uuid,
    product_id uuid,
    prescribed_by uuid,
    prescription_number character varying(100) COLLATE pg_catalog."default",
    quantity_prescribed integer NOT NULL,
    quantity_dispensed integer DEFAULT 0,
    dosage_instructions text COLLATE pg_catalog."default" NOT NULL,
    refills_authorized integer DEFAULT 0,
    refills_remaining integer DEFAULT 0,
    status character varying(50) COLLATE pg_catalog."default" DEFAULT 'pending'::character varying,
    prescribed_date date NOT NULL,
    dispensed_date date,
    expiration_date date,
    notes text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT prescriptions_pkey PRIMARY KEY (id),
    CONSTRAINT prescriptions_prescription_number_key UNIQUE (prescription_number),
    CONSTRAINT prescriptions_clinic_id_fkey FOREIGN KEY (clinic_id)
        REFERENCES public.clinics (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT prescriptions_medical_record_id_fkey FOREIGN KEY (medical_record_id)
        REFERENCES public.medical_records (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT prescriptions_prescribed_by_fkey FOREIGN KEY (prescribed_by)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT prescriptions_product_id_fkey FOREIGN KEY (product_id)
        REFERENCES public.products (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT prescriptions_status_check CHECK (status::text = ANY (ARRAY['pending'::character varying::text, 'approved'::character varying::text, 'dispensed'::character varying::text, 'delivered'::character varying::text, 'cancelled'::character varying::text]))
);
 
ALTER TABLE IF EXISTS public.prescriptions
    OWNER to postgres;
 
-- Index: idx_prescriptions_patient
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient
    ON public.prescriptions USING btree
    (patient_id ASC NULLS LAST)
;
 
-- Trigger: update_prescriptions_updated_at
CREATE OR REPLACE TRIGGER update_prescriptions_updated_at
    BEFORE UPDATE
    ON public.prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
 
-- Corrected Table Creation Script - Part 4
-- Fourth level tables (depend on visits and other tables)
 
-- Table: public.certificate
CREATE TABLE IF NOT EXISTS public.certificate
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    visit_id uuid NOT NULL,
    certificate_type_id uuid,
    certificate_json text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT certificate_pkey PRIMARY KEY (id),
    CONSTRAINT fk_certificate_visit FOREIGN KEY (visit_id)
        REFERENCES public.visits (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.certificate
    OWNER to postgres;
 
-- Index: idx_certificate_created_at
CREATE INDEX IF NOT EXISTS idx_certificate_created_at
    ON public.certificate USING btree
    (created_at ASC NULLS LAST)
;
 
-- Index: idx_certificate_visit_id
CREATE INDEX IF NOT EXISTS idx_certificate_visit_id
    ON public.certificate USING btree
    (visit_id ASC NULLS LAST)
;
 
-- Table: public.complaint_detail
CREATE TABLE IF NOT EXISTS public.complaint_detail
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    visit_id uuid NOT NULL,
    notes text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_completed boolean DEFAULT false,
    CONSTRAINT complaint_detail_pkey PRIMARY KEY (id),
    CONSTRAINT fk_complaint_detail_visit_id FOREIGN KEY (visit_id)
        REFERENCES public.visits (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.complaint_detail
    OWNER to postgres;
 
-- Table: public.complaints_symptoms
CREATE TABLE IF NOT EXISTS public.complaints_symptoms
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    complaint_detail_id uuid NOT NULL,
    symptom_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT complaints_symptoms_pkey PRIMARY KEY (id),
    CONSTRAINT unique_complaint_symptom UNIQUE (complaint_detail_id, symptom_id),
    CONSTRAINT fk_complaints_symptoms_complaint_detail_id FOREIGN KEY (complaint_detail_id)
        REFERENCES public.complaint_detail (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_complaints_symptoms_symptom_id FOREIGN KEY (symptom_id)
        REFERENCES public.symptoms (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.complaints_symptoms
    OWNER to postgres;
 
-- Table: public.deworming_checkout
CREATE TABLE IF NOT EXISTS public.deworming_checkout
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    visit_id uuid NOT NULL,
    summary text COLLATE pg_catalog."default",
    next_deworming_due_date date,
    home_care_instructions text COLLATE pg_catalog."default",
    client_acknowledged boolean DEFAULT false,
    is_completed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT deworming_checkout_pkey PRIMARY KEY (id)
);
 
ALTER TABLE IF EXISTS public.deworming_checkout
    OWNER to postgres;
 
-- Table: public.deworming_intake
CREATE TABLE IF NOT EXISTS public.deworming_intake
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    visit_id uuid NOT NULL,
    weight_kg numeric(6,2),
    last_deworming_date date,
    symptoms_notes text COLLATE pg_catalog."default",
    temperature_c numeric(4,1),
    appetite_feeding_notes text COLLATE pg_catalog."default",
    current_medications text COLLATE pg_catalog."default",
    is_stool_sample_collected boolean DEFAULT false,
    is_completed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT deworming_intake_pkey PRIMARY KEY (id)
);
 
ALTER TABLE IF EXISTS public.deworming_intake
    OWNER to postgres;
 
-- Table: public.deworming_medication
CREATE TABLE IF NOT EXISTS public.deworming_medication
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    visit_id uuid NOT NULL,
    route character varying(30) COLLATE pg_catalog."default",
    date_time_given timestamp without time zone,
    veterinarian_name character varying(100) COLLATE pg_catalog."default",
    administered_by character varying(100) COLLATE pg_catalog."default",
    remarks text COLLATE pg_catalog."default",
    is_completed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT deworming_medication_pkey PRIMARY KEY (id)
);
 
ALTER TABLE IF EXISTS public.deworming_medication
    OWNER to postgres;
 
-- Table: public.deworming_notes
CREATE TABLE IF NOT EXISTS public.deworming_notes
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    visit_id uuid NOT NULL,
    adverse_reactions text COLLATE pg_catalog."default",
    additional_notes text COLLATE pg_catalog."default",
    owner_concerns text COLLATE pg_catalog."default",
    resolution_status character varying(50) COLLATE pg_catalog."default",
    is_completed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT deworming_notes_pkey PRIMARY KEY (id)
);
 
ALTER TABLE IF EXISTS public.deworming_notes
    OWNER to postgres;
 
-- Table: public.emergency_discharge
CREATE TABLE IF NOT EXISTS public.emergency_discharge
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    visit_id uuid NOT NULL,
    discharge_status character varying(50) COLLATE pg_catalog."default",
    discharge_time timestamp without time zone,
    responsible_clinician character varying(100) COLLATE pg_catalog."default",
    discharge_summary text COLLATE pg_catalog."default",
    home_care_instructions text COLLATE pg_catalog."default",
    followup_instructions text COLLATE pg_catalog."default",
    followup_date date,
    reviewed_with_client boolean DEFAULT false,
    is_completed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT emergency_discharge_pkey PRIMARY KEY (id)
);
 
ALTER TABLE IF EXISTS public.emergency_discharge
    OWNER to postgres;

-- Table: public.emergency_prescription
CREATE TABLE IF NOT EXISTS public.emergency_prescription
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    emergency_discharge_id uuid NOT NULL,
    visit_id uuid NOT NULL,
    medication_name character varying(100) COLLATE pg_catalog."default",
    dose character varying(50) COLLATE pg_catalog."default",
    frequency character varying(50) COLLATE pg_catalog."default",
    duration character varying(50) COLLATE pg_catalog."default",
    is_completed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT emergency_prescription_pkey PRIMARY KEY (id),
    CONSTRAINT fk_emergency_prescription_discharge FOREIGN KEY (emergency_discharge_id)
        REFERENCES public.emergency_discharge (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.emergency_prescription
    OWNER to postgres;
 
-- Table: public.emergency_procedures
CREATE TABLE IF NOT EXISTS public.emergency_procedures
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    visit_id uuid NOT NULL,
    procedure_time timestamp without time zone,
    iv_catheter_placement boolean DEFAULT false,
    oxygen_therapy boolean DEFAULT false,
    cpr boolean DEFAULT false,
    wound_care boolean DEFAULT false,
    bandaging boolean DEFAULT false,
    defibrillation boolean DEFAULT false,
    blood_transfusion boolean DEFAULT false,
    intubation boolean DEFAULT false,
    other_procedure boolean DEFAULT false,
    other_procedure_performed text COLLATE pg_catalog."default",
    performed_by character varying(100) COLLATE pg_catalog."default",
    fluids_type character varying(100) COLLATE pg_catalog."default",
    fluids_volume_ml numeric,
    fluids_rate_ml_hr numeric,
    response_to_treatment text COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    is_completed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT emergency_procedures_pkey PRIMARY KEY (id)
);
 
ALTER TABLE IF EXISTS public.emergency_procedures
    OWNER to postgres;
 
-- Table: public.emergency_procedure_medications
CREATE TABLE IF NOT EXISTS public.emergency_procedure_medications
(
    id uuid NOT NULL,
    emergency_procedure_id uuid NOT NULL,
    name text COLLATE pg_catalog."default",
    dose text COLLATE pg_catalog."default",
    route text COLLATE pg_catalog."default",
    "time" interval,
    CONSTRAINT emergency_procedure_medications_pkey PRIMARY KEY (id),
    CONSTRAINT emergency_procedure_medications_emergency_procedure_id_fkey FOREIGN KEY (emergency_procedure_id)
        REFERENCES public.emergency_procedures (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.emergency_procedure_medications
    OWNER to postgres;
 
-- Table: public.emergency_triage
CREATE TABLE IF NOT EXISTS public.emergency_triage
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    arrival_time timestamp without time zone NOT NULL,
    triage_nurse_doctor character varying(100) COLLATE pg_catalog."default",
    triage_category character varying(50) COLLATE pg_catalog."default",
    pain_score integer,
    allergies text COLLATE pg_catalog."default",
    immediate_intervention_required boolean DEFAULT false,
    reason_for_emergency text COLLATE pg_catalog."default",
    triage_level character varying(50) COLLATE pg_catalog."default",
    presenting_complaint text COLLATE pg_catalog."default",
    initial_notes text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    visit_id uuid,
    is_complete boolean DEFAULT false,
    CONSTRAINT emergency_triage_pkey PRIMARY KEY (id),
    CONSTRAINT emergency_triage_pain_score_check CHECK (pain_score >= 0 AND pain_score <= 10)
);
 
ALTER TABLE IF EXISTS public.emergency_triage
    OWNER to postgres;
 
-- Table: public.emergency_vitals
CREATE TABLE IF NOT EXISTS public.emergency_vitals
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    visit_id uuid NOT NULL,
    weight_kg numeric,
    capillary_refill_time_sec numeric,
    mucous_membrane_color character varying(50) COLLATE pg_catalog."default",
    oxygen_saturation_spo2 numeric,
    blood_glucose_mg_dl numeric,
    temperature_c numeric,
    heart_rhythm character varying(50) COLLATE pg_catalog."default",
    heart_rate_bpm integer,
    respiratory_rate_bpm integer,
    blood_pressure character varying(20) COLLATE pg_catalog."default",
    supplemental_oxygen_given boolean DEFAULT false,
    notes text COLLATE pg_catalog."default",
    is_completed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT emergency_vitals_pkey PRIMARY KEY (id)
);
 
ALTER TABLE IF EXISTS public.emergency_vitals
    OWNER to postgres;
 
-- Table: public.intake_details
CREATE TABLE IF NOT EXISTS public.intake_details
(
    id uuid NOT NULL,
    visit_id uuid NOT NULL,
    weight_kg numeric(6,2),
    notes text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_completed boolean DEFAULT false,
    CONSTRAINT intake_details_pkey PRIMARY KEY (id),
    CONSTRAINT fk_visit FOREIGN KEY (visit_id)
        REFERENCES public.visits (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.intake_details
    OWNER to postgres;
 
-- Table: public.intake_files
CREATE TABLE IF NOT EXISTS public.intake_files
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    intake_detail_id uuid NOT NULL,
    file_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    file_path character varying(255) COLLATE pg_catalog."default" NOT NULL,
    file_type character varying(50) COLLATE pg_catalog."default" NOT NULL,
    file_size bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT intake_files_intake_detail_id_fkey FOREIGN KEY (intake_detail_id)
        REFERENCES public.intake_details (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);
 
ALTER TABLE IF EXISTS public.intake_files
    OWNER to postgres;
 
-- Table: public.plan_detail
CREATE TABLE IF NOT EXISTS public.plan_detail
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    visit_id uuid NOT NULL,
    notes text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_completed boolean DEFAULT false,
    follow_up_date date,
    CONSTRAINT plan_detail_pkey PRIMARY KEY (id),
    CONSTRAINT fk_plan_detail_visit_id FOREIGN KEY (visit_id)
        REFERENCES public.visits (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.plan_detail
    OWNER to postgres;
 
-- Table: public.plan_mapping
CREATE TABLE IF NOT EXISTS public.plan_mapping
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    plan_detail_id uuid NOT NULL,
    plans_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT plan_mapping_pkey PRIMARY KEY (id),
    CONSTRAINT unique_plan_detail_plan UNIQUE (plan_detail_id, plans_id),
    CONSTRAINT fk_plan_mapping_plan_detail_id FOREIGN KEY (plan_detail_id)
        REFERENCES public.plan_detail (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_plan_mapping_plans_id FOREIGN KEY (plans_id)
        REFERENCES public.plans (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.plan_mapping
    OWNER to postgres;
 
-- Table: public.prescription_details
CREATE TABLE IF NOT EXISTS public.prescription_details
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    visit_id uuid NOT NULL,
    notes text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT prescription_details_pkey PRIMARY KEY (id),
    CONSTRAINT fk_prescription_visit FOREIGN KEY (visit_id)
        REFERENCES public.visits (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.prescription_details
    OWNER to postgres;
 
-- Table: public.procedure_detail
CREATE TABLE IF NOT EXISTS public.procedure_detail
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    visit_id uuid NOT NULL,
    notes text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_completed boolean DEFAULT false,
    CONSTRAINT procedure_detail_pkey PRIMARY KEY (id),
    CONSTRAINT fk_procedure_detail_visit_id FOREIGN KEY (visit_id)
        REFERENCES public.visits (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.procedure_detail
    OWNER to postgres;
 
-- Table: public.procedure_detail_mapping
CREATE TABLE IF NOT EXISTS public.procedure_detail_mapping
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    procedure_detail_id uuid NOT NULL,
    procedure_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    document_details json,
    CONSTRAINT procedure_detail_mapping_pkey PRIMARY KEY (id),
    CONSTRAINT unique_procedure_detail UNIQUE (procedure_detail_id, procedure_id),
    CONSTRAINT fk_procedure_detail_mapping_procedure_detail_id FOREIGN KEY (procedure_detail_id)
        REFERENCES public.procedure_detail (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_procedure_detail_mapping_procedure_id FOREIGN KEY (procedure_id)
        REFERENCES public.procedures (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.procedure_detail_mapping
    OWNER to postgres;
 
COMMENT ON COLUMN public.procedure_detail_mapping.document_details
    IS 'JSON field to store procedure-specific document details';
 
-- Table: public.surgery_detail
CREATE TABLE IF NOT EXISTS public.surgery_detail
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    visit_id uuid NOT NULL,
    surgery_type character varying(100) COLLATE pg_catalog."default",
    surgeon character varying(100) COLLATE pg_catalog."default",
    anesthesiologist character varying(100) COLLATE pg_catalog."default",
    surgery_start_time timestamp without time zone,
    surgery_end_time timestamp without time zone,
    anesthesia_protocol text COLLATE pg_catalog."default",
    surgical_findings text COLLATE pg_catalog."default",
    complications text COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    is_completed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT surgery_detail_pkey PRIMARY KEY (id)
);
 
ALTER TABLE IF EXISTS public.surgery_detail
    OWNER to postgres;
 
-- Table: public.surgery_discharge
CREATE TABLE IF NOT EXISTS public.surgery_discharge
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    visit_id uuid NOT NULL,
    discharge_status character varying(50) COLLATE pg_catalog."default",
    discharge_datetime timestamp without time zone,
    home_care_instructions text COLLATE pg_catalog."default",
    medications_to_go_home text COLLATE pg_catalog."default",
    follow_up_instructions text COLLATE pg_catalog."default",
    followup_date date,
    is_completed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT surgery_discharge_pkey PRIMARY KEY (id)
);
 
ALTER TABLE IF EXISTS public.surgery_discharge
    OWNER to postgres;
 
-- Table: public.surgery_post_op
CREATE TABLE IF NOT EXISTS public.surgery_post_op
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    visit_id uuid NOT NULL,
    recovery_status character varying(50) COLLATE pg_catalog."default",
    pain_assessment character varying(50) COLLATE pg_catalog."default",
    vital_signs text COLLATE pg_catalog."default",
    post_op_medications text COLLATE pg_catalog."default",
    wound_care text COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    is_completed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT surgery_post_op_pkey PRIMARY KEY (id)
);
 
ALTER TABLE IF EXISTS public.surgery_post_op
    OWNER to postgres;
 
-- Table: public.surgery_pre_op
CREATE TABLE IF NOT EXISTS public.surgery_pre_op
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    visit_id uuid NOT NULL,
    weight_kg numeric,
    pre_op_bloodwork_results text COLLATE pg_catalog."default",
    anesthesia_risk_assessment character varying(50) COLLATE pg_catalog."default",
    fasting_status character varying(50) COLLATE pg_catalog."default",
    pre_op_medications text COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    is_completed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT surgery_pre_op_pkey PRIMARY KEY (id)
);
 
ALTER TABLE IF EXISTS public.surgery_pre_op
    OWNER to postgres;
 
-- Table: public.vaccination_details
CREATE TABLE IF NOT EXISTS public.vaccination_details
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    visit_id uuid NOT NULL,
    notes text COLLATE pg_catalog."default",
    is_completed boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT vaccination_details_pkey PRIMARY KEY (id),
    CONSTRAINT vaccination_details_visit_id_fkey FOREIGN KEY (visit_id)
        REFERENCES public.visits (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);
 
ALTER TABLE IF EXISTS public.vaccination_details
    OWNER to postgres;
 
-- Index: idx_vaccination_details_visit_id
CREATE INDEX IF NOT EXISTS idx_vaccination_details_visit_id
    ON public.vaccination_details USING btree
    (visit_id ASC NULLS LAST)
;
 
-- Table: public.vaccination_detail_masters
CREATE TABLE IF NOT EXISTS public.vaccination_detail_masters
(
    vaccination_detail_id uuid NOT NULL,
    vaccination_master_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    vaccination_json text COLLATE pg_catalog."default",
    CONSTRAINT vaccination_detail_masters_pkey PRIMARY KEY (vaccination_detail_id, vaccination_master_id),
    CONSTRAINT vaccination_detail_masters_vaccination_detail_id_fkey FOREIGN KEY (vaccination_detail_id)
        REFERENCES public.vaccination_details (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT vaccination_detail_masters_vaccination_master_id_fkey FOREIGN KEY (vaccination_master_id)
        REFERENCES public.vaccination_master (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.vaccination_detail_masters
    OWNER to postgres;
 
-- Index: idx_vaccination_detail_masters_vaccination_detail_id
CREATE INDEX IF NOT EXISTS idx_vaccination_detail_masters_vaccination_detail_id
    ON public.vaccination_detail_masters USING btree
    (vaccination_detail_id ASC NULLS LAST)
;
 
-- Index: idx_vaccination_detail_masters_vaccination_master_id
CREATE INDEX IF NOT EXISTS idx_vaccination_detail_masters_vaccination_master_id
    ON public.vaccination_detail_masters USING btree
    (vaccination_master_id ASC NULLS LAST)
;
 
-- Table: public.vital_details
CREATE TABLE IF NOT EXISTS public.vital_details
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    visit_id uuid NOT NULL,
    temperature_c integer,
    heart_rate_bpm integer,
    respiratory_rate_bpm integer,
    mucous_membrane_color text COLLATE pg_catalog."default",
    capillary_refill_time_sec integer,
    hydration_status text COLLATE pg_catalog."default",
    notes text COLLATE pg_catalog."default",
    is_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT vitals_pkey PRIMARY KEY (id),
    CONSTRAINT fk_vitals_visit_id FOREIGN KEY (visit_id)
        REFERENCES public.visits (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.vital_details
    OWNER to postgres;
 
-- Corrected Table Creation Script - Part 5
-- Fifth level tables (depend on purchase orders and other tables)
 
-- Table: public.purchase_orders
CREATE TABLE IF NOT EXISTS public.purchase_orders
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    clinic_id uuid,
    supplier_id uuid,
    order_number character varying(100) COLLATE pg_catalog."default" NOT NULL,
    order_date date NOT NULL,
    expected_delivery_date date,
    actual_delivery_date date,
    status character varying(50) COLLATE pg_catalog."default" DEFAULT 'pending'::character varying,
    extended_amount numeric(10,2),
    total_amount numeric(10,2),
    notes text COLLATE pg_catalog."default",
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    discount_percentage numeric(18,2),
    discounted_amount numeric(18,2),
    pdf_data bytea,
    CONSTRAINT purchase_orders_pkey PRIMARY KEY (id),
    CONSTRAINT purchase_orders_order_number_key UNIQUE (order_number),
    CONSTRAINT purchase_orders_clinic_id_fkey FOREIGN KEY (clinic_id)
        REFERENCES public.clinics (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT purchase_orders_created_by_fkey FOREIGN KEY (created_by)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id)
        REFERENCES public.suppliers (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT purchase_orders_status_check CHECK (status::text = ANY (ARRAY['pending'::character varying::text, 'ordered'::character varying::text, 'partial'::character varying::text, 'received'::character varying::text, 'cancelled'::character varying::text]))
);
 
ALTER TABLE IF EXISTS public.purchase_orders
    OWNER to postgres;
 
-- Trigger: update_purchase_orders_updated_at
CREATE OR REPLACE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE
    ON public.purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
 
-- Table: public.purchase_order_items
CREATE TABLE IF NOT EXISTS public.purchase_order_items
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    purchase_order_id uuid,
    product_id uuid,
    quantity_ordered integer NOT NULL,
    quantity_received integer DEFAULT 0,
    unit_cost numeric(10,2),
    extended_amount numeric(10,2),
    lot_number character varying(100) COLLATE pg_catalog."default",
    expiration_date date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    units_per_package integer,
    total_units numeric(10,2),
    batch_number character varying(100) COLLATE pg_catalog."default",
    date_of_manufacture date,
    actual_delivery_date date,
    received_by uuid,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    discount_percentage numeric(18,2),
    discounted_amount numeric(18,2),
    tax_amount numeric(18,2),
    total_amount numeric(18,2),
    supplier_id uuid,
    barcode_number text COLLATE pg_catalog."default",
    CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id),
    CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id)
        REFERENCES public.products (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id)
        REFERENCES public.purchase_orders (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT purchase_order_items_received_by_fkey FOREIGN KEY (received_by)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);
 
ALTER TABLE IF EXISTS public.purchase_order_items
    OWNER to postgres;
 
COMMENT ON COLUMN public.purchase_order_items.units_per_package
    IS 'Number of units per package (e.g., tablets per strip, ml per bottle)';
 
COMMENT ON COLUMN public.purchase_order_items.total_units
    IS 'Total units in EA (Each) for inventory tracking';
 
COMMENT ON COLUMN public.purchase_order_items.batch_number
    IS 'Batch number for received items';
 
COMMENT ON COLUMN public.purchase_order_items.date_of_manufacture
    IS 'Date of manufacture for received items';
 
COMMENT ON COLUMN public.purchase_order_items.actual_delivery_date
    IS 'Actual delivery date when items were received';
 
COMMENT ON COLUMN public.purchase_order_items.received_by
    IS 'User who received the items';
 
COMMENT ON COLUMN public.purchase_order_items.updated_at
    IS 'Last update timestamp';
 
-- Index: idx_purchase_order_items_actual_delivery_date
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_actual_delivery_date
    ON public.purchase_order_items USING btree
    (actual_delivery_date ASC NULLS LAST)
;
 
-- Index: idx_purchase_order_items_received_by
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_received_by
    ON public.purchase_order_items USING btree
    (received_by ASC NULLS LAST)
;
 
-- Table: public.purchase_order_receiving_history
CREATE TABLE IF NOT EXISTS public.purchase_order_receiving_history
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    purchase_order_id uuid NOT NULL,
    purchase_order_item_id uuid NOT NULL,
    product_id uuid NOT NULL,
    clinic_id uuid NOT NULL,
    quantity_received integer NOT NULL,
    batch_number character varying(100) COLLATE pg_catalog."default" NOT NULL,
    expiry_date date,
    date_of_manufacture date,
    received_date date NOT NULL,
    received_by uuid,
    notes text COLLATE pg_catalog."default",
    unit_cost numeric(10,2),
    lot_number character varying(100) COLLATE pg_catalog."default",
    supplier_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    quantity_on_hand integer DEFAULT 0,
    barcode character varying(255) COLLATE pg_catalog."default",
    shelf text COLLATE pg_catalog."default",
    bin text COLLATE pg_catalog."default",
    barcode_number text COLLATE pg_catalog."default",
    CONSTRAINT purchase_order_receiving_history_pkey PRIMARY KEY (id),
    CONSTRAINT uk_purchase_order_receiving_history_barcode UNIQUE (barcode),
    CONSTRAINT fk_purchase_order_receiving_history_clinic FOREIGN KEY (clinic_id)
        REFERENCES public.clinics (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_purchase_order_receiving_history_product FOREIGN KEY (product_id)
        REFERENCES public.products (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_purchase_order_receiving_history_purchase_order FOREIGN KEY (purchase_order_id)
        REFERENCES public.purchase_orders (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_purchase_order_receiving_history_purchase_order_item FOREIGN KEY (purchase_order_item_id)
        REFERENCES public.purchase_order_items (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_purchase_order_receiving_history_supplier FOREIGN KEY (supplier_id)
        REFERENCES public.suppliers (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL
);
 
ALTER TABLE IF EXISTS public.purchase_order_receiving_history
    OWNER to postgres;
 
COMMENT ON COLUMN public.purchase_order_receiving_history.quantity_on_hand
    IS 'Quantity in hand for this specific batch/lot at the time of receiving';
 
COMMENT ON COLUMN public.purchase_order_receiving_history.barcode
    IS 'Unique barcode for each received item batch';
 
-- Index: idx_purchase_order_receiving_history_barcode
CREATE INDEX IF NOT EXISTS idx_purchase_order_receiving_history_barcode
    ON public.purchase_order_receiving_history USING btree
    (barcode COLLATE pg_catalog."default" ASC NULLS LAST)
;
 
-- Index: idx_purchase_order_receiving_history_clinic_id
CREATE INDEX IF NOT EXISTS idx_purchase_order_receiving_history_clinic_id
    ON public.purchase_order_receiving_history USING btree
    (clinic_id ASC NULLS LAST)
;
 
-- Index: idx_purchase_order_receiving_history_product_clinic
CREATE INDEX IF NOT EXISTS idx_purchase_order_receiving_history_product_clinic
    ON public.purchase_order_receiving_history USING btree
    (product_id ASC NULLS LAST, clinic_id ASC NULLS LAST)
;
 
-- Index: idx_purchase_order_receiving_history_product_id
CREATE INDEX IF NOT EXISTS idx_purchase_order_receiving_history_product_id
    ON public.purchase_order_receiving_history USING btree
    (product_id ASC NULLS LAST)
;
 
-- Index: idx_purchase_order_receiving_history_purchase_order_id
CREATE INDEX IF NOT EXISTS idx_purchase_order_receiving_history_purchase_order_id
    ON public.purchase_order_receiving_history USING btree
    (purchase_order_id ASC NULLS LAST)
;
 
-- Index: idx_purchase_order_receiving_history_quantity_on_hand
CREATE INDEX IF NOT EXISTS idx_purchase_order_receiving_history_quantity_on_hand
    ON public.purchase_order_receiving_history USING btree
    (quantity_on_hand ASC NULLS LAST)
;
 
-- Index: idx_purchase_order_receiving_history_received_date
CREATE INDEX IF NOT EXISTS idx_purchase_order_receiving_history_received_date
    ON public.purchase_order_receiving_history USING btree
    (received_date ASC NULLS LAST)
;
 
-- Table: public.prescription_product_mapping
CREATE TABLE IF NOT EXISTS public.prescription_product_mapping
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    prescription_detail_id uuid NOT NULL,
    product_id uuid NOT NULL,
    frequency text COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    quantity integer,
    number_of_days integer,
    is_checked boolean DEFAULT false,
    directions text COLLATE pg_catalog."default",
    purchase_order_receiving_history_id uuid,
    CONSTRAINT prescription_product_mapping_pkey PRIMARY KEY (id),
    CONSTRAINT fk_prescription_detail FOREIGN KEY (prescription_detail_id)
        REFERENCES public.prescription_details (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_prescription_product_mapping_receiving_history FOREIGN KEY (purchase_order_receiving_history_id)
        REFERENCES public.purchase_order_receiving_history (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE RESTRICT
);
 
ALTER TABLE IF EXISTS public.prescription_product_mapping
    OWNER to postgres;
 
COMMENT ON COLUMN public.prescription_product_mapping.number_of_days
    IS 'Number of days for the prescription treatment';
 
COMMENT ON COLUMN public.prescription_product_mapping.directions
    IS 'Instructions or directions for taking the medication';
 
COMMENT ON COLUMN public.prescription_product_mapping.purchase_order_receiving_history_id
    IS 'Reference to the specific batch/lot from purchase order receiving history';
 
-- Index: idx_prescription_product_mapping_receiving_history_id
CREATE INDEX IF NOT EXISTS idx_prescription_product_mapping_receiving_history_id
    ON public.prescription_product_mapping USING btree
    (purchase_order_receiving_history_id ASC NULLS LAST)
;
 
-- Table: public.inventory
CREATE TABLE IF NOT EXISTS public.inventory
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    clinic_id uuid,
    product_id uuid,
    lot_number character varying(100) COLLATE pg_catalog."default",
    expiration_date date,
    quantity_on_hand integer NOT NULL DEFAULT 0,
    quantity_reserved integer DEFAULT 0,
    reorder_level integer DEFAULT 0,
    reorder_quantity integer DEFAULT 0,
    unit_cost numeric(10,2),
    wholesale_cost numeric(10,2),
    retail_price numeric(10,2),
    location character varying(100) COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    unit_of_measure character varying(20) COLLATE pg_catalog."default" DEFAULT 'EA'::character varying,
    units_per_package integer,
    batch_number character varying(100) COLLATE pg_catalog."default",
    date_of_manufacture date,
    received_from_po boolean DEFAULT false,
    po_item_id uuid,
    received_date date,
    supplier_id uuid,
    status character varying(50) COLLATE pg_catalog."default",
    CONSTRAINT inventory_pkey PRIMARY KEY (id),
    CONSTRAINT inventory_clinic_id_fkey FOREIGN KEY (clinic_id)
        REFERENCES public.clinics (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT inventory_po_item_id_fkey FOREIGN KEY (po_item_id)
        REFERENCES public.purchase_order_items (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL,
    CONSTRAINT inventory_product_id_fkey FOREIGN KEY (product_id)
        REFERENCES public.products (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.inventory
    OWNER to postgres;
 
COMMENT ON COLUMN public.inventory.unit_of_measure
    IS 'Unit of measure for the product (EA, STRIP, BOTTLE, etc.)';
 
COMMENT ON COLUMN public.inventory.units_per_package
    IS 'Number of units per package (e.g., tablets per strip, ml per bottle)';
 
COMMENT ON COLUMN public.inventory.batch_number
    IS 'Batch number from purchase order receiving';
 
COMMENT ON COLUMN public.inventory.date_of_manufacture
    IS 'Manufacture date from purchase order receiving';
 
COMMENT ON COLUMN public.inventory.received_from_po
    IS 'Indicates if this inventory was received from a purchase order';
 
COMMENT ON COLUMN public.inventory.po_item_id
    IS 'Reference to the purchase order item that created this inventory';
 
COMMENT ON COLUMN public.inventory.received_date
    IS 'Date when this inventory was received';
 
-- Index: idx_inventory_batch_number
CREATE INDEX IF NOT EXISTS idx_inventory_batch_number
    ON public.inventory USING btree
    (batch_number COLLATE pg_catalog."default" ASC NULLS LAST)
;
 
-- Index: idx_inventory_expiration
CREATE INDEX IF NOT EXISTS idx_inventory_expiration
    ON public.inventory USING btree
    (expiration_date ASC NULLS LAST)
;
 
-- Index: idx_inventory_po_item_id
CREATE INDEX IF NOT EXISTS idx_inventory_po_item_id
    ON public.inventory USING btree
    (po_item_id ASC NULLS LAST)
;
 
-- Index: idx_inventory_product
CREATE INDEX IF NOT EXISTS idx_inventory_product
    ON public.inventory USING btree
    (product_id ASC NULLS LAST)
;
 
-- Index: idx_inventory_received_date
CREATE INDEX IF NOT EXISTS idx_inventory_received_date
    ON public.inventory USING btree
    (received_date ASC NULLS LAST)
;
 
-- Trigger: update_inventory_updated_at
CREATE OR REPLACE TRIGGER update_inventory_updated_at
    BEFORE UPDATE
    ON public.inventory
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
 
-- Table: public.stock_adjustments
CREATE TABLE IF NOT EXISTS public.stock_adjustments
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    clinic_id uuid,
    inventory_id uuid,
    adjustment_type character varying(50) COLLATE pg_catalog."default",
    quantity_change integer NOT NULL,
    reason character varying(255) COLLATE pg_catalog."default",
    reference_number character varying(100) COLLATE pg_catalog."default",
    adjusted_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT stock_adjustments_pkey PRIMARY KEY (id),
    CONSTRAINT stock_adjustments_adjusted_by_fkey FOREIGN KEY (adjusted_by)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT stock_adjustments_clinic_id_fkey FOREIGN KEY (clinic_id)
        REFERENCES public.clinics (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT stock_adjustments_inventory_id_fkey FOREIGN KEY (inventory_id)
        REFERENCES public.inventory (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT stock_adjustments_adjustment_type_check CHECK (adjustment_type::text = ANY (ARRAY['increase'::character varying::text, 'decrease'::character varying::text, 'correction'::character varying::text]))
);
 
ALTER TABLE IF EXISTS public.stock_adjustments
    OWNER to postgres;
 
-- Table: public.password_reset_otps
CREATE TABLE IF NOT EXISTS public.password_reset_otps
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    otp character varying(10) COLLATE pg_catalog."default" NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    is_used boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT password_reset_otps_pkey PRIMARY KEY (id)
);
 
ALTER TABLE IF EXISTS public.password_reset_otps
    OWNER to postgres;
 
-- Index: idx_password_reset_otps_email
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_email
    ON public.password_reset_otps USING btree
    (email COLLATE pg_catalog."default" ASC NULLS LAST)
;
 
-- Table: public.client_deletion_otps
CREATE TABLE IF NOT EXISTS public.client_deletion_otps
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    client_id uuid NOT NULL,
    otp character varying(10) COLLATE pg_catalog."default" NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    is_used boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT client_deletion_otps_pkey PRIMARY KEY (id),
    CONSTRAINT fk_client_deletion_otps_client FOREIGN KEY (client_id)
        REFERENCES public.clients (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);
 
ALTER TABLE IF EXISTS public.client_deletion_otps
    OWNER to postgres;
 
-- Index: idx_client_deletion_otps_client_id
CREATE INDEX IF NOT EXISTS idx_client_deletion_otps_client_id
    ON public.client_deletion_otps USING btree
    (client_id ASC NULLS LAST)
;
 
 -- Table: public.patients

-- DROP TABLE IF EXISTS public.patients;

CREATE TABLE IF NOT EXISTS public.patients
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    client_id uuid,
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    species character varying(50) COLLATE pg_catalog."default" NOT NULL,
    breed character varying(100) COLLATE pg_catalog."default",
    color character varying(50) COLLATE pg_catalog."default",
    gender character varying(20) COLLATE pg_catalog."default",
    is_neutered boolean,
    date_of_birth date,
    weight_kg numeric(5,2),
    microchip_number character varying(50) COLLATE pg_catalog."default" NOT NULL,
    registration_number character varying(100) COLLATE pg_catalog."default",
    insurance_provider character varying(100) COLLATE pg_catalog."default",
    insurance_policy_number character varying(100) COLLATE pg_catalog."default",
    allergies text COLLATE pg_catalog."default",
    medical_conditions text COLLATE pg_catalog."default",
    behavioral_notes text COLLATE pg_catalog."default",
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    company_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    secondary_breed text COLLATE pg_catalog."default",
    CONSTRAINT patients_pkey PRIMARY KEY (id),
    CONSTRAINT patients_microchip_number_unique UNIQUE (microchip_number),
    CONSTRAINT fk_patients_company FOREIGN KEY (company_id)
        REFERENCES public.company (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT patients_client_id_fkey FOREIGN KEY (client_id)
        REFERENCES public.clients (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT patients_gender_check CHECK (gender::text = ANY (ARRAY['male'::character varying::text, 'female'::character varying::text, 'unknown'::character varying::text]))
);

ALTER TABLE IF EXISTS public.patients
    OWNER to postgres;

COMMENT ON COLUMN public.patients.secondary_breed
    IS 'Optional secondary breed for mixed breed patients';
-- Index: idx_patients_client

-- DROP INDEX IF EXISTS public.idx_patients_client;

CREATE INDEX IF NOT EXISTS idx_patients_client
    ON public.patients USING btree
    (client_id ASC NULLS LAST)
;
-- Index: idx_patients_company_id

-- DROP INDEX IF EXISTS public.idx_patients_company_id;

CREATE INDEX IF NOT EXISTS idx_patients_company_id
    ON public.patients USING btree
    (company_id ASC NULLS LAST)
;

-- Trigger: update_patients_updated_at

-- DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;

CREATE OR REPLACE TRIGGER update_patients_updated_at
    BEFORE UPDATE 
    ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- Make microchip_number Required and Unique (incl. Existing DB)
-- =========================================================
-- For existing DBs: update NULLs, add UNIQUE, set NOT NULL.
-- For new DBs: table already has NOT NULL + UNIQUE; blocks no-op.
-- =========================================================

DO $$
DECLARE
    row_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO row_count FROM patients WHERE microchip_number IS NULL;
    IF row_count > 0 THEN
        RAISE NOTICE 'Found % rows with NULL microchip_number. Generating temporary unique values...', row_count;
        UPDATE patients
        SET microchip_number = 'TEMP_' || id::TEXT
        WHERE microchip_number IS NULL;
        RAISE NOTICE 'Updated % rows. Please replace TEMP_* microchip numbers with real values.', row_count;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'patients' AND column_name = 'microchip_number' AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE patients ALTER COLUMN microchip_number SET NOT NULL;
        RAISE NOTICE 'Set microchip_number to NOT NULL';
    END IF;
END $$;

-- Table: public.patient_files
CREATE TABLE IF NOT EXISTS public.patient_files
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT patient_files_pkey PRIMARY KEY (id),
    CONSTRAINT fk_patient_files_patient FOREIGN KEY (patient_id)
        REFERENCES public.patients (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_patient_files_created_by FOREIGN KEY (created_by)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

ALTER TABLE IF EXISTS public.patient_files
    OWNER to postgres;

-- Index: idx_patient_files_patient_id
CREATE INDEX IF NOT EXISTS idx_patient_files_patient_id
    ON public.patient_files USING btree
    (patient_id ASC NULLS LAST)
;

-- Index: idx_patient_files_created_by
CREATE INDEX IF NOT EXISTS idx_patient_files_created_by
    ON public.patient_files USING btree
    (created_by ASC NULLS LAST)
;

-- Trigger: update_patient_files_updated_at
CREATE OR REPLACE TRIGGER update_patient_files_updated_at
    BEFORE UPDATE 
    ON public.patient_files
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

    -- Table: public.patient_file_attachments
CREATE TABLE IF NOT EXISTS public.patient_file_attachments
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    patient_file_id uuid NOT NULL,
    file_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    file_path character varying(500) COLLATE pg_catalog."default" NOT NULL,
    file_type character varying(50) COLLATE pg_catalog."default" NOT NULL,
    file_size bigint NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT patient_file_attachments_pkey PRIMARY KEY (id),
    CONSTRAINT fk_patient_file_attachments_patient_file FOREIGN KEY (patient_file_id)
        REFERENCES public.patient_files (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

ALTER TABLE IF EXISTS public.patient_file_attachments
    OWNER to postgres;

-- Index: idx_patient_file_attachments_patient_file_id
CREATE INDEX IF NOT EXISTS idx_patient_file_attachments_patient_file_id
    ON public.patient_file_attachments USING btree
    (patient_file_id ASC NULLS LAST)
;

-- Trigger: update_patient_file_attachments_updated_at
CREATE OR REPLACE TRIGGER update_patient_file_attachments_updated_at
    BEFORE UPDATE 
    ON public.patient_file_attachments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

    -- Table: public.visit_invoices

-- DROP TABLE IF EXISTS public.visit_invoices;

CREATE TABLE IF NOT EXISTS public.visit_invoices
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    visit_id uuid,
    client_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    invoice_number text COLLATE pg_catalog."default",
    items_total numeric(18,2),
    consultation_fee integer,
    consultation_discount_percentage numeric(5,2),
    consultation_discount numeric(18,2),
    consultation_fee_after_discount numeric(18,2),
    overall_product_discount numeric(18,2),
    overall_product_discount_percentage numeric(5,2),
    notes text COLLATE pg_catalog."default",
    total numeric(18,2),
    status text COLLATE pg_catalog."default",
    payment_method character varying(50) COLLATE pg_catalog."default",
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT visit_invoices_pkey PRIMARY KEY (id),
    CONSTRAINT fk_visit_invoices_client FOREIGN KEY (client_id)
        REFERENCES public.clients (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_visit_invoices_patient FOREIGN KEY (patient_id)
        REFERENCES public.patients (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_visit_invoices_visit FOREIGN KEY (visit_id)
        REFERENCES public.visits (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

ALTER TABLE IF EXISTS public.visit_invoices
    OWNER to postgres;
-- Index: idx_visit_invoices_client_id

-- DROP INDEX IF EXISTS public.idx_visit_invoices_client_id;

CREATE INDEX IF NOT EXISTS idx_visit_invoices_client_id
    ON public.visit_invoices USING btree
    (client_id ASC NULLS LAST)
;
-- Index: idx_visit_invoices_patient_id

-- DROP INDEX IF EXISTS public.idx_visit_invoices_patient_id;

CREATE INDEX IF NOT EXISTS idx_visit_invoices_patient_id
    ON public.visit_invoices USING btree
    (patient_id ASC NULLS LAST)
;
-- Index: idx_visit_invoices_visit_id

-- DROP INDEX IF EXISTS public.idx_visit_invoices_visit_id;

CREATE INDEX IF NOT EXISTS idx_visit_invoices_visit_id
    ON public.visit_invoices USING btree
    (visit_id ASC NULLS LAST)
;

    -- Table: public.visit_invoice_products

-- DROP TABLE IF EXISTS public.visit_invoice_products;

CREATE TABLE IF NOT EXISTS public.visit_invoice_products
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    visit_invoice_id uuid NOT NULL,
    purchase_order_receiving_history_id uuid NOT NULL,
    quantity integer NOT NULL,
    is_given boolean NOT NULL DEFAULT false,
    discount numeric(18,2),
    discount_percentage numeric(5,2),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT visit_invoice_products_pkey PRIMARY KEY (id),
    CONSTRAINT fk_visit_invoice_products_invoice FOREIGN KEY (visit_invoice_id)
        REFERENCES public.visit_invoices (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_visit_invoice_products_receiving_history FOREIGN KEY (purchase_order_receiving_history_id)
        REFERENCES public.purchase_order_receiving_history (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE RESTRICT
);

ALTER TABLE IF EXISTS public.visit_invoice_products
    OWNER to postgres;
-- Index: idx_visit_invoice_products_invoice_id

-- DROP INDEX IF EXISTS public.idx_visit_invoice_products_invoice_id;

CREATE INDEX IF NOT EXISTS idx_visit_invoice_products_invoice_id
    ON public.visit_invoice_products USING btree
    (visit_invoice_id ASC NULLS LAST)
;
-- Index: idx_visit_invoice_products_receiving_history_id

-- DROP INDEX IF EXISTS public.idx_visit_invoice_products_receiving_history_id;

CREATE INDEX IF NOT EXISTS idx_visit_invoice_products_receiving_history_id
    ON public.visit_invoice_products USING btree
    (purchase_order_receiving_history_id ASC NULLS LAST)
;

    ALTER TABLE public.visit_invoices
ADD COLUMN IF NOT EXISTS payment_method character varying(50) COLLATE pg_catalog."default";

-- Add clinic_id to visit_invoice table
ALTER TABLE visit_invoices
ADD COLUMN IF NOT EXISTS clinic_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'; -- Assuming a default GUID for existing records, adjust as needed.

-- Add overall_product_discount to visit_invoices table
ALTER TABLE public.visit_invoices
ADD COLUMN IF NOT EXISTS overall_product_discount numeric(18,2);

-- Add overall_product_discount_percentage to visit_invoices table
ALTER TABLE public.visit_invoices
ADD COLUMN IF NOT EXISTS overall_product_discount_percentage numeric(5,2);

-- Add discount to visit_invoice_products table
ALTER TABLE public.visit_invoice_products
ADD COLUMN IF NOT EXISTS discount numeric(18,2);

-- Add discount_percentage to visit_invoice_products table
ALTER TABLE public.visit_invoice_products
ADD COLUMN IF NOT EXISTS discount_percentage numeric(5,2);

ALTER TABLE public.company 
ADD COLUMN IF NOT EXISTS privacy_policy text COLLATE pg_catalog."default",
ADD COLUMN IF NOT EXISTS terms_of_use text COLLATE pg_catalog."default";


DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.procedures WHERE name = 'Vaccination') THEN
        DELETE FROM public.procedures
        WHERE name = 'Vaccination';
    END IF;
END $$;

-- Drop the is_core column from public.vaccination_master
ALTER TABLE public.vaccination_master
DROP COLUMN IF EXISTS is_core;

-- =========================================================
-- Remove prescriptions column from deworming_medication
-- =========================================================
-- Drop the index on prescriptions column (if exists)
DROP INDEX IF EXISTS public.idx_deworming_medication_prescriptions;

-- Drop the prescriptions column from deworming_medication table
ALTER TABLE public.deworming_medication
DROP COLUMN IF EXISTS prescriptions;

-- =========================================================
-- Remove follow_up_required column from deworming_notes
-- =========================================================
-- Drop the follow_up_required column from deworming_notes table
ALTER TABLE public.deworming_notes
DROP COLUMN IF EXISTS follow_up_required;

-- =========================================================
-- Add followup_date column to emergency_discharge table
-- =========================================================
-- Add the new column (nullable date column)
ALTER TABLE public.emergency_discharge 
ADD COLUMN IF NOT EXISTS followup_date date;

-- Add a comment to document the column purpose
COMMENT ON COLUMN public.emergency_discharge.followup_date IS 'Date for follow-up appointment or check-up (date only, no time component)';

-- Create index on followup_date column for better query performance
CREATE INDEX IF NOT EXISTS idx_emergency_discharge_followup_date ON public.emergency_discharge(followup_date);

-- Create partial index for non-null followup dates
CREATE INDEX IF NOT EXISTS idx_emergency_discharge_followup_date_not_null ON public.emergency_discharge(followup_date) WHERE followup_date IS NOT NULL;

-- =========================================================
-- Add followup_date column to surgery_discharge table
-- =========================================================
-- Add the new column (nullable date column)
ALTER TABLE public.surgery_discharge 
ADD COLUMN IF NOT EXISTS followup_date date;

-- Add a comment to document the column purpose
COMMENT ON COLUMN public.surgery_discharge.followup_date IS 'Date for follow-up appointment or check-up (date only, no time component)';

-- Create index on followup_date column for better query performance
CREATE INDEX IF NOT EXISTS idx_surgery_discharge_followup_date ON public.surgery_discharge(followup_date);

-- Create partial index for non-null followup dates
CREATE INDEX IF NOT EXISTS idx_surgery_discharge_followup_date_not_null ON public.surgery_discharge(followup_date) WHERE followup_date IS NOT NULL;

-- =========================================================
-- Add visit_id column to patient_files table
-- =========================================================
-- Add visit_id column to patient_files table (nullable)
ALTER TABLE public.patient_files
ADD COLUMN IF NOT EXISTS visit_id uuid NULL;

-- Add foreign key constraint to visits table (with check to avoid duplicate)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_patient_files_visit'
    ) THEN
        ALTER TABLE public.patient_files
        ADD CONSTRAINT fk_patient_files_visit FOREIGN KEY (visit_id)
            REFERENCES public.visits (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE SET NULL;
    END IF;
END $$;

-- Add index for better query performance on visit_id
CREATE INDEX IF NOT EXISTS idx_patient_files_visit_id
    ON public.patient_files USING btree
    (visit_id ASC NULLS LAST)
;

-- Add comment to document the column
COMMENT ON COLUMN public.patient_files.visit_id
    IS 'Optional foreign key to visits table. Links patient files to a specific visit if applicable.';

-- =========================================================
-- Table: public.patient_reports
-- =========================================================
CREATE TABLE IF NOT EXISTS public.patient_reports
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL,
    doctor_id uuid NOT NULL,
    created_by_id uuid NOT NULL,
    html_file text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT patient_reports_pkey PRIMARY KEY (id),
    CONSTRAINT fk_patient_reports_patient FOREIGN KEY (patient_id)
        REFERENCES public.patients (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_patient_reports_doctor FOREIGN KEY (doctor_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk_patient_reports_created_by FOREIGN KEY (created_by_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

ALTER TABLE IF EXISTS public.patient_reports
    OWNER to postgres;

-- Index: idx_patient_reports_patient_id
CREATE INDEX IF NOT EXISTS idx_patient_reports_patient_id
    ON public.patient_reports USING btree
    (patient_id ASC NULLS LAST)
;

-- Index: idx_patient_reports_doctor_id
CREATE INDEX IF NOT EXISTS idx_patient_reports_doctor_id
    ON public.patient_reports USING btree
    (doctor_id ASC NULLS LAST)
;

-- Index: idx_patient_reports_created_by_id
CREATE INDEX IF NOT EXISTS idx_patient_reports_created_by_id
    ON public.patient_reports USING btree
    (created_by_id ASC NULLS LAST)
;

-- Trigger: update_patient_reports_updated_at
CREATE OR REPLACE TRIGGER update_patient_reports_updated_at
    BEFORE UPDATE 
    ON public.patient_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments to document columns
COMMENT ON COLUMN public.patient_reports.html_file
    IS 'HTML content for the patient report (can store long text/length values)';

-- Drop name column if it exists (for backward compatibility with existing databases)
ALTER TABLE IF EXISTS public.patient_reports
DROP COLUMN IF EXISTS name;

-- =========================================================
-- Table: public.certificate_type
-- =========================================================
CREATE TABLE IF NOT EXISTS public.certificate_type
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default",
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT certificate_type_pkey PRIMARY KEY (id),
    CONSTRAINT certificate_type_name_key UNIQUE (name)
);

ALTER TABLE IF EXISTS public.certificate_type
    OWNER to postgres;

-- Index: idx_certificate_type_name
CREATE INDEX IF NOT EXISTS idx_certificate_type_name
    ON public.certificate_type USING btree
    (name COLLATE pg_catalog."default" ASC NULLS LAST)
;

-- Index: idx_certificate_type_is_active
CREATE INDEX IF NOT EXISTS idx_certificate_type_is_active
    ON public.certificate_type USING btree
    (is_active ASC NULLS LAST)
;

-- =========================================================
-- Add certificate_type_id column to existing certificate table
-- =========================================================
ALTER TABLE public.certificate
ADD COLUMN IF NOT EXISTS certificate_type_id uuid;

-- Add index for certificate_type_id (for existing databases)
CREATE INDEX IF NOT EXISTS idx_certificate_certificate_type_id
    ON public.certificate USING btree
    (certificate_type_id ASC NULLS LAST)
;

-- Add comment to document the column
COMMENT ON COLUMN public.certificate.certificate_type_id
    IS 'Type identifier for the certificate';

-- Add foreign key constraint for certificate_type_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_certificate_certificate_type'
    ) THEN
        ALTER TABLE public.certificate
        ADD CONSTRAINT fk_certificate_certificate_type FOREIGN KEY (certificate_type_id)
            REFERENCES public.certificate_type (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE SET NULL;
    END IF;
END $$;

-- =========================================================
-- Table: public.conversations
-- One conversation per patient - automatically created when needed
-- =========================================================
CREATE TABLE IF NOT EXISTS public.conversations
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL,
    started_by_user_id uuid,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT conversations_pkey PRIMARY KEY (id),
    CONSTRAINT conversations_patient_id_key UNIQUE (patient_id),
    CONSTRAINT fk_conversations_patient FOREIGN KEY (patient_id)
        REFERENCES public.patients (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_conversations_started_by_user FOREIGN KEY (started_by_user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL
);

ALTER TABLE IF EXISTS public.conversations
    OWNER to postgres;

-- Index: idx_conversations_patient_id_unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_patient_id_unique
    ON public.conversations USING btree
    (patient_id ASC NULLS LAST)
;

-- Index: idx_conversations_started_by_user_id
CREATE INDEX IF NOT EXISTS idx_conversations_started_by_user_id
    ON public.conversations USING btree
    (started_by_user_id ASC NULLS LAST)
;

-- Index: idx_conversations_is_active
CREATE INDEX IF NOT EXISTS idx_conversations_is_active
    ON public.conversations USING btree
    (is_active ASC NULLS LAST)
;

-- =========================================================
-- Table: public.conversation_messages
-- Stores individual messages within conversations
-- =========================================================
CREATE TABLE IF NOT EXISTS public.conversation_messages
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL,
    role character varying(20) COLLATE pg_catalog."default" NOT NULL,
    content text COLLATE pg_catalog."default" NOT NULL,
    sent_by_user_id uuid,
    metadata jsonb,
    sequence_number integer NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT conversation_messages_pkey PRIMARY KEY (id),
    CONSTRAINT conversation_messages_role_check CHECK (role::text = ANY (ARRAY['user'::character varying, 'assistant'::character varying, 'system'::character varying]::text[])),
    CONSTRAINT fk_conversation_messages_conversation FOREIGN KEY (conversation_id)
        REFERENCES public.conversations (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_conversation_messages_sent_by_user FOREIGN KEY (sent_by_user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE SET NULL
);

ALTER TABLE IF EXISTS public.conversation_messages
    OWNER to postgres;

-- Index: idx_conversation_messages_conversation_id
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id
    ON public.conversation_messages USING btree
    (conversation_id ASC NULLS LAST)
;

-- Index: idx_conversation_messages_sequence_number
CREATE INDEX IF NOT EXISTS idx_conversation_messages_sequence_number
    ON public.conversation_messages USING btree
    (conversation_id ASC NULLS LAST, sequence_number ASC NULLS LAST)
;

-- Index: idx_conversation_messages_sent_by_user_id
CREATE INDEX IF NOT EXISTS idx_conversation_messages_sent_by_user_id
    ON public.conversation_messages USING btree
    (sent_by_user_id ASC NULLS LAST)
;

-- =========================================================
-- Table: public.ratings
-- Stores ratings and feedback for appointments
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ratings
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    appointment_id uuid NOT NULL,
    rating integer NOT NULL,
    feedback text COLLATE pg_catalog."default",
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ratings_pkey PRIMARY KEY (id),
    CONSTRAINT fk_ratings_appointment FOREIGN KEY (appointment_id)
        REFERENCES public.appointments (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

ALTER TABLE IF EXISTS public.ratings
    OWNER to postgres;

-- Index: idx_ratings_appointment_id
CREATE INDEX IF NOT EXISTS idx_ratings_appointment_id
    ON public.ratings USING btree
    (appointment_id ASC NULLS LAST)
;

-- Trigger: update_ratings_updated_at
CREATE OR REPLACE TRIGGER update_ratings_updated_at
    BEFORE UPDATE
    ON public.ratings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- Table: public.notifications
-- Stores persistent notifications for users and clients
-- Notifications are created when sent via SignalR and can be retrieved after page refresh
-- At least one of user_id or client_id must be set (recipient is either a user or a client)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.notifications
(
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NULL,
    client_id uuid NULL,
    type character varying(100) COLLATE pg_catalog."default" NOT NULL,
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    message text COLLATE pg_catalog."default" NOT NULL,
    is_read boolean NOT NULL DEFAULT false,
    timestamp timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notifications_pkey PRIMARY KEY (id),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT fk_notifications_client FOREIGN KEY (client_id)
        REFERENCES public.clients (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT chk_notifications_recipient CHECK (user_id IS NOT NULL OR client_id IS NOT NULL)
);

ALTER TABLE IF EXISTS public.notifications
    OWNER to postgres;

-- Migration: Add client_id to EXISTING notifications table (must run before any COMMENT/INDEX on client_id)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications')
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'client_id')
    THEN
        ALTER TABLE public.notifications ADD COLUMN client_id uuid NULL;
    END IF;
END $$;
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications')
    AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'user_id')
    THEN
        ALTER TABLE public.notifications ALTER COLUMN user_id DROP NOT NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_notifications_client')
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients')
    THEN
        ALTER TABLE public.notifications ADD CONSTRAINT fk_notifications_client
            FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_notifications_recipient')
    THEN
        ALTER TABLE public.notifications ADD CONSTRAINT chk_notifications_recipient
            CHECK (user_id IS NOT NULL OR client_id IS NOT NULL);
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

COMMENT ON TABLE public.notifications
    IS 'Stores persistent notifications for users and clients. Notifications are created when sent via SignalR and can be retrieved after page refresh.';
COMMENT ON COLUMN public.notifications.user_id
    IS 'Foreign key to users table - the recipient of the notification (when set)';
COMMENT ON COLUMN public.notifications.client_id
    IS 'Foreign key to clients table - when set, recipient is a client (no user account)';
COMMENT ON COLUMN public.notifications.type
    IS 'Type of notification (e.g., appointment_created, appointment_cancelled)';
COMMENT ON COLUMN public.notifications.data
    IS 'JSONB object containing additional notification data specific to the type';
COMMENT ON COLUMN public.notifications.is_read
    IS 'Whether the user has read/viewed this notification';

-- Index: idx_notifications_user_id
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
    ON public.notifications USING btree
    (user_id ASC NULLS LAST)
;

-- Index: idx_notifications_client_id
CREATE INDEX IF NOT EXISTS idx_notifications_client_id
    ON public.notifications USING btree
    (client_id ASC NULLS LAST)
;

-- Index: idx_notifications_is_read
CREATE INDEX IF NOT EXISTS idx_notifications_is_read
    ON public.notifications USING btree
    (user_id ASC NULLS LAST, is_read ASC NULLS LAST)
    WHERE is_read = false
;

-- Index: idx_notifications_created_at
CREATE INDEX IF NOT EXISTS idx_notifications_created_at
    ON public.notifications USING btree
    (created_at DESC NULLS LAST)
;

-- Trigger: update_notifications_updated_at
CREATE OR REPLACE TRIGGER update_notifications_updated_at
    BEFORE UPDATE
    ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
