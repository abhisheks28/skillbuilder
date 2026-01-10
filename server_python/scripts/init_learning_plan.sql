CREATE TABLE IF NOT EXISTS learning_plan_progress (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    child_id VARCHAR(255) NOT NULL,
    day_number INTEGER NOT NULL,
    category VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'unlocked', -- 'locked', 'unlocked', 'completed'
    assessment_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, child_id, day_number, category)
);
