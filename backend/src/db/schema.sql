CREATE DATABASE IF NOT EXISTS ComplaintManagementDB;
USE ComplaintManagementDB;

CREATE TABLE `Users` (
    user_id VARCHAR(255) PRIMARY KEY,  -- Firebase UID
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('Admin', 'Manager', 'Staff', 'Customer') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for searching user by email
CREATE INDEX idx_users_email ON `Users`(email);

CREATE TABLE `Complaints` (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255), -- References Users(user_id)
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('Pending', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Pending',
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    assigned_staff VARCHAR(255), -- References Users(user_id) if assigned
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES `Users`(user_id),
    FOREIGN KEY (assigned_staff) REFERENCES `Users`(user_id) ON DELETE SET NULL
);

-- Index for searching complaints by status and priority
CREATE INDEX idx_complaints_status ON `Complaints`(status);
CREATE INDEX idx_complaints_priority ON `Complaints`(priority);

CREATE TABLE `Complaint_Updates` (
    update_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT,
    updated_by VARCHAR(255), -- References Users(user_id) updated by staff
    status ENUM('Pending', 'In Progress', 'Resolved', 'Closed') NOT NULL,
    comment TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES `Complaints`(complaint_id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES `Users`(user_id)
);

-- Index for searching complaints update history by complaint_id
CREATE INDEX idx_complaint_updates_complaint ON `Complaint_Updates`(complaint_id);

CREATE TABLE `Attachments` (
    attachment_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL, -- Firebase Storage URL
    file_type VARCHAR(100),
    file_size INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES `Complaints`(complaint_id) ON DELETE CASCADE
);

-- Index for searching attachments by complaint_id
CREATE INDEX idx_attachments_complaint ON `Attachments`(complaint_id);

CREATE TABLE `Feedback` (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT UNIQUE, -- one complaint have one feedback
    rating INT CHECK (rating BETWEEN 1 AND 5), -- 1 to 5 scale
    comments TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES `Complaints`(complaint_id) ON DELETE CASCADE
);

-- Index for searching feedback by complaint_id
CREATE INDEX idx_feedback_complaint ON `Feedback`(complaint_id);