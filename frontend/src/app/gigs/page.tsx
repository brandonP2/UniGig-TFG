'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/BackButton';

interface Gig {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  client: {
    user: {
      name: string;
      email: string;
    };
  };
  category: {
    name: string;
    description: string;
  };
}

interface User {
  email: string;
  role: string;
}

export default function Gigs() {
  const router = useRouter();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    minBudget: '',
    maxBudget: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    }
    fetchGigs();
  }, [filters]);

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

  const fetchGigs = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.minBudget) queryParams.append('minBudget', filters.minBudget);
      if (filters.maxBudget) queryParams.append('maxBudget', filters.maxBudget);

      const response = await fetch(`http://localhost:3001/api/gigs?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch gigs');
      }
      const data = await response.json();
      setGigs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (gigId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/gigs/${gigId}/apply`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to apply for gig');
      }

      // Refresh gigs list
      fetchGigs();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (gigId: string) => {
    if (!confirm('Are you sure you want to delete this gig?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/gigs/${gigId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete gig');
      }

      // Refresh gigs list
      fetchGigs();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <BackButton href="/dashboard" />
            <h1 className="text-3xl font-bold text-gray-900">Available Gigs</h1>
          </div>
          {user?.role === 'CLIENT' && (
            <Link
              href="/gigs/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Post New Gig
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Search
                </label>
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Search gigs..."
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">All</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div>
                <label htmlFor="minBudget" className="block text-sm font-medium text-gray-700">
                  Min Budget
                </label>
                <input
                  type="number"
                  name="minBudget"
                  id="minBudget"
                  value={filters.minBudget}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="maxBudget" className="block text-sm font-medium text-gray-700">
                  Max Budget
                </label>
                <input
                  type="number"
                  name="maxBudget"
                  id="maxBudget"
                  value={filters.maxBudget}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="No limit"
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {gigs.map((gig) => (
              <li key={gig.id}>
                <div className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-medium text-indigo-600 truncate">
                            {gig.title}
                          </p>
                          <div className="ml-2 flex-shrink-0">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              gig.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                              gig.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                              gig.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {gig.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 line-clamp-2">{gig.description}</p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <p>Posted by {gig.client.user.name}</p>
                          <span className="mx-2">•</span>
                          <p>Budget: ${gig.budget}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-4">
                      <Link
                        href={`/gigs/${gig.id}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        View Details
                      </Link>
                      {user?.role === 'STUDENT' && gig.status === 'OPEN' && (
                        <button
                          onClick={() => handleApply(gig.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Apply
                        </button>
                      )}
                      {user?.email === gig.client.user.email && (
                        <>
                          <Link
                            href={`/gigs/${gig.id}/edit`}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(gig.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-500"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 