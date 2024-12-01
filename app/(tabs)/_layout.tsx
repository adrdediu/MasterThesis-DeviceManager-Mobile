import { ThemeProvider } from '../../contexts/ThemeContext';
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
