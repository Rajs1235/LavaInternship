import React, { useState } from 'react';

const StudentResumeForm = () => {
  const apiEndpoint = "https://70vamjew18.execute-api.ap-south-1.amazonaws.com/upload-url";
  const [toastVisible, setToastVisible] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateMarks = (marks) => {
    const num = parseFloat(marks);
    return !isNaN(num) && num >= 0 && num <= 100;
  };

  const validateYear = (year, type) => {
    const currentYear = new Date().getFullYear();
    const num = parseInt(year);

    if (type === '12th') {
      return num >= 1990 && num <= currentYear;
    } else if (type === 'graduation') {
      return num >= 1990 && num <= currentYear + 6;
    }
    return false;
  };

  const validateLinkedIn = (url) => {
    const linkedInRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
    return linkedInRegex.test(url);
  };

  const validateFile = (file) => {
    if (!file) return { valid: false, message: "Please select a PDF file" };

    if (file.type !== 'application/pdf') {
      return { valid: false, message: "Only PDF files are allowed" };
    }

    const sizeInKB = file.size / 1024;
    if (sizeInKB > 300) {
      return { valid: false, message: `File size is ${sizeInKB.toFixed(1)} KB. Maximum allowed is 300 KB` };
    }

    return { valid: true, message: "" };
  };

  const validateField = (name, value, file = null) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (!value.trim() || value.trim().length < 2) {
          newErrors[name] = "Name must be at least 2 characters long";
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'email':
        if (!validateEmail(value)) {
          newErrors[name] = "Please enter a valid email address";
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'contact':
        if (!validatePhone(value)) {
          newErrors[name] = "Please enter a valid 10-digit Indian mobile number";
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'pass12':
        if (!validateYear(value, '12th')) {
          newErrors[name] = "Please enter a valid 12th passing year (1990-current year)";
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'gradYear':
        if (!validateYear(value, 'graduation')) {
          newErrors[name] = "Please enter a valid graduation year";
        } else if (parseInt(value) < parseInt(document.getElementsByName('pass12')[0].value)) {
          newErrors[name] = "Graduation year cannot be before 12th passing year";
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'marks12':
      case 'gradMarks':
        if (!validateMarks(value)) {
          newErrors[name] = "Marks must be between 0 and 100";
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'Gender':
      case 'workPref':
        if (!value) {
          newErrors[name] = `Please select ${name === 'Gender' ? 'a gender' : 'work preference'}`;
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'linkedIn':
        if (!validateLinkedIn(value)) {
          newErrors[name] = "Please enter a valid LinkedIn profile URL";
        } else {
          delete newErrors[name];
        }
        break;
        
      case 'resume':
        const fileValidation = validateFile(file);
        if (!fileValidation.valid) {
          newErrors[name] = fileValidation.message;
        } else {
          delete newErrors[name];
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return !newErrors[name]; // Return true if no error for this field
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateField('resume', null, file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const file = e.target.resume.files[0];
    const formData = {
      name: e.target.name.value.trim(),
      email: e.target.email.value.trim(),
      contact: e.target.contact.value.trim(),
      pass12: e.target.pass12.value,
      gradYear: e.target.gradYear.value,
      marks12: e.target.marks12.value,
      gradMarks: e.target.gradMarks.value,
      gender: e.target.Gender.value,
      workPref: e.target.workPref.value,
      linkedIn: e.target.linkedIn.value.trim(),
      resume: file?.name || ''
    };

    // Validate all fields
    let isValid = true;
    isValid = validateField('name', formData.name) && isValid;
    isValid = validateField('email', formData.email) && isValid;
    isValid = validateField('contact', formData.contact) && isValid;
    isValid = validateField('pass12', formData.pass12) && isValid;
    isValid = validateField('gradYear', formData.gradYear) && isValid;
    isValid = validateField('marks12', formData.marks12) && isValid;
    isValid = validateField('gradMarks', formData.gradMarks) && isValid;
    isValid = validateField('Gender', formData.gender) && isValid;
    isValid = validateField('workPref', formData.workPref) && isValid;
    isValid = validateField('linkedIn', formData.linkedIn) && isValid;
    isValid = validateField('resume', null, file) && isValid;

    if (!isValid) {
      // Scroll to the first error
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        document.getElementsByName(firstError)[0]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
      return;
    }

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");

      // PUT file to S3
      await fetch(result.upload_url, {
        method: "PUT",
        headers: { "Content-Type": "application/pdf" },
        body: file
      });

      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
      e.target.reset();
      setErrors({});
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div>
      <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-2xl mx-auto my-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">🎓 Student Resume Submission</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                className={`w-full border-2 ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                placeholder="Enter your full name"
                required
                onBlur={handleBlur}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                className={`w-full border-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                placeholder="example@email.com"
                required
                onBlur={handleBlur}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Contact Number */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Contact Number *</label>
              <input
                type="tel"
                name="contact"
                pattern="[6-9]\d{9}"
                className={`w-full border-2 ${errors.contact ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                placeholder="10-digit mobile number"
                required
                onBlur={handleBlur}
              />
              {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
            </div>

            {/* 12th Passing Year */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Year of Passing 12th *</label>
              <input
                type="date"
                name="pass12"
                className={`w-full border-2 ${errors.pass12 ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                required
                min="1990-01-01"
                max={`${new Date().getFullYear()}-12-31`}
                onKeyDown={e => e.preventDefault()}
                onBlur={handleBlur}
              />
              {errors.pass12 && <p className="text-red-500 text-xs mt-1">{errors.pass12}</p>}
            </div>

            {/* Graduation Year */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Graduation Year *</label>
              <input
                type="date"
                name="gradYear"
                className={`w-full border-2 ${errors.gradYear ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                required
                min="1990-01-01"
                max={`${new Date().getFullYear() + 6}-12-31`}
                onKeyDown={e => e.preventDefault()}
                onBlur={handleBlur}
              />
              {errors.gradYear && <p className="text-red-500 text-xs mt-1">{errors.gradYear}</p>}
            </div>

            {/* 12th Marks */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">12th Marks (%) *</label>
              <input
                type="number"
                name="marks12"
                min="0"
                max="100"
                step="0.01"
                className={`w-full border-2 ${errors.marks12 ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                placeholder="Enter percentage (0-100)"
                required
                onBlur={handleBlur}
              />
              {errors.marks12 && <p className="text-red-500 text-xs mt-1">{errors.marks12}</p>}
            </div>

            {/* Graduation Marks */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Graduation Marks (%) *</label>
              <input
                type="number"
                name="gradMarks"
                min="0"
                max="100"
                step="0.01"
                className={`w-full border-2 ${errors.gradMarks ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                placeholder="Enter percentage (0-100)"
                required
                onBlur={handleBlur}
              />
              {errors.gradMarks && <p className="text-red-500 text-xs mt-1">{errors.gradMarks}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Gender *</label>
              <select
                name="Gender"
                className={`w-full border-2 ${errors.Gender ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                required
                onBlur={handleBlur}
              >
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
              {errors.Gender && <p className="text-red-500 text-xs mt-1">{errors.Gender}</p>}
            </div>

            {/* Work Preference */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Work Preference *</label>
              <select
                name="workPref"
                className={`w-full border-2 ${errors.workPref ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                required
                onBlur={handleBlur}
              >
                <option value="">Select Preference</option>
                <option value="Work From Home">Work From Home</option>
                <option value="Office">Office</option>
                <option value="Hybrid">Hybrid</option>
              </select>
              {errors.workPref && <p className="text-red-500 text-xs mt-1">{errors.workPref}</p>}
            </div>
          </div>

          {/* LinkedIn - Full width */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">LinkedIn Profile URL *</label>
            <input
              type="url"
              name="linkedIn"
              className={`w-full border-2 ${errors.linkedIn ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
              placeholder="https://linkedin.com/in/your-profile"
              required
              onBlur={handleBlur}
            />
            {errors.linkedIn && <p className="text-red-500 text-xs mt-1">{errors.linkedIn}</p>}
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">Upload Resume (PDF, Max 300KB) *</label>
            <input
              type="file"
              name="resume"
              accept=".pdf"
              className={`w-full border-2 ${errors.resume ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
              required
              onChange={handleFileChange}
            />
            {errors.resume ? (
              <p className="text-red-500 text-xs mt-1">{errors.resume}</p>
            ) : (
              <p className="text-xs text-gray-600 mt-1">Only PDF files under 300KB are allowed</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-md"
          >
            📤 Submit Resume
          </button>
        </form>

        {/* Success Toast */}
        {toastVisible && (
          <div className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg animate-slide-in z-50">
            <div className="flex items-center">
              <span className="text-xl mr-2">✅</span>
              <span className="font-semibold">Form submitted successfully!</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          0% { transform: translateX(150%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slideIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default StudentResumeForm;