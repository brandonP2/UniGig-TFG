'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StarIcon } from '@heroicons/react/24/solid';
import BackButton from '@/components/BackButton';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  activityLog: {
    gig: {
      title: string;
      client: {
        user: {
          name: string;
        };
      };
      service: {
        student: {
          user: {
            name: string;
          };
        };
      };
    };
  };
}

export default function Reviews() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchReviews(token);
  }, [router]);

  const fetchReviews = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/reviews', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <StarIcon
        key={index}
        className={`h-5 w-5 ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
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
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
              <BackButton href="/dashboard" />
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-gray-50 rounded-lg p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {review.activityLog.gig.title}
                      </h3>
                      <div className="mt-1 text-sm text-gray-500">
                        <span>Client: {review.activityLog.gig.client.user.name}</span>
                        <span className="mx-2">•</span>
                        <span>
                          Student: {review.activityLog.gig.service.student.user.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  <p className="text-gray-700">{review.comment}</p>

                  <div className="mt-4 text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              ))}

              {reviews.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No reviews yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 