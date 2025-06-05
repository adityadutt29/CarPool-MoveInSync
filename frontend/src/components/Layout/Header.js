import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <Link to={user?.role === 'driver' ? '/driver/dashboard' : '/rider/dashboard'} className="flex items-center">
              <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
              <span className="text-white font-bold text-xl ml-2">MoveInSync</span>
            </Link>
          </div>

          {/* Navigation */}
          {user && (
            <nav className="hidden md:flex items-center space-x-6">
              {user.role === 'driver' ? (
                <>
                  <Link to="/driver/dashboard" className="text-white hover:text-blue-100 transition-all duration-200 hover:scale-105">
                    Dashboard
                  </Link>
                  <Link to="/create-ride" className="text-white hover:text-blue-100 transition-all duration-200 hover:scale-105">
                    Create Ride
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/rider/dashboard" className="text-white hover:text-blue-100 transition-all duration-200 hover:scale-105">
                    Dashboard
                  </Link>
                  <Link to="/search-rides" className="text-white hover:text-blue-100 transition-all duration-200 hover:scale-105">
                    Find Rides
                  </Link>
                </>
              )}
              <Link to="/profile" className="text-white hover:text-blue-100 transition-all duration-200 hover:scale-105">
                Profile
              </Link>
            </nav>
          )}

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:block">
                  <span className="text-white text-sm">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-white text-indigo-700 px-4 py-2 rounded-full font-medium hover:bg-indigo-50 hover:shadow-md transition-all duration-200 shadow-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="bg-white text-indigo-700 px-4 py-2 rounded-full font-medium hover:bg-indigo-50 hover:shadow-md transition-all duration-200 shadow-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-transparent text-white border border-white px-4 py-2 rounded-full font-medium hover:bg-white hover:text-indigo-700 transition-all duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;