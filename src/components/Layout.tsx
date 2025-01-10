import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Camera, 
  History, 
  UserCircle, 
  LogOut 
} from 'lucide-react';

function Layout() {
  const { signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          <div className="p-4">
            <h1 className="text-xl font-bold text-gray-800">Health Classifier</h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            <Link
              to="/dashboard"
              className={`flex items-center px-4 py-2 rounded-lg ${
                isActive('/dashboard')
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mr-3" />
              Dashboard
            </Link>

            <Link
              to="/classifier"
              className={`flex items-center px-4 py-2 rounded-lg ${
                isActive('/classifier')
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Camera className="w-5 h-5 mr-3" />
              Classifier
            </Link>

            <Link
              to="/history"
              className={`flex items-center px-4 py-2 rounded-lg ${
                isActive('/history')
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <History className="w-5 h-5 mr-3" />
              History
            </Link>

            <Link
              to="/profile"
              className={`flex items-center px-4 py-2 rounded-lg ${
                isActive('/profile')
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <UserCircle className="w-5 h-5 mr-3" />
              Profile
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => signOut()}
              className="flex items-center w-full px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;