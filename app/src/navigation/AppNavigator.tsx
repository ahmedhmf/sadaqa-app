import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "../screens/app/HomeScreen";

export type AppStackParamList = {
  Home: undefined;
  DeceasedList: undefined;
  DeceasedDetails: { deceasedId: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Home" }}
      />
      {/* <Stack.Screen
        name="DeceasedList"
        component={DeceasedListScreen}
        options={{ title: "Deceased" }}
      />
      <Stack.Screen
        name="DeceasedDetails"
        component={DeceasedDetailsScreen}
        options={{ title: "Deceased Details" }}
      /> */}
    </Stack.Navigator>
  );
}
