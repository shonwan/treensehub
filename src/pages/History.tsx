import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Home, BarChart, User, History as HistoryIcon, LogOut } from 'lucide-react';
import { ClassificationData } from '../types/database';

const geocode = async (latitude: number, longitude: number) => {
  const apiKey = 'pk.eyJ1Ijoic2hvbmNob25hIiwiYSI6ImNtNjF0a3kyYzBxbDEybW82MWZ5ZHppcWQifQ.-M6OdFIjjzOdim_V1kEgog'; // Your Mapbox API key
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${apiKey}`
  );
  const data = await response.json();
  if (data.features && data.features.length > 0) {
    return data.features[0].place_name;
  } else {
    return 'Location not found';
  }
};

function History() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<ClassificationData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); 
  const [selectedItem, setSelectedItem] = useState<ClassificationData | null>(null); // Modal state
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // State for selected items
  const modalRef = useRef<HTMLDivElement>(null); // Ref for the modal element
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

          const updatedHistory = await Promise.all(
            data.map(async (item) => {
              const locationText = item.location;
              const latLonMatch = locationText.match(/Latitude:\s*(-?\d+\.\d+),\s*Longitude:\s*(-?\d+\.\d+)/);

              if (latLonMatch) {
                const latitude = parseFloat(latLonMatch[1]);
                const longitude = parseFloat(latLonMatch[2]);
                const address = await geocode(latitude, longitude);
                item.location = address;
              }
              return item;
            })
          );

          setHistory(updatedHistory);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setSelectedItem(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalRef]);

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

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setDeleting(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        const { error } = await supabase
          .from('plant_classifications')
          .delete()
          .eq('id', deleteId);

        if (error) {
          throw error;
        }

        setHistory(history.filter(item => item.id !== deleteId));
        setDeleting(false);
        setDeleteId(null);
        setSuccessMessage('Item successfully deleted!');

        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);

      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const deleteSelectedItems = async () => {
    try {
      const { error } = await supabase
        .from('plant_classifications')
        .delete()
        .in('id', selectedItems);

      if (error) {
        throw error;
      }

      setHistory(history.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
      setSuccessMessage('Selected items successfully deleted!');

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting selected items:', error);
    }
  };

  const cancelDelete = () => {
    setDeleting(false);
    setDeleteId(null);
  };

  const openModal = (item: ClassificationData) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === paginatedHistory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedHistory.map(item => item.id));
    }
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
    {/* Header */}
    <h1 className="text-2xl font-bold text-gray-900">Classification History</h1>
    {/* Search Bar */}
    <input
      type="text"
      placeholder="Search..."
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      className="border p-2 rounded-md"
    />
  </div>
  <div className="flex justify-between items-center mb-6">
    <div className="flex items-center">
      {selectedItems.length > 0 && (
        <>
          <button
            onClick={deleteSelectedItems}
            className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 mr-4"
            disabled={selectedItems.length === 0}
          >
            Delete Selected
          </button>
          <span>{selectedItems.length} selected</span>
        </>
      )}
    </div>
  </div>
  {successMessage && (
    <div className="p-4 mb-4 text-white bg-green-500 rounded-md">
      {successMessage}
    </div>
  )}
  <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
    <thead>
      <tr>
        <th className="p-4 table-cell-border text-center align-middle">
          <input
            type="checkbox"
            onChange={handleSelectAll}
            checked={selectedItems.length === paginatedHistory.length}
          />
        </th>
        <th className="p-4 text-left table-cell-border">Image</th>
        <th className="p-4 text-left cursor-pointer table-cell-border" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
          Classification {sortOrder === 'asc' ? '↑' : '↓'}
        </th>
        <th className="p-4 text-left table-cell-border">Confidence</th>
        <th className="p-4 text-left table-cell-border">Location</th>
        <th className="p-4 text-left table-cell-border">Date</th>
        <th className="p-4 text-left table-cell-border">Actions</th>
      </tr>
    </thead>
    <tbody>
      {paginatedHistory.map(item => (
        <tr key={item.id} onClick={() => openModal(item)}>
          <td className="p-4 table-cell-border text-center align-middle">
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => { e.stopPropagation(); handleSelectItem(item.id); }}
            />
          </td>
          <td className="p-4 table-cell-border"><img src={item.image_url} alt="Plant" className="w-12 h-12 rounded-lg" /></td>
          <td className="p-4 table-cell-border">{item.classification}</td>
          <td className="p-4 table-cell-border">{(item.confidence)}</td>
          <td className="p-4 table-cell-border">{item.location}</td>
          <td className="p-4 table-cell-border">{new Date(item.created_at).toLocaleString()}</td>
          <td className="p-4 table-cell-border">
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
              className="text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  {/* Delete Confirmation */}
  {deleting && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Confirm Deletion</h3>
        <p className="mb-4">Are you sure you want to delete this item?</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={cancelDelete}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Modal */}
  {selectedItem && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-lg w-96">
        <button onClick={closeModal} className="absolute top-2 right-2 text-gray-700">X</button>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Classification details</h3>
        <img src={selectedItem.image_url} alt="Plant" className="w-full h-auto mb-4" />
        
        <p><strong>Date:</strong> {new Date(selectedItem.created_at).toLocaleString()}</p>
        <br />
        <p><strong>Result:</strong> {selectedItem.classification}</p>
        <br />
        <p><strong>Confidence:</strong> {selectedItem.confidence}</p>
        <br />
        <p><strong>Location:</strong> {selectedItem.location}</p>
      </div>
    </div>
  )}

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