import React, { useState } from 'react';
import Dashboard from './AdminDashboard';
import AdminNewBikes from './AdminNewBikes';
import AdminUsedBikes from './AdminUsedBikes';
import AdminUsers from './AdminUsers';
import AdminSubmissions from './AdminSubmissions';
import AdminSlider from './AdminSlider'; 
import BikesPage from './BikesPage';

const AdminPage = () => {
  const [selectedSection, setSelectedSection] = useState('dashboard');

  const renderSection = () => {
    switch (selectedSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'bikes':
        return <BikesPage />;
      case 'new-bikes':
        return <AdminNewBikes />;
      case 'used-bikes':
        return <AdminUsedBikes />;
      case 'users':
        return <AdminUsers />;
      case 'submissions':
        return <AdminSubmissions />;
      case 'slider': // <-- add this case
        return <AdminSlider />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-64 h-screen bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <ul className="space-y-4">
          <li
            className={`cursor-pointer hover:text-yellow-400 ${selectedSection === 'dashboard' ? 'text-yellow-400' : ''}`}
            onClick={() => setSelectedSection('dashboard')}
          >
            Dashboard
          </li>
          <li
            className={`cursor-pointer hover:text-yellow-400 ${selectedSection === 'new-bikes' ? 'text-yellow-400' : ''}`}
            onClick={() => setSelectedSection('bikes')}
          >
            Bikes
          </li>
          <li
            className={`cursor-pointer hover:text-yellow-400 ${selectedSection === 'new-bikes' ? 'text-yellow-400' : ''}`}
            onClick={() => setSelectedSection('new-bikes')}
          >
            New Bikes
          </li>
          <li
            className={`cursor-pointer hover:text-yellow-400 ${selectedSection === 'used-bikes' ? 'text-yellow-400' : ''}`}
            onClick={() => setSelectedSection('used-bikes')}
          >
            Used Bikes
          </li>
          <li
            className={`cursor-pointer hover:text-yellow-400 ${selectedSection === 'users' ? 'text-yellow-400' : ''}`}
            onClick={() => setSelectedSection('users')}
          >
            Users
          </li>
          <li
            className={`cursor-pointer hover:text-yellow-400 ${selectedSection === 'submissions' ? 'text-yellow-400' : ''}`}
            onClick={() => setSelectedSection('submissions')}
          >
            Submissions
          </li>
          <li
            className={`cursor-pointer hover:text-yellow-400 ${selectedSection === 'slider' ? 'text-yellow-400' : ''}`}
            onClick={() => setSelectedSection('slider')}
          >
            Homepage Slider
          </li>
        </ul>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-100 p-6">
        {renderSection()}
      </main>
    </div>
  );
};

export default AdminPage;
