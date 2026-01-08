# 📄 MVP Specification — Sadaqa Jariyah App  
**Version:** 0.4 (Invites & Members Updated)  
**Platform:** React Native (Expo) + Supabase  

**Team Roles**  
- **Developer:** Backend, Logic, Supabase  
- **UI/UX Developer:** Design, Components, Frontend integration  

---

## 🎯 MVP Goal

Enable users to:

- Create profiles for deceased individuals.
- Log Islamic acts of goodness (dua, daily deeds, Quran reading).
- Create **private or shared Quran khatma** for a deceased person.
- Allow **family & friends to “join” a deceased profile** as members.
- Let members participate in shared khatma (pick a juz, mark as completed).
- Share a **public memorial link** that shows:
  - Burial (janazah) details
  - Azah (condolence) details
- Allow public social sharing of the deceased page.

No donations or waqf in MVP.

---

## 👥 Roles & Access Model

### 1. Owner
- User who creates the deceased profile.
- Can:
  - Edit all deceased information.
  - Set profile visibility: private/public.
  - Start private or shared khatma.
  - See all khatma progress & activity.

### 2. Members (Family & Friends)
- Users who **“join/save”** a deceased profile.
- Technically stored in `deceased_collaborators`.
- Can:
  - See the deceased profile in their own list.
  - See burial & azah info.
  - See active khatma for that deceased.
  - Claim a juz and mark it as completed.
  - Log dua / deeds / Quran for this deceased.

### 3. Public Viewers
- Anyone who opens the **public link** (e.g., from social media).
- Can:
  - See name, date of passing, burial & azah info.
- Cannot:
  - See khatma progress.
  - Log anything.
- BUT they see a button:
  - **“Save this person in my app / Join family circle”**  
    → leads to login/signup → then creates a member record.

---

## 🧩 Core Feature Groups

### 1. Authentication

- Email/password signup & login.
- Persisted session.
- Logout.

No OAuth in MVP.

---

### 2. Deceased Profiles

Each profile represents one deceased person.

#### 2.1 CRUD
- Create (name, optional date of passing).
- Edit.
- Delete.
- Mark one as default (for Home view).

#### 2.2 Visibility
- `private`:
  - Visible to owner + members only (through collaborators table).
- `public`:
  - Visible to:
    - Owner
    - Members
    - Anyone with the public link (read-only view).

#### 2.3 Public Share Link (Social Media Friendly)
- Each public profile has:
  - `public_slug`
  - Link pattern: `https://yourapp.com/d/{slug}` (web) and `sadaqa://d/{slug}` (deep link).
- Used to share on:
  - WhatsApp, Telegram, Facebook, etc.

#### 2.4 Members via “Join/Save” (No complex invite tokens)

From the **public deceased page**:

- Public viewer sees a button:  
  **“Save in my app / Join family circle”**
- Flow:
  1. If not logged in → show login/signup.
  2. After login:
     - App inserts a row into `deceased_collaborators`:
       - `deceased_id`
       - `user_id` (current user)
       - `role = collaborator`
- Result:
  - This deceased appears in their own “Deceased List”.
  - They become a **Member** of this deceased person.

> No separate invite tokens in MVP. Membership is driven by the public link + login + “Join/Save” action.

#### 2.5 Burial & Azah Information

Optional fields on the deceased profile:

**Burial (Janazah)**

- `burial_salah`: which prayer (Fajr/Dhuhr/Asr/Maghrib/Isha).
- `burial_date`: date & time.
- `burial_location`: free text (address, mosque, cemetery).

**Azah (Condolence Gathering)**

- `azah_date_start`: date or start of range.
- `azah_date_end`: optional end date.
- `azah_location`: address / hall / home.

Displayed on:

- Owner and members’ views.
- Public view (if visibility = public).

---

### 3. Dua Module

- Local dua library (JSON).
- Categories:
  - For deceased, forgiveness, general.
- User selects a dua and confirms.
- Logs activity in `activity_log`:
  - `type = dua`
  - `deceased_id`, `user_id`, `timestamp`.

---

### 4. Daily Good Deeds Module

- Local list of deed suggestions.
- “Today’s Good Deed” suggestion.
- User marks completion.
- Logs activity:
  - `type = deed`.

---

### 5. Quran Reading Module

- Simple Quran reading logging (no full text requirement in MVP).
- User logs:
  - Surah name and/or page range.
- Logs activity:
  - `type = quran`
  - optional: `surah`, `page_from`, `page_to`, `juz_number`.

---

### 6. Khatma Module (Private & Shared)

Goal: Allow the owner to start a khatma; allow members to pick and complete ajzaa (juz).

#### 6.1 Khatma Creation

Owner, from deceased details:

- “Start Khatma”
- Choose:
  - Private (only owner participates)
  - Shared (owner + members)

The system:

- Inserts into `khatma`:
  - `deceased_id`
  - `owner_user_id`
  - `is_shared`
  - `status = active`
- Inserts 30 rows into `khatma_juz`:
  - 1 to 30, all `status = unclaimed`.

#### 6.2 Discovering Active Khatma

For **members** (and owner):

- On deceased details screen:
  - Query `khatma` where `deceased_id = X` and `status = active`.
- If exists:
  - Show banner:
    - “There is an active khatma for [Name] – pick a juz to join.”
  - Show khatma progress & juz list.

_MVP: no push notifications required. The presence of an active khatma is discovered when member opens the app / the profile._

#### 6.3 Juz Claim & Completion

For members and owner:

- Juz list:
  - If `status = unclaimed` → show button “Pick this juz”.
  - On tap → `claimJuz(juzId)`:
    - Sets `assigned_user_id = current user`
    - `status = in_progress`
- When the member finishes reading:
  - Tap “I finished this juz” → `completeJuz(juzId)`:
    - `status = completed`
    - `completed_at = now()`.

Progress bar:

- `completed_juz / 30` as percentage.

#### 6.4 Ending Khatma

- Owner can update status:
  - `status = completed` in `khatma`.
- Optionally start another khatma later.

---

### 7. Public Deceased View (Social Link)

Accessible via:

- `https://yourapp.com/d/{slug}` (web)
- `sadaqa://d/{slug}` (deep link)

Shows:

- Name & date of passing.
- Burial details (if present).
- Azah details (if present).
- A general reminder to make dua.

Important actions:

- **“Save this person in my app / Join family circle”**
  - If logged in → create collaborator row.
  - If not → login/signup → then create collaborator row.

No khatma or internal activity is shown to public viewers in MVP.

---

### 8. Activity Summary

On Home screen:

- Summarize user activity (last 7 days):
  - Number of dua.
  - Number of deeds.
  - Number of Quran reading sessions.

Simple client-side aggregation over `activity_log`.

---

## 📱 MVP Screens

(unchanged in structure, but some copy updated)

- Onboarding
- Login / Register
- Home
- Deceased List
- Deceased Details (now includes burial/azah + khatma section + “Join family” state)
- Dua Library
- Daily Deeds
- Quran Reading
- Khatma Overview + Juz List
- Public Deceased Screen (web + app deep link)

---

## 🏗 Data Model (Supabase) – High Level

**Already implemented in DB:**

- `deceased_profiles`
- `deceased_collaborators`
- `khatma`
- `khatma_juz`
- `activity_log`

No `invite_tokens` needed for MVP in this design.

---

## 🔐 RLS Summary (Conceptual)

- Owner:
  - Full read/write on their deceased and khatma.
- Members:
  - Read the deceased profile (private/public).
  - Read & update their assigned juz.
  - Insert & read activity for deceased they belong to.
- Public:
  - Read-only access to public deceased (via slug).
  - No khatma visibility.
  - No activity access.

---

## 🎉 MVP Done When

A user can:

1. Sign up / log in.
2. Create a deceased profile with burial & azah info.
3. Make the profile public & share the link (social media).
4. Another user opens the link, logs in, and **joins** as a member.
5. Owner starts a **shared khatma** for that deceased.
6. Members see the active khatma when they open the app/profile.
7. Members pick ajzaa (juz) and mark them completed.
8. All see khatma progress.
9. Weekly activity stats reflect dua/deeds/quran.
10. Public viewers (not logged) can see janazah & azah info via link.
