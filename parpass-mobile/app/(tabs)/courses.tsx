import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCourses, Course } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';

type FilterType = 'all' | 'core' | 'premium';

export default function CoursesScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const { member } = useAuth();

  const loadCourses = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const tier = filter === 'all' ? undefined : filter;
      const data = await getCourses(tier);
      setCourses(data);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [filter]);

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
              onRefresh={() => loadCourses(true)}
              tintColor="#10b981"
            />
          }
          ListHeaderComponent={
            <Text style={styles.resultCount}>{courses.length} courses available</Text>
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
});
