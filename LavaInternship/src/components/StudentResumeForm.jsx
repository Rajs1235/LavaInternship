import React, { useState } from 'react';

const StudentResumeForm = () => {
  const apiEndpoint = "https://70vamjew18.execute-api.ap-south-1.amazonaws.com/upload-url";
  const [toastVisible, setToastVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const file = e.target.resume.files[0];
    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      contact: e.target.contact.value,
      pass12: e.target.pass12.value,
      gradYear: e.target.gradYear.value,
      marks12: e.target.marks12.value,
      gradMarks: e.target.gradMarks.value,
      gender: e.target.Gender.value,
      workPref: e.target.workPref.value,
      linkedIn: e.target.linkedIn.value,
      resume: file.name
    };

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
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">🎓 Employee Resume Form</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Full Name</label>
              <input type="text" name="name" className="w-full border rounded-md px-3 py-2" required />
            </div>
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input type="email" name="email" className="w-full border rounded-md px-3 py-2" required />
            </div>
            <div>
              <label className="block font-medium mb-1">Contact Number</label>
              <input type="text" name="contact" className="w-full border rounded-md px-3 py-2" required />
            </div>
            <div>
              <label className="block font-medium mb-1">Year of Passing 12th</label>
              <input type="number" name="pass12" className="w-full border rounded-md px-3 py-2" required />
            </div>
            <div>
              <label className="block font-medium mb-1">Graduation Year</label>
              <input type="number" name="gradYear" className="w-full border rounded-md px-3 py-2" required />
            </div>
            <div>
              <label className="block font-medium mb-1">12th Marks (%)</label>
              <input type="text" name="marks12" className="w-full border rounded-md px-3 py-2" required />
            </div>
            <div>
              <label className="block font-medium mb-1">Graduation Marks (%)</label>
              <input type="text" name="gradMarks" className="w-full border rounded-md px-3 py-2" required />
            </div>
            <div>
              <label className="block font-medium mb-1">Gender</label>
              <select name="Gender" className="w-full border rounded-md px-3 py-2" required>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Work Preference</label>
              <select name="workPref" className="w-full border rounded-md px-3 py-2" required>
                <option value="">Select</option>
                <option value="Work From Home">Work From Home</option>
                <option value="Office">Office</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">LinkedIn</label>
              <input type="text" name="linkedIn" className="w-full border rounded-md px-3 py-2" placeholder="Enter LinkedIn URL" required />
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Upload Resume (PDF)</label>
            <input type="file" name="resume" accept=".pdf" className="w-full border rounded-md px-3 py-2" required />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium mt-2"
          >
            📤 Submit Resume
          </button>
        </form>

        {toastVisible && (
          <div className="fixed bottom-5 right-5 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in">
            ✅ Form submitted successfully!
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
