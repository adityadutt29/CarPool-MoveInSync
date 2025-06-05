import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages / Components
import Login      from './components/Auth/Login';
import Register   from './components/Auth/Register';
import DriverDash from './components/Dashboard/DriverDashboard';
import RiderDash  from './components/Dashboard/RiderDashboard';
import CreateRide from './components/Rides/CreateRide';
import SearchRides from './components/Rides/SearchRides';
import RequestsList from './components/Rides/RequestsList';
import RequestRide from './components/Rides/RequestRide';
import Profile    from './components/Profile/Profile';
import ChooseRole from './components/Auth/ChooseRole';
import RideDetails from './components/Rides/RideDetails';

import PrivateRoute from './utils/PrivateRoute';
import MainLayout from './components/Layout/MainLayout';

function App() {
  // Helper function to wrap authenticated routes with MainLayout
  const AuthenticatedRoute = ({ children }) => (
    <PrivateRoute>
      <MainLayout>{children}</MainLayout>
    </PrivateRoute>
  );

  // Helper for public routes that still use the layout
  const PublicRouteWithLayout = ({ children }) => (
    <MainLayout>{children}</MainLayout>
  );

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/choose-role" element={
              <AuthenticatedRoute>
                <ChooseRole />
              </AuthenticatedRoute>
            } />

            <Route path="/driver/dashboard" element={
              <AuthenticatedRoute>
                <DriverDash />
              </AuthenticatedRoute>
            } />
            <Route path="/rider/dashboard" element={
              <AuthenticatedRoute>
                <RiderDash />
              </AuthenticatedRoute>
            } />

            <Route path="/driver/requests/:rideId" element={
              <AuthenticatedRoute>
                <RequestsList />
              </AuthenticatedRoute>
            } />
            <Route path="/create-ride" element={
              <AuthenticatedRoute>
                <CreateRide />
              </AuthenticatedRoute>
            } />
            <Route path="/search-rides" element={
              <AuthenticatedRoute>
                <SearchRides />
              </AuthenticatedRoute>
            } />
            <Route path="/ride/:rideId/request" element={
              <AuthenticatedRoute>
                <RequestRide />
              </AuthenticatedRoute>
            } />
            <Route path="/ride/:rideId" element={
              <AuthenticatedRoute>
                <RideDetails />
              </AuthenticatedRoute>
            } />
            <Route path="/profile" element={
              <AuthenticatedRoute>
                <Profile />
              </AuthenticatedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;