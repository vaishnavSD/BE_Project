-- Migration to update factory approval system to use 'collected' status instead of 'approved'/'rejected'

-- Add collected_at column if it doesn't exist
ALTER TABLE scrapCollection 
ADD COLUMN IF NOT EXISTS collected_at TIMESTAMP NULL DEFAULT NULL;

-- Update existing 'approved' status to 'collected' (if any exist)
UPDATE scrapCollection 
SET approval_status = 'collected', collected_at = approved_at 
WHERE approval_status = 'approved';

-- Remove rejected collections or set them to pending (depending on business logic)
-- For now, we'll set rejected collections back to pending
UPDATE scrapCollection 
SET approval_status = 'pending', factory_employee_id = NULL, factory_notes = NULL 
WHERE approval_status = 'rejected';

-- Remove the approved_at and rejected_at columns as we only need collected_at
-- Note: Be careful with this in production - you might want to keep these for historical data
-- ALTER TABLE scrapCollection DROP COLUMN IF EXISTS approved_at;
-- ALTER TABLE scrapCollection DROP COLUMN IF EXISTS rejected_at;