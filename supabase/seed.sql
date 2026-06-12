-- Seed data for InspectAI similarity search feature.
--
-- Findings are inserted without embeddings (embedding = NULL).
-- After startup, backfill via the ML service batch endpoint:
--   POST /embeddings/batch  with all finding IDs and texts
--
-- Uses a placeholder inspection owned by a seed user. In production,
-- real embeddings come from the HF Inference Provider pipeline.

-- Seed organization and user for historical findings
insert into organizations (id, name)
values ('00000000-0000-0000-0000-000000000001', 'InspectAI Demo Org')
on conflict (id) do nothing;

-- Seed profiles row (auth.users entry must exist first in real Supabase;
-- for local dev with supabase start, insert directly into auth.users first
-- or use the Supabase Studio UI to create the demo user, then run this seed)
insert into profiles (id, email, full_name, role, organization_id)
values (
  '00000000-0000-0000-0000-000000000002',
  'seed@inspectai.dev',
  'Seed Inspector',
  'inspector',
  '00000000-0000-0000-0000-000000000001'
)
on conflict (id) do nothing;

-- Seed inspection for historical findings
insert into inspections (id, title, address, city, state, zip_code, property_type, status, user_id)
values (
  '00000000-0000-0000-0000-000000000010',
  'Historical Findings Reference',
  '123 Demo Street',
  'San Francisco',
  'CA',
  '94105',
  'single_family',
  'completed',
  '00000000-0000-0000-0000-000000000002'
)
on conflict (id) do nothing;

-- Historical findings (embedding = NULL; backfilled by ML service)
insert into findings (id, inspection_id, title, description, category, severity, location, cost_estimate, cost_min, cost_max, status, is_ai_generated)
values
  -- Structural
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000010',
    'Foundation crack - horizontal',
    'Horizontal crack found in the foundation wall, approximately 12 inches long and 1/4 inch wide. Horizontal cracks indicate lateral pressure from soil and are more serious than vertical cracks.',
    'structural', 'critical', 'Basement north wall', 8500, 5000, 15000, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000010',
    'Foundation crack - vertical hairline',
    'Hairline vertical crack in poured concrete foundation, less than 1/16 inch wide. Common in new construction due to concrete curing. Monitor for widening over time.',
    'structural', 'minor', 'Basement east wall', 350, 200, 600, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000010',
    'Sagging floor joists',
    'Multiple floor joists in the crawl space show visible sagging of 1-2 inches over a 10-foot span. Likely caused by moisture damage and wood rot. Structural engineer evaluation recommended.',
    'structural', 'major', 'Crawl space, center section', 4200, 2500, 7000, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000010',
    'Load-bearing wall modification without permit',
    'Evidence of a removed load-bearing wall in the main floor. No beam or header visible to redistribute load. Ceiling shows deflection above affected area.',
    'structural', 'critical', 'Main floor, living room', 12000, 8000, 20000, 'active', true
  ),
  -- Roofing
  (
    '10000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000010',
    'Missing shingles - wind damage',
    'Approximately 15-20 asphalt shingles missing from the northwest slope of the roof, exposing underlayment. Recent wind storm likely cause. Active leak risk during rain.',
    'roofing', 'major', 'Northwest roof slope', 1800, 900, 3200, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000010',
    'Roof age exceeds useful life',
    'Asphalt shingle roof shows granule loss, curling, and brittleness consistent with 20+ year age. Shingles at end of useful life. Full replacement recommended within 1-2 years.',
    'roofing', 'major', 'Entire roof surface', 9500, 7000, 14000, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000010',
    'Flashing separation at chimney',
    'Metal flashing around chimney base has separated from the masonry, creating a gap that allows water infiltration. Evidence of water staining on interior chimney chase.',
    'roofing', 'major', 'Chimney, south side', 650, 400, 1200, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000010',
    'Gutter detachment',
    'Section of gutter on the rear of the home has pulled away from the fascia board. Fascia shows rot and is no longer holding gutter screws. Water overflows directly against foundation.',
    'exterior', 'minor', 'Rear of home, east side', 450, 300, 800, 'active', true
  ),
  -- Electrical
  (
    '10000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000010',
    'Double-tapped breaker',
    'Multiple circuit breakers in the main panel have two wires connected to a single terminal (double-tapped). This is a fire hazard unless the breaker is rated for two conductors.',
    'electrical', 'major', 'Main electrical panel, basement', 300, 200, 500, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000010',
    'Aluminum wiring - pre-1972',
    'Home has original aluminum branch circuit wiring. Aluminum wiring requires anti-oxidant compound at all connections and CO/ALR rated devices to reduce fire risk.',
    'electrical', 'critical', 'Throughout home', 6500, 4000, 10000, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000010',
    'GFCI protection absent near water',
    'Kitchen countertop outlets within 6 feet of the sink lack GFCI protection as required by current code. Bathroom outlets also not GFCI protected.',
    'electrical', 'major', 'Kitchen and bathrooms', 350, 200, 600, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000010',
    'Exposed wiring in basement',
    'Romex cable in basement runs along wall without conduit or protection. Cable shows signs of rodent chewing near the west corner. Potential shock and fire hazard.',
    'electrical', 'major', 'Basement, west corner', 250, 150, 400, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000013',
    '00000000-0000-0000-0000-000000000010',
    'Panel capacity at maximum',
    'Main electrical panel is fully loaded at 200A with no spare breaker slots. No capacity for future EV charger, HVAC upgrades, or additions without panel replacement.',
    'electrical', 'minor', 'Main electrical panel', 2500, 1800, 4000, 'active', true
  ),
  -- Plumbing
  (
    '10000000-0000-0000-0000-000000000014',
    '00000000-0000-0000-0000-000000000010',
    'Galvanized steel pipe corrosion',
    'Original galvanized steel supply pipes show significant interior corrosion, reducing water pressure throughout the home. Rust-colored water reported by sellers. Replacement with copper or PEX recommended.',
    'plumbing', 'major', 'Throughout home, supply lines', 5500, 3500, 9000, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000015',
    '00000000-0000-0000-0000-000000000010',
    'Slow drain - main sewer line',
    'All fixtures drain slowly and gurgling observed when toilet is flushed. Indicates partial blockage or root intrusion in main sewer line. Camera inspection recommended.',
    'plumbing', 'major', 'Main sewer line', 1200, 600, 3500, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000016',
    '00000000-0000-0000-0000-000000000010',
    'Water heater past service life',
    'Gas water heater is 14 years old, exceeding typical 8-12 year service life. Anode rod likely depleted. Sediment buildup audible when heating. Replacement recommended.',
    'plumbing', 'minor', 'Utility room', 1400, 900, 2200, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000017',
    '00000000-0000-0000-0000-000000000010',
    'Polybutylene supply pipes',
    'Home contains original polybutylene (grey plastic) water supply pipes, installed circa 1980s. These pipes are known to fail without warning. Insurance companies may refuse coverage.',
    'plumbing', 'critical', 'Throughout home, supply lines', 7500, 5000, 12000, 'active', true
  ),
  -- HVAC
  (
    '10000000-0000-0000-0000-000000000018',
    '00000000-0000-0000-0000-000000000010',
    'HVAC unit at end of service life',
    'Central air conditioning unit is 18 years old. SEER rating is approximately 8, well below current minimum of 14. Unit runs longer than normal to reach setpoint. Replacement recommended.',
    'hvac', 'major', 'Exterior, south side', 6500, 4500, 9000, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000019',
    '00000000-0000-0000-0000-000000000010',
    'Furnace heat exchanger crack',
    'Visible crack in the furnace heat exchanger. This is a serious safety defect that can allow combustion gases including carbon monoxide to enter the living space. Immediate replacement required.',
    'hvac', 'critical', 'Basement utility room', 3200, 2200, 5500, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000020',
    '00000000-0000-0000-0000-000000000010',
    'Ductwork disconnected in crawl space',
    'Supply duct in crawl space has separated from trunk line. Conditioned air is being blown directly into crawl space rather than living areas. Energy waste and potential moisture issue.',
    'hvac', 'major', 'Crawl space, center section', 400, 250, 700, 'active', true
  ),
  -- Water damage / interior
  (
    '10000000-0000-0000-0000-000000000021',
    '00000000-0000-0000-0000-000000000010',
    'Active roof leak - water staining',
    'Water staining and soft drywall on master bedroom ceiling consistent with active roof leak above. Stain approximately 2x3 feet. Mold growth observed at perimeter of stain.',
    'interior', 'major', 'Master bedroom, ceiling', 2800, 1500, 5000, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000022',
    '00000000-0000-0000-0000-000000000010',
    'Mold growth in basement',
    'Black mold visible on basement wall framing and drywall, approximately 40 square feet. Musty odor throughout basement. Moisture source appears to be foundation wall seepage.',
    'structural', 'critical', 'Basement, north wall', 4500, 2500, 9000, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000023',
    '00000000-0000-0000-0000-000000000010',
    'Bathroom exhaust fan not vented to exterior',
    'Second floor bathroom exhaust fan duct terminates in attic space rather than exterior. Moisture-laden air is deposited in attic, causing condensation, wood rot, and mold risk.',
    'interior', 'minor', 'Second floor bathroom, attic above', 350, 200, 600, 'active', true
  ),
  -- Safety
  (
    '10000000-0000-0000-0000-000000000024',
    '00000000-0000-0000-0000-000000000010',
    'Smoke detectors absent or non-functional',
    'No smoke detectors found in bedrooms or at top of stairway. Existing detectors in hallway are original to home (20+ years) and do not respond to test. Replacement required immediately.',
    'safety', 'critical', 'Throughout home', 180, 100, 350, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000025',
    '00000000-0000-0000-0000-000000000010',
    'Carbon monoxide detector absent',
    'No carbon monoxide detectors present in home despite having a gas furnace and attached garage. CO detectors required within 15 feet of sleeping areas per most state codes.',
    'safety', 'critical', 'Throughout home', 120, 60, 250, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000026',
    '00000000-0000-0000-0000-000000000010',
    'Deck railing below code height',
    'Rear deck railing is 32 inches high. Code requires 36 inches for decks less than 30 inches off grade and 42 inches for decks 30+ inches high. Deck is 48 inches off grade.',
    'safety', 'major', 'Rear deck', 900, 600, 1500, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000027',
    '00000000-0000-0000-0000-000000000010',
    'Handrail missing on stairway',
    'Interior stairway from main floor to second floor lacks a continuous handrail on one side. Fall hazard, especially for elderly occupants. Code requires graspable handrail on all stairs with 4+ risers.',
    'safety', 'minor', 'Main stairway', 250, 150, 450, 'active', true
  ),
  -- Exterior
  (
    '10000000-0000-0000-0000-000000000028',
    '00000000-0000-0000-0000-000000000010',
    'Wood rot - window sills and frames',
    'Multiple exterior window sills and frames on the south and west elevations show soft, deteriorated wood. Paint has failed allowing moisture intrusion. Rot extends into rough framing on two windows.',
    'exterior', 'major', 'South and west elevations', 3200, 1800, 6000, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000029',
    '00000000-0000-0000-0000-000000000010',
    'Grading slopes toward foundation',
    'Soil grading on the north side of the home slopes toward the foundation rather than away from it. Water pooling observed against foundation wall. Contributes to basement moisture issues.',
    'exterior', 'major', 'North side of home', 800, 500, 1500, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000030',
    '00000000-0000-0000-0000-000000000010',
    'Efflorescence on brick exterior',
    'White mineral deposits (efflorescence) on lower courses of brick on front elevation. Indicates moisture moving through brick. Tuckpointing needed to prevent further water intrusion.',
    'exterior', 'minor', 'Front elevation, lower 3 feet', 1200, 700, 2500, 'active', true
  ),
  -- Cosmetic
  (
    '10000000-0000-0000-0000-000000000031',
    '00000000-0000-0000-0000-000000000010',
    'Interior paint - peeling and chipping',
    'Peeling and chipping paint throughout several rooms. No structural significance. Cosmetic update recommended prior to listing or occupancy.',
    'interior', 'cosmetic', 'Multiple rooms', 2500, 1500, 4000, 'active', true
  ),
  (
    '10000000-0000-0000-0000-000000000032',
    '00000000-0000-0000-0000-000000000010',
    'Carpet staining and wear',
    'Significant staining and wear on carpet in living areas and hallway. Pad appears compressed. Replacement recommended.',
    'interior', 'cosmetic', 'Living room, hallway', 3800, 2500, 6000, 'active', true
  )
on conflict (id) do nothing;
