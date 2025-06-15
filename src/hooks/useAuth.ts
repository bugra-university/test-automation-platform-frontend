import { useContext } from 'react';
import AuthContext from '../contexts/authContext';

// Auth functions are now directly available from AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};
