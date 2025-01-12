import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase'; // Ensure correct import path
import { Home, BarChart, User, History as HistoryIcon, LogOut } from 'lucide-react';
import { ClassificationData } from '../types/database';

function History() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<ClassificationData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      const fetchHistory = async () => {
        try {
          const { data, error } = await supabase
            .from('plant_classifications')
            .select('*')
            .order('created_at', { ascending: sortOrder === 'asc' });

          if (error) {
            throw error;
          }

          setHistory(data);
        } catch (error) {
          if (error instanceof Error) {
            console.error('Error fetching history:', error.message);
          } else {
            console.error('Error fetching history:', error);
          }
        }
      };

      fetchHistory();
    }
  }, [user, navigate, sortOrder]);

  const filteredHistory = history.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.classification.toLowerCase() === term ||
      item.location.toLowerCase().includes(term) ||
      new Date(item.created_at).toLocaleString().includes(term)
    );
  });

  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

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
              <BarChart className="w-5 h-5 mr-3 text-indigo-600" />
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">History</h1>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="border p-2 rounded-md"
          />
        </div>
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr>
              <th className="p-4 text-left">Image</th>
              <th className="p-4 text-left cursor-pointer" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                Classification {sortOrder === 'asc' ? '↑' : '↓'}
              </th>
              <th className="p-4 text-left">Location</th>
              <th className="p-4 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedHistory.map(item => (
              <tr key={item.id}>
                <td className="p-4"><img src={item.image_url} alt="Plant" className="w-12 h-12 rounded-lg" /></td>
                <td className="p-4">{item.classification}</td>
                <td className="p-4">{item.location}</td>
                <td className="p-4">{new Date(item.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center mt-4">
          {currentPage > 1 && (
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-2 rounded-md bg-gray-200"
            >
              Previous
            </button>
          )}
          <p>Page {currentPage} of {totalPages}</p>
          {currentPage < totalPages && (
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2 rounded-md bg-gray-200"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default History;
