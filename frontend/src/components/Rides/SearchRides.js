import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom map click handler component
function MapClickHandler({ onMapClick }) {
  const map = useMapEvents({
    click: (e) => {
      onMapClick(e);
    }
  });
  return null;
}

const SearchRides = () => {
  const navigate = useNavigate();
  const [origLat, setOrigLat] = useState('');
  const [origLng, setOrigLng] = useState('');
  const [destLat, setDestLat] = useState('');
  const [destLng, setDestLng] = useState('');
  const [time, setTime]       = useState('');
  const [results, setResults] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null); // 'origin' or 'destination'
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Default to Bangalore
  const [status, setStatus] = useState({ type: '', message: '' }); // For showing messages

  const handleMapClick = (e) => {
    if (!activeMarker) {
      setStatus({
        type: 'error',
        message: 'Please select "Set Origin" or "Set Destination" first'
      });
      return;
    }
    const { lat, lng } = e.latlng;
    const newLat = lat.toFixed(6);
    const newLng = lng.toFixed(6);
    
    if (activeMarker === 'origin') {
      setOrigLat(newLat);
      setOrigLng(newLng);
      setStatus({
        type: 'success',
        message: `Origin location set to ${newLat}, ${newLng}`
      });
    } else if (activeMarker === 'destination') {
      setDestLat(newLat);
      setDestLng(newLng);
      setStatus({
        type: 'success',
        message: `Destination location set to ${newLat}, ${newLng}`
      });
    }
    setMapCenter([lat, lng]); // Center the map at the clicked location
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      // Convert the local time to UTC
      const timeInUTC = new Date(time).toISOString();
      const query = `?origLat=${origLat}&origLng=${origLng}&destLat=${destLat}&destLng=${destLng}&time=${timeInUTC}`;
      console.log('Searching with query:', query);
      const res = await api.get(`/rides/search${query}`);
      console.log('Search results:', res.data);
      setResults(res.data);
    } catch (err) {
      console.error(err);
      alert('Error searching rides.');
    }
  };

  const handleRequest = (rideId) => {
    navigate(`/ride/${rideId}/request`); 
    // For brevity; you could also do it inline with a pop‐up
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const RideCard = ({ ride }) => {
    return (
      <Card 
        className="mb-4 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        hoverable
      >
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center mb-2">
              <svg className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
              <div className="font-medium">{ride.driver.displayName}'s Ride</div>
            </div>
            <div className="flex items-center mb-2">
              <svg className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="text-gray-600">Departure:</span> <span className="text-gray-800">{formatDate(ride.departureTime)}</span>
              </div>
            </div>
            <div className="flex items-center mb-2">
              <svg className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <div>
                <span className="text-gray-600">Seats:</span> <span className="text-gray-800">{ride.availableSeats}/{ride.totalSeats} available</span>
              </div>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 011-1zm2 3v1a1 1 0 102 0V5h6v1a1 1 0 102 0V5h1v4H4V5h1z" clipRule="evenodd" />
              </svg>
              <div>
                <span className="text-gray-600">Match:</span> <span className="text-green-600 font-medium">{ride.matchPercent}%</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col justify-between">
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Available
              </span>
            </div>
            <div className="mt-4 flex flex-col space-y-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleRequest(ride.rideId)}
                className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
              >
                <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Request Seat
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/ride/${ride.rideId}`)}
                className="border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Find Available Rides</h1>
        <Card className="bg-white">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Map section for selecting origin and destination */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Location Selection</h3>
              
              {status.message && (
                <div className={`mb-4 p-3 rounded-md ${
                  status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {status.message}
                </div>
              )}
              
              <div className="bg-gray-100 p-4 rounded-md">
                <div className="mb-4">
                  <div className="flex space-x-4 mb-2">
                    <button
                      type="button"
                      onClick={() => setActiveMarker('origin')}
                      className={`px-3 py-1 rounded-md ${
                        activeMarker === 'origin'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      Set Origin
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMarker('destination')}
                      className={`px-3 py-1 rounded-md ${
                        activeMarker === 'destination'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      Set Destination
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {activeMarker
                      ? `Click on the map to set ${activeMarker} location`
                      : 'Select "Set Origin" or "Set Destination" to mark locations'}
                  </p>
                </div>
                
                <div className="h-64 w-full rounded-md overflow-hidden">
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    doubleClickZoom={false} // Disable double-click zoom
                  >
                    <MapClickHandler onMapClick={handleMapClick} />
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {origLat && origLng && (
                      <Marker
                        position={[parseFloat(origLat), parseFloat(origLng)]}
                        eventHandlers={{
                          click: () => setActiveMarker('origin')
                        }}
                      >
                        <Popup>Origin Location</Popup>
                      </Marker>
                    )}
                    
                    {destLat && destLng && (
                      <Marker
                        position={[parseFloat(destLat), parseFloat(destLng)]}
                        eventHandlers={{
                          click: () => setActiveMarker('destination')
                        }}
                      >
                        <Popup>Destination Location</Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Origin Latitude"
                  type="number"
                  step="0.000001"
                  value={origLat}
                  required
                  onChange={e => setOrigLat(e.target.value)}
                  placeholder="Enter origin latitude"
                />
              </div>
              <div>
                <Input
                  label="Origin Longitude"
                  type="number"
                  step="0.000001"
                  value={origLng}
                  required
                  onChange={e => setOrigLng(e.target.value)}
                  placeholder="Enter origin longitude"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Destination Latitude"
                  type="number"
                  step="0.000001"
                  value={destLat}
                  required
                  onChange={e => setDestLat(e.target.value)}
                  placeholder="Enter destination latitude"
                />
              </div>
              <div>
                <Input
                  label="Destination Longitude"
                  type="number"
                  step="0.000001"
                  value={destLng}
                  required
                  onChange={e => setDestLng(e.target.value)}
                  placeholder="Enter destination longitude"
                />
              </div>
            </div>
            
            <div>
              <Input
                label="Approximate Time (±15min)"
                type="datetime-local"
                value={time}
                required
                onChange={e => setTime(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" variant="primary">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                Search Rides
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {results.length > 0 && (
        <div className="mb-8 animate-slideUp">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Available Rides</h2>
            <span className="text-sm text-gray-500">{results.length} rides found</span>
          </div>
          
          <div className="space-y-4">
            {results.map((ride) => (
              <RideCard key={ride.rideId} ride={ride} />
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && (
        <Card className="text-center py-8 mt-8">
          <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No rides found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search parameters</p>
        </Card>
      )}
    </div>
  );
};

export default SearchRides;