import React, { useState, useRef, useEffect } from "react";

export default function TerminalPage() {
  const [history, setHistory] = useState<string[]>([
    "Booting Hassan Secure Terminal v1.0...",
    "Type 'help' to see available commands.",
  ]);

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [history]);

  const commands: Record<string, string | (() => string)> = {
    help: `
Available Commands:
whoami      - About me
skills      - Technical skills
projects    - Major work
contact     - Contact info
clear       - Clear terminal
    `,

    whoami: `
Hassan Rhani
GRC Analyst & Cybersecurity Engineer
Focused on ISO27001, RBI Compliance,
Palo Alto, Fortinet & Security Architecture
    `,

    skills: `
ISO27001:2022
RBI IT Compliance
Palo Alto Networks
Fortinet Firewall
SD-WAN Architecture
SIEM (QRadar / SISA)
Python Automation
    `,

    projects: `
• Palo Alto HA Implementation (HQ + NDR)
• SD-WAN with FatPipe Integration
• RBI Audit Closure & Compliance Mapping
• SIEM DR Architecture Design
    `,

    contact: `
Email: hassan@example.com
GitHub: https://github.com/inarhsec
LinkedIn: linkedin.com/in/hassan
    `,

    clear: () => "",
  };

  const handleCommand = (command: string) => {
    const trimmed = command.trim();

    if (trimmed === "clear") {
      setHistory([]);
      return;
    }

    const output =
      commands[trimmed]
        ? typeof commands[trimmed] === "function"
          ? (commands[trimmed] as Function)()
          : commands[trimmed]
        : `Command not found: ${trimmed}\nType 'help'`;

    setHistory((prev) => [...prev, `hassan@inarhsec:~$ ${trimmed}`, output]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(input);
      setInput("");
    }
  };

  return (
    <div style={styles.container} onClick={() => inputRef.current?.focus()}>
      <div style={styles.window}>
        <div style={styles.header}>
          <span style={{ ...styles.circle, background: "#ff5f56" }} />
          <span style={{ ...styles.circle, background: "#ffbd2e" }} />
          <span style={{ ...styles.circle, background: "#27c93f" }} />
        </div>

        <div style={styles.body}>
          {history.map((line, index) => (
            <pre key={index} style={{ margin: 0 }}>
              {line}
            </pre>
          ))}

          <div style={{ display: "flex" }}>
            <span style={styles.prompt}>hassan@inarhsec:~$ </span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={styles.input}
              autoFocus
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100vw",
    height: "100vh",
    background: "#0d1117",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  window: {
    width: "95%",
    maxWidth: "1000px",
    height: "85vh",
    background: "#161b22",
    borderRadius: "8px",
    boxShadow: "0 0 30px rgba(0,255,136,0.3)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "10px",
    display: "flex",
    gap: "8px",
  },
  circle: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
  },
  body: {
    flex: 1,
    padding: "20px",
    fontFamily: "Courier New, monospace",
    fontSize: "16px",
    color: "#00ff88",
    overflowY: "auto",
  },
  prompt: {
    color: "#58a6ff",
    fontWeight: "bold",
  },
  input: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#00ff88",
    fontFamily: "Courier New, monospace",
    fontSize: "16px",
    flex: 1,
  },
};