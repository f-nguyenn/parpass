import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  PLAY_FREQUENCIES,
  PREFERRED_TIMES,
  defaultSurveyData,
  saveSurveyData,
  getSurveyData,
  SurveyData,
} from '../../lib/onboarding';

export default function PreferencesScreen() {
  const [frequency, setFrequency] = useState<SurveyData['playFrequency']>(null);
  const [time, setTime] = useState<SurveyData['preferredTime']>(null);

  const handleNext = async () => {
    const existing = await getSurveyData() || defaultSurveyData;
    await saveSurveyData({
      ...existing,
      playFrequency: frequency,
      preferredTime: time,
    });
    router.push('/onboarding/notifications');
  };

  const isComplete = frequency && time;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.progress}>
          <View style={[styles.progressDot, styles.progressDotComplete]} />
          <View style={[styles.progressDot, styles.progressDotComplete]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Your preferences</Text>
        <Text style={styles.subtitle}>
          Help us suggest the perfect tee times
        </Text>

        {/* Play Frequency */}
        <Text style={styles.sectionTitle}>How often do you play?</Text>
        <View style={styles.options}>
          {PLAY_FREQUENCIES.map((freq) => (
            <TouchableOpacity
              key={freq.id}
              style={[
                styles.option,
                frequency === freq.id && styles.optionSelected,
              ]}
              onPress={() => setFrequency(freq.id)}
            >
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionLabel,
                    frequency === freq.id && styles.optionLabelSelected,
                  ]}
                >
                  {freq.label}
                </Text>
                <Text style={styles.optionDesc}>{freq.description}</Text>
              </View>
              <View
                style={[
                  styles.radio,
                  frequency === freq.id && styles.radioSelected,
                ]}
              >
                {frequency === freq.id && (
                  <View style={styles.radioDot} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Preferred Time */}
        <Text style={styles.sectionTitle}>Preferred tee time?</Text>
        <View style={styles.timeGrid}>
          {PREFERRED_TIMES.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.timeOption,
                time === t.id && styles.timeOptionSelected,
              ]}
              onPress={() => setTime(t.id)}
            >
              <Text style={styles.timeIcon}>{t.icon}</Text>
              <Text
                style={[
                  styles.timeLabel,
                  time === t.id && styles.timeLabelSelected,
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !isComplete && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!isComplete}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progress: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  progressDotActive: {
    backgroundColor: '#10b981',
    width: 24,
  },
  progressDotComplete: {
    backgroundColor: '#10b981',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  options: {
    gap: 10,
    marginBottom: 32,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: '#059669',
  },
  optionDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#10b981',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  timeOption: {
    width: '47%',
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeOptionSelected: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  timeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  timeLabelSelected: {
    color: '#059669',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
