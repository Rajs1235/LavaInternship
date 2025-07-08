import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const genderData = [
  { name: 'Male', value: 60 },
  { name: 'Female', value: 40 },
];

const statusData = [
  { name: 'Processed', value: 80 },
  { name: 'Current', value: 25 },
  { name: 'Under Review', value: 15 },
];

const COLORS = ['#264143', '#DE5499', '#E99F4C'];

const candidates = [
  {
    name: 'Fred Flinstone',
    location: 'Bedrock, NY',
    phone: '724-524-0868',
    email: 'fred@rockmail.com',
    job: 'Job Approval Approver',
    doc: 'fred.docx',
    image: 'https://upload.wikimedia.org/wikipedia/en/1/16/Fred_Flintstone.png',
  },
  {
    name: 'Jane Smith',
    location: 'Springfield, IL',
    phone: '123-456-7890',
    email: 'jane@smithmail.com',
    job: 'UI Designer',
    doc: 'jane.pdf',
    image: 'https://via.placeholder.com/150',
  },
  {
    name: 'Aarav Kumar',
    location: 'Delhi, India',
    phone: '987-654-3210',
    email: 'aarav@kumar.com',
    job: 'Frontend Developer',
    doc: 'aarav.docx',
    image: 'https://via.placeholder.com/150/0000FF/808080?Text=Aarav',
  },
];

const HRDashboard = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#dda5a5] flex font-['Segoe_UI']">
      {/* Sidebar */}
      <div className="w-1/4 min-h-screen bg-white border-r border-[#264143] p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#264143]">HR Dashboard</h2>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
        
        <h3 className="text-lg font-semibold text-[#264143] mb-4">Candidates</h3>
        <ul className="space-y-2">
          {candidates.map((candidate, i) => (
            <li
              key={i}
              className={`p-2 border rounded-md shadow-sm cursor-pointer ${
                selectedCandidate?.name === candidate.name ? 'bg-[#EDDCD9]' : ''
              }`}
              onClick={() => setSelectedCandidate(candidate)}
            >
              <p className="font-semibold text-[#264143]">{candidate.name}</p>
              <p className="text-xs text-gray-600">Job: {candidate.job}</p>
              <button className="mt-1 text-sm text-blue-600 hover:underline">
                View Profile
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Panel */}
      <div className="w-3/4 min-h-screen p-6 flex flex-col gap-6">
        {!selectedCandidate ? (
          <>
            {/* Default View: Charts */}
            <div className="bg-white p-4 border-2 border-[#264143] rounded-xl shadow-md">
              <h2 className="text-xl font-bold text-[#264143] mb-4">Gender Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`gender-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 border-2 border-[#264143] rounded-xl shadow-md">
              <h2 className="text-xl font-bold text-[#264143] mb-4">Application Status</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`status-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <>
            {/* Candidate Details */}
            <div className="bg-[#EDDCD9] border-2 border-[#264143] rounded-xl shadow-[3px_4px_0px_1px_#E99F4C] p-4">
              <h1 className="text-2xl font-extrabold text-[#264143]">{selectedCandidate.name}</h1>
              <p className="text-sm text-[#264143]">
                Applied for: <span className="font-semibold">{selectedCandidate.job}</span>
              </p>
              <div className="mt-2 flex gap-4 text-sm text-gray-600">
                <span>📍 {selectedCandidate.location}</span>
                <span>📞 {selectedCandidate.phone}</span>
                <span>✉️ {selectedCandidate.email}</span>
              </div>

              {/* Buttons */}
              <div className="mt-4 flex gap-4">
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md"
                  onClick={() => alert(`${selectedCandidate.name} advanced!`)}
                >
                  ✅ Advance
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md"
                  onClick={() => alert(`${selectedCandidate.name} rejected.`)}
                >
                  ❌ Reject
                </button>
              </div>
            </div>

            <div className="flex gap-6 mt-4">
              {/* Resume Viewer */}
              <div className="flex-1 bg-white border-2 border-[#264143] p-4 rounded-xl shadow-md">
                <h3 className="text-md font-bold text-[#264143] mb-2">Resume</h3>
                <div className="h-64 w-full flex items-center justify-center border rounded bg-gray-50">
                  <img src={selectedCandidate.image} alt="Resume" className="h-40" />
                </div>
              </div>

              {/* Task Panel */}
              <div className="w-1/3 bg-white border-2 border-[#264143] p-4 rounded-xl shadow-md flex flex-col gap-4">
                <div>
                  <h4 className="font-semibold text-[#264143]">Tasks</h4>
                  <p className="text-xs text-gray-600">No incomplete tasks</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#264143]">Documents</h4>
                  <p className="text-sm text-blue-600 hover:underline cursor-pointer">{selectedCandidate.doc}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-[#264143]">Categories</h4>
                  <p className="text-xs text-gray-600">None assigned</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HRDashboard;