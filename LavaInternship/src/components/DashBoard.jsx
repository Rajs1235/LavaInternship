import React from 'react';

const HRDashboard = () => {
  return (
    <div className="min-h-screen bg-[#dda5a5] flex flex-col items-center p-6 font-['Segoe_UI']">
      <div className="w-full max-w-5xl bg-[#EDDCD9] border-2 border-[#264143] rounded-2xl shadow-[3px_4px_0px_1px_#E99F4C] p-6">
        {/* Title */}
        <h1 className="text-3xl font-extrabold text-[#264143] mb-2 text-center">HR Dashboard</h1>
        <p className="text-lg font-semibold text-[#264143] mb-6 text-center">Track and classify resumes efficiently</p>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-center">
          <div className="bg-white rounded-xl border-2 border-[#264143] shadow-[3px_4px_0px_1px_#E99F4C] p-4">
            <h2 className="text-xl font-bold text-[#264143]">120</h2>
            <p className="text-sm font-semibold text-[#264143]">Resumes Processed</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-[#264143] shadow-[3px_4px_0px_1px_#E99F4C] p-4">
            <h2 className="text-xl font-bold text-[#264143]">75%</h2>
            <p className="text-sm font-semibold text-[#264143]">Classification Accuracy</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-[#264143] shadow-[3px_4px_0px_1px_#E99F4C] p-4">
            <h2 className="text-xl font-bold text-[#264143]">32</h2>
            <p className="text-sm font-semibold text-[#264143]">Shortlisted Candidates</p>
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-[#264143] mb-4">Recent Resumes</h3>
          <ul className="space-y-2">
            {['John Doe', 'Jane Smith', 'Aarav Kumar'].map((name, i) => (
              <li key={i} className="flex justify-between items-center bg-white border border-[#264143] px-4 py-2 rounded-lg shadow-[2px_2px_0px_0px_#E99F4C]">
                <span className="text-[#264143] font-semibold">{name}</span>
                <button className="bg-[#DE5499] text-white font-bold px-4 py-1 rounded-md hover:opacity-90">
                  View
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Upload Button */}
        <div className="flex justify-center">
          <button className="btn text-white bg-[#DE5499] font-bold py-3 px-6 rounded-xl shadow-[3px_3px_0px_0px_#E99F4C] hover:opacity-90">
            Upload New Resume
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
