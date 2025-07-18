import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from 'react-router-dom';

const StudentResumeForm = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [jobInfo, setJobInfo] = useState({ jobId: null, jobTitle: null });

    useEffect(() => {
        const jobId = localStorage.getItem('applicationJobId');
        const jobTitle = localStorage.getItem('applicationJobTitle');

        if (jobId) {
            setJobInfo({ jobId, jobTitle });
        }
    }, []);

    const apiEndpoint = "https://70vamjew18.execute-api.ap-south-1.amazonaws.com/upload-url";
    const [toastVisible, setToastVisible] = useState(false);
    const [errors, setErrors] = useState({});

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        const cleaned = phone.trim().replace(/[\s\-()]/g, '');
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(cleaned);
    };

    const validateExperience = (exp) => {
        const num = parseFloat(exp);
        return !isNaN(num) && num >= 0;
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
                message: `File size is ${sizeInMB.toFixed(2)} MB. Maximum allowed is 3 MB`,
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
                    newErrors[name] = "Please enter a valid 10-digit Indian mobile number";
                } else {
                    delete newErrors[name];
                }
                break;
            
            case "professionalExperience":
                if (!value.trim() || !validateExperience(value)) {
                    newErrors[name] = "Please enter a valid number of years (e.g., 0, 1.5, 5)";
                } else {
                    delete newErrors[name];
                }
                break;

            case "Gender":
            case "workPref":
            case "experience":
                if (!value) {
                    let fieldName = "";
                    if (name === "Gender") fieldName = "a gender";
                    else if (name === "workPref") fieldName = "work preference";
                    else if (name === "experience") fieldName = "an experience range";
                    newErrors[name] = `Please select ${fieldName}`;
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
                // For optional fields, we don't set errors if they are empty
                delete newErrors[name];
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
            professionalExperience: e.target.professionalExperience.value.trim(),
            pass12: e.target.pass12.value,
            gradYear: e.target.gradYear.value,
            marks12: e.target.marks12.value,
            gradMarks: e.target.gradMarks.value,
            gender: e.target.Gender.value,
            workPref: e.target.workPref.value,
            experience: e.target.experience.value,
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

        // Perform all validations for required fields
        collectError("name", validateField("name", formData.name));
        collectError("email", validateField("email", formData.email));
        collectError("contact", validateField("contact", formData.contact));
        collectError("professionalExperience", validateField("professionalExperience", formData.professionalExperience));
        collectError("Gender", validateField("Gender", formData.gender));
        collectError("experience", validateField("experience", formData.experience));
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
                headers: { "Content-Type": file.type }, // Use the actual file type
                body: file,
            });

            if (!uploadResponse.ok) {
                console.error("❌ S3 upload failed:", await uploadResponse.text());
                throw new Error("Failed to upload file to S3");
            }

            console.log("✅ File uploaded successfully");
            setToastVisible(true);
            setTimeout(() => setToastVisible(false), 3000);

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
                className="bg-white shadow-xl rounded-lg p-8 w-full max-w-4xl"
                style={{ maxHeight: '95vh', overflowY: 'auto' }}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                className={`w-full border-2 ${errors.name ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="Enter your full name"
                                required
                                onBlur={handleBlur}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                name="email"
                                className={`w-full border-2 ${errors.email ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="example@email.com"
                                required
                                onBlur={handleBlur}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        {/* Contact Number */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Contact Number *
                            </label>
                            <input
                                type="tel"
                                name="contact"
                                className={`w-full border-2 ${errors.contact ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="10-digit mobile number"
                                required
                                onBlur={handleBlur}
                            />
                            {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
                        </div>

                        {/* Gender */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Gender *
                            </label>
                            <select
                                name="Gender"
                                className={`w-full border-2 ${errors.Gender ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                required
                                onBlur={handleBlur}
                                defaultValue=""
                            >
                                <option value="" disabled>Select Gender</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                            </select>
                            {errors.Gender && <p className="text-red-500 text-xs mt-1">{errors.Gender}</p>}
                        </div>

                        {/* Professional Experience */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Professional Experience (years) *
                            </label>
                            <input
                                type="number"
                                name="professionalExperience"
                                min="0"
                                step="0.5"
                                className={`w-full border-2 ${errors.professionalExperience ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="e.g., 2.5"
                                required
                                onBlur={handleBlur}
                            />
                            {errors.professionalExperience && <p className="text-red-500 text-xs mt-1">{errors.professionalExperience}</p>}
                        </div>
                        
                        {/* 12th Passing Year (Optional) */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Year of Passing 12th
                            </label>
                            <input
                                type="number"
                                name="pass12"
                                className={`w-full border-2 ${errors.pass12 ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                required
                                placeholder="YYYY"
                                min="1990"
                                max={new Date().getFullYear()}
                                onBlur={handleBlur}
                            />
                            {errors.pass12 && <p className="text-red-500 text-xs mt-1">{errors.pass12}</p>}
                        </div>

                        {/* 12th Marks (Optional) */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                12th Marks (%)
                            </label>
                            <input
                                type="number"
                                name="marks12"
                                min="0" max="100" step="0.01"
                                className={`w-full border-2 ${errors.marks12 ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="e.g., 85.5"
                                onBlur={handleBlur}
                            />
                            {errors.marks12 && <p className="text-red-500 text-xs mt-1">{errors.marks12}</p>}
                        </div>

                        {/* Graduation Year (Optional) */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Graduation Year
                            </label>
                            <input
                                type="number"
                                name="gradYear"
                                className={`w-full border-2 ${errors.gradYear ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                required
                                placeholder="YYYY"
                                min="1990"
                                max={new Date().getFullYear() + 6}
                                onBlur={handleBlur}
                            />
                            {errors.gradYear && <p className="text-red-500 text-xs mt-1">{errors.gradYear}</p>}
                        </div>

                        {/* Graduation Marks (Optional) */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Graduation Marks (%)
                            </label>
                            <input
                                type="number"
                                name="gradMarks"
                                min="0" max="100" step="0.01"
                                className={`w-full border-2 ${errors.gradMarks ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="e.g., 75.0"
                                onBlur={handleBlur}
                            />
                            {errors.gradMarks && <p className="text-red-500 text-xs mt-1">{errors.gradMarks}</p>}
                        </div>

                        {/* Experience Range */}
                        <div className="md:col-span-2">
                            <label className="block font-semibold text-gray-700 mb-1">
                                Experience Range *
                            </label>
                            <select
                                name="experience"
                                className={`w-full border-2 ${errors.experience ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                required
                                onBlur={handleBlur}
                                defaultValue=""
                            >
                                <option value="" disabled>Select Experience</option>
                                <option value="0-1 Year">0-1 Year</option>
                                <option value="1-2 Years">1-2 Years</option>
                                <option value="2-3 Years">2-3 Years</option>
                                <option value="3-5 Years">3-5 Years</option>
                                <option value="5-7 Years">5-7 Years</option>
                                <option value="7-10 Years">7-10 Years</option>
                                <option value="10+ Years">10+ Years</option>
                            </select>
                            {errors.experience && (
                                <p className="text-red-500 text-xs mt-1">{errors.experience}</p>
                            )}
                        </div>
                        
                        {/* Work Preference */}
                        <div>
                            <label className="block font-semibold text-gray-700 mb-1">
                                Work Preference *
                            </label>
                            <select
                                name="workPref"
                                className={`w-full border-2 ${errors.workPref ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                required
                                onBlur={handleBlur}
                                defaultValue=""
                            >
                                <option value="" disabled>Select Preference</option>
                                <option value="Work From Home">Work From Home</option>
                                <option value="Office">Office</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                            {errors.workPref && <p className="text-red-500 text-xs mt-1">{errors.workPref}</p>}
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                            <label className="block font-semibold text-gray-700 mb-1">
                                Address *
                            </label>
                            <input
                                type="text"
                                name="address"
                                className={`w-full border-2 ${errors.address ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="Enter your full address"
                                required
                                onBlur={handleBlur}
                            />
                            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                        </div>

                        {/* LinkedIn */}
                        <div className="md:col-span-2">
                            <label className="block font-semibold text-gray-700 mb-1">
                                LinkedIn Profile URL
                            </label>
                            <input
                                type="url"
                                name="linkedIn"
                                className={`w-full border-2 ${errors.linkedIn ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors`}
                                placeholder="https://linkedin.com/in/your-profile"
                                onBlur={handleBlur}
                            />
                            {errors.linkedIn && <p className="text-red-500 text-xs mt-1">{errors.linkedIn}</p>}
                        </div>

                        {/* Resume Upload */}
                        <div className="md:col-span-2">
                            <label className="block font-semibold text-gray-700 mb-1">
                                Upload Resume (PDF/DOC, Max 3MB) *
                            </label>
                            <input
                                type="file"
                                name="resume"
                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                className={`w-full border-2 ${errors.resume ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
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