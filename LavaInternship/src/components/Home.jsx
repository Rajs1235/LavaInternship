import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center ">
      <div className="bg-white border-2 border-[#264143] rounded-2xl shadow-[3px_4px_0px_1px_#E99F4C] p-10 max-w-xl w-full text-center">
        <h1 className="text-3xl font-extrabold text-[#264143] mb-2">Welcome to Resume Portal</h1>
        <p className="text-lg text-[#DE5499] mb-6 font-semibold">
          Streamline your resume submission and review process!
        </p>
        <p className="text-[#264143] mb-8">
          Candidates can upload their resumes for automated extraction and review.<br />
          HR can manage, review, and process applications efficiently.
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="btn bg-[#DE5499] text-white font-bold w-60 py-3 rounded-lg shadow hover:opacity-90 transition"
        >
          Get Started
        </button>
        <div className="mt-10 text-xs text-gray-500">
          <span>Made for placements & recruitment</span>
        </div>
      </div>
    </div>
  );
};

export default Home;
