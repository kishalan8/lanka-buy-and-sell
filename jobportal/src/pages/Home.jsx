import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, admin } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to JobListings</h1>
      <p className="text-xl text-gray-600 mb-8">
        Find your dream job or post job opportunities
      </p>

      <div className="flex justify-center space-x-4">
        {!user && !admin && (
          <>
            <Link
              to="/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 text-lg"
            >
              Sign Up
            </Link>
          </>
        )}

        {user && (
          <Link
            to="/jobs"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg"
          >
            Browse Jobs
          </Link>
        )}

        {admin && (
          <Link
            to="/admin"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg"
          >
            Admin Panel
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home;