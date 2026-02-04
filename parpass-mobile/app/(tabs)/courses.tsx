import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCourses, Course, getClusterRecommendations, RecommendedCourse } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';

type FilterType = 'all' | 'core' | 'premium';

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return '#dcfce7';
    case 'moderate': return '#fef3c7';
    case 'challenging': return '#fed7aa';
    case 'expert': return '#fecaca';
    default: return '#e5e7eb';
  }
}

export default function CoursesScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const { member } = useAuth();

  const loadData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const tier = filter === 'all' ? undefined : filter;
      const [coursesData, recsData] = await Promise.all([
        getCourses(tier),
        member ? getClusterRecommendations(member.id, 5) : Promise.resolve(null),
      ]);
      setCourses(coursesData);
      if (recsData?.recommendations) {
        setRecommendations(recsData.recommendations);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter, member]);

  const canAccess = (course: Course) => {
    if (!member) return false;
    if (member.tier === 'premium') return true;
    return course.tier_required === 'core';
  };

  const renderCourse = ({ item }: { item: Course }) => {
    const accessible = canAccess(item);

    return (
      <TouchableOpacity
        style={[styles.courseCard, !accessible && styles.courseCardLocked]}
        onPress={() => router.push(`/course/${item.id}`)}
      >
        <View style={styles.courseInfo}>
          <View style={styles.courseHeader}>
            <Text style={styles.courseName} numberOfLines={1}>
              {item.name}
            </Text>
            {!accessible && (
              <Ionicons name="lock-closed" size={16} color="#9ca3af" />
            )}
          </View>
          <Text style={styles.courseLocation}>
            {item.city}, {item.state}
          </Text>
          <View style={styles.courseMeta}>
            {item.average_rating && (
              <View style={styles.rating}>
                <Ionicons name="star" size={14} color="#fbbf24" />
                <Text style={styles.ratingText}>{item.average_rating}</Text>
                <Text style={styles.reviewCount}>({item.review_count})</Text>
              </View>
            )}
            <View
              style={[
                styles.tierBadge,
                item.tier_required === 'premium'
                  ? styles.tierPremium
                  : styles.tierCore,
              ]}
            >
              <Text
                style={[
                  styles.tierText,
                  item.tier_required === 'premium'
                    ? styles.tierPremiumText
                    : styles.tierCoreText,
                ]}
              >
                {item.tier_required}
              </Text>
            </View>
            <Text style={styles.holes}>{item.holes} holes</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Pills */}
      <View style={styles.filterContainer}>
        {(['all', 'core', 'premium'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterPill, filter === f && styles.filterPillActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f === 'all' ? 'All Courses' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <FlatList
          data={courses}
          renderItem={renderCourse}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
              tintColor="#10b981"
            />
          }
          ListHeaderComponent={
            <>
              {/* For You Section */}
              {recommendations.length > 0 && (
                <View style={styles.forYouSection}>
                  <View style={styles.forYouHeader}>
                    <View style={styles.forYouTitleRow}>
                      <Ionicons name="sparkles" size={20} color="#10b981" />
                      <Text style={styles.forYouTitle}>For You</Text>
                    </View>
                    <Text style={styles.forYouSubtitle}>Based on your player profile</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.recsContainer}
                  >
                    {recommendations.map((course) => (
                      <TouchableOpacity
                        key={course.id}
                        style={styles.recCard}
                        onPress={() => router.push(`/course/${course.id}`)}
                      >
                        <View style={styles.recHeader}>
                          <Text style={styles.recName} numberOfLines={1}>{course.name}</Text>
                          <View style={[
                            styles.difficultyBadge,
                            { backgroundColor: getDifficultyColor(course.difficulty) }
                          ]}>
                            <Text style={styles.difficultyText}>{course.difficulty}</Text>
                          </View>
                        </View>
                        <Text style={styles.recLocation}>{course.city}, {course.state}</Text>
                        <View style={styles.recReason}>
                          <Ionicons name="sparkles" size={14} color="#10b981" />
                          <Text style={styles.recReasonText} numberOfLines={2}>{course.reason}</Text>
                        </View>
                        <View style={styles.recMeta}>
                          {course.course_rating && (
                            <Text style={styles.recStat}>Rating: {course.course_rating}</Text>
                          )}
                          <View style={[
                            styles.recTierBadge,
                            course.tier_required === 'premium' ? styles.tierPremium : styles.tierCore
                          ]}>
                            <Text style={[
                              styles.recTierText,
                              course.tier_required === 'premium' ? styles.tierPremiumText : styles.tierCoreText
                            ]}>
                              {course.tier_required}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              <Text style={styles.resultCount}>{courses.length} courses available</Text>
            </>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterPillActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  resultCount: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 12,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  courseCardLocked: {
    opacity: 0.7,
  },
  courseInfo: {
    flex: 1,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  courseLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  reviewCount: {
    fontSize: 13,
    color: '#9ca3af',
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tierCore: {
    backgroundColor: '#ecfdf5',
  },
  tierPremium: {
    backgroundColor: '#faf5ff',
  },
  tierText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tierCoreText: {
    color: '#059669',
  },
  tierPremiumText: {
    color: '#9333ea',
  },
  holes: {
    fontSize: 13,
    color: '#9ca3af',
  },
  // For You section styles
  forYouSection: {
    marginBottom: 20,
    marginHorizontal: -16,
    paddingHorizontal: 0,
  },
  forYouHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  forYouTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  forYouTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  forYouSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  recsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  recCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: 280,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ecfdf5',
  },
  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  recName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'capitalize',
  },
  recLocation: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 10,
  },
  recReason: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  recReasonText: {
    fontSize: 12,
    color: '#059669',
    marginLeft: 6,
    fontWeight: '500',
    flex: 1,
    lineHeight: 18,
  },
  recMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recStat: {
    fontSize: 12,
    color: '#9ca3af',
  },
  recTierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recTierText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});
