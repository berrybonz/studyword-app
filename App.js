import React, { createContext, useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import MainTabNavigator from './MainTabNavigator';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { ThemeProvider } from './ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './i18n';
import { ensureUserDocument } from './src/utils/firebaseUtils';

export const AuthContext = createContext();

const Stack = createStackNavigator();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        ensureUserDocument(user).catch((error) => {
          console.error("ensureUserDocument error:", error);
        });
      }
      setUser(user);
    });
    return () => unsubscribe();
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

const RootNavigator = () => {
  const { user } = useContext(AuthContext);
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      ) : (
        <>
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const App = () => {
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('appLanguage');
        if (savedLanguage) {
          i18n.changeLanguage(savedLanguage);
        }
      } catch (error) {
        console.error('Error loading language', error);
      }
    };
    loadLanguage();
  }, []);
  
  return (
    <AuthProvider>
      <ThemeProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
