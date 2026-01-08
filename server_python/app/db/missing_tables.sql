-- Tutor Bookings
CREATE TABLE IF NOT EXISTS tutor_bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE, -- The student/parent requesting
    tutor_id INTEGER REFERENCES teachers(teacher_id) ON DELETE SET NULL, -- Assigned tutor
    subject VARCHAR(100),
    topic VARCHAR(255),
    preferred_time TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lottery Winners
CREATE TABLE IF NOT EXISTS lottery_winners (
    winner_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    round_name VARCHAR(100), -- e.g., 'Round 1', 'Grand Prize'
    prize_details VARCHAR(255),
    won_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security Violations (Proctoring)
CREATE TABLE IF NOT EXISTS security_violations (
    violation_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    child_id VARCHAR(100), -- Flexible ID if it doesn't strictly match a student record
    test_type VARCHAR(50), -- 'assessment', 'speed_test', 'neet'
    violation_type VARCHAR(50), -- 'tab-switch', 'fullscreen-exit'
    details JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
