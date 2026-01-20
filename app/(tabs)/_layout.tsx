
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';

export default function TabLayout() {
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'edit',
      label: 'Journal',
    },
    {
      name: '(history)',
      route: '/(tabs)/(history)/',
      icon: 'book',
      label: 'History',
    },
  ];

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen key="home" name="(home)" />
        <Stack.Screen key="history" name="(history)" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
