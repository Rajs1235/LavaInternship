import React, { useState } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';

// Replace with your actual API Gateway endpoint for creating the review link
const CREATE_REVIEW_LINK_API = 'https://orsugtf042.execute-api.ap-south-1.amazonaws.com/createreviewlink';

const SendForReview = ({ candidate }) => {
    const [reviewerEmail, setReviewerEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSendReview = async (e) => {
        e.preventDefault();
        if (!reviewerEmail) {
            setMessage({ type: 'error', text: 'Please enter a reviewer\'s email.' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await axios.post(CREATE_REVIEW_LINK_API, {
                resume_id: candidate.resume_id,
                reviewer_email: reviewerEmail,
                candidate_name: `${candidate.first_name} ${candidate.last_name}`,
                department: candidate.department
            });

            setMessage({ type: 'success', text: response.data.message || 'Review link sent successfully!' });
            setReviewerEmail('');
        } catch (error) {
            console.error("Error sending review link:", error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send review link.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-6 p-4 border-t border-gray-200">
            <h3 className="font-semibold text-[#264143] mb-3">Send for Departmental Review</h3>
            <form onSubmit={handleSendReview} className="flex flex-col sm:flex-row gap-3">
                <input
                    type="email"
                    value={reviewerEmail}
                    onChange={(e) => setReviewerEmail(e.target.value)}
                    placeholder="Enter reviewer's email address"
                    className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#264143] focus:border-[#264143] transition"
                    required
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#264143] text-white px-4 py-2 rounded-md hover:bg-[#1a2d2f] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={16} />
                    {isLoading ? 'Sending...' : 'Send Link'}
                </button>
            </form>
            {message.text && (
                <p className={`mt-3 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {message.text}
                </p>
            )}
        </div>
    );
};

export default SendForReview;