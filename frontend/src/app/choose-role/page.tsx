'use client';

import { useRouter } from 'next/navigation';

export default function ChooseRole() {
  const router = useRouter();

  const handleRoleSelect = (role: 'STUDENT' | 'CLIENT') => {
    localStorage.setItem('selectedRole', role);
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Choose your role
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelect('STUDENT')}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Student
            </button>
            <button
              onClick={() => handleRoleSelect('CLIENT')}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 