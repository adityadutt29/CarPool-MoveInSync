import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../UI/Card';
import Button from '../UI/Button';

const DriverDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      // Fetch all rides created by this driver, including status
      api.get(`/rides/driver/${user.id}/my-rides`)
        .then(res => setRides(res.data.map(ride => ({
          ...ride,
          status: ride.status || 'UPCOMING' // Ensure status exists
        }))))
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const RideCard = ({ ride }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    
    const updateRideStatus = async (status) => {
      setIsUpdating(true);
      try {
        const response = await api.patch(`/rides/${ride.rideId}/status`, { status });
        // Update the specific ride in state with the response data
        setRides(prev => prev.map(r =>
          r.rideId === ride.rideId ? { ...r, status: response.data.ride.status } : r
        ));
      } catch (err) {
        console.error('Error updating ride status:', err);
      } finally {
        setIsUpdating(false);
      }
    };

    const getStatusBadge = (status) => {
      switch(status) {
        case 'UPCOMING':
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Upcoming</span>;
        case 'IN_PROGRESS':
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">In Progress</span>;
        case 'COMPLETED':
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>;
        default:
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
      }
    };

    return (
      <Card
        className="mb-4 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        hoverable
      >
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center mb-2">
              <svg className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3a1 1 0 001-1v-3.05a2.5 2.5 0 010-4.9V4a1 1 0 00-1-1H3zM14 7.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
              </svg>
              <div className="font-medium">Ride #{ride.rideId}</div>
            </div>
            <div className="flex items-center mb-2">
              <svg className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="text-gray-600">Departure:</span> <span className="text-gray-800">{formatDate(ride.departureTime)}</span>
              </div>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <div>
                <span className="text-gray-600">Seats:</span> <span className="text-gray-800">{ride.availableSeats}/{ride.totalSeats} available</span>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-gray-600">Status:</span> {getStatusBadge(ride.status || 'UPCOMING')}
            </div>
          </div>
          
          <div className="flex flex-col justify-between">
            <div className="text-right">
              {getStatusBadge(ride.status || 'UPCOMING')}
            </div>
            <div className="mt-4 flex flex-col space-y-2">
              {ride.status === 'UPCOMING' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => updateRideStatus('IN_PROGRESS')}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Starting...' : 'Start Ride'}
                </Button>
              )}
              {ride.status === 'IN_PROGRESS' && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => updateRideStatus('COMPLETED')}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Completing...' : 'Complete Ride'}
                </Button>
              )}
              <Link to={`/driver/requests/${ride.rideId}`}>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                >
                  View Requests
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/ride/${ride.rideId}`)}
              >
                View Details
              </Button>
            </div>
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
            <p className="text-gray-600">Manage your rides and driver profile</p>
          </div>
          <div className="flex space-x-3">
            <Link to="/profile">
              <Button variant="outline" size="md">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
                My Profile
              </Button>
            </Link>
            <Link to="/create-ride">
              <Button variant="primary" size="md">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create New Ride
              </Button>
            </Link>
          </div>
        </div>
        
        <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2 text-white">Ready to offer a ride?</h2>
              <p className="opacity-90">Create a new ride and help your colleagues commute</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link to="/create-ride">
                <Button variant="light" size="md">
                  Create Ride
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Active Rides</h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : rides.length === 0 ? (
          <Card className="text-center py-8">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No active rides</h3>
            <p className="text-gray-500 mb-4">You don't have any active rides as a driver</p>
            <Link to="/create-ride">
              <Button variant="primary">Create a Ride</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {rides.map(ride => (
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Create Ride</h3>
            <p className="text-gray-500 mb-4">Offer a ride to your colleagues</p>
            <Link to="/create-ride">
              <Button variant="outline" fullWidth>Create</Button>
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

   export default DriverDashboard;