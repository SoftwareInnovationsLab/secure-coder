import { Link } from 'react-router-dom';
import { useBreadcrumb } from '../context/BreadcrumbsContext';

const Breadcrumbs = () => {
    const { breadcrumb } = useBreadcrumb();

    return (
        <nav>
            {breadcrumb.map((item, index) => (
                <span key={index}>
                    {item.path ? <Link to={item.path}>{item.label}</Link> : item.label}
                    {index < breadcrumb.length - 1 && ' / '}
                </span>
            ))}
        </nav>
    );
};

export default Breadcrumbs;
