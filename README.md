# NILA ARCHIVE

> **Interactive Conversation Explorer & Relationship Analytics Suite**

A private, beautifully designed, and high-performance digital archive built for the conversation history between **NILA** (`NILU`) and **FARHAN** (`farhannn`).

---

## 🌟 Overview

The **NILA ARCHIVE** transforms raw exported messaging data into an editorial, interactive experience. Rather than browsing static JSON logs, the archive lets you explore conversations through time, search past messages instantly, play voice notes with animated scrubbers, view full-resolution photos, and discover conversational rhythms.

### Key Metrics
* **Total Messages:** 80,988 (`41,741` by NILA • `39,247` by FARHAN)
* **Active Days:** 87 days (July 6, 2026 – October 1, 2026)
* **Shares & Links:** 2,109 (1,633 Reels, 350 Posts, 61 Stories, 65 Other)
* **Voice Notes:** 2,147 voice messages
* **Reactions:** 2,597 message reactions

---

## ✨ Features

* **📅 Interactive Calendar & Heatmap**:
  Visualizes daily activity density across all months. Click any day to see top shared moments, message distribution, and jump directly to that date's dialogue.

* **💬 High-Performance Conversation Viewer**:
  Powered by `@tanstack/react-virtual` to render thousands of messages smoothly at 60 FPS. Features a 24-hour timeline scrubber, sender alignment, photo lightbox, video playback, custom audio player, and floating reactions.

* **🔍 Full-Text Global Search**:
  Instant search across all 80,988 messages with exact keyword highlighting, sender filters, date boundaries, and one-click jump to context in the chat.

* **📊 Deep Relationship Analytics**:
  * 51.5% vs 48.5% communication balance
  * 24-hour diurnal activity rhythm chart
  * Day-of-the-week message frequency distribution
  * Lexical tracker (*"I love you"*, apologies, greetings, promises)
  * Nickname analysis and mention frequencies

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
git clone https://github.com/farhanfreak9137-ai/our-archive.git
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
