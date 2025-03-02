import React, { useEffect, useState, useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import ReviewScreen from './ReviewScreen';
import SettingsStackScreen from './SettingsStackScreen';
import LearningModesStack from './LearningModesStack';
import SocialStackScreen from './SocialStackScreen';
import ProfileStack from './ProfileStack'; // 새로 만든 스택
import { useTranslation } from 'react-i18next';
import { ThemeContext } from './ThemeContext';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const { t, i18n } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const [lang, setLang] = useState(i18n.language);

  useEffect(() => {
    const handleLanguageChange = () => {
      setLang(i18n.language);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: theme.tabBarBackgroundColor },
        tabBarActiveTintColor: theme.tabBarActiveColor,
        tabBarInactiveTintColor: theme.tabBarInactiveColor,
        headerStyle: { backgroundColor: theme.headerBackgroundColor },
        headerTintColor: theme.headerColor,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('home') }} />
      <Tab.Screen name="Review" component={ReviewScreen} options={{ title: t('review') }} />
      <Tab.Screen name="LearningModes" component={LearningModesStack} options={{ title: t('learningModes') }} />
      <Tab.Screen name="Social" component={SocialStackScreen} options={{ title: t('community') }} />
      {/* EnhancedFeatures 탭 제거
        <Tab.Screen 
          name="Enhanced" 
          component={EnhancedFeatures} 
          options={{ title: t('enhancedFeatures') }} 
        />
      */}
      <Tab.Screen name="ProfileStack" component={ProfileStack} options={{ title: t('profile') }} />
      <Tab.Screen name="Settings" component={SettingsStackScreen} options={{ title: t('settings') }} />
    </Tab.Navigator>
  );
}
