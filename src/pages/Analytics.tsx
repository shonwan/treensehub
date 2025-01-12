import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
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
    dailyAverageScans: 0,
  });
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      const fetchData = async () => {
        try {
          const { data, error } = await supabase
            .from("plant_classifications")
            .select("*")
            .gte("created_at", getStartDate(selectedPeriod)); // Filter by selected period

          if (error) {
            throw error;
          }

          setData(data);

          const totalScans = data.length;
          const healthyScans = data.filter(
            (item) => item.classification === "Healthy"
          ).length;
          const unhealthyScans = data.filter(
            (item) => item.classification === "Unhealthy"
          ).length;

          const numberOfDays = getNumberOfDays(selectedPeriod);
          const dailyAverageScans = totalScans / numberOfDays;

          setMetrics({
            totalScans,
            healthyScans,
            unhealthyScans,
            dailyAverageScans,
          });
        } catch (error) {
          if (error instanceof Error) {
            console.error("Error fetching data:", error.message);
          } else {
            console.error("Error fetching data:", error);
          }
        }
      };

      fetchData();
    }
  }, [user, navigate, selectedPeriod]);

  const getStartDate = (period: string) => {
    const now = new Date();
    if (period === "week") {
      now.setDate(now.getDate() - 7);
    } else if (period === "month") {
      now.setMonth(now.getMonth() - 1);
    } else if (period === "year") {
      now.setFullYear(now.getFullYear() - 1);
    }
    return now.toISOString();
  };

  const getNumberOfDays = (period: string) => {
    if (period === "week") {
      return 7;
    } else if (period === "month") {
      return 30; // Simplification
    } else if (period === "year") {
      return 365; // Simplification
    }
    return 1;
  };

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPeriod(e.target.value);
  };

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
    { name: "Healthy", value: metrics.healthyScans },
    { name: "Unhealthy", value: metrics.unhealthyScans },
  ];

  const COLORS = ["#00C49F", "#FF8042"];

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
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
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
            <Link
              to="/dashboard"
              className="w-full flex items-center p-2 rounded-md hover:bg-indigo-100 focus:outline-none"
            >
              <Home className="w-5 h-5 mr-3 text-indigo-600" />
              Overview
            </Link>
            <Link
              to="/history"
              className="w-full flex items-center p-2 rounded-md hover:bg-indigo-100 focus:outline-none"
            >
              <HistoryIcon className="w-5 h-5 mr-3 text-indigo-600" />
              History
            </Link>
            <Link
              to="/analytics"
              className="w-full flex items-center p-2 rounded-md hover:bg-indigo-100 focus:outline-none"
            >
              <IconBarChart className="w-5 h-5 mr-3 text-indigo-600" />
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
            <LogOut className="w-5 h-5 mr-2" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content*/}
      <div className="flex-1 p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <select
            value={selectedPeriod}
            onChange={handlePeriodChange}
            className="bg-white border border-gray-300 rounded-md p-2"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
        <div className="grid grid-cols-4 gap-6 mt-4">
          <div className="p-4 bg-white shadow-md rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
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
                <p className="text-gray-500">Total Scans</p>
                <h3 className="text-2xl font-bold text-indigo-600">
                  {metrics.totalScans}
                </h3>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white shadow-md rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg
                  className="h-8 w-8 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-gray-500">Healthy Scans</p>
                <h3 className="text-2xl font-bold text-green-600">
                  {metrics.healthyScans}
                </h3>
                <p className="text-sm text-gray-400">
                  {((metrics.healthyScans / metrics.totalScans) * 100).toFixed(
                    1
                  )}
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
                  {metrics.unhealthyScans}
                </h3>
                <p className="text-sm text-gray-400">
                  {(
                    (metrics.unhealthyScans / metrics.totalScans) *
                    100
                  ).toFixed(1)}
                  % of total
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white shadow-md rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg
                  className="h-8 w-8 text-yellow-500"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  {" "}
                  <path stroke="none" d="M0 0h24v24H0z" />{" "}
                  <polyline points="21 12 17 12 14 20 10 4 7 12 3 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-gray-500">Daily Average Scans</p>
                <h3 className="text-2xl font-bold text-yellow-600">
                  {metrics.dailyAverageScans.toFixed(2)}
                </h3>
                <p className="text-sm text-gray-400">
                  {(
                    (metrics.dailyAverageScans / metrics.totalScans) *
                    100
                  ).toFixed(1)}
                  % of total
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex space-x-6">
          <div className="w-1/2 p-4 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Scans Over Time
            </h2>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Healthy vs. Unhealthy Scans
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={renderCustomizedLabel}
                >
                  {pieData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
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