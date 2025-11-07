# 🚀 Setup Guide
See **[Setup Guide → docs/SETUP.md](./docs/SETUP.md)** for installation, run commands, and testing instructions.


# 🗓️ 5-Week Project Split: CSC 698 — AI Medical Support Chatbot

| **Week** | **Focus / Milestone** | **Zoe — PM / Docs / Flex** | **Jason — Backend / AI** | **Hana — Frontend / QA** |
|-----------|-----------------------|-----------------------------|---------------------------|---------------------------|
| **1** | **Slice 0 – Scaffold + Mocked Chat**<br>Goal: Working local prototype (UI ↔ Mock Server). | • Create GitHub repo + branching setup<br>• Add internal SETUP (setup, API contract)<br>• Write About / Privacy / Disclaimer modals<br>• Draft architecture diagram + weekly goals | • Initialize Node/Express server<br>• Create mock `/ask` endpoint returning sample JSON (`{answer, sources: []}`)<br>• Log incoming requests | • Build HTML chat UI (chat window, input box, send button)<br>• Connect frontend → mock API<br>• Add simple CSS styling + message bubbles |
| **2** | **Slice 1 – Real Server Integration**<br>Goal: Backend + UI send/receive real data. | • Write short API contract doc (`/ask` specs)<br>• Check repo structure, write testing guide | • Connect server to real POST input<br>• Add basic data retrieval module (stubbed CDC/Mayo dataset JSON)<br>• Implement error handling + logging | • Improve UI state (loading indicator + error messages)<br>• Test real backend response rendering |
| **3** | **Slice 2 – LLM Integration**<br>Goal: AI generates answers from backend. | • Document prompt templates and LLM instructions<br>• Validate disclaimer text + tone | • Integrate Gemini or OpenAI API call in `/ask`<br>• Test LLM responses with sample queries<br>• Handle timeouts + API errors | • Polish chat layout (bubbles, citations list)<br>• Add scrollable history + reset button |
| **4** | **Slice 3 – RAG + Source Grounding**<br>Goal: Verified data + citations. | • Curate public datasets (CDC, Mayo, MedlinePlus JSON index)<br>• Document retrieval process and cite format | • Build retriever (search relevant chunks from datasets)<br>• Combine retrieved text + LLM answer<br>• Return citations in response JSON | • Display citations nicely (links to sources)<br>• Ensure disclaimer visible per message |
| **5** | **Slice 4 – Testing + Polish + Demo Prep**<br>Goal: Stable demo & presentation-ready. | • Run QA tests with team<br>• Finalize documentation + slide deck<br>• Prepare demo script and submission package | • Optimize server performance / cache datasets<br>• Add logging and metrics (print source counts, API latency) | • UI refinements (theme, mobile layout)<br>• Conduct usability testing + bug report sheet |

---

### 👥 Team Roles
- **Zoe Elias** — PM / Docs / Flex (can assist both frontend & backend to balance workload)  
- **Jason Anousaya** — Backend / AI  
- **Hana Emari** — Frontend / QA

---

## 💡 How This Works
Each week is a **vertical slice** — a fully working mini-version of the chatbot that adds one new system layer.  
- **Zoe** keeps coordination, docs, and integration smooth while helping flexibly with either side as needed. 
- **Hana** focuses on user-facing experience (clarity, styling, QA).  
- **Jason** focuses on backend logic and LLM integration.  

---

## 🧭 End-of-Project Deliverables
- ✅ Working chatbot demo (web-based, cited responses + disclaimers)  
- ✅ Final code repo (Node + HTML/JS)  
- ✅ Documentation (SETUP, architecture diagram, source references)  
- ✅ Presentation slides (overview + live demo)


# 📌 Week 1 — “Slice 0: Scaffold + Mocked Chat”

### 🎯 Goal  
Deliver a working **local chatbot prototype** where the UI connects to a mocked `/ask` endpoint that returns a sample answer with sources and a disclaimer.

---

## 🧭 Zoe — PM / Docs / Flex  
**Focus:** Setup, documentation, and integration prep.

**Tasks**
- [ ] Create GitHub repo (`ai-medical-chatbot`) and initialize default branches (`main`, `develop`).
- [ ] Set up `.gitignore`, `SETUP.md`, and internal `/docs` folder.
- [ ] Write internal SETUP sections:
  - Setup instructions  
  - API contract for `/ask` endpoint  
  - Environment variable notes (`.env.example`)
- [ ] Create or copy project boilerplate files:
```
/server.js
/public/index.html
/public/script.js
/public/style.css
```
- [ ] Write **About / Privacy / Disclaimer** text for modal placeholders.
- [ ] Confirm development environments and test local server start.
- [ ] Assist Hana or Jason as flex support if either falls behind.

---

## ⚙️ Jason — Backend / AI  
**Focus:** Set up a minimal Express server returning mock data.

**Tasks**
- [ ] Install dependencies:  
```bash
npm init -y  
npm install express nodemon dotenv
```
- [ ] Create `server.js` with a basic `/ask` POST endpoint:
```
app.post('/ask', (req, res) => {
  res.json({
    answer: "This is a mocked answer about healthy sleep habits.",
    sources: ["https://www.cdc.gov/sleep"],
    disclaimer: "This information is for educational purposes only."
  });
});
```
- [ ] Add middleware for `express.json()` and simple console logging of requests.
- [ ] Confirm server starts with `npm run dev` (using nodemon).
- [ ] Share endpoint URL and testing instructions with Hana.

---

## 💬 Hana — Frontend / QA
**Focus:** Build and connect a simple HTML chat interface.

**Tasks**
- [ ] Create `index.html` with:
  - Title and short tagline
  - Message display area
  - Input field + “Send” button
- [ ] Build `script.js`:
```
async function sendMessage() {
  const question = document.getElementById('input').value;
  const res = await fetch('/ask', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ question })
  });
  const data = await res.json();
  renderMessage(data);
}
```
- [ ] Create minimal CSS for chat bubbles (user vs. bot).
- [ ] Test full round-trip: typing → fetch → render mock response.
- [ ] Record screenshot or short clip of working mock chat (for later documentation).


# ⏰ Timeline (Thu Nov 6 - Tue Nov 11)

| **Date** | **Focus / Milestone** | **Primary Owner(s)** | **Tasks / Deliverables** |
|-----------|----------------------|----------------------|---------------------------|
| **Thu Nov 6** | **Repo & Project Setup** | **Zoe (PM)** | • Create GitHub repo (`ai-medical-chatbot`) + branches (`main`, `develop`)<br>• Push initial scaffold (`/server.js`, `/public`, `.gitignore`, `SETUP.md`)<br>• Add setup + API contract to SETUP<br>• Share repo invite & setup guide with team |
| **Fri Nov 7 – Sat Nov 8** | **Backend Initialization** | **Jason (Backend)** | • Initialize Node/Express project (`npm init -y`, install `express nodemon dotenv`)<br>• Create and test basic Express server (`app.listen`)<br>• Implement `/ask` route returning mock JSON response<br>• Add `express.json()` middleware + logging<br>• Commit & push working backend **(Zoe will merge to develop to be pulled by Hana)** <br>• Verifies server runs locally |
| **Sun Nov 9 – Mon Nov 10** | **Frontend Scaffold** | **Hana (Frontend)** | • Create `index.html`, `script.js`, `style.css`<br>• Build chat window, input box, send button<br>• Connect to `/ask` endpoint using `fetch()`<br>• Render mock answer in chat bubbles<br>• Add minimal CSS styling<br>• Commit & push working UI **(Zoe will merge to develop, then to main)**|
| **Tue Nov 11** | **Integration + QA + Docs Polish** | **Zoe** | • Connect frontend ↔ backend and test end-to-end flow<br>• Fix CORS/fetch/JSON issues<br>• Verify output shape (`answer`, `sources`, `disclaimer`)<br>• Write About / Privacy / Disclaimer copy<br>• Finalize SETUP with setup & usage steps<br>• Tag `v0.1` (Mocked Chat) release on GitHub |

---

### ✅ Deliverables by End of Tue Nov 11
- Fully working **mocked chatbot prototype**  
- Verified **UI ↔ Server** communication  
- **Repo + SETUP** finalized with setup instructions


# 🗂️ Week 1 File Ownership

| **File / Folder** | **Owner** | **Purpose / Notes** |
|--------------------|------------|----------------------|
| **README.md** | **Zoe** | Project dashboard — setup steps, run commands, API contract, repo conventions |
| **.gitignore** | **Zoe** | Ignore node_modules, env files, logs |
| **.env.example** | **Zoe** | Placeholder env vars (e.g., PORT=3000) |
| **/docs/** | **Zoe** | Folder for documentation |
| **/docs/setup.md** | **Zoe** | Setup and run guide (shared with team) |
| **/server.js** | **Jason** | Express backend — serve `/public` and mocked `POST /ask` |
| **/package.json** | **Jason** | Scripts + dependencies (express, morgan, dotenv, nodemon) |
| **/package-lock.json** | **Jason** | Auto-generated lockfile (commit after npm install) |
| **/public/index.html** | **Hana** | Chat interface — chat container, input, send button |
| **/public/script.js** | **Hana** | Form submit → `fetch('/ask')`, render user/bot bubbles, show sources & disclaimer |
| **/public/style.css** | **Hana** | Layout + chat bubble styling (user vs. bot), minor polish |

---

### 🤝 Handoff & Integration Checkpoints
| **When** | **Owner** | **Action** |
|-----------|------------|-------------|
| After scaffolding | Zoe | Push repo + branches; notify Jason & Hana |
| After backend mock ready | Jason → Zoe merges to develop → Hana | Share running server URL & example `/ask` test |
| During integration | Hana → Zoe merges to develop, then to main | Confirm `fetch('/ask')` works; push working UI |
| Final QA | Zoe | Verify local loop works; update README + add disclaimer text |