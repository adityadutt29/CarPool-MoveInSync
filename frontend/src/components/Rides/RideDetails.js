import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import Card from '../UI/Card';
import Button from '../UI/Button';

const RideDetails = () => {
  const { rideId } = useParams();
  const { user } = useContext(AuthContext);
  const [ride, setRide] = useState(null);
  const [sosMsg, setSosMsg] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch ride details (including masked/unmasked driver email)
  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await api.get(`/rides/${rideId}/details`);
        setRide(res.data);
      } catch (err) {
        alert(err.response?.data?.error?.message || 'Unable to load ride details');
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [rideId]);

  const sendSOS = async () => {
    if (sosMsg.trim().length < 3) {
      alert('Please enter a short message for SOS.');
      return;
    }
    try {
      await api.post(`/rides/${rideId}/sos`, { message: sosMsg.trim() });
      alert('🚨 SOS sent to driver!');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'SOS failed');
    }
  };

  if (loading) return <p>Loading ride details…</p>;
  if (!ride) return <p>Ride not found.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Ride Details</h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-gray-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <div><span className="font-medium">Ride ID:</span> {ride.rideId}</div>
          </div>
          <div className="flex items-center">
            <svg className="h-5 w-5 text-gray-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <div><span className="font-medium">Driver:</span> {ride.driver.displayName}</div>
          </div>
          <div className="flex items-center">
            <svg className="h-5 w-5 text-gray-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <div><span className="font-medium">Driver Email:</span> {ride.driver.email}</div>
          </div>
          {ride.vehicleInfo && (
            <>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-gray-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
                  <path d="M14 7a1 1 0 00-1-1h-2l-.447-.894A2 2 0 009.237 3H8a1 1 0 100 2h1.237l.553 1.106A1 1 0 0010.764 7H13a1 1 0 001-1z" />
                </svg>
                <div><span className="font-medium">Vehicle:</span> {ride.vehicleInfo.make} {ride.vehicleInfo.model}</div>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-gray-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <div><span className="font-medium">License Plate:</span> {ride.vehicleInfo.plateNo}</div>
              </div>
            </>
          )}
          <div className="flex items-start">
            <svg className="h-5 w-5 text-gray-500 mr-3 mt-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">Route:</p>
              <p>From: {ride.pickupLat.toFixed(4)}, {ride.pickupLng.toFixed(4)}</p>
              <p>To: {ride.dropLat.toFixed(4)}, {ride.dropLng.toFixed(4)}</p>
            </div>
          </div>
          <div className="flex items-center">
            <svg className="h-5 w-5 text-gray-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <div><span className="font-medium">Departure:</span> {new Date(ride.departureTime).toLocaleString()}</div>
          </div>
          <div className="flex items-center">
            <svg className="h-5 w-5 text-gray-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <div><span className="font-medium">Seats:</span> {ride.availableSeats} / {ride.totalSeats}</div>
          </div>
        </div>
      </Card>

      {user.id !== ride.driver.id && (
        <Card className="mt-6 p-6">
          <h3 className="text-xl font-semibold mb-4">Emergency / SOS</h3>
          <textarea
            rows="3"
            placeholder="Type a brief SOS message…"
            value={sosMsg}
            onChange={e => setSosMsg(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button
            variant="danger"
            onClick={sendSOS}
          >
            🚨 Send SOS
          </Button>
        </Card>
      )}
    </div>
  );
};

export default RideDetails;