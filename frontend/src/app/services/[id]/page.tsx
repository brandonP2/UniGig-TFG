'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/BackButton';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  student: {
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
}

export default function ServiceDetails({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [user, setUser] = useState<{ id: string; role: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUser(token);
    fetchService(token);
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

  const fetchService = async (token: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/services/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch service details');
      }

      const data = await response.json();
      setService(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/services/${params.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete service');
      }

      router.push('/services');
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

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-red-600">Service not found</p>
            <BackButton href="/services" className="mt-4" />
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
                <BackButton href="/services" />
                <h1 className="text-2xl font-bold text-gray-900">{service.title}</h1>
              </div>
              {user?.email === service.student.user.email && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => router.push(`/services/${service.id}/edit`)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit Service
                  </button>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete Service
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Description</h2>
                <p className="mt-1 text-gray-600">{service.description}</p>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900">Price</h2>
                <p className="mt-1 text-gray-600">${service.price}</p>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900">Category</h2>
                <p className="mt-1 text-gray-600">{service.category.name}</p>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900">Service Provider</h2>
                <p className="mt-1 text-gray-600">{service.student.user.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 