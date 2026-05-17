const express = require('express');
const path = require('path');
const app = express();
const port = 5932;
const dotenv = require('dotenv');
const crypto = require('crypto');
var markdown = require("markdown").markdown;
const { createProxyMiddleware } = require('http-proxy-middleware');

dotenv.config();

const slackIDs = []
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.get('Content-Type', 'text/html');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
    res.end;
});

app.get('/oauth/callback', async (req, res) => {
    const code = req.query.code;
    const response = await fetch('https://auth.hackclub.com/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: 'a2107a6fc2455c8eb2f8b48fd969844f',
            client_secret: process.env.CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: 'http://localhost:5932/oauth/callback'
        })
    });
    const data = await response.json();
    console.debug(data);
    const userData = await fetch('https://auth.hackclub.com/oauth/userinfo', {
        headers: {
            'Authorization': `Bearer ${data.access_token}`
        }
    });
    const user = await userData.json();
    console.debug(user);
    if (user.verification_status == 'verified') {
        res.redirect(`/ls?token=${data.access_token}`);
    }

});

app.get('/ls', (req, res) => {
    res.send(`
        <style>
            body {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                color: #ffffff;
                background-color: #000000;
                font-family: Arial, sans-serif;
            }
        </style>
            <p>Please wait...</p>
        <script>
            localStorage.setItem('access_token', '${req.query.token}');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        </script>
    `);
})

app.get('/checktoken', async (req, res) => {
    const token = req.query.token;
    const userData = await fetch('https://auth.hackclub.com/oauth/userinfo', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const user = await userData.json();
    if (user.verification_status == 'verified') {
        if (!slackIDs.includes(user.slack_id)) {
            slackIDs.push(user.slack_id);
        }
        res.json({ success: true, slack_id: user.slack_id });
    } else {
        res.json({ success: false });
    }
});


app.get('/api/explore/projects', async (req, res) => {
    const response = await fetch('https://macondo.hackclub.com/api/explore/projects' + req.url.split('/api/explore/projects')[1], {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    var data = await response.json();
    res.json(data);
});
app.get('/api/projects/:id', async (req, res) => {
    const id = req.params.id;
    const response = await fetch(`https://macondo.hackclub.com/api/projects/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    var data = await response.json();
    data.description = markdown.toHTML(data.description || '');
    res.json(data);
});
app.get('/api/users/:id', async (req, res) => {
    const id = req.params.id;
    const response = await fetch(`https://macondo.hackclub.com/api/users/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await response.json();
    res.json(data);
});
app.get('/api/explore/people', async (req, res) => {
    const response = await fetch('https://macondo.hackclub.com/api/explore/people' + req.url.split('/api/explore/people')[1], {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    const data = await response.json();
    res.json(data);
});
app.use('/image/:sub', async (req, res) => {
    const sub = req.params.sub;
    const target = `https://user-cdn.hackclub-assets.com/${sub}`;
    return createProxyMiddleware({
        target: target,
        changeOrigin: true,
        secure: false,
        ws: true,
        onError: (err, req, res) => {
        console.error('Proxy error:', err.message);
        res.status(502).send('Proxy error');
        }
    })(req, res);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});