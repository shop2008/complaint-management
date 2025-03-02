# Customer Complaint Management System

A full-stack web application for managing customer complaints with role-based access control.

## Features

- Complete CRUD operations for complaints
- Role-based access control (Admin, Manager, Staff, Customer)
- File attachments support
- Real-time status updates
- Customer feedback system
- Responsive design

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Firebase Authentication
- Axios for API calls

### Backend
- Node.js with Express
- TypeScript
- MySQL database

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- Firebase account
- npm or yarn

## Setup Instructions

### Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE ComplaintManagementDB;
```

2. Run the schema file:
```bash
mysql -u your_username -p ComplaintManagementDB < backend/src/db/schema.sql
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   - Open the `.env` file and update the values with your configuration
   - Make sure to set the correct database credentials and Firebase configuration

4. Set up Firebase:
   - Create a Firebase project
   - Enable Authentication with email/password
   - Set up Firebase Storage for file uploads
   - Download the service account key
   - Save it as `serviceAccountKey.json` in the backend directory

5. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   - Open the `.env` file and update the values with your configuration
   - Make sure to set the correct API URL and Firebase configuration
   - You can get the Firebase configuration values from your Firebase project settings

4. Start the frontend development server:
```bash
npm run dev
```