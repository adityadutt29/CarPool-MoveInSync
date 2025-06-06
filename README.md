# Carpool Solution (MoveInSync Case Study)

**Demo Video:** https://drive.google.com/file/d/13YDKECdNEe0fH4fEGGdNJx1LkGzssPjr/view?usp=sharing

## Overview

This project is a comprehensive carpooling solution for the case study based on Car Pooling System solution. It connects drivers and riders within an organization, offering features for ride creation, search, management, and real-time updates. The solution is built with a modern MERN stack (MongoDB, Express.js, React, Node.js) and emphasizes robust authentication, efficient ride matching, and a user-friendly interface.

## Features

### General
- **User Authentication**: Secure login and registration system with JWT authentication.
- **Role-Based Access**: Separate dashboards and features for drivers and riders.
- **Real-time Updates**: Regular polling for ride status updates.
- **Profile Management**: User profile customization options.

### Frontend Specific
- **Ride Management**: Create, search, and manage rides.
- **Interactive Maps**: Location selection using Leaflet maps.
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS.

### Backend Specific
- **RidePool Management**: Creation, search, request, and approval flows for carpool rides.
- **Email Notifications**: Automated email notifications for ride requests and approvals.
- **SOS Endpoint**: Functionality to alert driver/rider in case of emergency.
- **Caching**: In-memory caching of search results for improved performance.
- **Monitoring**: Prometheus metrics for HTTP request duration and a `/metrics` endpoint.
- **Global Error Handling**: Robust error and exception handling for consistent responses.

## Tech Stack

### Frontend
- **React**: Frontend library for building user interfaces.
- **React Router**: For navigation and routing.
- **Axios**: HTTP client for API requests.
- **Leaflet/React-Leaflet**: Interactive maps.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **JWT**: Token-based authentication.

### Backend
- **Node.js/Express.js**: Backend runtime and web framework.
- **MongoDB/Mongoose**: NoSQL database and ODM for data persistence.
- **JWT**: Token-based authentication (`jsonwebtoken`).
- **Bcrypt.js**: For password hashing.
- **Nodemailer**: For email notifications.
- **Node-Cache**: For in-memory caching.
- **Prom-Client**: For Prometheus metrics collection.

## Project Structure

```
.env                  # Environment variables for the entire project
README.md             # This project-level README
backend/              # Backend application directory
├── .env              # Backend specific environment variables
├── README.md         # Backend specific README
├── config/           # Database configuration
├── middleware/       # Express middleware (auth, error handling, logging)
├── models/           # Mongoose schemas and models
├── routes/           # API routes
├── services/         # Business logic services (email, caching, matching)
├── utils/            # Utility functions
└── server.js         # Main backend application entry point
frontend/             # Frontend application directory
├── .env              # Frontend specific environment variables
├── README.md         # Frontend specific README
├── public/           # Public assets
├── src/              # React source code
│   ├── components/   # UI components
│   ├── context/      # React context providers
│   ├── services/     # API and other services
│   ├── utils/        # Utility functions
│   ├── App.js        # Main application component
│   └── index.js      # Application entry point
└── tailwind.config.js # Tailwind CSS configuration
```

## Getting Started

To get the Carpool Solution running locally, follow these steps:

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- MongoDB (running locally or accessible via a connection string)

### 1. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  Create a `.env` file in the `backend` directory with the following content. Replace placeholders with your actual values:
    ```
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/moveinsync
    JWT_SECRET=MoveInSyncSecretKey
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=465
    SMTP_USER=yourmail@gmail.com
    SMTP_PASS=you_app_password
    FROM_EMAIL="MoveInSync" <yourmail@gmail.com>
    ```
    Ensure MongoDB is running locally (`mongod --dbpath <your_db_path>`) or update `MONGODB_URI` accordingly.
4.  Start the backend server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The API will be available at `http://localhost:5000/api`.
    - Health check: `http://localhost:5000/health`
    - Metrics: `http://localhost:5000/metrics`

### 2. Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  Create a `.env` file in the `frontend` directory with the following content:
    ```
    REACT_APP_API_URL=http://localhost:5000/api
    ```
    Adjust the URL if your backend is running on a different port or host.
4.  Start the frontend development server:
    ```bash
    npm start
    # or
    yarn start
    ```
5.  Open your browser and navigate to `http://localhost:3000`.
