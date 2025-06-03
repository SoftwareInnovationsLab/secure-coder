import { createContext, useContext, useState, ReactNode } from 'react';

interface BreadcrumbItem {
    label: string;
    path?: string; // Optional: if you want breadcrumb links
}

interface BreadcrumbContextType {
    breadcrumb: BreadcrumbItem[];
    setBreadcrumb: (items: BreadcrumbItem[]) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export const BreadcrumbProvider = ({ children }: { children: ReactNode }) => {
    const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);

    return (
        <BreadcrumbContext.Provider value={{ breadcrumb, setBreadcrumb }}>
            {children}
        </BreadcrumbContext.Provider>
    );
};

export const useBreadcrumb = () => {
    const context = useContext(BreadcrumbContext);
    if (!context) throw new Error('useBreadcrumb must be used within BreadcrumbProvider');
    return context;
};
