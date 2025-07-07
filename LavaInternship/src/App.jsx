import { useState } from 'react'

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.css'
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import HRDashboard from './components/DashBoard';
import StudentResumeForm from './components/StudentResumeForm';
function App() {

  return (<>
     <BrowserRouter>
          <Routes>
            {/* Public Routes */}
        
            <Route path="/" element={<Home />} />
             <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
         <Route path="/dashboard" element={<HRDashboard />} />
<Route path="/studentform" element={<StudentResumeForm />} />
          </Routes>
        </BrowserRouter>
    </> )
}

export default App
