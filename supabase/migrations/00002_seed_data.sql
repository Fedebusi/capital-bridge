-- CapitalBridge Seed Data
-- Run this in Supabase SQL Editor to populate sample data

-- ============================================================
-- BORROWERS
-- ============================================================

INSERT INTO borrowers (id, name, group_name, type, internal_rating, rating_date, headquarters, year_established, website, description, total_exposure, total_commitments, number_of_active_deals, avg_irr, avg_multiple) VALUES
('b0000001-0000-0000-0000-000000000001', 'Solaris Promociones SL', 'Grupo Valverde Inversiones', 'Developer', 'A', '2025-03-15', 'Marbella, Málaga', 2009, 'www.valverde-inversiones.es', 'Leading Costa del Sol residential developer specializing in premium beachfront and golf-adjacent projects.', 10536400, 14200000, 1, 12.5, 1.22),
('b0000002-0000-0000-0000-000000000002', 'Norte Residencial SL', 'Altamira Capital Partners', 'Developer & Sponsor', 'B', '2026-02-20', 'Madrid', 2015, NULL, 'Madrid-focused residential developer with growing track record.', 0, 19500000, 1, 10.4, 1.15),
('b0000003-0000-0000-0000-000000000003', 'Levantina Homes SL', 'Mediterráneo Desarrollos', 'Developer', 'A', '2026-01-10', 'Valencia', 2004, NULL, 'One of Valencia''s most experienced residential developers with 22+ years of activity.', 0, 6800000, 1, 11.9, 1.19),
('b0000004-0000-0000-0000-000000000004', 'Eixample Heritage SL', 'Tramontana Group', 'Developer', 'C', '2026-03-28', 'Barcelona', 2020, NULL, 'Younger Barcelona-based developer focused on heritage refurbishment projects.', 0, 8500000, 1, 8.9, 1.11),
('b0000005-0000-0000-0000-000000000005', 'Marina Residences SL', 'Balear Real Estate', 'Developer & Sponsor', 'B', '2026-01-15', 'Palma de Mallorca', 2012, NULL, 'Balearic Islands-focused developer with strong track record in Palma premium residential.', 0, 13500000, 1, 11.4, 1.18);

-- ============================================================
-- BORROWER CONTACTS
-- ============================================================

INSERT INTO borrower_contacts (borrower_id, name, role, email, phone) VALUES
('b0000001-0000-0000-0000-000000000001', 'E. Sandoval', 'CEO & UBO', 'r.montalban@valverde-inv.es', '+34 952 XXX XXX'),
('b0000001-0000-0000-0000-000000000001', 'M. Sandoval', 'CFO', 'e.montalban@valverde-inv.es', '+34 952 XXX XXX'),
('b0000001-0000-0000-0000-000000000001', 'R. Fuentes', 'Head of Construction', 'j.ortega@solaris-dev.es', '+34 652 XXX XXX'),
('b0000002-0000-0000-0000-000000000002', 'H. Paredes', 'Managing Partner', 'f.velazquez@altamiracap.es', '+34 915 XXX XXX'),
('b0000002-0000-0000-0000-000000000002', 'A. Quintero', 'Finance Director', 'c.iglesias@altamiracap.es', '+34 915 XXX XXX'),
('b0000003-0000-0000-0000-000000000003', 'G. Navarro', 'CEO', 'a.pascual@meddesarrollos.es', '+34 963 XXX XXX'),
('b0000003-0000-0000-0000-000000000003', 'I. Molina', 'Commercial Director', 'l.ferrer@meddesarrollos.es', '+34 963 XXX XXX'),
('b0000004-0000-0000-0000-000000000004', 'D. Estrada', 'Founder & CEO', 'p.casanova@tramontana-dev.es', '+34 934 XXX XXX'),
('b0000005-0000-0000-0000-000000000005', 'F. Marín', 'Managing Director', 'b.serra@balear-re.es', '+34 971 XXX XXX'),
('b0000005-0000-0000-0000-000000000005', 'B. Costa', 'CFO', 'm.fiol@balear-re.es', '+34 971 XXX XXX');

-- ============================================================
-- CORPORATE ENTITIES
-- ============================================================

INSERT INTO corporate_entities (borrower_id, name, type, jurisdiction, registration_number, ownership) VALUES
('b0000001-0000-0000-0000-000000000001', 'Grupo Valverde Inversiones SL', 'Holding', 'Spain', 'B-29XXXXXX', '100% Valverde Family'),
('b0000001-0000-0000-0000-000000000001', 'Solaris Promociones SL', 'SPV', 'Spain', 'B-29XXXXXX', '100% Grupo Valverde'),
('b0000001-0000-0000-0000-000000000001', 'E. Sandoval García', 'UBO', 'Spain', NULL, '85% beneficial ownership'),
('b0000002-0000-0000-0000-000000000002', 'Altamira Capital Partners SL', 'Sponsor', 'Spain', 'B-28XXXXXX', '60% H. Paredes, 40% institutional'),
('b0000002-0000-0000-0000-000000000002', 'Norte Residencial SL', 'SPV', 'Spain', 'B-28XXXXXX', '100% Altamira Capital'),
('b0000003-0000-0000-0000-000000000003', 'Mediterráneo Desarrollos SA', 'Holding', 'Spain', 'A-46XXXXXX', 'Navarro Family (70%), Institutional (30%)'),
('b0000003-0000-0000-0000-000000000003', 'Levantina Homes SL', 'SPV', 'Spain', 'B-46XXXXXX', '100% Mediterráneo Desarrollos'),
('b0000004-0000-0000-0000-000000000004', 'Tramontana Group SL', 'Sponsor', 'Spain', 'B-08XXXXXX', 'Estrada Family (80%), Angel investors (20%)'),
('b0000004-0000-0000-0000-000000000004', 'Eixample Heritage SL', 'SPV', 'Spain', 'B-08XXXXXX', '100% Tramontana Group'),
('b0000005-0000-0000-0000-000000000005', 'Balear Real Estate SL', 'Sponsor', 'Spain', 'B-07XXXXXX', 'Marín Family (65%), Private investors (35%)'),
('b0000005-0000-0000-0000-000000000005', 'Marina Residences SL', 'SPV', 'Spain', 'B-07XXXXXX', '100% Balear RE');

-- ============================================================
-- KYC RECORDS
-- ============================================================

INSERT INTO kyc_records (borrower_id, item, status, last_checked, expiry_date, notes) VALUES
('b0000001-0000-0000-0000-000000000001', 'ID Verification (UBO)', 'valid', '2025-02-10', '2027-02-10', NULL),
('b0000001-0000-0000-0000-000000000001', 'AML Screening (WorldCheck)', 'valid', '2026-01-15', '2026-07-15', NULL),
('b0000001-0000-0000-0000-000000000001', 'Audited Financial Statements', 'valid', '2025-06-20', NULL, 'FY2024 audited by external firm'),
('b0000001-0000-0000-0000-000000000001', 'PEP Screening', 'valid', '2026-01-15', '2026-07-15', NULL),
('b0000002-0000-0000-0000-000000000002', 'ID Verification (UBO)', 'valid', '2026-02-01', '2028-02-01', NULL),
('b0000002-0000-0000-0000-000000000002', 'AML Screening (WorldCheck)', 'valid', '2026-02-20', '2026-08-20', NULL),
('b0000002-0000-0000-0000-000000000002', 'Audited Financial Statements', 'expiring_soon', '2025-07-10', '2026-04-30', 'FY2025 accounts requested'),
('b0000003-0000-0000-0000-000000000003', 'ID Verification (UBO)', 'valid', '2026-01-05', '2028-01-05', NULL),
('b0000003-0000-0000-0000-000000000003', 'AML Screening (WorldCheck)', 'valid', '2026-01-10', '2026-07-10', NULL),
('b0000004-0000-0000-0000-000000000004', 'ID Verification (UBO)', 'valid', '2026-03-20', '2028-03-20', NULL),
('b0000004-0000-0000-0000-000000000004', 'AML Screening (WorldCheck)', 'pending', NULL, NULL, 'Screening initiated — awaiting results'),
('b0000004-0000-0000-0000-000000000004', 'Audited Financial Statements', 'expired', '2025-01-15', '2026-01-15', 'FY2025 accounts not yet available'),
('b0000005-0000-0000-0000-000000000005', 'ID Verification (UBO)', 'valid', '2026-01-10', '2028-01-10', NULL),
('b0000005-0000-0000-0000-000000000005', 'AML Screening (WorldCheck)', 'valid', '2026-01-15', '2026-07-15', NULL);

-- ============================================================
-- COMPLETED PROJECTS
-- ============================================================

INSERT INTO completed_projects (borrower_id, name, location, year, units, loan_amount, irr, multiple, days_delay, outcome) VALUES
('b0000001-0000-0000-0000-000000000001', 'Hacienda Los Olivos', 'Benahavís', 2025, 10, 7200000, 14.2, 1.28, 0, 'on_time'),
('b0000001-0000-0000-0000-000000000001', 'Residencial Playa Dorada', 'Estepona', 2023, 24, 5800000, 12.8, 1.22, 15, 'on_time'),
('b0000001-0000-0000-0000-000000000001', 'Villas del Golf', 'Benahavís', 2022, 8, 4200000, 11.5, 1.18, 45, 'minor_delay'),
('b0000002-0000-0000-0000-000000000002', 'Residencial Arturo Soria', 'Madrid', 2024, 36, 11200000, 11.0, 1.17, 60, 'minor_delay'),
('b0000002-0000-0000-0000-000000000002', 'Apartamentos Chamberí', 'Madrid', 2022, 18, 5400000, 9.8, 1.14, 120, 'significant_delay'),
('b0000003-0000-0000-0000-000000000003', 'Lofts Ciutat Vella', 'Valencia', 2024, 14, 3800000, 13.5, 1.24, 0, 'on_time'),
('b0000003-0000-0000-0000-000000000003', 'Terrasses del Carme', 'Valencia', 2023, 20, 5200000, 12.2, 1.20, 0, 'on_time'),
('b0000004-0000-0000-0000-000000000004', 'Can Piqué Residences', 'Barcelona', 2024, 8, 2800000, 9.2, 1.12, 75, 'minor_delay'),
('b0000005-0000-0000-0000-000000000005', 'Ses Voltes Apartments', 'Palma', 2024, 18, 5600000, 12.0, 1.20, 30, 'on_time'),
('b0000005-0000-0000-0000-000000000005', 'Portixol Marina Lofts', 'Palma', 2022, 12, 3900000, 11.5, 1.18, 0, 'on_time');

-- ============================================================
-- DEALS
-- ============================================================

INSERT INTO deals (id, project_name, borrower_id, borrower_name, sponsor, location, city, coordinates, stage, asset_type, description, loan_amount, currency, interest_rate, pik_spread, total_rate, origination_fee, exit_fee, tenor, maturity_date, disbursed_amount, outstanding_principal, accrued_pik, total_exposure, gdv, current_appraisal, total_units, total_area, construction_budget, construction_spent, construction_progress, land_cost, ltv, ltc, pre_sales_percent, developer_experience, developer_track_record, date_received, term_sheet_date, ic_approval_date, closing_date, first_drawdown_date, expected_maturity, screening_score, tags) VALUES
('d0000001-0000-0000-0000-000000000001', 'Terrazas del Faro', 'b0000001-0000-0000-0000-000000000001', 'Solaris Promociones SL', 'Grupo Valverde Inversiones', 'Marbella, Málaga', 'Marbella', ARRAY[36.5099,-4.8861], 'active', 'Residential - Build to Sell', '38-unit luxury residential complex with panoramic sea views, infinity pool, private gardens, and underground parking.', 14200000, 'EUR', 4.5, 4.5, 9.0, 1.5, 0.75, 24, '2027-08-20', 9940000, 9940000, 596400, 10536400, 31200000, 20100000, 38, 4520, 15800000, 10740000, 72, 4100000, 52.4, 71.4, 47, 'Established - 16 years', 9, '2025-04-10', '2025-04-28', '2025-06-05', '2025-07-20', '2025-08-01', '2027-08-20', NULL, ARRAY['Costa del Sol','Luxury','Sea Views','Golden Mile']),

('d0000002-0000-0000-0000-000000000002', 'Arcos de Canillejas', 'b0000002-0000-0000-0000-000000000002', 'Norte Residencial SL', 'Altamira Capital Partners', 'Canillejas, Madrid', 'Madrid', ARRAY[40.45,-3.61], 'due_diligence', 'Residential - Build to Sell', '72-unit residential development in eastern Madrid, close to IFEMA and Barajas airport.', 19500000, 'EUR', 4.25, 4.25, 8.5, 1.25, 0.5, 30, '2028-11-30', 0, 0, 0, 0, 46000000, 26800000, 72, 7850, 24000000, 0, 0, 9200000, 72.8, 58.7, 18, 'Experienced - 11 years', 6, '2026-03-05', '2026-03-22', NULL, NULL, NULL, '2028-11-30', NULL, ARRAY['Madrid','IFEMA Area','Transport Hub']),

('d0000003-0000-0000-0000-000000000003', 'Jardines de Ruzafa', 'b0000003-0000-0000-0000-000000000003', 'Levantina Homes SL', 'Mediterráneo Desarrollos', 'Ruzafa, Valencia', 'Valencia', ARRAY[39.462,-0.374], 'ic_approval', 'Residential - Build to Sell', '24-unit boutique residential project in Valencia''s trendy Ruzafa district.', 6800000, 'EUR', 5.0, 4.0, 9.0, 1.5, 1.0, 22, '2028-06-30', 0, 0, 0, 0, 17800000, 10700000, 24, 2750, 8900000, 0, 0, 2600000, 63.6, 59.1, 38, 'Established - 22 years', 14, '2026-02-20', '2026-03-08', NULL, NULL, NULL, '2028-06-30', NULL, ARRAY['Valencia','Boutique','Ruzafa']),

('d0000004-0000-0000-0000-000000000004', 'Palau de Gràcia', 'b0000004-0000-0000-0000-000000000004', 'Eixample Heritage SL', 'Tramontana Group', 'Gràcia, Barcelona', 'Barcelona', ARRAY[41.4036,2.1744], 'screening', 'Residential - Refurbishment & Sale', 'Complete renovation of a 1920s modernist building into 16 high-end loft-style apartments.', 8500000, 'EUR', 5.5, 4.0, 9.5, 1.75, 1.0, 20, '2028-04-30', 0, 0, 0, 0, 23600000, 11900000, 16, 2180, 8200000, 0, 0, 5800000, 71.4, 60.7, 0, 'Mid-level - 6 years', 3, '2026-04-02', NULL, NULL, NULL, NULL, '2028-04-30', 62, ARRAY['Barcelona','Refurbishment','Modernist','Gràcia']),

('d0000005-0000-0000-0000-000000000005', 'Hacienda Los Olivos', 'b0000001-0000-0000-0000-000000000001', 'Olivos Premium Villas SL', 'Sierra Bermeja Desarrollos', 'Benahavís, Málaga', 'Benahavís', ARRAY[36.5228,-5.0455], 'repaid', 'Residential - Build to Sell', '10 luxury detached villas in the Benahavís hills. Fully sold 4 months before completion.', 7200000, 'EUR', 5.0, 4.5, 9.5, 1.5, 0.75, 18, '2025-11-30', 7200000, 0, 0, 0, 19500000, 19500000, 10, 3200, 9600000, 9600000, 100, 3900000, 36.9, 53.3, 100, 'Established - 19 years', 11, '2024-02-20', '2024-03-10', '2024-04-15', '2024-05-30', '2024-06-15', '2025-11-30', NULL, ARRAY['Benahavís','Luxury Villas','Golf','Fully Repaid']),

('d0000006-0000-0000-0000-000000000006', 'Mirador del Port', 'b0000005-0000-0000-0000-000000000005', 'Marina Residences SL', 'Balear Real Estate', 'Portixol, Palma de Mallorca', 'Palma', ARRAY[39.563,2.6502], 'documentation', 'Residential - Build to Sell', 'Two boutique residential buildings with 48 apartments total. Seafront location in Portixol.', 13500000, 'EUR', 4.75, 4.25, 9.0, 1.25, 0.75, 28, '2028-10-31', 0, 0, 0, 0, 35000000, 20500000, 48, 5600, 17800000, 0, 0, 6800000, 65.9, 54.9, 31, 'Established - 14 years', 8, '2026-01-25', '2026-02-12', '2026-03-20', NULL, NULL, '2028-10-31', NULL, ARRAY['Mallorca','Seafront','Portixol','Premium']);

-- ============================================================
-- DRAWDOWNS
-- ============================================================

INSERT INTO drawdowns (deal_id, milestone, amount, scheduled_date, status, construction_progress) VALUES
('d0000001-0000-0000-0000-000000000001', 'Land acquisition & site preparation', 4000000, '2025-08-01', 'disbursed', 0),
('d0000001-0000-0000-0000-000000000001', 'Foundation & structural frame', 2800000, '2025-11-15', 'disbursed', 28),
('d0000001-0000-0000-0000-000000000001', 'Envelope, MEP & rough-in', 3140000, '2026-03-15', 'disbursed', 58),
('d0000001-0000-0000-0000-000000000001', 'Interior finishes & fit-out', 2560000, '2026-08-01', 'pending', 78),
('d0000001-0000-0000-0000-000000000001', 'Completion, landscaping & handover', 1700000, '2027-01-15', 'pending', 95),
('d0000002-0000-0000-0000-000000000002', 'Land & permits', 5500000, '2026-08-01', 'pending', 0),
('d0000002-0000-0000-0000-000000000002', 'Foundation & basement', 4200000, '2026-12-01', 'pending', 18),
('d0000002-0000-0000-0000-000000000002', 'Superstructure', 5000000, '2027-05-01', 'pending', 48),
('d0000002-0000-0000-0000-000000000002', 'Finishes & landscaping', 4800000, '2027-11-01', 'pending', 82),
('d0000003-0000-0000-0000-000000000003', 'Land & initial works', 2200000, '2026-07-01', 'pending', 0),
('d0000003-0000-0000-0000-000000000003', 'Structure', 2300000, '2026-12-01', 'pending', 35),
('d0000003-0000-0000-0000-000000000003', 'Finishes', 2300000, '2027-06-01', 'pending', 72),
('d0000005-0000-0000-0000-000000000005', 'Land & infrastructure', 2200000, '2024-06-15', 'disbursed', 0),
('d0000005-0000-0000-0000-000000000005', 'Structure', 2700000, '2024-10-15', 'disbursed', 38),
('d0000005-0000-0000-0000-000000000005', 'Finishes & landscaping', 2300000, '2025-03-15', 'disbursed', 76),
('d0000006-0000-0000-0000-000000000006', 'Land & pre-construction', 3600000, '2026-07-01', 'pending', 0),
('d0000006-0000-0000-0000-000000000006', 'Foundation & structure Bldg A', 3200000, '2026-11-01', 'pending', 22),
('d0000006-0000-0000-0000-000000000006', 'Structure Bldg B & MEP', 3600000, '2027-04-01', 'pending', 52),
('d0000006-0000-0000-0000-000000000006', 'Finishes & common areas', 3100000, '2027-10-01', 'pending', 82);

-- ============================================================
-- COVENANTS
-- ============================================================

INSERT INTO covenants (deal_id, name, metric, threshold, current_value, status) VALUES
('d0000001-0000-0000-0000-000000000001', 'Maximum LTV', 'LTV', '≤ 65%', '52.4%', 'compliant'),
('d0000001-0000-0000-0000-000000000001', 'Maximum LTC', 'LTC', '≤ 75%', '71.4%', 'compliant'),
('d0000001-0000-0000-0000-000000000001', 'Minimum Pre-Sales', 'Pre-Sales', '≥ 30%', '47%', 'compliant'),
('d0000001-0000-0000-0000-000000000001', 'Construction Timeline', 'Timeline', '≤ 6 months delay', 'On schedule', 'compliant'),
('d0000002-0000-0000-0000-000000000002', 'Maximum LTV', 'LTV', '≤ 65%', '72.8%', 'breach'),
('d0000002-0000-0000-0000-000000000002', 'Maximum LTC', 'LTC', '≤ 75%', '58.7%', 'compliant'),
('d0000002-0000-0000-0000-000000000002', 'Minimum Pre-Sales', 'Pre-Sales', '≥ 30%', '18%', 'watch'),
('d0000003-0000-0000-0000-000000000003', 'Maximum LTV', 'LTV', '≤ 65%', '63.6%', 'compliant'),
('d0000003-0000-0000-0000-000000000003', 'Maximum LTC', 'LTC', '≤ 75%', '59.1%', 'compliant'),
('d0000003-0000-0000-0000-000000000003', 'Minimum Pre-Sales', 'Pre-Sales', '≥ 25%', '38%', 'compliant'),
('d0000006-0000-0000-0000-000000000006', 'Maximum LTV', 'LTV', '≤ 70%', '65.9%', 'compliant'),
('d0000006-0000-0000-0000-000000000006', 'Maximum LTC', 'LTC', '≤ 75%', '54.9%', 'compliant'),
('d0000006-0000-0000-0000-000000000006', 'Minimum Pre-Sales', 'Pre-Sales', '≥ 25%', '31%', 'compliant');

-- ============================================================
-- UNIT SALES
-- ============================================================

INSERT INTO unit_sales (deal_id, unit, type, area, list_price, status, sale_price, release_price) VALUES
('d0000001-0000-0000-0000-000000000001', 'A-01', '2-bed apartment', 97, 510000, 'sold', 502000, 204000),
('d0000001-0000-0000-0000-000000000001', 'A-02', '2-bed apartment', 101, 525000, 'sold', 520000, 210000),
('d0000001-0000-0000-0000-000000000001', 'B-01', '3-bed apartment', 132, 740000, 'contracted', 735000, 296000),
('d0000001-0000-0000-0000-000000000001', 'B-02', '3-bed penthouse', 160, 980000, 'reserved', NULL, NULL),
('d0000001-0000-0000-0000-000000000001', 'C-01', '2-bed apartment', 94, 490000, 'available', NULL, NULL),
('d0000001-0000-0000-0000-000000000001', 'C-02', '3-bed apartment', 135, 755000, 'reserved', NULL, NULL),
('d0000003-0000-0000-0000-000000000003', 'PH-A', '3-bed penthouse', 148, 1120000, 'contracted', 1095000, 375000),
('d0000003-0000-0000-0000-000000000003', '1-B', '2-bed apartment', 85, 480000, 'reserved', NULL, NULL),
('d0000003-0000-0000-0000-000000000003', '2-A', '2-bed apartment', 89, 505000, 'contracted', 498000, 168000),
('d0000005-0000-0000-0000-000000000005', 'V-01', '4-bed villa', 340, 1890000, 'sold', 1870000, 620000),
('d0000005-0000-0000-0000-000000000005', 'V-02', '4-bed villa', 325, 1780000, 'sold', 1800000, 598000),
('d0000005-0000-0000-0000-000000000005', 'V-03', '5-bed villa', 395, 2100000, 'sold', 2100000, 695000),
('d0000006-0000-0000-0000-000000000006', 'A-PH1', '4-bed penthouse', 195, 1680000, 'contracted', 1640000, 445000),
('d0000006-0000-0000-0000-000000000006', 'A-3B', '3-bed apartment', 115, 635000, 'reserved', NULL, NULL);

-- ============================================================
-- SCREENING CRITERIA (for deal-004 Palau de Gràcia)
-- ============================================================

INSERT INTO screening_criteria (deal_id, label, pass, value, threshold) VALUES
('d0000004-0000-0000-0000-000000000004', 'Asset Type', true, 'Residential - Refurb', 'Residential'),
('d0000004-0000-0000-0000-000000000004', 'Location', true, 'Barcelona Prime', 'Spain Tier 1 Cities'),
('d0000004-0000-0000-0000-000000000004', 'LTV at Origination', false, '71.4%', '≤ 65%'),
('d0000004-0000-0000-0000-000000000004', 'LTC', true, '60.7%', '≤ 75%'),
('d0000004-0000-0000-0000-000000000004', 'Ticket Size', true, '€8.5M', '€5M - €25M'),
('d0000004-0000-0000-0000-000000000004', 'Developer Track Record', false, '3 projects', '≥ 5 projects'),
('d0000004-0000-0000-0000-000000000004', 'Pre-Sales', false, '0%', '≥ 15%'),
('d0000004-0000-0000-0000-000000000004', 'Construction Risk', true, 'Refurbishment', 'Acceptable');

