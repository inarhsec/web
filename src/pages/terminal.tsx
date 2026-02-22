import React, { useState, useRef, useEffect } from "react";

export default function TerminalPage() {
  const [history, setHistory] = useState<string[]>([
    "Booting Hassan Secure Terminal v2.0...",
    "Initializing Security Module...",
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
whoami      - Professional Summary
experience  - Work History
skills      - Technical Skills
tools       - Security Tools
certs       - Certifications
education   - Education
contact     - Contact Information
clear       - Clear terminal
    `,

    whoami: `
Hassan Rhani
Security Engineer | GRC Analyst | Cracker

Specializing in:
• ISO 27001 Implementation
• RBI / NPCI / PCI DSS / ISO / PIMS / DPDPA Compliance
• Banking & Fintech Security
• NGFW Architecture (Palo Alto & Fortinet)
• VAPT & Red Teaming
    `,

    experience: `
TechFlex Solutions Pvt Ltd (Aug 2024 - Present)
Role: Security Engineer / Infosec Analyst (Finacus)

• Managed ISO 27001, PCI-DSS, NPCI, RBI compliance
• Resolved regulatory advisories for multiple banks
• Supported 250+ Bank Audits (Zero Non-Conformities)
• Implemented & Hardened Palo Alto & Fortinet NGFW
• Conducted Data Center Migrations
• Network & Web Application VAPT

Netplace Technologies Pvt Ltd (May 2022 – June 2024)
Role: Network Security Engineer

• Cisco NX9300, 9000 Series, ISR C8300
• Aruba 2920, Comware Core, Meraki Family
• Implemented ISE 3.2 on Azure (802.1X, TACACS)
• Ekahau Wireless Site Surveys & Heatmaps
    `,

    skills: `
GRC & Compliance:
ISO27001 | RBI | NPCI | NABARD | PCI-DSS | NIST | CIS

Networking:
Routing & Switching | DNAC | L2 Security | VPN
SD-WAN (FatPipe) | NAC | NGFW

Red Team:
Recon | OSINT | Web VAPT | Exploitation
Privilege Escalation | Persistence | AD Attacks

Cloud:
Azure | AWS | Meraki | Netskope

Operating Systems:
Windows | Linux | IOS-XE | NX-OS
    `,

    tools: `
Web Security:
Burp Suite Pro | SQLMap | Ffuf | Amass | Nikto
Project Discovery | Hydra | Impacket | Netexec

Network Security:
Nmap | Wireshark | TCPDump
Nessus | Metasploit

Source Code Review:
Fortify

Wireless:
Ekahau Kit | WLC | Access Points
    `,

    certs: `
INE eJPT (Valid till May 2028)

Palo Alto:
Strata Associate
Prisma Associate

Fortinet:
NSE 4 FortiGate 7.6
Cybersecurity Associate

Cisco:
Cybersecurity Essentials
CCNP
CMNA
Engineering Meraki Solutions

HPE Aruba:
Mobility Essentials
Network Essentials

Netskope Cloud Security Specialist
Google Cybersecurity
CTF: Mystiko 2024
    `,

    education: `
Bachelor of Commerce (BCom)
University of Mumbai (2019 – 2022)
CGPI: 7.32

Rizvi College of Arts Science & Commerce
    `,

    contact: `
Phone: +91 8433663196
Email: hassanrhani@zohomail.in
GitHub: https://github.com/inarhsec
LinkedIn: https://linkedin.com/in/rhanihasan
    `,

    clear: () => "",
  };

  const handleCommand = (command: string) => {
    const trimmed = command.trim().toLowerCase();

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
    fontSize: "15px",
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
    fontSize: "15px",
    flex: 1,
  },
};