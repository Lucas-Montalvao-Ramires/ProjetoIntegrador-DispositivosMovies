import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Estado compartilhado (leitos/pacientes) - ver src/context/DataContext.js
import { DataProvider } from "./src/context/DataContext";

// Telas
import LoginScreen from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import PatientDetailsScreen from "./src/screens/PatientDetailsScreen";
import ManageBedsScreen from "./src/screens/ManageBedsScreen";
import MonitoringScreen from "./src/screens/MonitoringScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      {/* DataProvider envolve TODA a navegação para que qualquer tela
          possa ler/alterar os mesmos dados (leitos, pacientes, fichas). */}
      <DataProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="PatientDetails" component={PatientDetailsScreen} />
            <Stack.Screen name="ManageBeds" component={ManageBedsScreen} />
            <Stack.Screen name="Monitoring" component={MonitoringScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </DataProvider>
    </SafeAreaProvider>
  );
}
