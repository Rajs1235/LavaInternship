import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from 'react-router-dom';

const StudentResumeForm = () => {

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [jobInfo, setJobInfo] = useState({ jobId: null, jobTitle: null });

  useEffect(() => {
    // // Method 1: From localStorage (if using the first approach)
    const jobId = localStorage.getItem('applicationJobId');
    const jobTitle = localStorage.getItem('applicationJobTitle');

    // Method 2: From URL params (if using the second approach)
    // const jobId = searchParams.get('jobId');
    // const jobTitle = searchParams.get('jobTitle');

    if (jobId) {
      setJobInfo({ jobId, jobTitle });
    }
  }, []);


  const apiEndpoint =
    "https://70vamjew18.execute-api.ap-south-1.amazonaws.com/upload-url";
  const [toastVisible, setToastVisible] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    // Only check for standard 10-digit Indian mobile numbers
    const cleaned = phone.trim().replace(/[\s\-()]/g, '');
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(cleaned);
  };

  const validateMarks = (marks) => {
    const num = parseFloat(marks);
    return !isNaN(num) && num >= 0 && num <= 100;
  };

  const validateYear = (year, type) => {
    const currentYear = new Date().getFullYear();
    const num = parseInt(year);

    if (type === "12th") {
      return num >= 1990 && num <= currentYear;
    } else if (type === "graduation") {
      return num >= 1990 && num <= currentYear + 6;
    }
    return false;
  };

  const validateLinkedIn = (url) => {
    const linkedInRegex =
      /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
    return linkedInRegex.test(url);
  };

  const validateFile = (file) => {
    if (!file) return { valid: false, message: "Please select a file" };

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExtensions = [".pdf", ".doc", ".docx"];

    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    const hasValidType = allowedTypes.includes(file.type);

    if (!hasValidType && !hasValidExtension) {
      return { valid: false, message: "Only PDF, DOC, or DOCX files are allowed" };
    }

    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > 3) {
      return {
        valid: false,
        message: `File size is ${(sizeInMB).toFixed(2)} MB. Maximum allowed is 3 MB`,
      };
    }

    return { valid: true, message: "" };
  };

  const validateField = (name, value, file = null) => {
    const newErrors = { ...errors };

    switch (name) {
      case "name":
        if (!value.trim() || value.trim().length < 2) {
          newErrors[name] = "Name must be at least 2 characters long";
        } else {
          delete newErrors[name];
        }
        break;

      case "email":
        if (!validateEmail(value)) {
          newErrors[name] = "Please enter a valid email address";
        } else {
          delete newErrors[name];
        }
        break;

      case "contact":
        if (!validatePhone(value)) {
          newErrors[name] =
            "Please enter a valid 10-digit Indian mobile number";
        } else {
          delete newErrors[name];
        }
        break;

      case "pass12":
        if (!validateYear(value, "12th")) {
          newErrors[name] =
            "Please enter a valid 12th passing year (1990-current year)";
        } else {
          delete newErrors[name];
        }
        break;

      case "gradYear":
        if (!validateYear(value, "graduation")) {
          newErrors[name] = "Please enter a valid graduation year";
        } else if (
          parseInt(value) <
          parseInt(document.getElementsByName("pass12")[0].value)
        ) {
          newErrors[name] =
            "Graduation year cannot be before 12th passing year";
        } else {
          delete newErrors[name];
        }
        break;

      case "Gender":
      case "workPref":
        if (!value) {
          newErrors[name] = `Please select ${name === "Gender" ? "a gender" : "work preference"
            }`;
        } else {
          delete newErrors[name];
        }
        break;


      case "resume":
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
    validateField("resume", null, file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const now = new Date();
    const submittedAt = now.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      address: e.target.address.value.trim(),
      resume: file?.name || "",
      jobId: jobInfo.jobId,
      jobTitle: jobInfo.jobTitle,
      submittedAt: submittedAt
    };

    console.log("📤 Form Data Prepared:", formData);

    let localErrors = {};
    const collectError = (name, valid) => {
      if (!valid) localErrors[name] = true;
    };

    // Perform all validations
    collectError("name", validateField("name", formData.name));
    collectError("email", validateField("email", formData.email));
    collectError("contact", validateField("contact", formData.contact));
    collectError("pass12", validateField("pass12", formData.pass12));
    collectError("gradYear", validateField("gradYear", formData.gradYear));
    collectError("gradMarks", validateField("gradMarks", formData.gradMarks));
    collectError("Gender", validateField("Gender", formData.gender));
    collectError("workPref", validateField("workPref", formData.workPref));
    collectError("resume", validateField("resume", null, file));

    const isValid = Object.keys(localErrors).length === 0;

    if (!isValid) {
      console.warn("⚠️ Validation failed. Local errors:", localErrors);
      const firstError = Object.keys(localErrors)[0];
      if (firstError) {
        document.getElementsByName(firstError)[0]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    try {
      console.log("📡 Sending form data to API:", apiEndpoint);
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      console.log("✅ Response from Lambda:", result);

      if (!res.ok) {
        console.error("❌ API error response:", result);
        throw new Error(result.error || "Upload failed");
      }

      if (!result.upload_url) {
        throw new Error("No upload URL received from server");
      }

      console.log("📁 Uploading file to S3:", result.upload_url);
      const uploadResponse = await fetch(result.upload_url, {
        method: "PUT",
        headers: { "Content-Type": "application/pdf" },
        body: file,
      });

      if (!uploadResponse.ok) {
        console.error("❌ S3 upload failed:", await uploadResponse.text());
        throw new Error("Failed to upload file to S3");
      }

      console.log("✅ File uploaded successfully");
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);

      // Clear job info from localStorage
      localStorage.removeItem('applicationJobId');
      localStorage.removeItem('applicationJobTitle');

      e.target.reset();
      setErrors({});
    } catch (err) {
      console.error("🚨 Submission error:", err);
      alert("Error: " + err.message);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className="bg-white shadow-xl rounded-none p-4 w-full mx-0 my-0"
        style={{ maxHeight: '100vh', overflowY: 'auto' }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">
          🎓 Student Resume Submission
          {jobInfo.jobTitle && (
            <div className="text-lg font-normal text-blue-600 mt-2">
              Applying for: {jobInfo.jobTitle}
            </div>
          )}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* All form fields are now within a single grid container for better responsiveness */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Full Name */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                className={`w-full border-2 ${errors.name ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                placeholder="Enter your full name"
                required
                onBlur={handleBlur}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                className={`w-full border-2 ${errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                placeholder="example@email.com"
                required
                onBlur={handleBlur}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Contact Number */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Contact Number *
              </label>
              <input
                type="tel"
                name="contact"
                pattern="[6-9]\d{9}"
                className={`w-full border-2 ${errors.contact ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                placeholder="10-digit mobile number"
                required
                onBlur={handleBlur}
              />
              {errors.contact && (
                <p className="text-red-500 text-xs mt-1">{errors.contact}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Gender *
              </label>
              <select
                name="Gender"
                className={`w-full border-2 ${errors.Gender ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                required
                onBlur={handleBlur}
                defaultValue=""
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
              {errors.Gender && (
                <p className="text-red-500 text-xs mt-1">{errors.Gender}</p>
              )}
            </div>

            {/* 12th Passing Year */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Year of Passing 12th *
              </label>
              <input
                type="date"
                name="pass12"
                className={`w-full border-2 ${errors.pass12 ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                required
                min="1990-01-01"
                max={`${new Date().getFullYear()}-12-31`}
                onChange={handleBlur} // Use onChange for immediate feedback on date pickers
              />
              {errors.pass12 && (
                <p className="text-red-500 text-xs mt-1">{errors.pass12}</p>
              )}
            </div>

            {/* 12th Marks */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                12th Marks (%)
              </label>
              <input
                type="number"
                name="marks12"
                min="0"
                max="100"
                step="0.01"
                className={`w-full border-2 ${errors.marks12 ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                placeholder="e.g., 85.5"
                onBlur={handleBlur}
              />
              {errors.marks12 && (
                <p className="text-red-500 text-xs mt-1">{errors.marks12}</p>
              )}
            </div>

            {/* Graduation Year */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Graduation Year *
              </label>
              <input
                type="date"
                name="gradYear"
                className={`w-full border-2 ${errors.gradYear ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                required
                min="1990-01-01"
                max={`${new Date().getFullYear() + 6}-12-31`}
                onChange={handleBlur} // Use onChange for immediate feedback
              />
              {errors.gradYear && (
                <p className="text-red-500 text-xs mt-1">{errors.gradYear}</p>
              )}
            </div>

            {/* Graduation Marks */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Graduation Marks (%) *
              </label>
              <input
                type="number"
                name="gradMarks"
                min="0"
                max="100"
                step="0.01"
                className={`w-full border-2 ${errors.gradMarks ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                placeholder="e.g., 75.0"
                required
                onBlur={handleBlur}
              />
              {errors.gradMarks && (
                <p className="text-red-500 text-xs mt-1">{errors.gradMarks}</p>
              )}
            </div>

            {/* Work Preference */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">
                Work Preference *
              </label>
              <select
                name="workPref"
                className={`w-full border-2 ${errors.workPref ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                required
                onBlur={handleBlur}
                defaultValue=""
              >
                <option value="" disabled>
                  Select Preference
                </option>
                <option value="Work From Home">Work From Home</option>
                <option value="Office">Office</option>
                <option value="Hybrid">Hybrid</option>
              </select>
              {errors.workPref && (
                <p className="text-red-500 text-xs mt-1">{errors.workPref}</p>
              )}
            </div>

            {/* Address - Spans full width */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                name="address"
                className={`w-full border-2 ${errors.address ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                placeholder="Enter your full address"
                required
                onBlur={handleBlur}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            {/* LinkedIn - Spans full width */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                name="linkedIn"
                className={`w-full border-2 ${errors.linkedIn ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                placeholder="https://linkedin.com/in/your-profile"
                onBlur={handleBlur}
              />
              {errors.linkedIn && (
                <p className="text-red-500 text-xs mt-1">{errors.linkedIn}</p>
              )}
            </div>

            {/* Resume Upload - Spans full width */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-gray-700 mb-1">
                Upload Resume (PDF/DOC, Max 3MB) *
              </label>
              <input
                type="file"
                name="resume"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className={`w-full border-2 ${errors.resume ? "border-red-500" : "border-gray-300"
                  } rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
                required
                onChange={handleFileChange}
              />
              {errors.resume ? (
                <p className="text-red-500 text-xs mt-1">{errors.resume}</p>
              ) : (
                <p className="text-xs text-gray-600 mt-1">
                  Only PDF, DOC, or DOCX files under 3MB are allowed.
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            📤 Submit Resume
          </button>
        </form>

        {jobInfo.jobId && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/job-listings')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Job Listings
            </button>
          </div>
        )}


        {/* Success Toast */}
        {toastVisible && (
          <div className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg animate-slide-in z-50">
            <div className="flex items-center">
              <span className="text-xl mr-2">✅</span>
              <span className="font-semibold">
                Form submitted successfully!
              </span>
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
          animation: slideIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default StudentResumeForm;
