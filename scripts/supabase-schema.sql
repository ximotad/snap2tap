
-- Flete Inspection Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Assets table
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    default_location TEXT NOT NULL,
    status TEXT CHECK (status IN ('available', 'out')) DEFAULT 'available',
    current_inspection_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inspections table
CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    workflow_name TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT CHECK (type IN ('checkout', 'return', 'update')) NOT NULL,
    status TEXT CHECK (status IN ('open', 'closed')) DEFAULT 'closed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    checklist_json JSONB,
    signature_path TEXT,
    recipient_emails TEXT[],
    related_inspection_id UUID REFERENCES inspections(id)
);

-- Media table
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('photo', 'video')) NOT NULL,
    tag_label TEXT,
    tag_timestamp INTERVAL,
    taken_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint for current_inspection_id
ALTER TABLE assets 
ADD CONSTRAINT fk_current_inspection 
FOREIGN KEY (current_inspection_id) REFERENCES inspections(id);

-- Insert demo data
INSERT INTO assets (asset_code, name, default_location, status) VALUES
('TRUCK123', 'Box Truck #123', 'Bronx', 'out'),
('FORKLIFT9', 'Forklift #9', 'Avenue D', 'available');

-- Insert demo inspection (open for TRUCK123)
INSERT INTO inspections (
    id,
    asset_id,
    workflow_name,
    location,
    type,
    status,
    created_at,
    checklist_json
) VALUES (
    uuid_generate_v4(),
    (SELECT id FROM assets WHERE asset_code = 'TRUCK123'),
    'Bronx Checkout',
    'Bronx',
    'checkout',
    'open',
    '2022-10-11 10:30:00+00',
    '{"truckType": "box-truck", "vehicleNumber": "TRK-001", "customer": "ABC Company"}'
);

-- Update asset with current inspection
UPDATE assets 
SET current_inspection_id = (
    SELECT id FROM inspections 
    WHERE asset_id = (SELECT id FROM assets WHERE asset_code = 'TRUCK123')
    AND status = 'open'
    LIMIT 1
)
WHERE asset_code = 'TRUCK123';

-- Insert demo closed inspection for FORKLIFT9
INSERT INTO inspections (
    asset_id,
    workflow_name,
    location,
    type,
    status,
    created_at,
    closed_at,
    checklist_json
) VALUES (
    (SELECT id FROM assets WHERE asset_code = 'FORKLIFT9'),
    'Return - Avenue D',
    'Avenue D',
    'return',
    'closed',
    '2022-10-10 14:15:00+00',
    '2022-10-10 14:45:00+00',
    '{"truckType": "forklift", "vehicleNumber": "FL-009", "customer": "XYZ Corp"}'
);

-- Create storage buckets (run these in Supabase Dashboard -> Storage)
-- 1. Create bucket: inspections_media (public: true)
-- 2. Create bucket: signatures (public: true)

-- Indexes for performance
CREATE INDEX idx_assets_asset_code ON assets(asset_code);
CREATE INDEX idx_inspections_asset_id ON inspections(asset_id);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_media_inspection_id ON media(inspection_id);

-- RLS Policies (disable for demo - enable in production)
ALTER TABLE assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE inspections DISABLE ROW LEVEL SECURITY;
ALTER TABLE media DISABLE ROW LEVEL SECURITY;
