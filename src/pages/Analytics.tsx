import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase'; // Ensure correct import path
import { Home, BarChart as IconBarChart, User, History as HistoryIcon, LogOut } from 'lucide-react';
import { BarChart, Bar, PieChart as RePieChart, Pie, Cell, Tooltip, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { ClassificationData } from '../types/database';
import { ChartDataMap } from '../types/database';

interface CustomizedLabelProps { percent: number; x: number; y: number; name: string; }

function Analytics() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<ClassificationData[]>([]);
  const [metrics, setMetrics] = useState({
    totalScans: 0,
    healthyScans: 0,
    unhealthyScans: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      const fetchData = async () => {
        try {
          const { data, error } = await supabase
            .from('plant_classifications')
            .select('*');

          if (error) {
            throw error;
          }

          setData(data);

          // Calculate metrics
          const totalScans = data.length;
          const healthyScans = data.filter(item => item.classification === 'Healthy').length;
          const unhealthyScans = data.filter(item => item.classification === 'Unhealthy').length;

          setMetrics({
            totalScans,
            healthyScans,
            unhealthyScans,
          });
        } catch (error) {
          if (error instanceof Error) {
            console.error('Error fetching data:', error.message);
          } else {
            console.error('Error fetching data:', error);
          }
        }
      };

      fetchData();
    }
  }, [user, navigate]);

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  // Prepare data for charts
  const chartData = data.reduce((acc: ChartDataMap, item) => {
    const date = new Date(item.created_at).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { date, Healthy: 0, Unhealthy: 0 };
    }
    acc[date][item.classification]++;
    return acc;
  }, {} as ChartDataMap);
  const formattedChartData = Object.values(chartData);

  const pieData = [
    { name: 'Healthy', value: metrics.healthyScans },
    { name: 'Unhealthy', value: metrics.unhealthyScans },
  ];

  const COLORS = ['#00C49F', '#FF8042'];

  const renderCustomizedLabel = ({
    percent,
    x,
    y,
    name,
  }: CustomizedLabelProps) => {
    return (
      <text
        x={x}
        y={y}
        fill="black"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {" "}
        {`${name}: ${(percent * 100).toFixed(0)}%`}{" "}
      </text>
    );
  };

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
            {/* <button className="w-full flex items-center p-2 rounded-md hover:bg-indigo-100 focus:outline-none">
              <User className="w-5 h-5 mr-3 text-indigo-600" />
              Profile
            </button> */}
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        </div>
        <div className="grid grid-cols-3 gap-6 mt-4">
          <div className="p-4 bg-white shadow-md rounded-lg">
            <h3 className="text-sm font-medium text-gray-700">Total Scans</h3>
            <p className="text-2xl font-semibold text-indigo-600">{metrics.totalScans}</p>
          </div>
          <div className="p-4 bg-white shadow-md rounded-lg">
            <h3 className="text-sm font-medium text-gray-700">Healthy Scans</h3>
            <p className="text-2xl font-semibold text-green-600">{metrics.healthyScans}</p>
          </div>
          <div className="p-4 bg-white shadow-md rounded-lg">
            <h3 className="text-sm font-medium text-gray-700">Unhealthy Scans</h3>
            <p className="text-2xl font-semibold text-red-600">{metrics.unhealthyScans}</p>
          </div>
        </div>

        <div className="mt-8 flex space-x-6">
          <div className="w-1/2 p-4 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Scans Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formattedChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Healthy" fill="#00C49F" />
                <Bar dataKey="Unhealthy" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 p-4 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Healthy vs. Unhealthy Scans</h2>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label={renderCustomizedLabel}>
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
