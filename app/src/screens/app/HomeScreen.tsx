// app/src/screens/app/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Button } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppStackParamList } from "../../navigation/AppNavigator";
import { useAuth } from "../../context/AuthContext";
import { getWeeklySummary } from "../../services/activityService";
import { getDeceasedProfiles } from "../../services/deceasedService";

type Props = NativeStackScreenProps<AppStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  const { signOut, user } = useAuth();
  const [summary, setSummary] = useState<{
    duaCount: number;
    deedCount: number;
    quranSessions: number;
  } | null>(null);

  const [deceasedCount, setDeceasedCount] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [sum, deceased] = await Promise.all([
          getWeeklySummary(),
          getDeceasedProfiles(),
        ]);
        setSummary(sum);
        setDeceasedCount(deceased.length);
      } catch (err) {
        console.log("Home load error:", err);
      }
    };
    load();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
      <Text style={{ fontSize: 20, marginBottom: 8 }}>
        Welcome {user?.email}
      </Text>
      <Text style={{ marginBottom: 8 }}>
        Deceased profiles: {deceasedCount}
      </Text>
      <Text style={{ marginBottom: 8 }}>
        Dua this week: {summary?.duaCount ?? 0}
      </Text>
      <Text style={{ marginBottom: 8 }}>
        Deeds this week: {summary?.deedCount ?? 0}
      </Text>
      <Text style={{ marginBottom: 16 }}>
        Quran sessions: {summary?.quranSessions ?? 0}
      </Text>

      <Button
        title="Go to Deceased List"
        onPress={() => navigation.navigate("DeceasedList")}
      />
      <View style={{ height: 16 }} />
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}
