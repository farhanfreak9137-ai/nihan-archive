# NIHAN'S ARCHIVE

> **Interactive Conversation Explorer & Relationship Analytics Suite**

A private, beautifully designed, and high-performance digital archive built for the conversation history of **NIHAN** (`Ashikul Islam Nihan`) and **SUMAIYA** (`S` / `s.` / `june_4003`), with multi-thread integration (Hasan, Sajid, Meta AI).

---

## 🌟 Overview

The **NIHAN'S ARCHIVE** transforms raw exported messaging data into an editorial, interactive experience. Rather than browsing static JSON logs, the archive lets you explore conversations through time, search past messages instantly, play voice notes with animated scrubbers, view full-resolution photos, and discover conversational rhythms.

### Key Metrics
* **Total Messages:** 5,436 (`2,716` by NIHAN [50.0%] • `2,377` by SUMAIYA [43.7%] • `206` by HASAN [3.8%] • `132` by SAJID [2.4%] • `5` by META_AI [0.1%])
* **Active Days:** 102 days (January 22, 2026 – October 16, 2026)
* **Shares & Links:** 515 (361 Reels, 130 Posts, 5 Stories, 19 Other)
* **Voice Notes:** 45 voice messages
* **Reactions:** 175 message reactions
* **All-Time Peak Day:** October 11, 2026 (672 messages, 10 calls, 8 voice notes)

---

## ✨ Features

* **📅 Interactive Calendar & Heatmap**:
  Visualizes daily activity density across all months. Click any day to see top shared moments, message distribution, and jump directly to that date's dialogue.

* **💬 High-Performance Conversation Viewer**:
  Powered by `@tanstack/react-virtual` to render thousands of messages smoothly at 60 FPS. Features a 24-hour timeline scrubber, sender alignment, photo lightbox, video playback, custom audio player, and floating reactions.

* **🔍 Full-Text Global Search**:
  Instant search across all 5,436 messages with exact keyword highlighting, multi-sender filters, date boundaries, and one-click jump to context in the chat.

* **📊 Deep Relationship Analytics**:
  * Communication balance and marathon records
  * 24-hour diurnal activity rhythm chart
  * Day-of-the-week message frequency distribution
  * Lexical tracker (Bengali & Banglish pet names, apologies, sweet expressions)
  * Nickname analysis ("penguin 🎀", "Historical landmark", "bauni")

* **🔞 Intimate & Late-Night Vault**:
  Dedicated uncensored section with 15 curated emotional and late-night sessions (568 messages, 6 audio notes).

* **📁 Media & Reels Vault**:
  Dedicated tabbed explorer for Instagram Reels, Posts, Stories, Photos (with fullscreen zoom and download), Videos, and Voice Notes with audio playback.

* **⭐ Important Moments & Bookmarks**:
  Chronological milestone timeline featuring relationship milestones, with ability to save and label custom bookmarks stored locally.

* **🤖 Opt-in AI Day In Review**:
  Client-side Gemini AI integration allowing you to generate nuanced narrative summaries of any selected day on demand with your own API key.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
* **Virtualization**: `@tanstack/react-virtual`
* **Icons & Animation**: `lucide-react`, `framer-motion`
* **Data Processing**: Custom Node/TypeScript ingestion pipeline with mojibake decoding and deduplication

---

## 🚀 Getting Started

### 1. Installation
```bash
git clone https://github.com/nihan-archive/our-archive.git
cd our-archive
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 🔄 Updating with New Messages

When new Instagram conversation exports or media files are added:

1. Place new `message_*.json` files into `Messages/` (or drop an export folder into the workspace).
2. Run the update script:
   ```bash
   npm run build:data
   ```
The pipeline will automatically discover new files, deduplicate records, synchronize media, update day shards, and recalculate calendar and search indices!
