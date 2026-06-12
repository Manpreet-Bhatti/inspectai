-- Seed data for InspectAI similarity search feature.
--
-- Attaches historical findings to the first existing user in the database.
-- Run after creating your account via the app, then:
--   supabase db reset              (local — resets + seeds)
--   OR
--   psql $DB_URL -f supabase/seed.sql
--
-- Embeddings are NULL on insert. Backfill after startup:
--   curl -X POST http://localhost:8000/embeddings/backfill

do $$
declare
  v_user_id uuid;
  v_inspection_id uuid := '00000000-0000-0000-0000-000000000010';
begin
  -- Pick the first real user
  select id into v_user_id from profiles order by created_at limit 1;

  if v_user_id is null then
    raise notice 'No users found — skipping seed. Create an account via the app, then run: supabase db query --linked --file supabase/seed.sql';
    return;
  end if;

  -- Seed inspection for historical findings
  insert into inspections (id, title, address, city, state, zip_code, property_type, status, user_id)
  values (
    v_inspection_id,
    'Historical Findings Reference',
    '123 Demo Street',
    'San Francisco',
    'CA',
    '94105',
    'single_family',
    'completed',
    v_user_id
  )
  on conflict (id) do nothing;

  -- Historical findings (embedding = NULL; backfilled by ML service)
  insert into findings (id, inspection_id, title, description, category, severity, location, cost_estimate, cost_min, cost_max, status, is_ai_generated)
  values
    -- Structural
    (
      '10000000-0000-0000-0000-000000000001', v_inspection_id,
      'Foundation crack - horizontal',
      'Horizontal crack found in the foundation wall, approximately 12 inches long and 1/4 inch wide. Horizontal cracks indicate lateral pressure from soil and are more serious than vertical cracks.',
      'structural', 'critical', 'Basement north wall', 8500, 5000, 15000, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000002', v_inspection_id,
      'Foundation crack - vertical hairline',
      'Hairline vertical crack in poured concrete foundation, less than 1/16 inch wide. Common in new construction due to concrete curing. Monitor for widening over time.',
      'structural', 'minor', 'Basement east wall', 350, 200, 600, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000003', v_inspection_id,
      'Sagging floor joists',
      'Multiple floor joists in the crawl space show visible sagging of 1-2 inches over a 10-foot span. Likely caused by moisture damage and wood rot. Structural engineer evaluation recommended.',
      'structural', 'major', 'Crawl space, center section', 4200, 2500, 7000, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000004', v_inspection_id,
      'Load-bearing wall modification without permit',
      'Evidence of a removed load-bearing wall in the main floor. No beam or header visible to redistribute load. Ceiling shows deflection above affected area.',
      'structural', 'critical', 'Main floor, living room', 12000, 8000, 20000, 'active', true
    ),
    -- Roofing
    (
      '10000000-0000-0000-0000-000000000005', v_inspection_id,
      'Missing shingles - wind damage',
      'Approximately 15-20 asphalt shingles missing from the northwest slope of the roof, exposing underlayment. Recent wind storm likely cause. Active leak risk during rain.',
      'roofing', 'major', 'Northwest roof slope', 1800, 900, 3200, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000006', v_inspection_id,
      'Roof age exceeds useful life',
      'Asphalt shingle roof shows granule loss, curling, and brittleness consistent with 20+ year age. Shingles at end of useful life. Full replacement recommended within 1-2 years.',
      'roofing', 'major', 'Entire roof surface', 9500, 7000, 14000, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000007', v_inspection_id,
      'Flashing separation at chimney',
      'Metal flashing around chimney base has separated from the masonry, creating a gap that allows water infiltration. Evidence of water staining on interior chimney chase.',
      'roofing', 'major', 'Chimney, south side', 650, 400, 1200, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000008', v_inspection_id,
      'Gutter detachment',
      'Section of gutter on the rear of the home has pulled away from the fascia board. Fascia shows rot and is no longer holding gutter screws. Water overflows directly against foundation.',
      'exterior', 'minor', 'Rear of home, east side', 450, 300, 800, 'active', true
    ),
    -- Electrical
    (
      '10000000-0000-0000-0000-000000000009', v_inspection_id,
      'Double-tapped breaker',
      'Multiple circuit breakers in the main panel have two wires connected to a single terminal (double-tapped). This is a fire hazard unless the breaker is rated for two conductors.',
      'electrical', 'major', 'Main electrical panel, basement', 300, 200, 500, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000010', v_inspection_id,
      'Aluminum wiring - pre-1972',
      'Home has original aluminum branch circuit wiring. Aluminum wiring requires anti-oxidant compound at all connections and CO/ALR rated devices to reduce fire risk.',
      'electrical', 'critical', 'Throughout home', 6500, 4000, 10000, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000011', v_inspection_id,
      'GFCI protection absent near water',
      'Kitchen countertop outlets within 6 feet of the sink lack GFCI protection as required by current code. Bathroom outlets also not GFCI protected.',
      'electrical', 'major', 'Kitchen and bathrooms', 350, 200, 600, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000012', v_inspection_id,
      'Exposed wiring in basement',
      'Romex cable in basement runs along wall without conduit or protection. Cable shows signs of rodent chewing near the west corner. Potential shock and fire hazard.',
      'electrical', 'major', 'Basement, west corner', 250, 150, 400, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000013', v_inspection_id,
      'Panel capacity at maximum',
      'Main electrical panel is fully loaded at 200A with no spare breaker slots. No capacity for future EV charger, HVAC upgrades, or additions without panel replacement.',
      'electrical', 'minor', 'Main electrical panel', 2500, 1800, 4000, 'active', true
    ),
    -- Plumbing
    (
      '10000000-0000-0000-0000-000000000014', v_inspection_id,
      'Galvanized steel pipe corrosion',
      'Original galvanized steel supply pipes show significant interior corrosion, reducing water pressure throughout the home. Rust-colored water reported by sellers. Replacement with copper or PEX recommended.',
      'plumbing', 'major', 'Throughout home, supply lines', 5500, 3500, 9000, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000015', v_inspection_id,
      'Slow drain - main sewer line',
      'All fixtures drain slowly and gurgling observed when toilet is flushed. Indicates partial blockage or root intrusion in main sewer line. Camera inspection recommended.',
      'plumbing', 'major', 'Main sewer line', 1200, 600, 3500, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000016', v_inspection_id,
      'Water heater past service life',
      'Gas water heater is 14 years old, exceeding typical 8-12 year service life. Anode rod likely depleted. Sediment buildup audible when heating. Replacement recommended.',
      'plumbing', 'minor', 'Utility room', 1400, 900, 2200, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000017', v_inspection_id,
      'Polybutylene supply pipes',
      'Home contains original polybutylene (grey plastic) water supply pipes, installed circa 1980s. These pipes are known to fail without warning. Insurance companies may refuse coverage.',
      'plumbing', 'critical', 'Throughout home, supply lines', 7500, 5000, 12000, 'active', true
    ),
    -- HVAC
    (
      '10000000-0000-0000-0000-000000000018', v_inspection_id,
      'HVAC unit at end of service life',
      'Central air conditioning unit is 18 years old. SEER rating is approximately 8, well below current minimum of 14. Unit runs longer than normal to reach setpoint. Replacement recommended.',
      'hvac', 'major', 'Exterior, south side', 6500, 4500, 9000, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000019', v_inspection_id,
      'Furnace heat exchanger crack',
      'Visible crack in the furnace heat exchanger. This is a serious safety defect that can allow combustion gases including carbon monoxide to enter the living space. Immediate replacement required.',
      'hvac', 'critical', 'Basement utility room', 3200, 2200, 5500, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000020', v_inspection_id,
      'Ductwork disconnected in crawl space',
      'Supply duct in crawl space has separated from trunk line. Conditioned air is being blown directly into crawl space rather than living areas. Energy waste and potential moisture issue.',
      'hvac', 'major', 'Crawl space, center section', 400, 250, 700, 'active', true
    ),
    -- Water damage / interior
    (
      '10000000-0000-0000-0000-000000000021', v_inspection_id,
      'Active roof leak - water staining',
      'Water staining and soft drywall on master bedroom ceiling consistent with active roof leak above. Stain approximately 2x3 feet. Mold growth observed at perimeter of stain.',
      'interior', 'major', 'Master bedroom, ceiling', 2800, 1500, 5000, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000022', v_inspection_id,
      'Mold growth in basement',
      'Black mold visible on basement wall framing and drywall, approximately 40 square feet. Musty odor throughout basement. Moisture source appears to be foundation wall seepage.',
      'structural', 'critical', 'Basement, north wall', 4500, 2500, 9000, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000023', v_inspection_id,
      'Bathroom exhaust fan not vented to exterior',
      'Second floor bathroom exhaust fan duct terminates in attic space rather than exterior. Moisture-laden air is deposited in attic, causing condensation, wood rot, and mold risk.',
      'interior', 'minor', 'Second floor bathroom, attic above', 350, 200, 600, 'active', true
    ),
    -- Safety
    (
      '10000000-0000-0000-0000-000000000024', v_inspection_id,
      'Smoke detectors absent or non-functional',
      'No smoke detectors found in bedrooms or at top of stairway. Existing detectors in hallway are original to home (20+ years) and do not respond to test. Replacement required immediately.',
      'safety', 'critical', 'Throughout home', 180, 100, 350, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000025', v_inspection_id,
      'Carbon monoxide detector absent',
      'No carbon monoxide detectors present in home despite having a gas furnace and attached garage. CO detectors required within 15 feet of sleeping areas per most state codes.',
      'safety', 'critical', 'Throughout home', 120, 60, 250, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000026', v_inspection_id,
      'Deck railing below code height',
      'Rear deck railing is 32 inches high. Code requires 36 inches for decks less than 30 inches off grade and 42 inches for decks 30+ inches high. Deck is 48 inches off grade.',
      'safety', 'major', 'Rear deck', 900, 600, 1500, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000027', v_inspection_id,
      'Handrail missing on stairway',
      'Interior stairway from main floor to second floor lacks a continuous handrail on one side. Fall hazard, especially for elderly occupants. Code requires graspable handrail on all stairs with 4+ risers.',
      'safety', 'minor', 'Main stairway', 250, 150, 450, 'active', true
    ),
    -- Exterior
    (
      '10000000-0000-0000-0000-000000000028', v_inspection_id,
      'Wood rot - window sills and frames',
      'Multiple exterior window sills and frames on the south and west elevations show soft, deteriorated wood. Paint has failed allowing moisture intrusion. Rot extends into rough framing on two windows.',
      'exterior', 'major', 'South and west elevations', 3200, 1800, 6000, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000029', v_inspection_id,
      'Grading slopes toward foundation',
      'Soil grading on the north side of the home slopes toward the foundation rather than away from it. Water pooling observed against foundation wall. Contributes to basement moisture issues.',
      'exterior', 'major', 'North side of home', 800, 500, 1500, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000030', v_inspection_id,
      'Efflorescence on brick exterior',
      'White mineral deposits (efflorescence) on lower courses of brick on front elevation. Indicates moisture moving through brick. Tuckpointing needed to prevent further water intrusion.',
      'exterior', 'minor', 'Front elevation, lower 3 feet', 1200, 700, 2500, 'active', true
    ),
    -- Cosmetic
    (
      '10000000-0000-0000-0000-000000000031', v_inspection_id,
      'Interior paint - peeling and chipping',
      'Peeling and chipping paint throughout several rooms. No structural significance. Cosmetic update recommended prior to listing or occupancy.',
      'interior', 'cosmetic', 'Multiple rooms', 2500, 1500, 4000, 'active', true
    ),
    (
      '10000000-0000-0000-0000-000000000032', v_inspection_id,
      'Carpet staining and wear',
      'Significant staining and wear on carpet in living areas and hallway. Pad appears compressed. Replacement recommended.',
      'interior', 'cosmetic', 'Living room, hallway', 3800, 2500, 6000, 'active', true
    )
  on conflict (id) do nothing;

  raise notice 'Seeded 32 historical findings for user %', v_user_id;
end $$;
