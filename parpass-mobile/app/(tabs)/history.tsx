import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMemberHistory, Round } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';

export default function HistoryScreen() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { member } = useAuth();

  const loadHistory = async (showRefresh = false) => {
    if (!member) return;

    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getMemberHistory(member.id);
      setRounds(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [member]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderRound = ({ item }: { item: Round }) => (
    <View style={styles.roundCard}>
      <View style={styles.roundIcon}>
        <Ionicons name="golf" size={24} color="#10b981" />
      </View>
      <View style={styles.roundInfo}>
        <Text style={styles.courseName} numberOfLines={1}>
          {item.course_name}
        </Text>
        <Text style={styles.location}>
          {item.city}, {item.state}
        </Text>
        <View style={styles.roundMeta}>
          <Text style={styles.date}>{formatDate(item.checked_in_at)}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.time}>{formatTime(item.checked_in_at)}</Text>
        </View>
      </View>
      <View style={styles.holesBadge}>
        <Text style={styles.holesNumber}>{item.holes_played}</Text>
        <Text style={styles.holesLabel}>holes</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name="time-outline" size={48} color="#d1d5db" />
      </View>
      <Text style={styles.emptyTitle}>No rounds yet</Text>
      <Text style={styles.emptyText}>
        Check in at a course to start tracking your rounds
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rounds}
        renderItem={renderRound}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          rounds.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadHistory(true)}
            tintColor="#10b981"
          />
        }
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={
          rounds.length > 0 ? (
            <Text style={styles.headerText}>{rounds.length} rounds played</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flex: 1,
  },
  headerText: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 12,
  },
  roundCard: {
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
  roundIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roundInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  roundMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 13,
    color: '#9ca3af',
  },
  metaDot: {
    color: '#d1d5db',
    marginHorizontal: 6,
  },
  time: {
    fontSize: 13,
    color: '#9ca3af',
  },
  holesBadge: {
    alignItems: 'center',
    marginLeft: 12,
  },
  holesNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  holesLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
