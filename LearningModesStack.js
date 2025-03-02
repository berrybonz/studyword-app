import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LearningModesScreen from './LearningModesScreen';
import MatchingGameScreen from './MatchingGameScreen';
import FillInTheBlanksScreen from './FillInTheBlanksScreen';
import QuizScreen from './QuizScreen';
import { ThemeContext } from './ThemeContext';

const Stack = createStackNavigator();

export default function LearningModesStack() {
  const { theme } = useContext(ThemeContext);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.headerBackgroundColor },
        headerTintColor: theme.headerColor,
      }}
    >
      {/* 헤더를 사용하고 싶지 않다면 headerShown: false */}
      <Stack.Screen
        name="LearningModesScreen"
        component={LearningModesScreen}
        options={{ title: '학습 모드' }} 
      />
      <Stack.Screen
        name="MatchingGameScreen"
        component={MatchingGameScreen}
        options={{ title: '매칭 게임' }}
      />
      <Stack.Screen
        name="FillInTheBlanksScreen"
        component={FillInTheBlanksScreen}
        options={{ title: '빈칸 채우기' }}
      />
      <Stack.Screen
        name="QuizScreen"
        component={QuizScreen}
        options={{ title: '퀴즈' }}
      />
    </Stack.Navigator>
  );
}
