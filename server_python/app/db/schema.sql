-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    role VARCHAR(50), -- 'student', 'teacher', 'parent', 'guest', 'admin'
    firebase_uid VARCHAR(128) UNIQUE, -- Link to Firebase
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Credentials (Optional/Linked to User)
CREATE TABLE IF NOT EXISTS credentials (
    credential_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255)
);

-- RBAC (Roles and Permissions)
CREATE TABLE IF NOT EXISTS rbac (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE,
    feature_1 BOOLEAN DEFAULT FALSE,
    feature_2 BOOLEAN DEFAULT FALSE,
    permissions JSONB -- Flexible permissions storage
);

-- Parents
CREATE TABLE IF NOT EXISTS parents (
    parent_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    phone_number VARCHAR(20),
    email_id VARCHAR(255),
    profession VARCHAR(100),
    spouse_name VARCHAR(255),
    student_ids JSONB -- Array of Student IDs (referenced logically or via FK lookup)
);

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
    teacher_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    school VARCHAR(255),
    subject VARCHAR(100),
    phone_number VARCHAR(20),
    email_id VARCHAR(255)
);

-- Students
CREATE TABLE IF NOT EXISTS students (
    student_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    grade VARCHAR(20),
    school VARCHAR(255),
    parent_id INTEGER REFERENCES parents(parent_id) ON DELETE SET NULL,
    parent_name VARCHAR(255), -- Denormalized or fetched via parent_id
    phone_number VARCHAR(20),
    email_id VARCHAR(255),
    mentor_id INTEGER REFERENCES teachers(teacher_id) ON DELETE SET NULL
);

-- Mentorship (Relationship)
CREATE TABLE IF NOT EXISTS mentorship (
    mentorship_id SERIAL PRIMARY KEY,
    mentor_id INTEGER REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    mentee_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teaching (Competencies/Profile)
CREATE TABLE IF NOT EXISTS teaching (
    teaching_id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    connector BOOLEAN DEFAULT FALSE,
    grade_1 BOOLEAN DEFAULT FALSE,
    grade_2 BOOLEAN DEFAULT FALSE,
    grade_3 BOOLEAN DEFAULT FALSE,
    grade_4 BOOLEAN DEFAULT FALSE,
    grade_5 BOOLEAN DEFAULT FALSE,
    grade_6 BOOLEAN DEFAULT FALSE,
    grade_7 BOOLEAN DEFAULT FALSE,
    grade_8 BOOLEAN DEFAULT FALSE,
    grade_9 BOOLEAN DEFAULT FALSE,
    grade_10 BOOLEAN DEFAULT FALSE,
    grade_11 BOOLEAN DEFAULT FALSE,
    grade_12 BOOLEAN DEFAULT FALSE,
    sat BOOLEAN DEFAULT FALSE,
    neet BOOLEAN DEFAULT FALSE,
    cet BOOLEAN DEFAULT FALSE,
    jee_mains BOOLEAN DEFAULT FALSE,
    jee_adv BOOLEAN DEFAULT FALSE
);

-- Guests
CREATE TABLE IF NOT EXISTS guests (
    guest_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    phone_number VARCHAR(20),
    email_id VARCHAR(255),
    profession VARCHAR(100)
);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
    report_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    category VARCHAR(50),
    report_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Puzzles
CREATE TABLE IF NOT EXISTS puzzles (
    puzzle_id SERIAL PRIMARY KEY,
    grade INTEGER,
    content JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Puzzle Completions
CREATE TABLE IF NOT EXISTS puzzle_completions (
    completion_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    puzzle_id INTEGER REFERENCES puzzles(puzzle_id) ON DELETE CASCADE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_correct BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, completed_at) -- Simplified unique constraint
);

-- Lottery Registrations
CREATE TABLE IF NOT EXISTS lottery_registrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    ticket_code VARCHAR(50),
    user_type VARCHAR(50),
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NEET Questions
CREATE TABLE IF NOT EXISTS neet_questions (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(50),
    question_content JSONB,
    uploaded_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
