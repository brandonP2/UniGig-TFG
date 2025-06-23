'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'CLIENT';
}

interface Gig {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  client: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  category: {
    name: string;
    description: string;
  };
  activityLogs: Array<{
    id: string;
    action: string;
    createdAt: string;
    review?: {
      rating: number;
      comment: string;
    };
  }>;
}

function SuccessModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-sm mx-auto">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Application Successful!</h3>
          <p className="text-sm text-gray-500 mb-6">
            You have successfully applied to this gig. You will be redirected to messages to start the conversation.
          </p>
          <button
            onClick={onClose}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GigDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [gig, setGig] = useState<Gig | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUser(token);
    fetchGig(token);
  }, [router, params.id]);

  const fetchUser = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchGig = async (token: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/gigs/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch gig details');
      }

      const data = await response.json();
      setGig(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/gigs/${params.id}/apply`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to apply for gig');
      }

      // Show success modal
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    router.push('/messages');
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this gig? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/gigs/${params.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete gig');
      }

      router.push('/gigs');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-red-600">Gig not found</p>
            <Link href="/gigs" className="text-indigo-600 hover:text-indigo-500 mt-4 inline-block">
              Back to Gigs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <BackButton href="/gigs" />
                <h1 className="text-2xl font-bold text-gray-900">{gig.title}</h1>
              </div>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  gig.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                  gig.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                  gig.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                {gig.status}
              </span>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Description</h2>
                <p className="mt-1 text-gray-600">{gig.description}</p>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900">Budget</h2>
                <p className="mt-1 text-gray-600">${gig.budget}</p>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900">Category</h2>
                <p className="mt-1 text-gray-600">{gig.category.name}</p>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900">Posted by</h2>
                <p className="mt-1 text-gray-600">{gig.client.user.name}</p>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <Link
                href="/gigs"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Gigs
              </Link>
              {user?.role === 'STUDENT' && gig.status === 'OPEN' && (
                <button
                  onClick={handleApply}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Apply for Gig
                </button>
              )}
              {user?.email === gig.client.user.email && (
                <div className="flex space-x-3">
                  <Link
                    href={`/gigs/${gig.id}/edit`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit Gig
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete Gig
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SuccessModal isOpen={showSuccessModal} onClose={handleModalClose} />
    </div>
  );
} 