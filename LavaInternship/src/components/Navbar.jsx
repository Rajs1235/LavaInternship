import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onHomeClick }) => {
    const navigate = useNavigate();

    const handleHome = () => {
        if (onHomeClick) onHomeClick(); // reset selectedCandidate in parent
        navigate('/dashboard');
    };

    const handlePostJob = () => {
        navigate('/post-job');
    };

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <nav className="bg-[#264143] text-white shadow-lg">
            <div className="max-w-full mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold">HR Dashboard</h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button onClick={handleHome} className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-[#3a5a5c] transition-colors duration-200">
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l9-9 9 9M4 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0h6" />
                            </svg>
                            Home
                        </button>

                        <button onClick={handlePostJob} className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-[#3a5a5c] transition-colors duration-200">
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Post Job
                        </button>

                        <button onClick={handleLogout} className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600 bg-red-500 transition-colors duration-200">
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
