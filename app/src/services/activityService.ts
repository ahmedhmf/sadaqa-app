// app/src/services/activityService.ts
import { supabase } from "./supabase/client";
import type { ActivityLog, WeeklySummary } from "../types/domains";

export async function logDua(deceasedId: string): Promise<ActivityLog> {
  const { data, error } = await supabase
    .from("activity_log")
    .insert({
      deceased_id: deceasedId,
      type: "dua",
    })
    .select("*")
    .single();

  if (error) {
    console.error("logDua error:", error);
    throw error;
  }

  return data as ActivityLog;
}

export async function logDeed(deceasedId: string): Promise<ActivityLog> {
  const { data, error } = await supabase
    .from("activity_log")
    .insert({
      deceased_id: deceasedId,
      type: "deed",
    })
    .select("*")
    .single();

  if (error) {
    console.error("logDeed error:", error);
    throw error;
  }

  return data as ActivityLog;
}

export async function logQuranReading(params: {
  deceasedId: string;
  surah?: string;
  pageFrom?: number;
  pageTo?: number;
  juzNumber?: number;
}): Promise<ActivityLog> {
  const { data, error } = await supabase
    .from("activity_log")
    .insert({
      deceased_id: params.deceasedId,
      type: "quran",
      surah: params.surah ?? null,
      page_from: params.pageFrom ?? null,
      page_to: params.pageTo ?? null,
      juz_number: params.juzNumber ?? null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("logQuranReading error:", error);
    throw error;
  }

  return data as ActivityLog;
}

/**
 * Weekly summary (last 7 days) for current user across all deceased.
 * Simple client-side aggregated counts.
 */
export async function getWeeklySummary(): Promise<WeeklySummary> {
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) {
    throw userErr ?? new Error("Not authenticated");
  }

  const userId = userRes.user.id;
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("user_id", userId)
    .gte("timestamp", since.toISOString());

  if (error) {
    console.error("getWeeklySummary error:", error);
    throw error;
  }

  let duaCount = 0;
  let deedCount = 0;
  let quranSessions = 0;

  (data ?? []).forEach((row) => {
    if (row.type === "dua") duaCount++;
    if (row.type === "deed") deedCount++;
    if (row.type === "quran") quranSessions++;
  });

  return {
    duaCount,
    deedCount,
    quranSessions,
  };
}
