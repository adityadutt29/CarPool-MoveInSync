# MovelnSync - Carpool Frontend

## Overview

An efficient corporate carpooling solution designed to connect drivers and riders within organizations. This part contains the frontend application built with React and modern web technologies.

## Features

- **User Authentication**: Secure login and registration system with JWT authentication
- **Role-Based Access**: Separate dashboards and features for drivers and riders
- **Ride Management**: Create, search, and manage rides
- **Real-time Updates**: Regular polling for ride status updates
- **Interactive Maps**: Location selection using Leaflet maps
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS
- **Profile Management**: User profile customization options

## Tech Stack

- **React**: Frontend library for building user interfaces
- **React Router**: For navigation and routing
- **Axios**: HTTP client for API requests
- **Leaflet/React-Leaflet**: Interactive maps
- **Tailwind CSS**: Utility-first CSS framework for styling
- **JWT**: Token-based authentication

## Project Structure

```
src/
├── components/         # UI components
│   ├── Auth/           # Authentication components
│   ├── Dashboard/      # Dashboard views
│   ├── Layout/         # Layout components
│   ├── Profile/        # User profile components
│   ├── Rides/          # Ride management components
│   └── UI/             # Reusable UI components
├── context/            # React context providers
├── services/           # API and other services
├── utils/              # Utility functions
├── App.js              # Main application component
└── index.js            # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Backend API running (see backend README)

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd moveinsync/frontend
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```
   Adjust the URL if your backend is running on a different port or host.

4. Start the development server
   ```bash
   npm start
   # or
   yarn start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm build`: Builds the app for production
- `npm test`: Runs the test suite
- `npm eject`: Ejects from create-react-app

## Key Components

### Authentication

The application uses JWT-based authentication with tokens stored in localStorage. The `AuthContext` provides authentication state and methods throughout the application.

### Dashboards

- **Driver Dashboard**: Manage created rides, view ride requests, and update ride status
- **Rider Dashboard**: View upcoming rides, search for rides, and manage ride requests

### Ride Management

- **Create Ride**: Drivers can create new rides with pickup/drop locations, departure time, and rules
- **Search Rides**: Riders can search for available rides based on location and time
- **Request Ride**: Riders can request to join rides
- **Ride Details**: View detailed information about a specific ride

## Styling

The application uses Tailwind CSS for styling with a custom color palette defined in `tailwind.config.js`. The main colors are:

- Primary: Blue (#3a86ff)
- Secondary: Pink (#ff006e)
- Accent: Purple (#8338ec)

## API Integration

The frontend communicates with the backend API using Axios. The API service automatically attaches JWT tokens to requests for authenticated endpoints.