-- Fix status column length to accommodate longer status values
ALTER TABLE userRequest 
MODIFY COLUMN status VARCHAR(50) NULL;