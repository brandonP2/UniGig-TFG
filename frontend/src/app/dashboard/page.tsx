'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChartBarIcon, 
  BriefcaseIcon, 
  ChatBubbleLeftRightIcon,
  StarIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'CLIENT';
  student?: {
    university: string;
    major: string;
    graduationYear: number;
  };
  client?: {
    company: string;
  };
}

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
}

interface Gig {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalBudgetSpent: 0,
    activeProjects: 0,
    completedProjects: 0,
    averageRating: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchUserData(token);
  }, [router]);

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUser(data.user);

      // Fetch services or gigs based on user role
      if (data.user.role === 'STUDENT') {
        fetchStudentServices(token);
      } else {
        fetchClientGigs(token);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchStudentServices = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/services', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      setServices(data);
      
      // Update stats
      setStats({
        totalEarnings: data.reduce((acc: number, service: Service) => acc + (service.price || 0), 0),
        totalBudgetSpent: 0,
        activeProjects: data.filter((s: Service) => s.status === 'ACTIVE').length,
        completedProjects: data.filter((s: Service) => s.status === 'COMPLETED').length,
        averageRating: 4.5, // This should come from the backend
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientGigs = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/gigs', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch gigs');
      }

      const data = await response.json();
      setGigs(data);
      
      // Update stats for client
      setStats({
        totalEarnings: 0,
        totalBudgetSpent: data.reduce((acc: number, gig: Gig) => acc + (gig.budget || 0), 0),
        activeProjects: data.filter((g: Gig) => g.status === 'IN_PROGRESS').length,
        completedProjects: data.filter((g: Gig) => g.status === 'COMPLETED').length,
        averageRating: 4.5, // This should come from the backend
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {user?.role === 'STUDENT' 
              ? `${user.student?.university} • ${user.student?.major}`
              : user?.client?.company}
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {user?.role === 'STUDENT' ? 'Total Earnings' : 'Total Budget Spent'}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ${user?.role === 'STUDENT' ? stats.totalEarnings : stats.totalBudgetSpent}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BriefcaseIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {user?.role === 'STUDENT' ? 'Active Services' : 'Active Gigs'}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.activeProjects}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {user?.role === 'STUDENT' ? 'Completed Services' : 'Completed Gigs'}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.completedProjects}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <StarIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {user?.role === 'STUDENT' ? 'Average Rating Received' : 'Average Rating Given'}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.averageRating.toFixed(1)}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {user?.role === 'STUDENT' ? (
              <>
                <Link
                  href="/services/new"
                  className="relative block p-6 bg-white shadow rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <PlusIcon className="h-6 w-6 text-indigo-600" />
                    <h3 className="ml-3 text-lg font-medium text-gray-900">Create New Service</h3>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Publish your skills and start earning
                  </p>
                </Link>
                <Link
                  href="/gigs"
                  className="relative block p-6 bg-white shadow rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <MagnifyingGlassIcon className="h-6 w-6 text-indigo-600" />
                    <h3 className="ml-3 text-lg font-medium text-gray-900">Browse Gigs</h3>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Find new opportunities to work on
                  </p>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/gigs/new"
                  className="relative block p-6 bg-white shadow rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <PlusIcon className="h-6 w-6 text-indigo-600" />
                    <h3 className="ml-3 text-lg font-medium text-gray-900">Post New Gig</h3>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Create a new project and find talent
                  </p>
                </Link>
                <Link
                  href="/services"
                  className="relative block p-6 bg-white shadow rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <MagnifyingGlassIcon className="h-6 w-6 text-indigo-600" />
                    <h3 className="ml-3 text-lg font-medium text-gray-900">Browse Services</h3>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Find talented students for your projects
                  </p>
                </Link>
              </>
            )}
            <Link
              href="/messages"
              className="relative block p-6 bg-white shadow rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-indigo-600" />
                <h3 className="ml-3 text-lg font-medium text-gray-900">Messages</h3>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Check your conversations
              </p>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            <Link
              href={user?.role === 'STUDENT' ? '/services' : '/gigs'}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all
            </Link>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {user?.role === 'STUDENT'
                ? services.slice(0, 5).map((service) => (
                    <li key={service.id}>
                      <div className="block hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="truncate">
                              <div className="flex text-sm">
                                <p className="font-medium text-indigo-600 truncate">{service.title}</p>
                              </div>
                              <div className="mt-2 flex">
                                <div className="flex items-center text-sm text-gray-500">
                                  <p>${service.price}</p>
                                  <span className="mx-2">•</span>
                                  <p>{service.status}</p>
                                </div>
                              </div>
                            </div>
                            <div className="ml-2 flex-shrink-0 flex">
                              <Link
                                href={`/services/${service.id}`}
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                              >
                                View details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                : gigs.slice(0, 5).map((gig) => (
                    <li key={gig.id}>
                      <div className="block hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="truncate">
                              <div className="flex text-sm">
                                <p className="font-medium text-indigo-600 truncate">{gig.title}</p>
                              </div>
                              <div className="mt-2 flex">
                                <div className="flex items-center text-sm text-gray-500">
                                  <p>${gig.budget}</p>
                                  <span className="mx-2">•</span>
                                  <p>{gig.status}</p>
                                </div>
                              </div>
                            </div>
                            <div className="ml-2 flex-shrink-0 flex">
                              <Link
                                href={`/gigs/${gig.id}`}
                                className="font-medium text-indigo-600 hover:text-indigo-500"
                              >
                                View details
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
} 