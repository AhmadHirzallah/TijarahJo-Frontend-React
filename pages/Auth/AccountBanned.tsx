import React from 'react';
import { Ban, Mail, Phone, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

const AccountBanned: React.FC = () => {
  // Get dynamic support contact info from localStorage (set by admin)
  const supportEmail = localStorage.getItem('support_email') || 'support@tijarahjo.com';
  const supportWhatsApp = localStorage.getItem('support_whatsapp') || '962791234567';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 py-12 px-4">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-8 shadow-xl">
          <Ban className="h-12 w-12 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          Account Suspended
        </h1>

        {/* Message */}
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Your account has been suspended due to a violation of our{' '}
          <Link to="/terms" className="text-blue-600 hover:underline font-semibold">
            Terms of Service
          </Link>
          {' '}or{' '}
          <Link to="/community-guidelines" className="text-blue-600 hover:underline font-semibold">
            Community Guidelines
          </Link>.
        </p>

        {/* Info Box */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 mb-8 text-left">
          <h3 className="font-black text-gray-900 mb-6 text-xl">What can you do?</h3>
          <ul className="space-y-4 text-gray-600">
            <li className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-black">1</span>
              <span className="leading-relaxed">Review our Terms of Service to understand the violation</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-black">2</span>
              <span className="leading-relaxed">Contact our support team to appeal this decision</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-black">3</span>
              <span className="leading-relaxed">Provide any relevant information that may help your case</span>
            </li>
          </ul>
        </div>

        {/* Contact Options */}
        <div className="bg-white/50 backdrop-blur rounded-3xl p-8 mb-8 border border-white">
          <h3 className="font-black text-gray-900 mb-6 text-lg">Contact Support</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`mailto:${supportEmail}?subject=Account%20Ban%20Appeal`}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-bold"
            >
              <Mail className="h-5 w-5" />
              Email Support
            </a>
            <a
              href={`https://wa.me/${supportWhatsApp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl font-bold"
            >
              <Phone className="h-5 w-5" />
              WhatsApp
            </a>
          </div>
        </div>

        {/* Back Link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default AccountBanned;
