import { useAuth } from '../auth/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function LogoutButton() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/exercises'); // Redirect to login or home page
    };

    return <Link to='/exercises' onClick={handleLogout}>Logout</Link>
};
