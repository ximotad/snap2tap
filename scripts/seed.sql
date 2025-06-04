
-- Additional seed data for demo
INSERT INTO inspections (
    asset_id,
    workflow_name,
    location,
    type,
    status,
    created_at,
    closed_at,
    checklist_json,
    recipient_emails
) VALUES (
    (SELECT id FROM assets WHERE asset_code = 'FORKLIFT9'),
    'Checkout - Avenue D',
    'Avenue D',
    'checkout',
    'closed',
    '2022-10-08 09:00:00+00',
    '2022-10-08 09:30:00+00',
    '{"truckType": "forklift", "vehicleNumber": "FL-009", "customer": "XYZ Corp", "dateOut": "2022-10-08", "timeOut": "09:00", "milesOut": 1250, "fuelLevelOut": "Full"}',
    ARRAY['manager@xyzcorp.com', 'operator@xyzcorp.com']
);

-- Insert demo media records
INSERT INTO media (inspection_id, file_path, media_type, tag_label) VALUES
(
    (SELECT id FROM inspections WHERE workflow_name = 'Bronx Checkout' LIMIT 1),
    'inspections_media/truck123_photo1.jpg',
    'photo',
    NULL
),
(
    (SELECT id FROM inspections WHERE workflow_name = 'Bronx Checkout' LIMIT 1),
    'inspections_media/truck123_video1.mp4',
    'video',
    NULL
),
(
    (SELECT id FROM inspections WHERE workflow_name = 'Bronx Checkout' LIMIT 1),
    'inspections_media/truck123_photo2.jpg',
    'photo',
    '15s'
);
