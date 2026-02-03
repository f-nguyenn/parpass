import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../lib/AuthContext';
import { hasCompletedOnboarding, setOnboardingComplete } from '../lib/onboarding';
import { getOnboardingStatus } from '../lib/api';

export default function LoginScreen() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { member, loading, login } = useAuth();

  // Check onboarding status from both local storage and backend
  const checkOnboardingStatus = async (memberId: string): Promise<boolean> => {
    // First check local storage (for offline support)
    const localCompleted = await hasCompletedOnboarding();
    if (localCompleted) return true;

    // Then check backend (authoritative source)
    try {
      const backendCompleted = await getOnboardingStatus(memberId);
      if (backendCompleted) {
        // Sync local state with backend
        await setOnboardingComplete();
        return true;
      }
    } catch (error) {
      console.log('Could not check backend onboarding status, using local');
    }

    return false;
  };

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!loading && member) {
        const completed = await checkOnboardingStatus(member.id);
        if (completed) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/onboarding/welcome');
        }
      }
    };
    checkOnboarding();
  }, [loading, member]);

  const handleSubmit = async () => {
    if (code.length !== 8) {
      setError('Please enter a valid 8-character code');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const loggedInMember = await login(code);
      // Check if user has completed onboarding
      const completed = await checkOnboardingStatus(loggedInMember.id);
      if (completed) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/onboarding/welcome');
      }
    } catch (err) {
      setError('Invalid member code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoEmoji}>⛳</Text>
          </View>
          <Text style={styles.title}>ParPass</Text>
          <Text style={styles.subtitle}>Your golf network membership</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Member Code</Text>
          <TextInput
            style={styles.input}
            placeholder="PP100001"
            placeholderTextColor="#9ca3af"
            value={code}
            onChangeText={(text) => setCode(text.toUpperCase())}
            maxLength={8}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, code.length !== 8 && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={code.length !== 8 || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>Demo: PP100001 – PP100010</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 80,
    height: 80,
    backgroundColor: '#10b981',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  form: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 16,
  },
  error: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
  },
});
