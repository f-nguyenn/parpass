'use client';

import { useState, useEffect, use } from 'react';
import { getCourse, getMemberFavorites, addFavorite, removeFavorite, getCourseReviews, getCourseRating, submitReview, Course, Review, CourseRating } from '@/lib/api';
import { loadMemberFromStorage, AuthState } from '@/lib/auth';
import Link from 'next/link';

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthState>({ member: null, usage: null });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<CourseRating>({ average_rating: null, review_count: 0 });
  const [hasPlayed, setHasPlayed] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    async function loadData() {
      const authState = await loadMemberFromStorage();
      setAuth(authState);

      const courseData = await getCourse(id);
      setCourse(courseData);

      // Load reviews and rating
      const [reviewsData, ratingData] = await Promise.all([
        getCourseReviews(id),
        getCourseRating(id)
      ]);
      setReviews(reviewsData);
      setRating(ratingData);

      if (authState.member) {
        const favs = await getMemberFavorites(authState.member.id);
        setIsFavorite(favs.some(f => f.id === id));

        // Check if member has played this course
        const { getMemberHistory } = await import('@/lib/api');
        const history = await getMemberHistory(authState.member.id);
        const played = history.some(r => r.course_name === courseData.name);
        setHasPlayed(played);

        // Check if member has already reviewed
        const existingReview = reviewsData.find(
          r => r.member_first_name === authState.member?.first_name
        );
        if (existingReview) {
          setUserRating(existingReview.rating);
          setUserComment(existingReview.comment || '');
        }
      }

      setLoading(false);
    }
    loadData();
  }, [id]);

  const toggleFavorite = async () => {
    if (!auth.member || !course) return;

    setIsFavorite(!isFavorite);

    try {
      if (isFavorite) {
        await removeFavorite(auth.member.id, course.id);
      } else {
        await addFavorite(auth.member.id, course.id);
      }
    } catch {
      setIsFavorite(isFavorite);
    }
  };

  const handleSubmitReview = async () => {
    if (!auth.member || userRating === 0) return;

    setSubmitting(true);
    try {
      await submitReview(id, auth.member.id, userRating, userComment || undefined);
      // Reload reviews
      const [reviewsData, ratingData] = await Promise.all([
        getCourseReviews(id),
        getCourseRating(id)
      ]);
      setReviews(reviewsData);
      setRating(ratingData);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-gray-400" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😕</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Course not found</h2>
          <Link href="/courses" className="text-emerald-600 hover:underline">
            Back to courses
          </Link>
        </div>
      </div>
    );
  }

  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(course.name + ', ' + course.city + ', ' + course.state)}&zoom=15&maptype=satellite`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(course.name + ', ' + course.city + ', ' + course.state + ' ' + course.zip)}`;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Map Header */}
      <div className="relative h-64 bg-gray-200">
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={mapUrl}
        ></iframe>
        
        {/* Back Button Overlay */}
        <Link
          href="/courses"
          className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        {/* Favorite Button Overlay */}
        {auth.member && (
          <button
            onClick={toggleFavorite}
            className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50"
          >
            {isFavorite ? (
              <span className="text-xl">❤️</span>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 -mt-8 relative z-10 pb-8">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Course Info */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium mb-3 ${
                  course.tier_required === 'premium'
                    ? 'bg-purple-50 text-purple-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {course.tier_required.toUpperCase()}
                </span>
                <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
                <p className="text-gray-500 mt-1">
                  {course.city}, {course.state} {course.zip}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-lg">⛳</span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Holes</p>
                    <p className="text-lg font-semibold text-gray-900">{course.holes}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-lg">📞</span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Phone</p>
                    <a href={`tel:${course.phone}`} className="text-lg font-semibold text-gray-900 hover:text-emerald-600">
                      {course.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Actions */}
          <div className="p-4 grid grid-cols-2 gap-3">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-gray-900 text-white py-3.5 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Directions
            </a>
            <a
              href={`tel:${course.phone}`}
              className="flex items-center justify-center gap-2 bg-white text-gray-900 py-3.5 px-6 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call
            </a>
          </div>
        </div>

        {/* Tip Card */}
        <div className="bg-emerald-50 rounded-2xl p-5 mt-4 border border-emerald-100">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-lg">💡</span>
            </div>
            <div>
              <h3 className="font-medium text-emerald-900">Check-in Tip</h3>
              <p className="text-emerald-700 text-sm mt-1">
                Show your ParPass code at the pro shop when you arrive. Your round will be automatically logged.
              </p>
            </div>
          </div>
        </div>

        {/* Ratings & Reviews Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-4 overflow-hidden">
          {/* Rating Summary */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
              {rating.average_rating && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-lg ${star <= Math.round(rating.average_rating!) ? 'text-yellow-400' : 'text-gray-200'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900">{rating.average_rating}</span>
                  <span className="text-gray-500 text-sm">({rating.review_count} reviews)</span>
                </div>
              )}
              {!rating.average_rating && (
                <span className="text-gray-500 text-sm">No reviews yet</span>
              )}
            </div>
          </div>

          {/* Write Review Form (if member has played) */}
          {auth.member && hasPlayed && (
            <div className="p-6 bg-gray-50 border-b border-gray-100">
              <h3 className="font-medium text-gray-900 mb-3">
                {userRating > 0 ? 'Update your review' : 'Write a review'}
              </h3>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-2xl transition-colors"
                  >
                    <span className={star <= (hoverRating || userRating) ? 'text-yellow-400' : 'text-gray-300'}>
                      ★
                    </span>
                  </button>
                ))}
                {userRating > 0 && (
                  <span className="ml-2 text-sm text-gray-500 self-center">
                    {userRating === 1 && 'Poor'}
                    {userRating === 2 && 'Fair'}
                    {userRating === 3 && 'Good'}
                    {userRating === 4 && 'Very Good'}
                    {userRating === 5 && 'Excellent'}
                  </span>
                )}
              </div>
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Share your experience (optional)"
                className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={3}
              />
              <button
                onClick={handleSubmitReview}
                disabled={userRating === 0 || submitting}
                className="mt-3 bg-emerald-500 text-white py-2.5 px-5 rounded-xl font-medium hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting...' : userRating > 0 ? 'Submit Review' : 'Select a rating'}
              </button>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <div key={review.id} className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-900">{review.member_first_name}</span>
                      <span className="text-gray-400 text-sm ml-2">{formatDate(review.created_at)}</span>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-sm ${star <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <span className="text-2xl block mb-2">📝</span>
              Be the first to review this course!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
