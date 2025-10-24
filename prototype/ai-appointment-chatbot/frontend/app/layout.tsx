
import "./globals.css";
import React from "react";

export const metadata = {
  title: "Dental Appointment Chatbot",
  description: "Prototype — AI appointment booking",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-visual">
          <header className="topbar">
            <div className="brand">
              <span className="logo">🦷</span>
              <span className="title">Dental AI Assistant</span>
            </div>
          </header>

          <main className="app-container">{children}</main>

          <footer className="footer">
            <small>Prototype • For demo purposes only</small>
          </footer>
        </div>
      </body>
    </html>
  );
}
