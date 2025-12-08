const form = document.getElementById("chat-form");
const questionInput = document.getElementById("question");
const messagesEl = document.getElementById("messages");
const sendBtn = document.getElementById("send-btn");

// ------------------------------------------------------
// Helpers
// ------------------------------------------------------
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function smoothScrollBottom() {
  messagesEl.scrollTo({
    top: messagesEl.scrollHeight,
    behavior: "smooth"
  });
}

function appendMessage(text, who, extraHtml = "") {
  const bubble = document.createElement("div");
  bubble.classList.add("bubble", who);

  if (who === "user") {
    bubble.innerHTML = `<p>${escapeHtml(text)}</p>${extraHtml}`;
  } else {
    bubble.innerHTML = `${text}${extraHtml}`;
  }

  messagesEl.appendChild(bubble);
  smoothScrollBottom();
  return bubble;
}

// ------------------------------------------------------
// Submit handler
// ------------------------------------------------------
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = questionInput.value.trim();
  if (!question) return;

  // Show user message
  appendMessage(question, "user");

  // Clear input
  questionInput.value = "";
  sendBtn.disabled = true;

  // Typing indicator: just "..." bubble
  const thinkingBubble = document.createElement("div");
  thinkingBubble.classList.add("bubble", "bot", "thinking");
  messagesEl.appendChild(thinkingBubble);
  smoothScrollBottom();

  try {
    const res = await fetch("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    if (!res.ok) throw new Error(`Server responded with ${res.status}`);

    const data = await res.json();

    // Remove typing indicator
    thinkingBubble.remove();

    // Sources block (just org names)
    const sourcesBlock =
      Array.isArray(data.sources) && data.sources.length
        ? `
        <div class="sources-block">
          <span class="sources-label">Sources</span>
          <ul class="sources">
            ${data.sources.map((s) => `<li><strong>${escapeHtml(s)}</strong></li>`).join("")}
          </ul>
        </div>
      `
        : "";

    const disclaimerBlock = data.disclaimer
      ? `<p class="disclaimer-inline">${escapeHtml(data.disclaimer)}</p>`
      : "";

    const answerHtml = data.answer || "<p>Sorry, I could not generate an answer.</p>";

    appendMessage(answerHtml + sourcesBlock + disclaimerBlock, "bot");
  } catch (err) {
    console.error(err);
    thinkingBubble.remove();
    appendMessage(
      "Sorry, something went wrong while contacting the server. Please try again.",
      "bot"
    );
  } finally {
    sendBtn.disabled = false;
    questionInput.focus();
  }
});

// ------------------------------------------------------
// Enter to send, Shift+Enter for new line (ChatGPT-style)
// ------------------------------------------------------
questionInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});