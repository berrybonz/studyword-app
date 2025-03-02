import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SocialScreen from './SocialScreen';
import SocialPostScreen from './SocialPostScreen';
import SocialCommentsScreen from './SocialCommentsScreen';
import EditPostScreen from './EditPostScreen'; // 편집 화면
import UserProfileScreen from './UserProfileScreen'; // 새로 추가한 프로필 화면
import { ThemeContext } from './ThemeContext';
import { useTranslation } from 'react-i18next';

const Stack = createStackNavigator();

export default function SocialStackScreen() {
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
        name="SocialScreen"
        component={SocialScreen}
        options={{ title: t('community') }}
      />
      <Stack.Screen
        name="SocialPostScreen"
        component={SocialPostScreen}
        options={{ title: t('게시글') }}
      />
      <Stack.Screen
        name="SocialCommentsScreen"
        component={SocialCommentsScreen}
        options={{ title: t('댓글') }}
      />
      <Stack.Screen
        name="EditPostScreen"
        component={EditPostScreen}
        options={{ title: t('게시글 수정') }}
      />
      <Stack.Screen
        name="UserProfileScreen"
        component={UserProfileScreen}
        options={{ title: t('프로필') }}
      />
    </Stack.Navigator>
  );
}
