# Setup Guide — Week 1 (Slice 0: Scaffold + Mocked Chat)
Repo: https://github.com/zoebowe/csc698-capstone-project

This guide gets the Week 1 mock prototype running locally.

---

## 0) Branch Model

- **`main`** — protected, stable releases only (e.g., `v0.1` for Week 1).
- **`develop`** — integration branch where individual work is merged via PR.
- **`zoe-branch`, `jason-branch`, `hana-branch`** — personal feature branches for Week 1 tasks.

## 1) Prerequisites — All

- Node.js ≥ 18 (`node -v`)
- Git
- Editor (VS Code recommended)

## 2) Clone & Install — All

Everyone runs `npm install` — but the **backend lead (Jason)** is responsible for adding and committing new dependencies **(initializes the project first)**.

### Who does what

**Jason (Backend)**

- **Initializes the project (do not skip)**:
    ```bash
    npm init -y
    ```
    → Creates the initial `package.json`.

- Adds/updates dependencies:
    ```bash
    npm install express morgan dotenv
    npm install -D nodemon
    ```
    → This updates `package.json` and automatically creates or updates `package-lock.json`.

- Commits both files:
    ```bash
    git add package.json package-lock.json
    git commit -m "Add initial dependencies and lockfile"
    ```
- Confirm server starts
    ```
    npm run dev
    ```
    → should print `Server running at http://localhost:3000`
    That confirms `package.json` scripts and nodemon setup work.

**Hana & Zoe**
- After pulling the latest changes, run:
    ```bash
    npm install
    ```
    → This recreates the local `node_modules/` folder exactly according to the committed lockfile.

### Clone instructions

```bash
git clone https://github.com/zoebowe/csc698-capstone-project
cd csc698-capstone-project
npm install
```

## 3) Environment Variables — All

Create your real `.env`:
```bash
cp .env.example .env
```

## 4) NPM Scripts — Jason maintains

Ensure these exist in `package.json`:
```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "test": "jest"
  }
}
```
- `npm run dev` — hot-reload dev server (nodemon)
- `npm start` — plain Node run

## 5) Run the App — All

```bash
npm run dev
```
Open http://localhost:3000 — sending a message should hit the mocked `POST /ask`.

## 5) Project Layout (Week 1)

```
csc698-capstone-project/
├─ server.js
├─ package.json             #Jason creates
├─ package-lock.json        #Jason creates
├─ .env.example
├─ .gitignore
├─ README.md
├─ /public/
│  ├─ index.html
│  ├─ script.js
│  └─ style.css
└─ /docs/
   └─ SETUP.md
```

## 6) API Contract — Zoe (docs) + Jason (implements)

**Endpoint:** `POST /ask`

**Request**
```json
{ "question": "string" }
```

**Response (mock example)**
```json
{
  "answer": "This is a mocked answer about healthy sleep habits.",
  "sources": [{ "title": "CDC — Sleep", "url": "https://www.cdc.gov/sleep" }],
  "disclaimer": "For educational purposes only; not medical advice."
}
```
**Example curl**
```bash
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What helps with sleep?"}'
```

## 7) Backend Setup — Jason (jason-branch)

**server.js (Week 1 mock)**

```js
// OWNER: Jason
import express from "express";
import morgan from "morgan";

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));

// TODO[JASON][W1]: Implement the mocked /ask route.
// Acceptance: returns {answer, sources[], disclaimer} with HTTP 200.
app.post("/ask", (req, res) => {
  return res
    .status(501) // Not Implemented
    .json({ error: "TODO: implement /ask mocked response" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running http://localhost:${PORT}`));
```

**Tasks**

- Install deps: `express morgan dotenv` (+ dev: `nodemon`)
- Ensure `npm run dev` works

## 8) Frontend Setup — Hana (hana-branch)

**public/index.html**

```html
<!-- OWNER: Hana -->
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>AI Medical Support Chatbot</title>
  </head>
  <body>
    <main id="chat" aria-live="polite"></main>
    <form id="form">
      <input id="input" placeholder="Ask a health question…" />
      <button>Send</button>
    </form>
    <script src="script.js"></script>
  </body>
</html>
```

**public/script.js (skeleton)**

```js
// OWNER: Hana
const chat = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("input");

// TODO[HANA][W1]: Wire submit -> POST /ask -> render bubbles with
// answer + sources + disclaimer. Handle loading and errors.
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  // placeholder only:
  append("user", input.value || "(empty)");
  append("bot", "TODO: call /ask and render response");
  input.value = "";
});

function append(role, text) {
  const div = document.createElement("div");
  div.className = role;
  div.textContent = text;
  chat.appendChild(div);
}
```

**Tasks**
- Build minimal UI and wire `fetch('/ask')`

---

## 9) Testing & Verification — All

Once the app is running, verify that the full local loop (UI ↔ Server ↔ Mock Data) works correctly.

### ✅ What “Working” Looks Like
- The site loads at **http://localhost:3000**.
- Typing a question and pressing **Send**:
  - Shows a **user** bubble with the question.
  - Shows a brief **loading** state (“...thinking”).
  - Replaces it with a **bot** bubble containing:
    - The **answer** text
    - A **Sources:** line (titles)
    - A **Disclaimer:** line
- In DevTools → **Network tab**, the request to **POST `/ask`**:
  - Returns **HTTP 200**
  - Shows JSON with:
    ```json
    {
      "answer": "string",
      "sources": [{"title": "string", "url": "string"}],
      "disclaimer": "string"
    }
    ```
- In the server terminal, `morgan` logs show:  
  `POST /ask 200 - <ms>`


### 🧪 Step-by-Step Test (Hana)
1. **Start the server**
   ```bash
   npm run dev

    → Terminal should print Server running at http://localhost:3000.

2. **Open the site**
- Go to http://localhost:3000
- You should see an input box + Send button + empty chat area.

3. **Happy-path test**
- Type: `What helps with sleep?` → press Send.
- Expect user + bot bubbles with valid content and disclaimer.

4. **Network verification**
- In browser DevTools → Network → Filter `/ask`
- Confirm:
    - Status = 200
    - Request payload = `{"question":"What helps with sleep?"}`
    - Response JSON includes `answer`, `sources`, `disclaimer`.

5. **Server logs**
- Terminal shows `POST /ask 200` (no errors).

6. **Backend-only sanity check**
```bash
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What helps with sleep?"}'
```
- Should return the same mock JSON.