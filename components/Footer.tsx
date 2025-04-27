import React from 'react';

export default function Footer() {
  return (
    <div className="bg-blue-50 p-6 rounded-md">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-gray-600 text-sm">
          © {new Date().getFullYear()} Steven Carreon. All rights reserved.
        </p>
      </div>
    </div>
  );
}