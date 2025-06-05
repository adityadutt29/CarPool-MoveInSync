import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
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
const CreateRide = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    pickupLat: '',
    pickupLng: '',
    dropLat: '',
    dropLng: '',
    departureTime: '',
    totalSeats: 1,
    vehicleInfo: { make: '', model: '', plateNo: '', color: '' },
    rules: { femaleOnly: false, noSmoking: false, petAllowed: true }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]); // Default to Bangalore
  const [activeMarker, setActiveMarker] = useState(null); // 'pickup' or 'drop'

  useEffect(() => {
    if (useCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            pickupLat: latitude.toFixed(6),
            pickupLng: longitude.toFixed(6)
          }));
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          setStatus({ type: 'error', message: 'Could not get current location. Please select manually on the map.' });
        }
      );
    }
  }, [useCurrentLocation]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('vehicle.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        vehicleInfo: { ...prev.vehicleInfo, [key]: value }
      }));
    } else if (name.startsWith('rules.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        rules: { ...prev.rules, [key]: type === 'checkbox' ? checked : value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) : value
      }));
    }
  };

  const handleMapClick = (e) => {
    if (!activeMarker) {
      setStatus({
        type: 'error',
        message: 'Please select "Set Pickup" or "Set Drop-off" first'
      });
      return;
    }
    
    const { lat, lng } = e.latlng;
    const newLat = lat.toFixed(6);
    const newLng = lng.toFixed(6);
    
    if (activeMarker === 'pickup') {
      setFormData(prev => ({
        ...prev,
        pickupLat: newLat,
        pickupLng: newLng
      }));
      setStatus({
        type: 'success',
        message: `Pickup location set to ${newLat}, ${newLng}`
      });
    } else {
      setFormData(prev => ({
        ...prev,
        dropLat: newLat,
        dropLng: newLng
      }));
      setStatus({
        type: 'success',
        message: `Drop-off location set to ${newLat}, ${newLng}`
      });
    }
    
    // Force map re-render to show new marker
    setMapCenter([lat, lng]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });
    
    try {
      const payload = {
        pickupLat: parseFloat(formData.pickupLat),
        pickupLng: parseFloat(formData.pickupLng),
        dropLat: parseFloat(formData.dropLat),
        dropLng: parseFloat(formData.dropLng),
        departureTime: formData.departureTime,
        totalSeats: formData.totalSeats,
        vehicleInfo: formData.vehicleInfo,
        rules: formData.rules
      };
      const res = await api.post('/rides', payload);
      setStatus({ type: 'success', message: `Ride created with ID: ${res.data.rideId}` });
      setTimeout(() => navigate('/driver/dashboard'), 2000);
    } catch (err) {
      console.error(err);
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Error creating ride. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Ride</h2>
      
      {status.message && (
        <div className={`mb-4 p-3 rounded-md ${
          status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {status.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Location Selection</h3>
          
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="useCurrentLocation"
              checked={useCurrentLocation}
              onChange={(e) => setUseCurrentLocation(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="useCurrentLocation" className="ml-2 block text-sm text-gray-700">
              Use my current location for pickup
            </label>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-md">
            <div className="mb-4">
              <div className="flex space-x-4 mb-2">
                <button
                  type="button"
                  onClick={() => setActiveMarker('pickup')}
                  className={`px-3 py-1 rounded-md ${
                    activeMarker === 'pickup'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Set Pickup
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMarker('drop')}
                  className={`px-3 py-1 rounded-md ${
                    activeMarker === 'drop'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Set Drop-off
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {activeMarker
                  ? `Click on the map to set ${activeMarker} location`
                  : 'Select "Set Pickup" or "Set Drop-off" to mark locations'}
              </p>
            </div>
            
            <div className="h-64 w-full rounded-md overflow-hidden">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                doubleClickZoom={false} // Disable double-click zoom
                onClick={handleMapClick}
              >
<MapClickHandler onMapClick={handleMapClick} />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {formData.pickupLat && formData.pickupLng && (
                  <Marker
                    position={[parseFloat(formData.pickupLat), parseFloat(formData.pickupLng)]}
                    eventHandlers={{
                      click: () => setActiveMarker('pickup')
                    }}
                  >
                    <Popup>Pickup Location</Popup>
                  </Marker>
                )}
                
                {formData.dropLat && formData.dropLng && (
                  <Marker
                    position={[parseFloat(formData.dropLat), parseFloat(formData.dropLng)]}
                    eventHandlers={{
                      click: () => setActiveMarker('drop')
                    }}
                  >
                    <Popup>Drop-off Location</Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Latitude</label>
                <input
                  type="number"
                  name="pickupLat"
                  value={formData.pickupLat}
                  required
                  onChange={handleChange}
                  step="0.000001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12.345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Longitude</label>
                <input
                  type="number"
                  name="pickupLng"
                  value={formData.pickupLng}
                  required
                  onChange={handleChange}
                  step="0.000001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="98.765432"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drop-off Latitude</label>
                <input
                  type="number"
                  name="dropLat"
                  value={formData.dropLat}
                  required
                  onChange={handleChange}
                  step="0.000001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12.345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drop-off Longitude</label>
                <input
                  type="number"
                  name="dropLng"
                  value={formData.dropLng}
                  required
                  onChange={handleChange}
                  step="0.000001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="98.765432"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time</label>
            <input
              type="datetime-local"
              name="departureTime"
              value={formData.departureTime}
              required
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Seats</label>
            <input
              type="number"
              name="totalSeats"
              value={formData.totalSeats}
              required
              min="1"
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
              <input
                type="text"
                name="vehicle.make"
                value={formData.vehicleInfo.make}
                required
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Toyota, Honda, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                name="vehicle.model"
                value={formData.vehicleInfo.model}
                required
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Camry, Civic, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
              <input
                type="text"
                name="vehicle.plateNo"
                value={formData.vehicleInfo.plateNo}
                required
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ABC-123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                type="text"
                name="vehicle.color"
                value={formData.vehicleInfo.color}
                required
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Red, Blue, etc."
              />
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ride Rules</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="rules.femaleOnly"
                checked={formData.rules.femaleOnly}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="ml-2 block text-sm text-gray-700">Female passengers only</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="rules.noSmoking"
                checked={formData.rules.noSmoking}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="ml-2 block text-sm text-gray-700">No smoking in vehicle</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="rules.petAllowed"
                checked={formData.rules.petAllowed}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="ml-2 block text-sm text-gray-700">Pets allowed</label>
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isLoading ? 'Creating Ride...' : 'Create Ride'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRide;