// TODO[HANA][W1]: Wire form submit -> POST /ask with {question}, then render user/bot bubbles with answer, sources, and disclaimer.
// Done when: a real request to /ask (200 OK) replaces a '...thinking' placeholder with the mocked JSON response.
// (See SETUP.md)

const chat = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("input");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = input.value.trim();
  if (!question) return;             //handle empty input

  append("user", question);
  input.value = "";

  // bot thinking
  const thinking = append("bot", "thinking...");

  //ask
  try {
    const res = await fetch("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    if (!res.ok) {
      update(thinking, "Error: server returned " + res.status);
      return;
    }

    const data = await res.json();

    //replace placeholder with real response
    setTimeout(() => {
        update(
            thinking,
            `${data.answer}\n\nSources:\n- ${data.sources.join("\n- ")}\n\n${data.disclaimer}`
        );
    }, 600); // delay before showing response
  } catch (err) {
    update(thinking, "Network error.");
  }
});



function append(role, text) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

function update(node, text) {
  node.textContent = text;
  chat.scrollTop = chat.scrollHeight;
}

// handle shift + enter
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.shiftKey) return;
  if (e.key === "Enter") {
    e.preventDefault();
    form.requestSubmit();
  }
});
