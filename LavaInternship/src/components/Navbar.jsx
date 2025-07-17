import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';

const Navbar = ({ onHomeClick }) => {
    const navigate = useNavigate();

    const handleHome = () => {
        if (onHomeClick) onHomeClick(); // reset selectedCandidate in parent
        navigate('/dashboard');
    };

    const handleCandidateDatabase = () => {
        navigate('/candidate-database');
    };

    const handlePostJob = () => {
        navigate('/post-job');
    };

    // New handler for Manage Jobs
    const handleManageJobs = () => {
        navigate('/manage-jobs');
    };

    const handleLogout = async () => {
        await signOut();
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

                        <button onClick={handleCandidateDatabase} className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-[#3a5a5c] transition-colors duration-200">
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            Candidate Database
                        </button>

                        {/* New Manage Jobs Button */}
                        <button onClick={handleManageJobs} className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-[#3a5a5c] transition-colors duration-200">
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            Manage Jobs
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