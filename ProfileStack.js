import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from './ProfileScreen';
import EditProfileScreen from './EditProfileScreen';
import { ThemeContext } from './ThemeContext';
import { useTranslation } from 'react-i18next';

const Stack = createStackNavigator();

export default function ProfileStack() {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.headerBackgroundColor },
        headerTintColor: theme.headerColor,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ title: t('profile') }}
      />
      <Stack.Screen
        name="EditProfileScreen"
        component={EditProfileScreen}
        options={{ title: t('edit') }}
      />
    </Stack.Navigator>
  );
}
