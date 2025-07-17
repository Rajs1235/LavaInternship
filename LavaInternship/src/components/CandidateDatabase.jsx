import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Helper function to parse date strings like '17/07/2025, 21:49:58'
// It's good practice to keep pure helper functions outside the component
// so they aren't redefined on every render.
const parseCandidateDate = (dateStr) => {
    if (!dateStr) return null;
    const [datePart] = dateStr.split(',');
    if (!datePart) return null;
    const [day, month, year] = datePart.split('/');
    // Note: JavaScript's Date constructor is month-indexed (0-11)
    return new Date(year, month - 1, day);
};


const CandidateDatabase = () => {
    // State for the full, original list of candidates
    const [allCandidates, setAllCandidates] = useState([]);
    // State for the candidates that are actually displayed after filtering
    const [filteredCandidates, setFilteredCandidates] = useState([]);

    // State for filter values and search term
    const [filters, setFilters] = useState({
        gender: '',
        jobType: '', // Corresponds to 'department' in data
        experience: ''
    });
    const [searchTerm, setSearchTerm] = useState('');

    // State for dynamically populated filter options
    const [filterOptions, setFilterOptions] = useState({
        jobTypes: [],
        experiences: []
    });

    // State for loading and error handling
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Fetch all candidate data on component mount
    useEffect(() => {
        const fetchCandidates = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get('https://k2kqvumlg6.execute-api.ap-south-1.amazonaws.com/getResume');
                setAllCandidates(data);
                setFilteredCandidates(data); // Initially, show all candidates

                // Dynamically create filter options from the fetched data
                const jobTypes = [...new Set(data.map(c => c.department).filter(Boolean))];
                const experiences = [...new Set(data.map(c => c.experience).filter(Boolean))];
                setFilterOptions({ jobTypes, experiences });

            } catch (err) {
                console.error("Error fetching candidates:", err);
                setError("Failed to fetch candidate data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, []);

    // 2. Apply filters and search whenever their values change
    useEffect(() => {
        let processedCandidates = [...allCandidates];

        // Apply search term
        if (searchTerm) {
            processedCandidates = processedCandidates.filter(c =>
                (c.first_name && c.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (c.last_name && c.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Apply gender filter
        if (filters.gender) {
            processedCandidates = processedCandidates.filter(c => c.gender === filters.gender);
        }

        // Apply job type (department) filter
        if (filters.jobType) {
            processedCandidates = processedCandidates.filter(c => c.department === filters.jobType);
        }

        // Apply experience filter
        if (filters.experience) {
            processedCandidates = processedCandidates.filter(c => c.experience === filters.experience);
        }

        setFilteredCandidates(processedCandidates);

    }, [searchTerm, filters, allCandidates]);


    // Helper functions are now correctly inside the component
    const handleFilterChange = (filterName, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [filterName]: value
        }));
    };
    
    const clearAllFilters = () => {
        setSearchTerm('');
        setFilters({
            gender: '',
            jobType: '',
            experience: ''
        });
    };

    // The return statement is now correctly inside the component function
    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8  ">
            <div className="max-w-7xl mx-auto">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Candidate Database</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Search, filter, and view all candidate submissions.</p>
                </header>

                {/* Filter and Search Controls */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {/* Search Bar */}
                        <div className="sm:col-span-2 lg:col-span-4 xl:col-span-2">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Search by Name/Email</label>
                            <input
                                id="search"
                                type="text"
                                placeholder="e.g., Jane Doe..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Gender Filter */}
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Gender</label>
                            <select
                                id="gender"
                                value={filters.gender}
                                onChange={(e) => handleFilterChange('gender', e.target.value)}
                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Genders</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                            </select>
                        </div>

                        {/* Job Type Filter */}
                        <div>
                            <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Job Type</label>
                            <select
                                id="jobType"
                                value={filters.jobType}
                                onChange={(e) => handleFilterChange('jobType', e.target.value)}
                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Types</option>
                                {filterOptions.jobTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Experience Filter */}
                        <div>
                            <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Experience</label>
                            <select
                                id="experience"
                                value={filters.experience}
                                onChange={(e) => handleFilterChange('experience', e.target.value)}
                                className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Ranges</option>
                                {filterOptions.experiences.sort().map(exp => (
                                     <option key={exp} value={exp}>{exp}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-4">
                        <button 
                            onClick={clearAllFilters}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>

                {/* Candidate Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 uppercase">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Name</th>
                                    <th scope="col" className="px-6 py-3">Contact</th>
                                    <th scope="col" className="px-6 py-3">Job Type</th>
                                    <th scope="col" className="px-6 py-3">Experience</th>
                                    <th scope="col" className="px-6 py-3">Grad. Marks</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Submitted At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" className="text-center p-6">Loading candidates...</td></tr>
                                ) : error ? (
                                    <tr><td colSpan="7" className="text-center p-6 text-red-500">{error}</td></tr>
                                ) : filteredCandidates.length > 0 ? (
                                    filteredCandidates.map(candidate => (
                                        <tr key={candidate.resume_id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                {candidate.first_name} {candidate.last_name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-normal text-gray-500 dark:text-gray-400">{candidate.email}</div>
                                                <div>{candidate.phone}</div>
                                            </td>
                                            <td className="px-6 py-4">{candidate.department || 'N/A'}</td>
                                            <td className="px-6 py-4">{candidate.experience || 'N/A'}</td>
                                            <td className="px-6 py-4">{candidate.grad_marks ? `${candidate.grad_marks}%` : 'N/A'}</td>
                                            <td className="px-6 py-4">{candidate.status || 'N/A'}</td>
                                            <td className="px-6 py-4">{candidate.datetime ? parseCandidateDate(candidate.datetime).toLocaleDateString() : 'N/A'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="7" className="text-center p-6">No candidates match the current filters.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                     <div className="p-4 text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-700">
                        Showing {filteredCandidates.length} of {allCandidates.length} total candidates.
                    </div>
                </div>
            </div>
        </div>
    );
}; // <-- This is the correctly placed closing brace for the component

export default CandidateDatabase;
