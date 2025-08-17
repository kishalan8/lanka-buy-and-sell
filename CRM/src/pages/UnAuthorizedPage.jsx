import React from "react";
import { Link } from "react-router-dom";

const UnauthorizedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Unauthorized</h1>
      <p className="mb-4">You don’t have permission to view this page.</p>
      <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded">
        Go to Login
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
