import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#FFFFFF",
          },
          headerTintColor: "#0F172A",
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 18,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: "#F8FAFC",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "VSecure HRMS",
            headerTitleAlign: "left",
          }}
        />
        <Stack.Screen
          name="leave"
          options={{
            title: "Leave Management",
            headerTitleAlign: "left",
          }}
        />
        <Stack.Screen
          name="payroll"
          options={{
            title: "Payroll & Payslips",
            headerTitleAlign: "left",
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
