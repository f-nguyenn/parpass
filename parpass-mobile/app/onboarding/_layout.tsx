import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="skill-level" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="preferences" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
