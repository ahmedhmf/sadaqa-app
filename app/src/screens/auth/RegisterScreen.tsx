// app/src/screens/auth/RegisterScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/AuthNavigator";
import { useAuth } from "../../context/AuthContext";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const { signUp, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onRegister = async () => {
    try {
      await signUp(email, password);
      Alert.alert("Check your email", "If confirmation is required.");
      navigation.navigate("Login");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Registration failed", err.message ?? "Unknown error");
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Sign Up</Text>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
        value={password}
        onChangeText={setPassword}
      />
      <Button
        title={loading ? "Signing up..." : "Sign Up"}
        onPress={onRegister}
      />
    </View>
  );
}
