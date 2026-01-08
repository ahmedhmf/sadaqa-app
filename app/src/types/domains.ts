export type Visibility = "private" | "public";

export interface DeceasedProfile {
  id: string;
  owner_user_id: string;
  name: string;
  death_date: string | null; // ISO date

  visibility: Visibility;
  public_slug: string | null;

  burial_salah: string | null;
  burial_date: string | null; // ISO datetime
  burial_location: string | null;

  azah_date_start: string | null; // ISO datetime
  azah_date_end: string | null;   // ISO datetime
  azah_location: string | null;

  created_at: string;
  updated_at: string;
}

export type ActivityType = "dua" | "deed" | "quran";

export interface ActivityLog {
  id: string;
  user_id: string;
  deceased_id: string;
  type: ActivityType;
  timestamp: string;

  surah?: string | null;
  page_from?: number | null;
  page_to?: number | null;
  juz_number?: number | null;

  created_at: string;
}

export type KhatmaStatus = "active" | "completed";

export interface Khatma {
  id: string;
  deceased_id: string;
  owner_user_id: string;
  is_shared: boolean;
  status: KhatmaStatus;
  created_at: string;
  updated_at: string;
}

export type KhatmaJuzStatus = "unclaimed" | "in_progress" | "completed";

export interface KhatmaJuz {
  id: string;
  khatma_id: string;
  juz_number: number;
  assigned_user_id: string | null;
  status: KhatmaJuzStatus;
  completed_at: string | null;
  created_at: string;
}

export interface WeeklySummary {
  duaCount: number;
  deedCount: number;
  quranSessions: number;
}
