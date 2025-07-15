import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './screens/SplashScreen';
import HomeScreen from './screens/HomeScreen';
import PDFViewerScreen from './screens/PDFViewerScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash">
          {({ navigation }) => (
            <SplashScreen 
              onFinish={() => navigation.replace('Home')} 
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Home" component={HomeScreen} />
       <Stack.Screen 
          name="Viewer" 
          component={PDFViewerScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
