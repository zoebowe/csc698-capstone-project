# 6-Week Split: 10/29 - 12/10 (Parallel + Vertical Slices)

| Week | Milestone | **Zoë — PM / Docs / Flex** | **Jason — Backend / AI** | **Hana — Frontend / QA** |
|------|------------|-----------------------------|---------------------------|-----------------------------|
| **1** | **Slice 0–1: Scaffold + Mocked Chat** | • Create repo + Google Sheets Task Manager  <br>• Add short internal README (setup steps + API contract)  <br>• Write About/Privacy/disclaimer text for UI | • Set up `/server.js`, static `/public`  <br>• Add POST `/ask` (returns mock `{answer,sources:[]}`)  <br>• Basic request logging | • Drop in polished UI  <br>• Wire `fetch('/ask')`  <br>• Add bubbles, loading, and error message  <br>• A11y: `aria-live`, focus rings  <br>• Add Clear/Copy if quick |
| **2** | **Slice 2: Live LLM, same contract** | • Draft prompt rules (≤120 words, cite orgs, “educational only”)  <br>• Create 10-question eval + rubric | • Add `AI_MODE=mock|live` (default mock)  <br>• Call LLM when `live`  <br>• Add `.env.example` for keys  <br>• Timeout 6s, input clamp, friendly fallback returns same JSON | • Run eval in UI, file issues  <br>• Refine loading/error UX  <br>• Minor visual polish; mobile spacing |
| **3** | **Slice 3a: RAG-lite plumbing + Checkpoint Report** | • Curate `/data/snippets.json` (CDC/Mayo/MedlinePlus/NHS chunks)  <br>• Prepare and submit **Checkpoint Progress Report** | • Implement `getSnippets(query)` (keyword/topic match, k=2–3)  <br>• Compose prompt with snippets  <br>• Extract used orgs → return as sources | • Render real source chips from response  <br>• Optional “View sources” mini-modal  <br>• Ensure chips wrap & scroll nicely |
| **4** | **Slice 3b: RAG quality + guardrails** | • Finalize Privacy modal text | • Tighten prompt (“USE ONLY snippets”)  <br>• Handle empty retrieval (safe fallback)  <br>• Add light rate-limit (e.g., 10/min/IP)  <br>• Log latency, mode, sources, error | • A11y pass (labels, contrast)  <br>• Stress-test inputs (long/empty/weird)  <br>• Responsive tweaks; cross-browser smoke |
| **5** | **Slice 4: Polish + Deploy** | • Run full eval; record scores  <br>• Finalize demo content (for presentation & peer review) | • Deploy to Render/EC2  <br>• Add deploy instructions to README (start command + env vars)  <br>• Fallback to mock on provider errors  <br>• Tag release | • Favicon, title, footer credits  <br>• Verify prod URL end-to-end  <br>• Screenshot/gif capture  <br>• Final UI nits |
| **6** | **Slice 5: Demo hardening + Publishable Paper** | • Draft and format **Publishable Paper** (graduate deliverable)  <br>• Final report  <br>• Known-issues list  <br>• Demo script (happy path + fallback) | • Tiny load test  <br>• Review logs; tweak timeouts/prompt  <br>• Freeze versions, tag final | • Re-run eval on prod  <br>• Confirm Clear/Copy and modals  <br>• Practice demo clicks & timing |

#### Note: Zoë will hop in where needed for Hana, Jason, or both.

---

## Non-negotiables (apply every week)

- **Contract never changes:** `POST /ask` → `{answer:string, sources:string[]}` for success and failures (friendly fallback).  
- **Mode switch:** `AI_MODE=mock|live|rag` (default mock); UI unchanged across modes.  
- **Answer policy:** ≤120 words, cite orgs; include educational disclaimer line.  
- **Safety:** 6s timeout, input clamp, graceful error UX; light rate-limit (Week 4+).  
- **Docs:** Only update README if setup, environment, or deployment steps change.

---

## File map (stable)
```
/public/index.html
/public/script.js
/public/styles.css
/server.js
/data/snippets.json
```

---

## Quick acceptance checks per week

- **W1:** Type → see mock answer + sources chips + disclaimer; app runs locally.  
- **W2:** Flip `AI_MODE=live` → real answers; failures still return friendly JSON.  
- **W3:** Answers cite orgs actually injected from `snippets.json`; checkpoint report submitted.  
- **W4:** Can’t crash with odd input; rate-limit works; logs show latency/mode/sources.  
- **W5:** Deployed URL works; README includes deploy instructions.  
- **W6:** Demo smooth; publishable paper submitted; eval results captured.

---

# 🗓️ Week 1 (10/29 - 11/05) — Slice 0–1: Scaffold + Mocked Chat (UI ↔ Server)

### **Goal:**
One-page chatbot app that opens in the browser, sends a question to `/ask`, and gets a fake answer back with citations and a disclaimer.

### **Deliverable:**
* ✅ Functional local demo (mocked answers)  
* ✅ Shared GitHub repo  
* ✅ Short internal README with setup steps & API contract  

---

## 🧭 **ZOË — PM / Flex**
**Objective:** Establish repo, workflow, and minimal documentation so dev work can start cleanly.

**Tasks:**
- Create GitHub repo (`ai-medical-chatbot`).  
- Add folders:  
  ```
  /public/
  ├── index.html
  ├── script.js
  ├── styles.css
  /data/
  ├── snippets.json
  server.js
  README.md
  ```
- Add `.gitignore` (node_modules, .env).  
- Write **short internal README** (how to run app, file map, env vars).  
- Set up **Google Sheets Task Manager** (“To Do”, “In Progress”, “Done”).  
- Draft **About/Privacy text** for chatbot modals.

---

## ⚙️ **JASON — Backend / AI**
**Objective:** Spin up an Express server, serve static files, and provide working `/ask` endpoint returning mock data.

**Tasks:**
- Run `npm init -y`.  
- Install dependencies:  
  ```bash
  npm install express body-parser cors
  ```
- Create `.env.example` (for `AI_MODE` and optional API keys).  
- Write `/server.js` to serve `/public` and handle `/ask` POST.  
- Test locally (`npm start` → “Server on…”).  
- Push code under `jason-branch`.

---

## 🎨 **HANA — Frontend / QA**
**Objective:** Implement base chat page and connect it to the mock backend.

**Tasks:**
- Use existing HTML/CSS template (header, chat, input, disclaimer).  
- Connect form to backend `/ask` route via `fetch()`.  
- Add loading state and bubbles for user/bot.  
- Confirm responses render correctly with source chips.  
- Test keyboard-only navigation and layout responsiveness.  
- Push updates under `hana-branch`.

---

## 🧩 **End-of-Week Integration Checklist**
- ✅ `npm start` opens at `http://localhost:3000`.  
- ✅ Chat input → mock answer with “CDC, Mayo Clinic”.  
- ✅ Disclaimer visible on page.  
- ✅ Internal README includes setup + run instructions.  
- ✅ Everyone commits to their own branch → merge to `develop`.  