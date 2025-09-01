import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SliderImageUploader from '../components/Slider';

const Dashboard = () => {
  const [bikes, setBikes] = useState([]);
  const [pendingReservations, setPendingReservations] = useState(0);
  const [newSubmissions, setNewSubmissions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/dashboard-stats');
        const { bikes, pendingReservations, newSubmissions } = response.data;
        setBikes(bikes || []);
        setPendingReservations(pendingReservations || 0);
        setNewSubmissions(newSubmissions || 0);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const totalStock = bikes.reduce((sum, bike) => sum + Number(bike.stock || 0), 0);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white shadow p-4 rounded">
          <h3 className="text-lg font-semibold">Total Bikes in Stock</h3>
          <p className="text-2xl">{totalStock}</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <h3 className="text-lg font-semibold">Pending Reservations</h3>
          <p className="text-2xl">{pendingReservations}</p>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <h3 className="text-lg font-semibold">New Submissions</h3>
          <p className="text-2xl">{newSubmissions}</p>
        </div>
      </div>

      {/* Slider Image Management */}
      {/* You can remove/comment this if slider images are managed elsewhere */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold mb-4">Manage Homepage Slider</h3>
        <SliderImageUploader />
      </div>
    </div>
  );
};

export default Dashboard;
