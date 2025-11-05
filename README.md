# 🩺 AI Medical Support Chatbot

A web-based chatbot providing evidence-based health information from verified public datasets (CDC, Mayo Clinic, MedlinePlus, NHS) using retrieval-augmented generation (RAG) and a pre-trained LLM (Gemini / OpenAI). Built for SFSU CSC 698 – Generative AI Capstone.

---

## 🧩 5-Week Split: 10/29 – 12/10 (Condensed Plan)

| **Week** | **Milestone** | **Zoë — PM / Docs / Flex** | **Jason — Backend / AI** | **Hana — Frontend / QA** |
|-----------|---------------|-----------------------------|---------------------------|---------------------------|
| **1** | **Slice 0–1: Scaffold + Mocked Chat** | • Create repo + Sheets task board  <br>• Add internal README (setup + API contract)  <br>• Write About / Privacy / disclaimer text | • Set up `/server.js`, static `/public`  <br>• Add mock `/ask` endpoint  <br>• Basic request logging | • Drop in polished UI  <br>• Wire `fetch('/ask')`  <br>• Add bubbles, loading, error UX  <br>• A11y: `aria-live`, focus rings |
| **2** | **Slice 2: Live LLM + Prompt Rules + Eval** | • Draft prompt rules (citations, ≤120 words)  <br>• Create 10-question eval + rubric | • Add `AI_MODE=mock|live`  <br>• Connect LLM (Gemini / OpenAI)  <br>• Add `.env.example`, timeout 6 s | • Run eval in UI, file issues  <br>• Refine loading UX + mobile spacing |
| **3** | **Slice 3: RAG-lite + Checkpoint Report** | • Curate `/data/snippets.json` (CDC / Mayo / MedlinePlus / NHS)  <br>• Submit Checkpoint Progress Report  <br>• Write Privacy modal text | • Implement `getSnippets(query)` (k = 2–3)  <br>• Compose prompt with snippets  <br>• Extract orgs → `sources` | • Render source chips + modal  <br>• Wrap / scroll styling  <br>• A11y pass (labels, contrast) |
| **4** | **Slice 4: Guardrails + Polish + Deploy** | • Run full eval + record scores  <br>• Prep demo content  <br>• Add deploy instructions in README | • Tighten prompt (“USE ONLY snippets”)  <br>• Add rate-limit (10/min/IP)  <br>• Deploy to Render or EC2  <br>• Fallback to mock on errors | • Favicon / title / footer credits  <br>• Verify prod URL E2E  <br>• Screenshot/gif capture  <br>• Responsive QA |
| **5** | **Slice 5: Final Demo + Paper Deliverables** | • Draft & format Publishable Paper  <br>• Final Report + Known-Issues List  <br>• Demo Script (happy path + fallback) | • Tiny load test  <br>• Review logs / latency  <br>• Freeze versions + tag final release | • Re-run eval on prod  <br>• Confirm Clear / Copy + modals  <br>• Practice demo timing |

---

### 🔒 Non-Negotiables (Apply Every Week)

- **Contract:** `POST /ask` → `{answer, sources[]}` for all modes and errors.  
- **Mode switch:** `AI_MODE=mock|live|rag` (default mock); UI unchanged across modes.  
- **Answer policy:** ≤120 words, cite orgs, and include educational disclaimer.  
- **Safety:** 6 s timeout, input clamp, graceful error UX; light rate-limit (Week 4+).  
- **Docs:** Update README only for setup, environment, or deployment changes.

---

### 📂 File Map (Stable)

```
/public/index.html
/public/script.js
/public/styles.css
/server.js
/data/snippets.json
```

---

### ✅ Quick Acceptance Checks per Week

- **W1:** Mock answer + source chips + disclaimer render correctly; app runs locally.  
- **W2:** Flip `AI_MODE=live` → returns real answers; failures handled gracefully.  
- **W3:** Answers cite verified orgs from `snippets.json`; checkpoint submitted.  
- **W4:** No crashes; rate-limit + logging work; latency recorded.  
- **W5:** Deployed URL functional; final paper + demo ready.

---

### Note
Zoë may flex support between Hana and Jason as needed during critical integration or polish phases.

---

## 🗓️ Week 1 (10/29 – 11/10) — Slice 0–1: Scaffold + Mocked Chat + Mini Polish (UI ↔ Server)

### **Goal**
Deliver a working one-page chatbot that runs locally, sends a user question to `/ask`, and receives a **mock JSON answer** with citations and a disclaimer.  
By the end of this week, the full local loop (UI ↔ Server) should function and be visually stable enough for live LLM integration next week.

### **Deliverables**
✅ Functional local demo (mocked answers)  
✅ Shared GitHub repo with working branches  
✅ Short internal README (setup + API contract + env vars)  
✅ Draft Privacy / About / Disclaimer modals  
🖼️ *Optional:* Capture a screenshot of the working mock chat (used later in Week 5 report/demo).

---

### 🧭 **ZOË — PM / Flex**
**Objective:** Stand up repo, documentation, and team workflow so backend and frontend can integrate cleanly.

**Tasks**
- Create GitHub repo (`ai-medical-chatbot`) and initialize `develop` branch.  
- Add folders and files: 
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
- Add `.gitignore` (`node_modules`, `.env`, `.DS_Store`).  
- Write **internal README** with:  
- setup / run instructions  
- environment variables (`AI_MODE`, `PORT`)  
- file map & contribution rules  
- Create `.nvmrc` or note Node version (e.g., `v20.x`) for consistency.  
- Set up **Google Sheets Task Manager** (To Do → In Progress → Done).  
- Draft **About / Privacy / Disclaimer** text for chatbot modals.  
- Add `DISCLAIMER.md` or footer text in UI: “For educational use only. Not medical advice.”  
- Assist with integration testing mid-week to verify `/ask` response renders.

---

### ⚙️ **JASON — Backend / AI**
**Objective:** Create Express server that serves static files and provides a mock `/ask` route returning structured JSON.

**Tasks**
- Initialize project:  
```bash
npm init -y
npm install express body-parser cors
```
- Create `.env.example` for `AI_MODE`, `PORT`, and placeholder API keys.
- Contract: `POST /ask` → returns `{ "answer": string, "sources": string[] }`
- Implement `/server.js` to:
  - Serve static files from /public
  - Handle POST /ask returning mock data like:
      ```
      { "answer": "According to the CDC, wash hands regularly.", "sources": ["CDC", "Mayo Clinic"] }
      ```
  - Log request time, input length, and mode.
- Confirm local run: `npm start` → “Server on http://localhost:3000”.
- Push under `jason-branch`; open PR to `develop`.

---

### 🎨 **HANA — Frontend / QA**

**Objective:**  
Build minimal chat interface and connect to backend mock endpoint; polish basic UX and accessibility.

**Tasks**
- Use base HTML/CSS layout (header, chat window, input, disclaimer).  
- Connect form → `/ask` via `fetch()`.  
- Add loading bubble, bot/user message styling, and error handling.  
- Display citations as **source chips** and show disclaimer text below each answer.  
- Verify keyboard navigation (`tab`, `enter`) and screen-reader cues (`aria-live`).  
- Test responsive layout on desktop + mobile widths.  
- Push under `hana-branch`; merge after review.  

---

### 🧩 **End-of-Week Integration Checklist**

- ✅ `npm start` launches local app.  
- ✅ Typing a question returns mock `{answer, sources}` response.  
- ✅ Sources and disclaimer appear correctly in UI.  
- ✅ `.gitignore`, `.env.example`, `.nvmrc`, and internal README complete.  
- ✅ All team branches merged into `develop`; app stable for Week 2 LLM integration.