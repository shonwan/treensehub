import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, BarChart as IconBarChart, User, History as HistoryIcon, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProfileData } from '../types/database';

function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase.auth.getUser();

          if (error) {
            throw error;
          }

          setProfile({
            ...data.user,
            email: data.user.email ?? '',
          });
        } catch (error) {
          if (error instanceof Error) {
            console.error('Error fetching profile:', error.message);
          } else {
            console.error('Error fetching profile:', error);
          }
        }
      };

      fetchProfile();
    }
  }, [user, navigate]);

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-white p-4 shadow-md flex flex-col">
        <div className="space-y-4 flex-1">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="space-y-2">
            <Link to="/dashboard" className="w-full flex items-center p-2 rounded-md hover:bg-indigo-100 focus:outline-none">
              <Home className="w-5 h-5 mr-3 text-indigo-600" />
              Overview
            </Link>
            <Link to="/history" className="w-full flex items-center p-2 rounded-md hover:bg-indigo-100 focus:outline-none">
              <HistoryIcon className="w-5 h-5 mr-3 text-indigo-600" />
              History
            </Link>
            <Link to="/analytics" className="w-full flex items-center p-2 rounded-md hover:bg-indigo-100 focus:outline-none">
              <IconBarChart className="w-5 h-5 mr-3 text-indigo-600" />
              Analytics
            </Link>
            <Link to="/profile" className="w-full flex items-center p-2 rounded-md hover:bg-indigo-100 focus:outline-none">
              <User className="w-5 h-5 mr-3 text-indigo-600" />
              Profile
            </Link>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-2 rounded-md hover:bg-indigo-100 focus:outline-none text-red-600"
          >
            <LogOut className="w-5 h-5 mr-2" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
        </div>
        <div className="bg-white p-6 shadow-md rounded-lg">
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{profile.email}</p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">User ID</label>
            <p className="mt-1 text-gray-900">{profile.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
