
import { useAuth } from '../contexts/AuthContext';
import {  
  LogOut 
} from 'lucide-react';

function Layout() {
  const { signOut } = useAuth();


  return (
    <div className="min-h-screen bg-gray-50">
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
      
  );
}

export default Layout;