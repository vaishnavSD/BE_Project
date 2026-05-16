-- Add call agent related columns to userRequest table
ALTER TABLE userRequest 
ADD COLUMN IF NOT EXISTS call_agent_id INT NULL,
ADD COLUMN IF NOT EXISTS call_agent_notes TEXT NULL,
ADD COLUMN IF NOT EXISTS call_approved_at DATETIME NULL,
ADD COLUMN IF NOT EXISTS accepted_agent_id INT NULL,
ADD COLUMN IF NOT EXISTS agent_accepted_at DATETIME NULL;

-- Add foreign key constraints
ALTER TABLE userRequest 
ADD CONSTRAINT fk_call_agent 
FOREIGN KEY (call_agent_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE userRequest 
ADD CONSTRAINT fk_accepted_agent 
FOREIGN KEY (accepted_agent_id) REFERENCES users(id) ON DELETE SET NULL;
