import { Link } from 'react-router-dom';
import { HiOutlineHome } from 'react-icons/hi';

const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-primary-600">404</h1>
                <h2 className="text-3xl font-bold text-gray-800 mt-4">
                    Page Not Found
                </h2>
                <p className="text-gray-600 mt-2 max-w-md mx-auto">
                    Sorry, we couldn't find the page you're looking for. 
                    It might have been moved or doesn't exist.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center mt-6 btn-primary"
                >
                    <HiOutlineHome className="mr-2 h-5 w-5" />
                    Back to Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
