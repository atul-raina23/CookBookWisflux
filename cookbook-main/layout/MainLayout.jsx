

import { Outlet } from 'react-router-dom';
import { Navbar } from '../component/Navbar';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-800">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Outlet /> {/* This renders the child routes */}
      </main>
    </div>
  );
};