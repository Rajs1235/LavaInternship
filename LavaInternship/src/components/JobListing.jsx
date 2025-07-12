import React, { useState, useEffect } from 'react';
import { MapPin, Clock, DollarSign, Users, Calendar, Building, Briefcase, Star } from 'lucide-react';
// import { FaRupeeSign } from 'react-icons/fa';

const JobListing = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [filters, setFilters] = useState({
        department: '',
        workType: '',
        workMode: '',
        experienceLevel: '',
        search: ''
    });

    // Fetch jobs from API
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const res = await fetch("https://4vj8gtysxi.execute-api.ap-south-1.amazonaws.com/JobListings");
                const data = await res.json();

                if (data.status === "success" && data.data) {
                    const groupedJobs = data.data;

                    // Flatten grouped jobs
                    const allJobs = Object.values(groupedJobs).flat().map((job, index) => ({
                        ...job,
                        id: index + 1, // provide fallback ID
                        jobTitle: job.jobTitle ?? "Untitled Job",
                        workType: job.workType ?? "N/A",
                        workMode: job.workMode ?? "N/A",
                        experienceLevel: job.experienceLevel ?? "N/A",
                        minExperience: job.minExperience ?? "0",
                        maxExperience: job.maxExperience ?? "0",
                        minSalary: job.minSalary ?? "0",
                        maxSalary: job.maxSalary ?? "0",
                        currency: job.currency ?? "INR",
                        postedDate: job.posting_date ?? new Date().toISOString(),
                        status: job.status ?? "Active"
                    }));

                    setJobs(allJobs);
                    setFilteredJobs(allJobs);
                } else {
                    console.error("Invalid response format", data);
                }
            } catch (error) {
                console.error("Error fetching jobs:", error);
            }
        };

        fetchJobs();
    }, []);

    useEffect(() => {
        filterJobs();
    }, [filters, jobs]);

    const filterJobs = () => {
        let filtered = jobs.filter(job => {
            const matchesSearch = job.jobTitle.toLowerCase().includes(filters.search.toLowerCase()) ||
                job.department?.toLowerCase().includes(filters.search.toLowerCase()) ||
                job.location?.toLowerCase().includes(filters.search.toLowerCase());
            const matchesDepartment = !filters.department || job.department === filters.department;
            const matchesWorkType = !filters.workType || job.workType === filters.workType;
            const matchesWorkMode = !filters.workMode || job.workMode === filters.workMode;
            const matchesExperienceLevel = !filters.experienceLevel || job.experienceLevel === filters.experienceLevel;

            return matchesSearch && matchesDepartment && matchesWorkType && matchesWorkMode && matchesExperienceLevel;
        });

        setFilteredJobs(filtered);
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const formatSalary = (min, max, currency) => {
        const formatNumber = (num) => {
            const number = parseInt(num);
            if (number >= 10000000) return `${(number / 10000000).toFixed(1)}Cr`;
            if (number >= 100000) return `${(number / 100000).toFixed(1)}L`;
            if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
            return number.toString();
        };

        const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
        return `${symbol}${formatNumber(min)} - ${symbol}${formatNumber(max)}`;
    };

    const getTimeAgo = (dateString) => {
        const now = new Date();
        const posted = new Date(dateString);
        const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));

        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        const diffInWeeks = Math.floor(diffInDays / 7);
        return `${diffInWeeks}w ago`;
    };

    const resetFilters = () => {
        setFilters({
            department: '',
            workType: '',
            workMode: '',
            experienceLevel: '',
            search: ''
        });
    };

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8 mt-12 sm:mt-16 md:mt-20">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Openings</h1>
                    <p className="text-gray-600">Discover exciting career opportunities</p>
                </div>
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8 sticky top-0 z-10 backdrop-blur-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <input
                                type="text"
                                placeholder="Search jobs, departments, locations..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Department Filter */}
                        <div>
                            <select
                                value={filters.department}
                                onChange={(e) => handleFilterChange('department', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Departments</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Design">Design</option>
                                <option value="Sales">Sales</option>
                                <option value="HR">HR</option>
                                <option value="Finance">Finance</option>
                            </select>
                        </div>

                        {/* Work Type Filter */}
                        <div>
                            <select
                                value={filters.workType}
                                onChange={(e) => handleFilterChange('workType', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Types</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                            </select>
                        </div>

                        {/* Work Mode Filter */}
                        <div>
                            <select
                                value={filters.workMode}
                                onChange={(e) => handleFilterChange('workMode', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Modes</option>
                                <option value="On-site">On-site</option>
                                <option value="Remote">Remote</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>

                        {/* Reset Button */}
                        <div>
                            <button
                                onClick={resetFilters}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-black-600">
                        Showing {filteredJobs.length} of {jobs.length} jobs
                    </p>
                </div>

                {/* Scrollable Job Listings */}
                <div className="overflow-y-auto max-h-[calc(100vh-250px)] pr-2">

                    {/* Job Cards */}
                    <div className="space-y-6">
                        {filteredJobs.map(job => (
                            <div key={job.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                                <div className="p-6">
                                    {/* Job Header */}
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-xl font-bold text-gray-900">{job.jobTitle}</h3>
                                                {job.isUrgent && (
                                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                                        <Star className="w-3 h-3" />
                                                        Urgent
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                                                <div className="flex items-center gap-1">
                                                    <Building className="w-4 h-4" />
                                                    {job.department}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {job.location}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Briefcase className="w-4 h-4" />
                                                    {job.workType} • {job.workMode}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {getTimeAgo(job.postedDate)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-1 text-green-600 font-semibold">
                                                {/* <FaRupeeSign className="w-4 h-4" /> */}
                                                {formatSalary(job.minSalary, job.maxSalary, job.currency)}
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <Users className="w-4 h-4" />
                                                {job.positionsAvailable} position{job.positionsAvailable > 1 ? 's' : ''}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Job Description */}
                                    <p className="text-gray-700 mb-4 line-clamp-2">{job.jobDescription}</p>

                                    {/* Skills */}
                                    <div className="mb-4">
                                        <div className="flex flex-wrap gap-2">
                                            {Array.isArray(job.skills) && job.skills.length > 0 ? (
                                                <>
                                                    {job.skills.slice(0, 3).map((skill, index) => (
                                                        <span
                                                            key={index}
                                                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {job.skills.length > 5 && (
                                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                                            +{job.skills.length - 5} more
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-gray-400 italic">Skills not specified</span>
                                            )}
                                        </div>
                                    </div>


                                    {/* Job Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">Experience: </span>
                                            <span className="text-gray-600">{job.minExperience}-{job.maxExperience} years</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Deadline: </span>
                                            <span className="text-gray-600 flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(job.applicationDeadline).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium">
                                            Apply Now
                                        </button>
                                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                                            View Details
                                        </button>
                                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                                            Save
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* No Results */}
                {filteredJobs.length === 0 && (
                    <div className="text-center py-12">
                        <div className="bg-white rounded-lg shadow-md p-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                            <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                            <button
                                onClick={resetFilters}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobListing;