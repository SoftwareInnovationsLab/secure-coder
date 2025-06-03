import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    isSuperUser: boolean;
    login: (password: string) => boolean;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_PASSWORD = 'password'; // Move to .env for better security
const SUPER_PASSWORD = 'password123'; // Move to .env for better security

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSuperUser, setIsSuperUser] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('isAuthenticated');
        if (stored === 'true') {
            setIsAuthenticated(true);
        }
        const storedSuper = localStorage.getItem('isSuperUser');
        if (storedSuper === 'true') {
            setIsSuperUser(true);
        }
        setIsLoading(false);
    }, []);

    const login = (password: string) => {
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            localStorage.setItem('isAuthenticated', 'true');
            return true;
        } else if (password == SUPER_PASSWORD) {
            setIsAuthenticated(true);
            setIsSuperUser(true);
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('isSuperUser', 'true');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        setIsSuperUser(false);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('isSuperUser');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isSuperUser, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
