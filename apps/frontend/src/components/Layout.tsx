import { Outlet } from 'react-router-dom';
import Title from './Title';
import { useAuth } from '../auth/AuthContext';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import Breadcrumbs from './Breadcrumbs';

export default function Layout() {
    const { isAuthenticated } = useAuth();

    return (
        <>
            <h1><Title />: Secure Programming Exercises</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto p-4">
                <div className="text-left"><Breadcrumbs /></div>
                <div className="text-right">
                    {isAuthenticated ? <LogoutButton /> : <LoginButton />}
                </div>
            </div>
            <main>
                <Outlet /> {/* Renders the matched child route */}
            </main>
        </>
    );
}
