import React, { useState } from 'react';

const StudentResumeForm = () => {
  const [toastVisible, setToastVisible] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      name: e.target.name.value,
      email: e.target.email.value,
      contact: e.target.contact.value,
      pass12: e.target.pass12.value,
      gradYear: e.target.gradYear.value,
      marks12: e.target.marks12.value,
      gradMarks: e.target.gradMarks.value,
      workPref: e.target.workPref.value,
      experience: e.target.experience.value,
      resume: e.target.resume.files[0]?.name || ''
    };

    console.log("Form Submitted:", data);

    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);

    e.target.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-200 to-blue-200 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">🎓 Student Resume Form</h2>
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
              <label className="block font-medium mb-1">Work Preference</label>
              <select name="workPref" className="w-full border rounded-md px-3 py-2" required>
                <option value="">Select</option>
                <option value="Work From Home">Work From Home</option>
                <option value="Office">Office</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-medium mb-1">Work Experience</label>
            <textarea name="experience" className="w-full border rounded-md px-3 py-2" rows="3" placeholder="Write your experience (if any)..." />
          </div>
          <div>
            <label className="block font-medium mb-1">Upload Resume (PDF)</label>
            <input type="file" name="resume" accept=".pdf" className="w-full border rounded-md px-3 py-2" required />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium mt-2">
            📤 Submit Resume
          </button>
        </form>

        {/* Toast Notification */}
        {toastVisible && (
          <div className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300">
            ✅ Form submitted successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResumeForm;
