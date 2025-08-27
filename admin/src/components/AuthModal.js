import React, { useState } from 'react';
import axios from 'axios';

const AuthModal = ({ onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleSubmit = async (e) => {
  e.preventDefault();
  const url = `http://localhost:5000/api/auth/${isSignUp ? 'signup' : 'signin'}`;
  try {
    const res = await axios.post(url, form);
    alert(res.data.message);

    if (!isSignUp) {
      // Save token and user info
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('name', res.data.name);
    }

    onClose();
  } catch (err) {
    alert(err.response?.data?.message || 'Error');
  }
};


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-80">
        <h2 className="text-lg font-bold mb-4">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <input
                type="text"
                placeholder="Name"
                className="w-full mb-2 p-2 border"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-2 p-2 border"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-2 p-2 border"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {isSignUp && (
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full mb-4 p-2 border"
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          )}
          <button type="submit" className="bg-blue-500 w-full py-2 text-white rounded">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        <p className="mt-2 text-sm">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button className="text-blue-600 ml-1" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
        <button onClick={onClose} className="mt-4 text-red-500 block w-full">Close</button>
      </div>
    </div>
  );
};

export default AuthModal;
