import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer
} from 'recharts';

const COLORS = ['#264143', '#DE5499', '#E99F4C'];

const HRDashboard = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const navigate = useNavigate();

  const [genderData, setGenderData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const { data } = await axios.get('https://k2kqvumlg6.execute-api.ap-south-1.amazonaws.com/getResume');
        setCandidates(data);
        processStats(data);
      } catch (err) {
        console.error("Error fetching candidates:", err);
      }
    };

    const processStats = (data) => {
      // Gender distribution
      const genderCount = data.reduce((acc, curr) => {
        const gender = curr.gender || 'Unknown';
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      }, {});

      setGenderData(Object.entries(genderCount).map(([name, value]) => ({ name, value })));

      // Status distribution (you can change 'status' to whatever field you store this in)
      const statusCount = data.reduce((acc, curr) => {
        const status = curr.status || 'Not Available';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      setStatusData(Object.entries(statusCount).map(([name, value]) => ({ name, value })));
    };

    fetchCandidates();
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-[#dda5a5] flex font-['Segoe_UI']">
      {/* Sidebar */}
      <div className="w-1/4 min-h-screen bg-white border-r border-[#264143] p-4 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#264143]">HR Dashboard</h2>
          <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
            Logout
          </button>
        </div>

        <h3 className="text-lg font-semibold text-[#264143] mb-4">Candidates</h3>
        <ul className="space-y-2">
          {candidates.map(c => (
            <li
              key={c.resume_id}
              className={`p-2 border rounded-md shadow-sm cursor-pointer ${
                selectedCandidate?.resume_id === c.resume_id ? 'bg-[#EDDCD9]' : ''
              }`}
              onClick={() => setSelectedCandidate(c)}
            >
              <p className="font-semibold text-[#264143]">{c.first_name} {c.last_name}</p>
              <p className="text-xs text-gray-600">{c.email}</p>
              <button className="text-sm text-blue-600 hover:underline mt-1">View Profile</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Panel */}
      <div className="w-3/4 p-6 overflow-auto">
        {!selectedCandidate ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gender Chart */}
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

            {/* Status Chart */}
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
          </div>
        ) : (
          <div className="bg-white border-2 border-[#264143] rounded-xl shadow-md p-6 space-y-4">
            <h2 className="text-2xl font-bold text-[#264143]">{selectedCandidate.first_name} {selectedCandidate.last_name}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <p>📧 {selectedCandidate.email}</p>
              <p>📞 {selectedCandidate.phone}</p>
              <p>🚻 {selectedCandidate.gender}</p>
              <p>🎓 Grad: {selectedCandidate.grad_marks}% ({selectedCandidate.grad_year})</p>
              <p>🏫 12th: {selectedCandidate.marks12}% ({selectedCandidate.pass12})</p>
              <p>💼 Prefers: {selectedCandidate.work_pref}</p>
              <p>🔗 <a href={selectedCandidate.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 underline">LinkedIn Profile</a></p>
            </div>

            <div>
              <h3 className="font-semibold text-[#264143] mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCandidate.skills.map((skill, idx) => (
                  <span key={idx} className="bg-[#264143] text-white text-xs px-2 py-1 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[#264143] mb-2">Organizations</h3>
              <div className="flex flex-wrap gap-2">
                {selectedCandidate.entities?.ORGANIZATION?.map((org, idx) => (
                  <span key={idx} className="bg-[#264143] text-white text-xs px-2 py-1 rounded-full">
                    {org}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md" onClick={() => alert(`${selectedCandidate.first_name} advanced!`)}>
                ✅ Advance
              </button>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md" onClick={() => alert(`${selectedCandidate.first_name} rejected.`)}>
                ❌ Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRDashboard;
