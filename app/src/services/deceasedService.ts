import { supabase } from "./supabase/client";
import type { DeceasedProfile, Visibility } from "../types/domains";
import { nanoid } from "nanoid/non-secure";

// Helper to map DB row to TS type (if needed for transforms)
function mapDeceased(row: any): DeceasedProfile {
  return row as DeceasedProfile;
}

/**
 * Get all deceased profiles visible to current user:
 * - owner
 * - collaborator
 * - public (RLS already handles visibility).
 */
export async function getDeceasedProfiles(): Promise<DeceasedProfile[]> {
  const { data, error } = await supabase
    .from("deceased_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getDeceasedProfiles error:", error);
    throw error;
  }

  return (data ?? []).map(mapDeceased);
}

/**
 * Create new deceased profile for current user.
 */
export async function createDeceased(payload: {
  name: string;
  death_date?: string | null;
  burial_salah?: string | null;
  burial_date?: string | null;
  burial_location?: string | null;
  azah_date_start?: string | null;
  azah_date_end?: string | null;
  azah_location?: string | null;
}): Promise<DeceasedProfile> {
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) {
    throw userErr ?? new Error("Not authenticated");
  }

  const insert = {
    owner_user_id: userRes.user.id,
    name: payload.name,
    death_date: payload.death_date ?? null,
    burial_salah: payload.burial_salah ?? null,
    burial_date: payload.burial_date ?? null,
    burial_location: payload.burial_location ?? null,
    azah_date_start: payload.azah_date_start ?? null,
    azah_date_end: payload.azah_date_end ?? null,
    azah_location: payload.azah_location ?? null,
  };

  const { data, error } = await supabase
    .from("deceased_profiles")
    .insert(insert)
    .select("*")
    .single();

  if (error) {
    console.error("createDeceased error:", error);
    throw error;
  }

  return mapDeceased(data);
}

/**
 * Update deceased profile (only owner; RLS enforces that).
 */
export async function updateDeceased(
  id: string,
  updates: Partial<Pick<
    DeceasedProfile,
    | "name"
    | "death_date"
    | "burial_salah"
    | "burial_date"
    | "burial_location"
    | "azah_date_start"
    | "azah_date_end"
    | "azah_location"
  >>
): Promise<DeceasedProfile> {
  const { data, error } = await supabase
    .from("deceased_profiles")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("updateDeceased error:", error);
    throw error;
  }

  return mapDeceased(data);
}

/**
 * Delete deceased profile (only owner).
 */
export async function deleteDeceased(id: string): Promise<void> {
  const { error } = await supabase
    .from("deceased_profiles")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteDeceased error:", error);
    throw error;
  }
}

/**
 * Toggle visibility (private/public).
 */
export async function setDeceasedVisibility(
  id: string,
  visibility: Visibility
): Promise<DeceasedProfile> {
  const { data, error } = await supabase
    .from("deceased_profiles")
    .update({ visibility })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("setDeceasedVisibility error:", error);
    throw error;
  }

  return mapDeceased(data);
}

/**
 * Generate public slug & set profile to public.
 */
export async function makeDeceasedPublic(id: string): Promise<DeceasedProfile> {
  const slug = nanoid(14);

  const { data, error } = await supabase
    .from("deceased_profiles")
    .update({
      visibility: "public",
      public_slug: slug,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("makeDeceasedPublic error:", error);
    throw error;
  }

  return mapDeceased(data);
}

/**
 * Remove public slug & set profile to private.
 */
export async function makeDeceasedPrivate(id: string): Promise<DeceasedProfile> {
  const { data, error } = await supabase
    .from("deceased_profiles")
    .update({
      visibility: "private",
      public_slug: null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("makeDeceasedPrivate error:", error);
    throw error;
  }

  return mapDeceased(data);
}

/**
 * Fetch a public deceased by slug (for PublicDeceasedScreen).
 * Works without authentication thanks to RLS.
 */
export async function getDeceasedBySlug(
  slug: string
): Promise<DeceasedProfile | null> {
  const { data, error } = await supabase
    .from("deceased_profiles")
    .select("*")
    .eq("public_slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows
      return null;
    }
    console.error("getDeceasedBySlug error:", error);
    throw error;
  }

  return data ? mapDeceased(data) : null;
}

/**
 * Join a public deceased profile as member (collaborator).
 * Creates a row in deceased_collaborators for current user.
 * If the user is already a member, we silently ignore the unique violation.
 */
export async function joinDeceasedAsMember(
  deceasedId: string
): Promise<void> {
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes.user) {
    throw userErr ?? new Error("Not authenticated");
  }

  const userId = userRes.user.id;

  const { error } = await supabase
    .from("deceased_collaborators")
    .insert({
      deceased_id: deceasedId,
      user_id: userId,
      role: "collaborator",
    });

  if (error) {
    // Unique constraint violation means user is already a member.
    if (error.code === "23505") {
      console.log("User already a member of this deceased profile");
      return;
    }
    console.error("joinDeceasedAsMember error:", error);
    throw error;
  }
}
