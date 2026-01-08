// app/src/services/khatmaService.ts
import { supabase } from "./supabase/client";
import type { Khatma, KhatmaJuz, KhatmaStatus } from "../types/domains";

/**
 * Create a new khatma for a deceased, and auto-create 30 juz rows.
 * RLS ensures only owner can create.
 */
export async function createKhatma(params: {
  deceasedId: string;
  isShared: boolean;
}): Promise<{
  khatma: Khatma;
  juz: KhatmaJuz[];
}> {
  // 1) Create khatma
  const { data: khatmaData, error: khatmaError } = await supabase
    .from("khatma")
    .insert({
      deceased_id: params.deceasedId,
      is_shared: params.isShared,
    })
    .select("*")
    .single();

  if (khatmaError) {
    console.error("createKhatma error:", khatmaError);
    throw khatmaError;
  }

  const khatma = khatmaData as Khatma;

  // 2) Create 30 juz for this khatma
  const juzRows = Array.from({ length: 30 }, (_, i) => ({
    khatma_id: khatma.id,
    juz_number: i + 1,
    status: "unclaimed",
  }));

  const { data: juzData, error: juzError } = await supabase
    .from("khatma_juz")
    .insert(juzRows)
    .select("*");

  if (juzError) {
    console.error("createKhatma (juz insert) error:", juzError);
    throw juzError;
  }

  return {
    khatma,
    juz: (juzData ?? []) as KhatmaJuz[],
  };
}

/**
 * Get all khatma for a deceased that current user can see (owner or collaborator).
 */
export async function getKhatmaForDeceased(
  deceasedId: string
): Promise<Khatma[]> {
  const { data, error } = await supabase
    .from("khatma")
    .select("*")
    .eq("deceased_id", deceasedId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getKhatmaForDeceased error:", error);
    throw error;
  }

  return (data ?? []) as Khatma[];
}

/**
 * Get a khatma with all its juz rows.
 */
export async function getKhatmaWithJuz(
  khatmaId: string
): Promise<{ khatma: Khatma; juz: KhatmaJuz[] }> {
  const { data: khatmaData, error: khatmaError } = await supabase
    .from("khatma")
    .select("*")
    .eq("id", khatmaId)
    .single();

  if (khatmaError) {
    console.error("getKhatmaWithJuz (khatma) error:", khatmaError);
    throw khatmaError;
  }

  const { data: juzData, error: juzError } = await supabase
    .from("khatma_juz")
    .select("*")
    .eq("khatma_id", khatmaId)
    .order("juz_number", { ascending: true });

  if (juzError) {
    console.error("getKhatmaWithJuz (juz) error:", juzError);
    throw juzError;
  }

  return {
    khatma: khatmaData as Khatma,
    juz: (juzData ?? []) as KhatmaJuz[],
  };
}

/**
 * Claim a juz for the current user (owner or collaborator).
 */
export async function claimJuz(khatmaJuzId: string): Promise<KhatmaJuz> {
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) {
    throw userErr ?? new Error("Not authenticated");
  }

  const userId = userRes.user.id;

  const { data, error } = await supabase
    .from("khatma_juz")
    .update({
      assigned_user_id: userId,
      status: "in_progress",
    })
    .eq("id", khatmaJuzId)
    .select("*")
    .single();

  if (error) {
    console.error("claimJuz error:", error);
    throw error;
  }

  return data as KhatmaJuz;
}

/**
 * Release a juz (back to unclaimed) - owner or the same user can do this.
 */
export async function releaseJuz(khatmaJuzId: string): Promise<KhatmaJuz> {
  const { data, error } = await supabase
    .from("khatma_juz")
    .update({
      assigned_user_id: null,
      status: "unclaimed",
      completed_at: null,
    })
    .eq("id", khatmaJuzId)
    .select("*")
    .single();

  if (error) {
    console.error("releaseJuz error:", error);
    throw error;
  }

  return data as KhatmaJuz;
}

/**
 * Mark Juz as completed by current user.
 */
export async function completeJuz(khatmaJuzId: string): Promise<KhatmaJuz> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("khatma_juz")
    .update({
      status: "completed",
      completed_at: now,
    })
    .eq("id", khatmaJuzId)
    .select("*")
    .single();

  if (error) {
    console.error("completeJuz error:", error);
    throw error;
  }

  return data as KhatmaJuz;
}

/**
 * Update khatma status (e.g., mark as completed).
 * Only owner can do this (RLS).
 */
export async function updateKhatmaStatus(
  khatmaId: string,
  status: KhatmaStatus
): Promise<Khatma> {
  const { data, error } = await supabase
    .from("khatma")
    .update({ status })
    .eq("id", khatmaId)
    .select("*")
    .single();

  if (error) {
    console.error("updateKhatmaStatus error:", error);
    throw error;
  }

  return data as Khatma;
}
