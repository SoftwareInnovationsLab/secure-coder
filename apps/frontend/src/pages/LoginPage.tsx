import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';
import { useBreadcrumb } from '../context/BreadcrumbsContext';
import Title from '../components/Title';

const LoginPage = () => {
    const { login, isAuthenticated } = useAuth();
    const { setBreadcrumb } = useBreadcrumb();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        setBreadcrumb([
            { label: 'Home', path: '/' },
            { label: 'Login' }
        ])
    }, [setBreadcrumb]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(password)) {
            navigate('/exercises'); // or any protected route
        } else {
            setError('Incorrect password');
        }
    };

    return (
        <>
            {isAuthenticated ? <p>Already authenticated</p> :
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-6 text-left">
                    <h2 className="text-2xl font-bold">Admin Login</h2>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter admin password"
                    />
                    <button type="submit">Login</button>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </form>}
        </>
    );
};

export default LoginPage;
