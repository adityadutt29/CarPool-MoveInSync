import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Card from '../UI/Card';
import Button from '../UI/Button';
import api from '../../services/api';

const RiderDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [upcomingRides, setUpcomingRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const navigate = useNavigate();

  const fetchUpcomingRides = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/rides/upcoming');
      setUpcomingRides(response.data.map(ride => ({
        ...ride,
        status: ride.status || 'UPCOMING' // Ensure status exists
      })));
    } catch (err) {
      console.error('Failed to fetch upcoming rides:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingRides();
    
    // Set up polling for ride status updates every 30 seconds
    const intervalId = setInterval(fetchUpcomingRides, 30000);
    
    return () => clearInterval(intervalId);
  }, [lastRefresh]);

  const handleRefresh = () => {
    setLastRefresh(Date.now());
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const RideCard = ({ ride }) => {
    return (
      <Card hoverable>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3a1 1 0 001-1v-3.05a2.5 2.5 0 010-4.9V4a1 1 0 00-1-1H3zM14 7.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{ride.driver.displayName}'s Ride</h4>
                <p className="text-sm text-gray-500">Driver</p>
              </div>
            </div>
            <div>
              {ride.status === 'UPCOMING' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Upcoming</span>}
              {ride.status === 'IN_PROGRESS' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">In Progress</span>}
              {ride.status === 'COMPLETED' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start p-3 bg-gray-50 rounded-lg">
              <svg className="h-5 w-5 text-gray-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-xs text-gray-500">Pickup</p>
                <p className="text-sm font-medium text-gray-900">{ride.pickupLat.toFixed(4)}, {ride.pickupLng.toFixed(4)}</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-gray-50 rounded-lg">
              <svg className="h-5 w-5 text-gray-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-xs text-gray-500">Destination</p>
                <p className="text-sm font-medium text-gray-900">{ride.dropLat.toFixed(4)}, {ride.dropLng.toFixed(4)}</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-gray-50 rounded-lg">
              <svg className="h-5 w-5 text-gray-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-xs text-gray-500">Departure</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(ride.departureTime)}</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-gray-50 rounded-lg">
              <svg className="h-5 w-5 text-gray-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-medium">
                  {ride.status === 'UPCOMING' && <span className="text-blue-600">Upcoming</span>}
                  {ride.status === 'IN_PROGRESS' && <span className="text-yellow-600">In Progress</span>}
                  {ride.status === 'COMPLETED' && <span className="text-green-600">Completed</span>}
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate(`/ride/${ride.rideId}`)}
            >
              View Details
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome, {user.showFullName ? user.fullName : user.displayName}!</h1>
            <p className="text-gray-600">Your upcoming rides and travel plans</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              size="md"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing
                </span>
              ) : (
                <span className="flex items-center">
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Refresh
                </span>
              )}
            </Button>
            <Link to="/search-rides">
              <Button variant="primary" size="md">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                Find Rides
              </Button>
            </Link>
          </div>
        </div>
        
        <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2 text-white">Ready to go somewhere?</h2>
              <p className="opacity-90">Find available rides and travel with colleagues</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link to="/search-rides">
                <Button variant="light" size="md">
                  Search Rides
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Upcoming Rides</h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : upcomingRides.length === 0 ? (
          <Card className="text-center py-8">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No upcoming rides</h3>
            <p className="text-gray-500 mb-4">You don't have any upcoming rides scheduled</p>
            <Link to="/search-rides">
              <Button variant="primary">Find a Ride</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingRides.map(ride => (
              <RideCard key={ride._id || ride.rideId} ride={ride} />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="text-center">
            <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3a1 1 0 001-1v-3.05a2.5 2.5 0 010-4.9V4a1 1 0 00-1-1H3zM14 7.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Find Rides</h3>
            <p className="text-gray-500 mb-4">Search for available rides to your destination</p>
            <Link to="/search-rides">
              <Button variant="outline" fullWidth>Search</Button>
            </Link>
          </div>
        </Card>
        
        <Card className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="text-center">
            <div className="rounded-full bg-indigo-100 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your Profile</h3>
            <p className="text-gray-500 mb-4">Manage your account and preferences</p>
            <Link to="/profile">
              <Button variant="outline" fullWidth>View Profile</Button>
            </Link>
          </div>
        </Card>
        
        <Card className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="text-center">
            <div className="rounded-full bg-green-100 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Help & Support</h3>
            <p className="text-gray-500 mb-4">Get assistance with your rides</p>
            <Button variant="outline" fullWidth>Contact Support</Button>
          </div>
        </Card>
      </div>
    </div>
  );
   };

   export default RiderDashboard;