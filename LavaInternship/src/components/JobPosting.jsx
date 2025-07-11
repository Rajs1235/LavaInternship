import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const JobPostingForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        watch
    } = useForm({
        defaultValues: {
            jobTitle: '',
            department: '',
            location: '',
            workType: 'Full-time',
            workMode: 'On-site',
            experienceLevel: 'Entry Level',
            minExperience: '',
            maxExperience: '',
            minSalary: '',
            maxSalary: '',
            currency: 'INR',
            jobDescription: '',
            responsibilities: '',
            requirements: '',
            qualifications: '',
            skills: '',
            benefits: '',
            applicationDeadline: '',
            positionsAvailable: 1,
            reportingTo: '',
            contactEmail: '',
            isUrgent: false,
            allowRemote: false,
            travelRequired: false,
            backgroundCheckRequired: false
        }
    });

    const watchWorkType = watch('workType');

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            // Process skills and requirements as arrays
            const processedData = {
                ...data,
                skills: data.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
                requirements: data.requirements.split('\n').filter(req => req.trim()),
                responsibilities: data.responsibilities.split('\n').filter(resp => resp.trim()),
                qualifications: data.qualifications.split('\n').filter(qual => qual.trim()),
                benefits: data.benefits.split('\n').filter(benefit => benefit.trim()),
                postedDate: new Date().toISOString(),
                status: 'Active'
            };

            // Replace with your actual API endpoint
            // await axios.post('https://your-api-endpoint.com/jobs', processedData);

            console.log('Job posting data:', processedData);

            setSubmitSuccess(true);
            setTimeout(() => {
                setSubmitSuccess(false);
                reset();
                navigate('/hr-dashboard');
            }, 2000);

        } catch (error) {
            console.error('Error posting job:', error);
            alert('Failed to post job. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-stretch justify-start p-0 m-0 w-full" style={{ paddingTop: '120px' }}>
            <div className="w-full fixed top-0 left-0 z-50">
                <Navbar />
            </div>
            <div
                className="bg-white shadow-xl rounded-none p-4 w-full mx-0 my-0"
                style={{ maxHeight: '100vh', overflowY: 'auto' }}
            >
                {/* <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">
                    📝 Post New Job
                </h2> */}

                {/* Success Message */}
                {submitSuccess && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                        Job posted successfully! Redirecting to dashboard...
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                    {/* All form fields in a single grid container */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {/* Job Title */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Job Title *
                            </label>
                            <input
                                {...register('jobTitle', { required: 'Job title is required' })}
                                className={`w-full border-2 ${errors.jobTitle ? "border-red-500" : "border-gray-300"
                                    } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="e.g., Senior Software Engineer"
                            />
                            {errors.jobTitle && (
                                <p className="text-red-500 text-xs mt-1">{errors.jobTitle.message}</p>
                            )}
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Department *
                            </label>
                            <select
                                {...register('department', { required: 'Department is required' })}
                                className={`w-full border-2 ${errors.department ? "border-red-500" : "border-gray-300"
                                    } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                            >
                                <option value="">Select Department</option>
                                <option value="Engineering">Engineering</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Sales">Sales</option>
                                <option value="HR">Human Resources</option>
                                <option value="Finance">Finance</option>
                                <option value="Operations">Operations</option>
                                <option value="Design">Design</option>
                                <option value="Product">Product</option>
                                <option value="Customer Success">Customer Success</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.department && (
                                <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>
                            )}
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Location *
                            </label>
                            <input
                                {...register('location', { required: 'Location is required' })}
                                className={`w-full border-2 ${errors.location ? "border-red-500" : "border-gray-300"
                                    } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="e.g., Mumbai, Maharashtra, India"
                            />
                            {errors.location && (
                                <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>
                            )}
                        </div>

                        {/* Work Type */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Work Type *
                            </label>
                            <select
                                {...register('workType', { required: 'Work type is required' })}
                                className={`w-full border-2 ${errors.workType ? "border-red-500" : "border-gray-300"
                                    } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                            >
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                                <option value="Freelance">Freelance</option>
                            </select>
                            {errors.workType && (
                                <p className="text-red-500 text-xs mt-1">{errors.workType.message}</p>
                            )}
                        </div>

                        {/* Work Mode */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Work Mode *
                            </label>
                            <select
                                {...register('workMode', { required: 'Work mode is required' })}
                                className={`w-full border-2 ${errors.workMode ? "border-red-500" : "border-gray-300"
                                    } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                            >
                                <option value="On-site">On-site</option>
                                <option value="Remote">Remote</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                            {errors.workMode && (
                                <p className="text-red-500 text-xs mt-1">{errors.workMode.message}</p>
                            )}
                        </div>

                        {/* Experience Level */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Experience Level *
                            </label>
                            <select
                                {...register('experienceLevel', { required: 'Experience level is required' })}
                                className={`w-full border-2 ${errors.experienceLevel ? "border-red-500" : "border-gray-300"
                                    } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                            >
                                <option value="Entry Level">Entry Level (0-2 years)</option>
                                <option value="Mid Level">Mid Level (3-5 years)</option>
                                <option value="Senior Level">Senior Level (6-10 years)</option>
                                <option value="Executive Level">Executive Level (10+ years)</option>
                            </select>
                            {errors.experienceLevel && (
                                <p className="text-red-500 text-xs mt-1">{errors.experienceLevel.message}</p>
                            )}
                        </div>

                        {/* Min Experience */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Min Experience (years)
                            </label>
                            <input
                                {...register('minExperience', {
                                    min: { value: 0, message: 'Experience cannot be negative' },
                                    pattern: { value: /^\d+$/, message: 'Please enter a valid number' }
                                })}
                                type="number"
                                className={`w-full border-2 ${errors.minExperience ? "border-red-500" : "border-gray-300"
                                    } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="0"
                            />
                            {errors.minExperience && (
                                <p className="text-red-500 text-xs mt-1">{errors.minExperience.message}</p>
                            )}
                        </div>

                        {/* Max Experience */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Max Experience (years)
                            </label>
                            <input
                                {...register('maxExperience', {
                                    min: { value: 0, message: 'Experience cannot be negative' },
                                    pattern: { value: /^\d+$/, message: 'Please enter a valid number' }
                                })}
                                type="number"
                                className={`w-full border-2 ${errors.maxExperience ? "border-red-500" : "border-gray-300"
                                    } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="10"
                            />
                            {errors.maxExperience && (
                                <p className="text-red-500 text-xs mt-1">{errors.maxExperience.message}</p>
                            )}
                        </div>

                        {/* Currency */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Currency
                            </label>
                            <select
                                {...register('currency')}
                                className={`w-full border-2 ${errors.currency ? "border-red-500" : "border-gray-300"
                                    } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                            >
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>

                        {/* Min Salary */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Min Salary (Annual)
                            </label>
                            <input
                                {...register('minSalary', {
                                    pattern: { value: /^\d+$/, message: 'Please enter a valid number' }
                                })}
                                type="number"
                                className={`w-full border-2 ${errors.minSalary ? "border-red-500" : "border-gray-300"
                                    } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="500000"
                            />
                            {errors.minSalary && (
                                <p className="text-red-500 text-xs mt-1">{errors.minSalary.message}</p>
                            )}
                        </div>

                        {/* Max Salary */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Max Salary (Annual)
                            </label>
                            <input
                                {...register('maxSalary', {
                                    pattern: { value: /^\d+$/, message: 'Please enter a valid number' }
                                })}
                                type="number"
                                className={`w-full border-2 ${errors.maxSalary ? "border-red-500" : "border-gray-300"
                                    } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="800000"
                            />
                            {errors.maxSalary && (
                                <p className="text-red-500 text-xs mt-1">{errors.maxSalary.message}</p>
                            )}
                        </div>

                        {/* Application Deadline */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Application Deadline
                            </label>
                            <input
                                {...register('applicationDeadline')}
                                type="date"
                                className={`w-full border-2 ${errors.applicationDeadline ? "border-red-500" : "border-gray-300"
                                    } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                            />
                        </div>

                        {/* Positions Available */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Positions Available
                            </label>
                            <input
                                {...register('positionsAvailable', {
                                    min: { value: 1, message: 'Must be at least 1' },
                                    pattern: { value: /^\d+$/, message: 'Please enter a valid number' }
                                })}
                                type="number"
                                className={`w-full border-2 ${errors.positionsAvailable ? "border-red-500" : "border-gray-300"
                                    } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="1"
                            />
                            {errors.positionsAvailable && (
                                <p className="text-red-500 text-xs mt-1">{errors.positionsAvailable.message}</p>
                            )}
                        </div>

                        {/* Reporting To */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Reporting To
                            </label>
                            <input
                                {...register('reportingTo')}
                                className={`w-full border-2 ${errors.reportingTo ? "border-red-500" : "border-gray-300"
                                    } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="e.g., Engineering Manager"
                            />
                        </div>

                        {/* Contact Email */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Contact Email *
                            </label>
                            <input
                                {...register('contactEmail', {
                                    required: 'Contact email is required',
                                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Please enter a valid email' }
                                })}
                                type="email"
                                className={`w-full border-2 ${errors.contactEmail ? "border-red-500" : "border-gray-300"
                                    } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="hr@company.com"
                            />
                            {errors.contactEmail && (
                                <p className="text-red-500 text-xs mt-1">{errors.contactEmail.message}</p>
                            )}
                        </div>

                        {/* Job Description - Full width */}
                        <div className="md:col-span-2">
                            <label className="block font-semibold text-gray-700 mb-1">
                                Job Description *
                            </label>
                            <textarea
                                {...register('jobDescription', { required: 'Job description is required' })}
                                rows="4"
                                className={`w-full border-2 ${errors.jobDescription ? "border-red-500" : "border-gray-300"
                                    } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="Provide a comprehensive overview of the role..."
                            />
                            {errors.jobDescription && (
                                <p className="text-red-500 text-xs mt-1">{errors.jobDescription.message}</p>
                            )}
                        </div>

                        {/* Key Responsibilities - Full width */}
                        <div className="md:col-span-2">
                            <label className="block font-semibold text-gray-700 mb-1">
                                Key Responsibilities *
                            </label>
                            <textarea
                                {...register('responsibilities', { required: 'Responsibilities are required' })}
                                rows="5"
                                className={`w-full border-2 ${errors.responsibilities ? "border-red-500" : "border-gray-300"
                                    } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="List key responsibilities (one per line)&#10;• Develop and maintain software applications&#10;• Collaborate with cross-functional teams&#10;• Participate in code reviews"
                            />
                            {errors.responsibilities && (
                                <p className="text-red-500 text-xs mt-1">{errors.responsibilities.message}</p>
                            )}
                        </div>

                        {/* Requirements - Full width */}
                        <div className="md:col-span-2">
                            <label className="block font-semibold text-gray-700 mb-1">
                                Requirements *
                            </label>
                            <textarea
                                {...register('requirements', { required: 'Requirements are required' })}
                                rows="5"
                                className={`w-full border-2 ${errors.requirements ? "border-red-500" : "border-gray-300"
                                    } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="List requirements (one per line)&#10;• Bachelor's degree in Computer Science or related field&#10;• 3+ years of experience in software development&#10;• Strong problem-solving skills"
                            />
                            {errors.requirements && (
                                <p className="text-red-500 text-xs mt-1">{errors.requirements.message}</p>
                            )}
                        </div>

                        {/* Qualifications - Full width */}
                        <div className="md:col-span-2">
                            <label className="block font-semibold text-gray-700 mb-1">
                                Qualifications
                            </label>
                            <textarea
                                {...register('qualifications')}
                                rows="3"
                                className={`w-full border-2 ${errors.qualifications ? "border-red-500" : "border-gray-300"
                                    } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="List preferred qualifications (one per line)&#10;• Master's degree preferred&#10;• Industry certifications&#10;• Experience with specific tools or technologies"
                            />
                        </div>

                        {/* Required Skills - Full width */}
                        <div className="md:col-span-2">
                            <label className="block font-semibold text-gray-700 mb-1">
                                Required Skills *
                            </label>
                            <textarea
                                {...register('skills', { required: 'Skills are required' })}
                                rows="3"
                                className={`w-full border-2 ${errors.skills ? "border-red-500" : "border-gray-300"
                                    } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js, MongoDB, Git)"
                            />
                            {errors.skills && (
                                <p className="text-red-500 text-xs mt-1">{errors.skills.message}</p>
                            )}
                        </div>

                        {/* Benefits & Perks - Full width */}
                        <div className="md:col-span-2">
                            <label className="block font-semibold text-gray-700 mb-1">
                                Benefits & Perks
                            </label>
                            <textarea
                                {...register('benefits')}
                                rows="4"
                                className={`w-full border-2 ${errors.benefits ? "border-red-500" : "border-gray-300"
                                    } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="List benefits (one per line)&#10;• Health insurance&#10;• Flexible working hours&#10;• Professional development opportunities&#10;• Performance bonuses"
                            />
                        </div>

                        {/* Checkboxes - Full width */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center">
                                <input
                                    {...register('isUrgent')}
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">
                                    Mark as urgent hiring
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    {...register('travelRequired')}
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">
                                    Travel required for this position
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    {...register('backgroundCheckRequired')}
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">
                                    Background check required
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/hr-dashboard')}
                            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Posting Job...' : 'Post Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JobPostingForm;