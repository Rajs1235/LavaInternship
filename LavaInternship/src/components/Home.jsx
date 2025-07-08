import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaLaptopCode } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const [isStudent, setIsStudent] = useState(false);

  const handleGetStarted = () => {
    if (isStudent) {
      // Students go directly to resume form without authentication
      navigate('/studentform');
    } else {
      // HR users go to Cognito login
      navigate('/hr-login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      {/* Toggle Switch */}
      <div className="absolute top-10">
        <div className="toggleWrapper">
          <input
            className="input"
            id="roleSwitch"
            type="checkbox"
            checked={isStudent}
            onChange={() => setIsStudent(!isStudent)}
          />
          <label className="toggle" htmlFor="roleSwitch">
            <span className="toggle__handler">
              <span className="crater crater--1"></span>
              <span className="crater crater--2"></span>
              <span className="crater crater--3"></span>
            </span>
            <span className="star star--1"></span>
            <span className="star star--2"></span>
            <span className="star star--3"></span>
            <span className="star star--4"></span>
            <span className="star star--5"></span>
            <span className="star star--6"></span>
          </label>
        </div>
        <div className="flex justify-between mt-20 w-full px-12 text-4xl text-[#264143]">
          <FaLaptopCode className={!isStudent ? '' : 'opacity-30'} />
          <FaUserGraduate className={isStudent ? '' : 'opacity-30'} />
        </div>
      </div>

      {/* Card */}
      <div className="bg-white border-2 border-[#264143] rounded-2xl shadow-[3px_4px_0px_1px_#E99F4C] p-10 max-w-xl w-full text-center mt-40">
        <h1 className="text-3xl font-extrabold text-[#264143] mb-2">Welcome to Resume Portal</h1>
        <p className="text-lg text-[#DE5499] mb-6 font-semibold">
          Streamline your resume submission and review process!
        </p>
        <p className="text-[#264143] mb-8">
          {isStudent
            ? "Submit your resume for instant analysis and guidance."
            : "HRs can manage, review, and process applications efficiently."}
        </p>

        <button
          onClick={handleGetStarted}
          className={`btn font-bold w-60 py-3 rounded-lg shadow hover:opacity-90 transition text-white ${
            isStudent 
              ? 'bg-[#264143]' 
              : 'bg-[#DE5499]'
          }`}
        >
          {isStudent ? 'Upload Resume' : 'HR Login'}
        </button>

        <div className="mt-10 text-xs text-gray-500">
          <span>Made for placements & recruitment</span>
        </div>
      </div>
    </div>
  );
};

export default Home;