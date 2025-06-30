import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Simple token check - no complex validation
  const token = localStorage.getItem('token');
  
  if (!token) {
    // console.log(' No token found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // console.log(' Token found, rendering protected content');
  return children;
};

export default PrivateRoute;
