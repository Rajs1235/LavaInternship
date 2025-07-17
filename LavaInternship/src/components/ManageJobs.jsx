import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

// Live API Endpoints
const GET_JOBS_API = 'https://4vj8gtysxi.execute-api.ap-south-1.amazonaws.com/JobListings';
const GET_RESUMES_API = 'https://k2kqvumlg6.execute-api.ap-south-1.amazonaws.com/getResume';
const UPDATE_JOB_STATUS_API = 'https://jd8992ps66.execute-api.ap-south-1.amazonaws.com/updatejobstatus';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingJobId, setUpdatingJobId] = useState(null); // State to track which job is being updated

  // This function fetches the initial data when the component mounts.
  const fetchJobsAndSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('=== FETCHING JOBS & RESUMES ===');
      
      // Fetch both jobs and resumes data in parallel for efficiency
      const [jobsResponse, resumesResponse] = await Promise.all([
        axios.get(GET_JOBS_API),
        axios.get(GET_RESUMES_API)
      ]);

      console.log('✅ Jobs API Response Received');
      console.log('✅ Resumes API Response Received');

      // 1. Process resumes to get submission counts per job ID
      const resumes = resumesResponse.data;
      const submissionCounts = resumes.reduce((acc, resume) => {
        if (resume.jobId) {
          acc[resume.jobId] = (acc[resume.jobId] || 0) + 1;
        }
        return acc;
      }, {});
      console.log('📊 Submission Counts Calculated:', submissionCounts);

      // 2. Process and flatten the nested jobs data from the API response
      const rawJobData = jobsResponse.data.data;
      const flattenedJobs = Object.values(rawJobData).flat();

      // 3. Combine job data with their respective submission counts
      const jobsWithCounts = flattenedJobs.map(job => ({
        ...job,
        submissionCount: submissionCounts[job.job_id] || 0,
      }));

      setJobs(jobsWithCounts);
      console.log('✅ Processed jobs with counts:', jobsWithCounts);

    } catch (err) {
      console.error("❌ Error fetching data:", err);
      setError("Failed to fetch job data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  // useEffect hook to call the fetch function once on component mount.
  useEffect(() => {
    fetchJobsAndSubmissions();
  }, []);

  // This function handles the logic for toggling a job's status.
  const toggleJobStatus = async (jobId, currentStatus) => {
    // Prevent multiple simultaneous updates
    if (updatingJobId) return;

    setUpdatingJobId(jobId); // Set loading state for the specific button
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

    // Store the original state in case the API call fails and we need to revert.
    const originalJobs = [...jobs];

    // Optimistic UI Update: Update the state immediately for a responsive feel.
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.job_id === jobId ? { ...job, status: newStatus } : job
      )
    );

    try {
      console.log(`=== UPDATING JOB STATUS for ${jobId} to ${newStatus} ===`);
      
      // Make the actual API call to the backend
      await axios.post(UPDATE_JOB_STATUS_API, {
        job_id: jobId,
        status: newStatus,
      });
      
      console.log(`✅ Job status updated successfully for ${jobId}.`);
      // On success, the optimistic update is already correct. No further action is needed.

    } catch (err) {
      console.error("❌ Failed to update job status:", err);
      alert("Failed to update job status. Reverting change.");
      // If the API call fails, revert the UI to its original state.
      setJobs(originalJobs);
    } finally {
      // Reset the loading state for the button regardless of success or failure.
      setUpdatingJobId(null);
    }
  };

  return (
    <div className="min-h-screen h-screen w-full bg-[#dda5a5] flex flex-col font-['Segoe_UI'] overflow-hidden">
      <Navbar />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto bg-white p-6 border-2 border-[#264143] rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-[#264143] mb-6">Manage Job Listings</h2>

          {loading && <p className="text-center text-gray-600">Loading job data...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job ID</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted Date</th>
                    <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job.job_id}>
                      <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{job.job_id}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.jobTitle}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">{job.department}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(job.postedDate).toLocaleDateString()}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold text-center">{job.submissionCount}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          job.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => toggleJobStatus(job.job_id, job.status)}
                          disabled={updatingJobId === job.job_id} // Disable button during update
                          className={`px-4 py-2 rounded-md text-white transition-colors w-28 text-center ${
                            job.status === 'Active' 
                              ? 'bg-red-500 hover:bg-red-600' 
                              : 'bg-green-500 hover:bg-green-600'
                          } ${updatingJobId === job.job_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {updatingJobId === job.job_id ? 'Updating...' : (job.status === 'Active' ? 'Deactivate' : 'Reactivate')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {jobs.length === 0 && (
                  <p className="text-center text-gray-500 mt-4">No jobs found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageJobs;
