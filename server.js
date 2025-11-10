// TODO[JASON][W1]: Implement Express server that serves /public and a mocked POST /ask returning {answer, sources[], disclaimer}.
// Done when: npm run dev logs the server URL, and POST /ask returns 200 with the agreed JSON shape (visible in DevTools/ curl).
// (See SETUP.md)

require('dotenv').config();

const express = require('express');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] $ {req.method} ${req.url}`);
    if (req.method === 'POST'){
        console.log('Body:', req.body);
    }
    next();
});

app.post('/ask', (req, res) => {
    const { question } = req.body || {};
    console.log('Question:', question);

    res.json({
        answer: "This is a mocked answer about healthy sleep habits.",
        sources: ["http://www.cdc.gov/sleep"],
        disclaimer: "This information is for educational purposes only."
    });
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});

