import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, BarChart as IconBarChart, User, History as HistoryIcon, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProfileData } from '../types/database';
import Modal from '../modal/pass'; // Import the modal component

type SuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleOutsideClick}
    >
      <div className="bg-white p-6 rounded-md shadow-md">
        <h2 className="text-xl font-semibold">Success</h2>
        <p className="mt-4">Profile updated successfully!</p>
        <div className="mt-4 flex justify-center">
        </div>
      </div>
    </div>
  );
};

function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isNewUser, setIsNewUser] = useState(false); // New state to track if the profile is new
  const [isEditing, setIsEditing] = useState(false); // New state to track if the profile is in edit mode
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Password modal state
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // Success modal state

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      const fetchProfile = async () => {
        try {
          // Fetch profile data from Supabase
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) {
            if (error.code === 'PGRST116') { // No record found
              setProfile({
                email: user.email,
                id: user.id,
                phone: '',
                address: '',
                first_name: '',
                last_name: '',
                date_of_birth: null,
                updated_at: ''
              });
              setIsNewUser(true); // Set the profile as new
            } else {
              throw error;
            }
          } else {
            // Merge auth user email with profile data
            setProfile({
              ...data,
              email: user.email,
            });
            setIsNewUser(false); // Set the profile as existing
          }
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

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          phone: profile.phone,
          address: profile.address,
          first_name: profile.first_name,
          last_name: profile.last_name,
          date_of_birth: profile.date_of_birth,
        }, { onConflict: 'id' });

      if (error) {
        console.error('Error saving profile:', error.message);
      } else {
        setIsNewUser(false); // Set the profile as existing after saving
        setIsEditing(false); // Exit edit mode after saving
        setIsSuccessModalOpen(true); // Show success modal
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setPasswordError('Error updating password: ' + error.message);
      } else {
        setPasswordError('Password successfully updated!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsModalOpen(false); // Close modal after success
      }
    } catch (error) {
      if (error instanceof Error) {
        setPasswordError('Error updating password: ' + error.message);
      }
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex">
      {/* ----------------------------------------------------------------------- Sidebar ----------------------------------------------------------------------- */}

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

      {/*------------------------------------------------------------------------ Main Content -----------------------------------------------------------------------*/}
      <div className="flex-1 p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
        </div>
        <div className="bg-white p-6 shadow-md rounded-lg">
          <div className="flex">
            <div className="w-2/3 flex flex-col items-center border-r border-gray-200 pr-6">
              <img
                src="https://www.planetware.com/wpimages/2020/02/france-in-pictures-beautiful-places-to-photograph-eiffel-tower.jpg"
                alt="Random Profile Picture"
                className="w-24 h-24 rounded-full mb-4"
              />
              <label className="block text-gray-700 font-bold pt-11">User ID:</label>
              <p className="text-gray-900">{profile.id}</p>
              <label className="block text-gray-700 font-bold pt-5">Email:</label>
              <p className="mt-1 text-gray-900">{profile.email}</p>
              {/*CHANGE PASSWORD BUTTON*/}
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 mt-10"
              >
                Change Password
              </button>
            </div>
            <div className="w-2/3 pl-2">
              <div className="mb-4 border-b border-gray-200 pb-4">
                <label className="block text-gray-700">First Name:</label>
                <input
                  type="text"
                  className="mt-1 w-full border-gray-300"
                  value={profile.first_name}
                  onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="mb-4 border-b border-gray-200 pb-4">
                <label className="block text-gray-700">Last Name:</label>
                <input
                  type="text"
                  className="mt-1 w-full border-gray-300"
                  value={profile.last_name}
                  onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="mb-4 border-b border-gray-200 pb-4">
                <label className="block text-gray-700">Date of Birth:</label>
                <input
                  type="date"
                  className="mt-1 w-full border-gray-300"
                  value={profile.date_of_birth ? profile.date_of_birth.split('T')[0] : ''}
                  onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="mb-4 border-b border-gray-200 pb-4">
                <label className="block text-gray-700">Phone:</label>
                <input
                  type="text"
                  className="mt-1 w-full border-gray-300"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="mb-4 border-b border-gray-200 pb-4">
                <label className="block text-gray-700">Address:</label>
                <input
                  type="text"
                  className="mt-1 w-full border-gray-300"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              {/* Add your buttons here */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                  className={`px-4 py-2 rounded-md text-white ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isEditing || isNewUser ? 'Save Profile' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleChangePassword}
        passwordError={passwordError}
        currentPassword={currentPassword}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        setCurrentPassword={setCurrentPassword}
        setNewPassword={setNewPassword}
        setConfirmPassword={setConfirmPassword}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </div>
  );
}

export default Profile;