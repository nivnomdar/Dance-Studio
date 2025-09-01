import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaHome, FaChalkboardTeacher, FaEnvelope } from 'react-icons/fa';

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-[#FDF9F6] text-center p-6">
      <FaExclamationTriangle className="text-red-500 text-6xl mb-6 animate-bounce" />
      <h1 className="text-6xl font-extrabold text-[#4B2E83] mb-4 font-agrandir-grand">
        404
      </h1>
      <h2 className="text-2xl md:text-3xl font-bold text-[#EC4899] mb-4 font-agrandir-grand">
        הדף לא נמצא
      </h2>
      <p className="text-lg text-gray-700 mb-8 max-w-md font-agrandir-regular leading-relaxed">
        מצטערים, הדף שחיפשת לא נמצא. ייתכן שהקישור שבור, או שהדף הוסר.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-[#4B2E83] hover:bg-[#EC4899] transition-colors duration-300 font-agrandir-bold"
        >
          <FaHome className="mr-2" />
          חזרה לדף הבית
        </Link>
        <Link
          to="/classes"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-[#EC4899] hover:bg-[#4B2E83] transition-colors duration-300 font-agrandir-bold"
        >
          <FaChalkboardTeacher className="mr-2" />
          לכל השיעורים
        </Link>
        <Link
          to="/contact"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gray-500 hover:bg-gray-700 transition-colors duration-300 font-agrandir-bold"
        >
          <FaEnvelope className="mr-2" />
          צרו קשר
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
