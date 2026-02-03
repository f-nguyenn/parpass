import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SKILL_LEVELS, SurveyData, defaultSurveyData, saveSurveyData, getSurveyData } from '../../lib/onboarding';

export default function SkillLevelScreen() {
  const [selected, setSelected] = useState<SurveyData['skillLevel']>(null);

  const handleNext = async () => {
    const existing = await getSurveyData() || defaultSurveyData;
    await saveSurveyData({ ...existing, skillLevel: selected });
    router.push('/onboarding/goals');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.progress}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>What's your skill level?</Text>
        <Text style={styles.subtitle}>
          We'll recommend courses that match your experience
        </Text>

        <View style={styles.options}>
          {SKILL_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.option,
                selected === level.id && styles.optionSelected,
              ]}
              onPress={() => setSelected(level.id)}
            >
              <Text style={styles.optionIcon}>{level.icon}</Text>
              <View style={styles.optionText}>
                <Text style={[
                  styles.optionLabel,
                  selected === level.id && styles.optionLabelSelected,
                ]}>
                  {level.label}
                </Text>
                <Text style={styles.optionDesc}>{level.description}</Text>
              </View>
              <View style={[
                styles.radio,
                selected === level.id && styles.radioSelected,
              ]}>
                {selected === level.id && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !selected && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!selected}
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
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  optionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 17,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
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
