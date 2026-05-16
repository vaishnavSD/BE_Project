-- Add factory approval columns to scrapCollection table
ALTER TABLE scrapCollection 
ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
ADD COLUMN factory_employee_id INT NULL,
ADD COLUMN factory_notes TEXT NULL,
ADD COLUMN approved_at TIMESTAMP NULL,
ADD COLUMN rejected_at TIMESTAMP NULL,
ADD INDEX idx_approval_status (approval_status),
ADD INDEX idx_factory_employee (factory_employee_id);

-- Add foreign key constraint for factory employee
ALTER TABLE scrapCollection 
ADD CONSTRAINT fk_factory_employee 
FOREIGN KEY (factory_employee_id) REFERENCES users(id) ON DELETE SET NULL;

-- Sample factory user (you can modify the credentials)
INSERT INTO users (name, email, mobile_No, address, role, password) 
VALUES ('Factory Manager', 'factory@scrapwale.com', '9876543210', 'Factory Address', 'factory', 'factory123');

-- Update existing collections to have pending status
UPDATE scrapCollection SET approval_status = 'pending' WHERE approval_status IS NULL;