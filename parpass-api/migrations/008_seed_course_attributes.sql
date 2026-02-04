-- Migration: Seed course attributes data
-- Run: psql -d parpass -f migrations/008_seed_course_attributes.sql

-- TPC Sawgrass - Stadium Course (Famous, challenging)
UPDATE golf_courses SET
  difficulty = 'expert',
  course_type = 'resort',
  price_range = 'luxury',
  course_rating = 76.4,
  slope_rating = 155,
  par = 72,
  yardage = 7215,
  pace_of_play_mins = 270,
  walking_friendly = false,
  has_driving_range = true,
  has_practice_green = true,
  has_restaurant = true,
  has_pro_shop = true,
  cart_included = true
WHERE name LIKE '%TPC Sawgrass - Stadium%';

-- TPC Sawgrass - Dyes Valley (Challenging but more forgiving)
UPDATE golf_courses SET
  difficulty = 'challenging',
  course_type = 'resort',
  price_range = 'premium',
  course_rating = 73.8,
  slope_rating = 135,
  par = 72,
  yardage = 6864,
  pace_of_play_mins = 255,
  walking_friendly = false,
  has_driving_range = true,
  has_practice_green = true,
  has_restaurant = true,
  has_pro_shop = true,
  cart_included = true
WHERE name LIKE '%Dyes Valley%';

-- Queens Harbour (Semi-private, moderate)
UPDATE golf_courses SET
  difficulty = 'moderate',
  course_type = 'semi-private',
  price_range = 'premium',
  course_rating = 72.1,
  slope_rating = 130,
  par = 72,
  yardage = 6700,
  pace_of_play_mins = 250,
  walking_friendly = true,
  has_driving_range = true,
  has_practice_green = true,
  has_restaurant = true,
  has_pro_shop = true,
  cart_included = false
WHERE name LIKE '%Queens Harbour%';

-- Timuquana Country Club (Private style, challenging)
UPDATE golf_courses SET
  difficulty = 'challenging',
  course_type = 'semi-private',
  price_range = 'premium',
  course_rating = 73.5,
  slope_rating = 138,
  par = 72,
  yardage = 6850,
  pace_of_play_mins = 255,
  walking_friendly = true,
  has_driving_range = true,
  has_practice_green = true,
  has_restaurant = true,
  has_pro_shop = true,
  cart_included = false
WHERE name LIKE '%Timuquana%';

-- Windsor Parke (Public, beginner friendly)
UPDATE golf_courses SET
  difficulty = 'easy',
  course_type = 'public',
  price_range = 'moderate',
  course_rating = 69.8,
  slope_rating = 118,
  par = 72,
  yardage = 6200,
  pace_of_play_mins = 240,
  walking_friendly = true,
  has_driving_range = true,
  has_practice_green = true,
  has_restaurant = false,
  has_pro_shop = true,
  cart_included = false
WHERE name LIKE '%Windsor Parke%';

-- Jacksonville Beach Golf Club (Public, easy)
UPDATE golf_courses SET
  difficulty = 'easy',
  course_type = 'public',
  price_range = 'budget',
  course_rating = 68.5,
  slope_rating = 112,
  par = 72,
  yardage = 5900,
  pace_of_play_mins = 230,
  walking_friendly = true,
  has_driving_range = true,
  has_practice_green = true,
  has_restaurant = false,
  has_pro_shop = true,
  cart_included = false
WHERE name LIKE '%Jacksonville Beach Golf%';

-- Blue Sky Golf Club (Public, moderate)
UPDATE golf_courses SET
  difficulty = 'moderate',
  course_type = 'public',
  price_range = 'moderate',
  course_rating = 71.2,
  slope_rating = 125,
  par = 72,
  yardage = 6450,
  pace_of_play_mins = 245,
  walking_friendly = true,
  has_driving_range = true,
  has_practice_green = true,
  has_restaurant = true,
  has_pro_shop = true,
  cart_included = false
WHERE name LIKE '%Blue Sky%';

-- Hidden Hills (Public, easy/moderate)
UPDATE golf_courses SET
  difficulty = 'easy',
  course_type = 'public',
  price_range = 'budget',
  course_rating = 69.0,
  slope_rating = 115,
  par = 72,
  yardage = 6100,
  pace_of_play_mins = 235,
  walking_friendly = true,
  has_driving_range = false,
  has_practice_green = true,
  has_restaurant = false,
  has_pro_shop = true,
  cart_included = false
WHERE name LIKE '%Hidden Hills%';

-- Bent Creek (Public, moderate)
UPDATE golf_courses SET
  difficulty = 'moderate',
  course_type = 'public',
  price_range = 'moderate',
  course_rating = 70.5,
  slope_rating = 122,
  par = 72,
  yardage = 6350,
  pace_of_play_mins = 240,
  walking_friendly = true,
  has_driving_range = true,
  has_practice_green = true,
  has_restaurant = false,
  has_pro_shop = true,
  cart_included = false
WHERE name LIKE '%Bent Creek%';

-- World Golf Village - Slammer & Squire (Resort, moderate)
UPDATE golf_courses SET
  difficulty = 'moderate',
  course_type = 'resort',
  price_range = 'premium',
  course_rating = 72.8,
  slope_rating = 132,
  par = 72,
  yardage = 6800,
  pace_of_play_mins = 255,
  walking_friendly = false,
  has_driving_range = true,
  has_practice_green = true,
  has_restaurant = true,
  has_pro_shop = true,
  cart_included = true
WHERE name LIKE '%Slammer & Squire%';

-- World Golf Village - King & Bear (Resort, challenging)
UPDATE golf_courses SET
  difficulty = 'challenging',
  course_type = 'resort',
  price_range = 'premium',
  course_rating = 74.2,
  slope_rating = 141,
  par = 72,
  yardage = 7100,
  pace_of_play_mins = 260,
  walking_friendly = false,
  has_driving_range = true,
  has_practice_green = true,
  has_restaurant = true,
  has_pro_shop = true,
  cart_included = true
WHERE name LIKE '%King & Bear%';

-- Royal St. Augustine (Semi-private, moderate)
UPDATE golf_courses SET
  difficulty = 'moderate',
  course_type = 'semi-private',
  price_range = 'moderate',
  course_rating = 71.5,
  slope_rating = 128,
  par = 72,
  yardage = 6500,
  pace_of_play_mins = 245,
  walking_friendly = true,
  has_driving_range = true,
  has_practice_green = true,
  has_restaurant = true,
  has_pro_shop = true,
  cart_included = false
WHERE name LIKE '%Royal St. Augustine%';

-- St. Johns Golf & Country Club (Semi-private, moderate)
UPDATE golf_courses SET
  difficulty = 'moderate',
  course_type = 'semi-private',
  price_range = 'moderate',
  course_rating = 71.0,
  slope_rating = 126,
  par = 72,
  yardage = 6400,
  pace_of_play_mins = 245,
  walking_friendly = true,
  has_driving_range = true,
  has_practice_green = true,
  has_restaurant = true,
  has_pro_shop = true,
  cart_included = false
WHERE name LIKE '%St. Johns Golf%';

-- Golf Club at South Hampton (Semi-private, moderate)
UPDATE golf_courses SET
  difficulty = 'moderate',
  course_type = 'semi-private',
  price_range = 'moderate',
  course_rating = 70.8,
  slope_rating = 124,
  par = 72,
  yardage = 6350,
  pace_of_play_mins = 240,
  walking_friendly = true,
  has_driving_range = true,
  has_practice_green = true,
  has_restaurant = false,
  has_pro_shop = true,
  cart_included = false
WHERE name LIKE '%South Hampton%';

-- Streamsong Blue (Links, challenging)
UPDATE golf_courses SET
  difficulty = 'challenging',
  course_type = 'links',
  price_range = 'luxury',
  course_rating = 75.1,
  slope_rating = 145,
  par = 72,
  yardage = 7050,
  pace_of_play_mins = 270,
  walking_friendly = true,
  has_driving_range = true,
  has_practice_green = true,
  has_restaurant = true,
  has_pro_shop = true,
  cart_included = false
WHERE name LIKE '%Streamsong Blue%';

-- Streamsong Red (Links, challenging)
UPDATE golf_courses SET
  difficulty = 'challenging',
  course_type = 'links',
  price_range = 'luxury',
  course_rating = 74.8,
  slope_rating = 143,
  par = 72,
  yardage = 7000,
  pace_of_play_mins = 270,
  walking_friendly = true,
  has_driving_range = true,
  has_practice_green = true,
  has_restaurant = true,
  has_pro_shop = true,
  cart_included = false
WHERE name LIKE '%Streamsong Red%';

-- Streamsong Black (Links, expert)
UPDATE golf_courses SET
  difficulty = 'expert',
  course_type = 'links',
  price_range = 'luxury',
  course_rating = 76.0,
  slope_rating = 150,
  par = 73,
  yardage = 7300,
  pace_of_play_mins = 280,
  walking_friendly = true,
  has_driving_range = true,
  has_practice_green = true,
  has_restaurant = true,
  has_pro_shop = true,
  cart_included = false
WHERE name LIKE '%Streamsong Black%';

-- TPC Tampa Bay (Resort, challenging)
UPDATE golf_courses SET
  difficulty = 'challenging',
  course_type = 'resort',
  price_range = 'premium',
  course_rating = 73.6,
  slope_rating = 137,
  par = 71,
  yardage = 6800,
  pace_of_play_mins = 255,
  walking_friendly = false,
  has_driving_range = true,
  has_practice_green = true,
  has_restaurant = true,
  has_pro_shop = true,
  cart_included = true
WHERE name LIKE '%TPC Tampa Bay%';

-- Saddlebrook - Palmer (Resort, moderate)
UPDATE golf_courses SET
  difficulty = 'moderate',
  course_type = 'resort',
  price_range = 'premium',
  course_rating = 72.0,
  slope_rating = 128,
  par = 71,
  yardage = 6500,
  pace_of_play_mins = 250,
  walking_friendly = false,
  has_driving_range = true,
  has_practice_green = true,
  has_restaurant = true,
  has_pro_shop = true,
  cart_included = true
WHERE name LIKE '%Saddlebrook%Palmer%';

-- Saddlebrook - Saddlebrook (Resort, moderate)
UPDATE golf_courses SET
  difficulty = 'moderate',
  course_type = 'resort',
  price_range = 'premium',
  course_rating = 71.5,
  slope_rating = 126,
  par = 70,
  yardage = 6400,
  pace_of_play_mins = 245,
  walking_friendly = false,
  has_driving_range = true,
  has_practice_green = true,
  has_restaurant = true,
  has_pro_shop = true,
  cart_included = true
WHERE name LIKE '%Saddlebrook Resort - Saddlebrook%';

-- Set defaults for any remaining courses without attributes
UPDATE golf_courses SET
  difficulty = 'moderate',
  course_type = 'public',
  price_range = 'moderate',
  course_rating = 70.5,
  slope_rating = 120,
  par = 72,
  yardage = 6300,
  pace_of_play_mins = 240,
  walking_friendly = true,
  has_driving_range = true,
  has_practice_green = true,
  has_restaurant = false,
  has_pro_shop = true,
  cart_included = false
WHERE difficulty IS NULL;
