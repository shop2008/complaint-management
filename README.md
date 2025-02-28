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

3. Create a `.env` file:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=ComplaintManagementDB
FIREBASE_API_KEY=your_firebase_api_key
```

4. Set up Firebase:
   - Create a Firebase project
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

3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Start the frontend development server:
```bash
npm run dev
```