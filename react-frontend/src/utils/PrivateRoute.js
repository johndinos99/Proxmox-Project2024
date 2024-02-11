import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom'
import AuthContext from '../context/AuthContext';

// Function for preventing any unauthorized user from accessing protected routes.
const PrivateRoutes = () => {
    let { user } = useContext(AuthContext);
    
    return (
        user ? <Outlet /> : <Navigate to='/login' replace />
    );
};

export default PrivateRoutes;