import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, BarChart, User, History, LogOut} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ClassificationData } from '../types/database'; // Ensure correct import path



function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    HealthyScans: 0,
    UnhealthyScans: 0,
  });
  const [todayScans, setTodayScans] = useState({
    total: 0,
  });
  const [activities, setActivities] = useState<ClassificationData[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      // Fetch stats from Supabase
      const fetchStats = async () => {
        try {
          const { data, error } = await supabase
            .from('plant_classifications')
            .select('classification');

          if (error) {
            throw error;
          }

          // Aggregate counts manually
          const Healthy = data.filter(item => item.classification === 'Healthy').length;
          const Unhealthy = data.filter(item => item.classification === 'Unhealthy').length;

          setStats({
            HealthyScans: Healthy,
            UnhealthyScans: Unhealthy,
          });
        } catch (error) {
          if (error instanceof Error) {
            console.error('Error fetching stats:', error.message);
          } else {
            console.error('Error fetching stats:', error);
          }
        }
      };

      const fetchTodayScans = async () => {
        try {
          const today = new Date().toISOString().split('T')[0]; // Get today's date
          const { data, error } = await supabase
            .from('plant_classifications')
            .select('*')
            .gte('created_at', `${today}T00:00:00Z`) // Ensure correct comparison with timestamp
            .lt('created_at', `${today}T23:59:59Z`); // Fetch records for today

          if (error) {
            throw error;
          }

          setTodayScans({
            total: data.length,
          });
        } catch (error) {
          if (error instanceof Error) {
            console.error('Error fetching today\'s scans::', error.message);
          } else {
            console.error('Error fetching today\'s scans:', error);
          }
        }
      };

      const fetchActivities = async () => {
        try {
          const { data, error } = await supabase
            .from('plant_classifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5); // Fetch the 5 most recent activities

          if (error) {
            throw error;
          }

          setActivities(data);
        } catch (error) {
          if (error instanceof Error) {
            console.error('Error fetching recent activities', error.message);
          } else {
            console.error('Error fetching recent activities', error);
          }
        }
      };

      fetchStats();
      fetchTodayScans();
      fetchActivities();
    }
  }, [user, navigate]);

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-white p-4 shadow-md flex flex-col">
        <div className="space-y-4 flex-1">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
          <div className="space-y-2">
            <button className="w-full flex items-center p-2 rounded-md hover:bg-indigo-100 focus:outline-none">
              <Home className="w-5 h-5 mr-3 text-indigo-600" />
              Overview
            </button>
            <Link
              to="/history"
              className="w-full flex items-center p-2 rounded-md hover:bg-indigo-100 focus:outline-none"
            >
              <History className="w-5 h-5 mr-3 text-indigo-600" />
              History
            </Link>
            <Link
              to="/analytics"
              className="w-full flex items-center p-2 rounded-md hover:bg-indigo-100 focus:outline-none"
            >
              <BarChart className="w-5 h-5 mr-3 text-indigo-600" />
              Analytics
            </Link>
            <Link
              to="/profile"
              className="w-full flex items-center p-2 rounded-md hover:bg-indigo-100 focus:outline-none"
            >
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
            {" "}
            <LogOut className="w-5 h-5 mr-2" /> Sign Out{" "}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        {/* Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 flex justify-between items-center">
            Overview
          </h2>
          <div className="grid grid-cols-3 gap-6 mt-4">
            <div className="p-4 bg-white shadow-md rounded-lg">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    ></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-500">Today's Scans</p>
                  <h3 className="text-2xl font-bold">{todayScans.total}</h3>
                  <p className="text-sm text-gray-400">
                    Total: {stats.HealthyScans + stats.UnhealthyScans}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white shadow-md rounded-lg">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-500">Healthy Scans</p>
                  <h3 className="text-2xl font-bold text-green-600">
                    {stats.HealthyScans}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {(
                      (stats.HealthyScans /
                        (stats.HealthyScans + stats.UnhealthyScans)) *
                      100
                    ).toFixed(1)}
                    % of total
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white shadow-md rounded-lg">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-500">Unhealthy Scans</p>
                  <h3 className="text-2xl font-bold text-red-600">
                    {stats.UnhealthyScans}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {(
                      (stats.UnhealthyScans /
                        (stats.HealthyScans + stats.UnhealthyScans)) *
                      100
                    ).toFixed(1)}
                    % of total
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-4 shadow-md rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activities
          </h2>
          <ul>
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="border-b border-gray-200 py-2 flex items-center"
              >
                <img
                  src={activity.image_url}
                  alt="Activity"
                  className="w-12 h-12 rounded-lg mr-4"
                />
                <div>
                  <p className="text-sm text-gray-700">
                    {activity.classification}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
