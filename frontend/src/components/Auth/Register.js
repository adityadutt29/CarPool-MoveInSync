import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Card from '../UI/Card';
import Button from '../UI/Button';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState('rider'); // 'driver' or 'rider'
  const [showFullName, setShowFullName] = useState(false);
  const [blurProfile, setBlurProfile]   = useState(true);
  const [gender, setGender]             = useState('other');
  const [smokingAllowed, setSmokingAllowed] = useState(true);
  const [petAllowed, setPetAllowed]         = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({
        fullName,
        email,
        password,
        role,
        showFullName,
        blurProfile,
        gender,
        smokingAllowed,
        petAllowed
      });
      // Redirect based on role
      if (role === 'driver') {
        navigate('/driver/dashboard');
      } else {
        navigate('/rider/dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-3">
            <svg className="h-12 w-12 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Create an Account</h1>
          <p className="text-gray-600">Join MoveInSync today</p>
        </div>
        
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                required
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                required
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="your.email@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                required
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="driver"
                    checked={role === 'driver'}
                    onChange={() => setRole('driver')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">Driver</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="rider"
                    checked={role === 'rider'}
                    onChange={() => setRole('rider')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">Rider</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="other">Other</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
            
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={smokingAllowed}
                  onChange={e => setSmokingAllowed(e.target.checked)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Smoking Allowed</span>
              </label>
            </div>
            
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={petAllowed}
                  onChange={e => setPetAllowed(e.target.checked)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Pets Allowed</span>
              </label>
            </div>
            
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={showFullName}
                  onChange={e => setShowFullName(e.target.checked)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Show Full Name to Others</span>
              </label>
            </div>
            
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={blurProfile}
                  onChange={e => setBlurProfile(e.target.checked)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Blur Profile Picture Until Confirmed</span>
              </label>
            </div>
            
            <div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
              >
                Register
              </Button>
            </div>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already registered?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                Login here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
