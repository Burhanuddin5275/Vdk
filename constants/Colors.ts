/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    tabRedActive: '#B71C1C',
    tabRedInactive: '#E53935',
    // Additional colors for UI components
    card: '#fff',
    border: '#e5e7eb',
    primary: '#0a7ea4',
    primaryForeground: '#fff',
    secondary: '#f3f4f6',
    secondaryForeground: '#374151',
    muted: '#f9fafb',
    mutedForeground: '#6b7280',
    textMuted: '#6b7280',
    red: '#ef4444',
    green: '#10b981',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    tabRedActive: '#B71C1C',
    tabRedInactive: '#E53935',
    // Additional colors for UI components
    card: '#1f2937',
    border: '#374151',
    primary: '#3b82f6',
    primaryForeground: '#fff',
    secondary: '#374151',
    secondaryForeground: '#d1d5db',
    muted: '#111827',
    mutedForeground: '#9ca3af',
    textMuted: '#9ca3af',
    red: '#ef4444',
    green: '#10b981',
  },
};
