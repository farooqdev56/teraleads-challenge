
"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

type Message = { role: "user" | "bot"; text: string; ts?: string };

export default function Page() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [token, setToken] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // scroll to bottom when messages change
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const showError = (msg: string) => alert(msg);

  const handleRegister = async () => {
    if (!email || !password || !name) return showError("All fields required");
    try {
      await axios.post("http://localhost:4000/api/auth/register", { email, password, name });
      alert("Registered — you can now log in");
      setMode("login");
    } catch (err: any) {
      console.error(err);
      showError(err?.response?.data?.message || "Registration failed");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return showError("Provide email + password");
    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", { email, password });
      setToken(res.data.token ?? "");
      setLoggedIn(true);
      setMessages([{ role: "bot", text: `Welcome back, ${email.split("@")[0]}!` }]);
    } catch (err: any) {
      console.error("Login error", err);
      showError(err?.response?.data?.message || "Login failed — check backend");
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", text: input, ts: new Date().toISOString() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:4000/api/chat",
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const reply: string = (res.data && res.data.reply) ? String(res.data.reply) : "No reply";
      const botMsg: Message = { role: "bot", text: reply, ts: new Date().toISOString() };
      setMessages((p) => [...p, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((p) => [...p, { role: "bot", text: "Service unavailable." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" role="main">
      <div className="auth" aria-live="polite">
        <div>
          <div className="h1">Dental Assistant</div>
          <div className="hint">Smart appointment booking & patient help — demo</div>
        </div>

        {!loggedIn ? (
          <>
            <div className="toggle small">
              <button className={`btn ${mode === "login" ? "" : "secondary"}`} onClick={() => setMode("login")}>Login</button>
              <button className={`btn ${mode === "register" ? "" : "secondary"}`} onClick={() => setMode("register")}>Register</button>
            </div>

            <div className="form-group">
              {mode === "register" && (
                <>
                  <label className="small">Full name</label>
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
                </>
              )}

              <label className="small">Email</label>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@clinic.com" />

              <label className="small">Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />

              {mode === "login" ? (
                <button className="btn" onClick={handleLogin}>Sign in</button>
              ) : (
                <button className="btn" onClick={handleRegister}>Create account</button>
              )}

              <div className="small-muted">By using this demo you agree to simulated interactions only.</div>
            </div>
          </>
        ) : (
          <div>
            <div className="small">Signed in as <strong>{email}</strong></div>
            <div style={{ marginTop: 12 }}>
              <button className="btn" onClick={() => { setLoggedIn(false); setToken(""); setMessages([]); }}>Sign out</button>
            </div>
          </div>
        )}

        <div style={{ marginTop: "auto" }} className="small-muted">
          Tip: Try messaging "Book appointment" to see the flow.
        </div>
      </div>

      <div className="chat" aria-live="polite">
        <div className="chat-header">
          <div>
            <div style={{ fontWeight: 700 }}>Chat</div>
            <div className="small-muted">Ask the assistant to book or manage appointments</div>
          </div>

          <div className="small-muted">Status: {loggedIn ? "Connected" : "Guest"}</div>
        </div>

        <div className="chat-window" ref={chatRef}>
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              <div style={{ fontSize: 13, marginBottom: 6, color: "rgba(16,32,48,0.5)" }}>
                {m.role === "user" ? "You" : "Assistant"} • {m.ts ? new Date(m.ts).toLocaleTimeString() : ""}
              </div>
              <div>{m.text}</div>
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            className="input"
            placeholder={loggedIn ? "Type a message or ask to book an appointment..." : "Please login to chat"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
            disabled={!loggedIn || loading}
          />
          <button className="btn" onClick={sendMessage} disabled={!loggedIn || loading}>
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
