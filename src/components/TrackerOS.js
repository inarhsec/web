import { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

// Firebase config inlined — no separate firebase.js needed for Docusaurus
const firebaseConfig = {
  apiKey: "MASKED",
  authDomain: "tracker-os-34e7f.firebaseapp.com",
  projectId: "tracker-os-34e7f",
  storageBucket: "tracker-os-34e7f.firebasestorage.app",
  messagingSenderId: "480080302246",
  appId: "1:480080302246:web:2f22645796dd611e956467",
};

// Prevent re-initializing if hot-reload triggers this module again
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

const PRI = {
  HIGH:   { label: "HIGH",   color: "#ff6b6b", glow: "rgba(255,107,107,0.4)" },
  MEDIUM: { label: "MED",    color: "#ffd93d", glow: "rgba(255,217,61,0.4)"  },
  LOW:    { label: "LOW",    color: "#6bcb77", glow: "rgba(6,214,160,0.4)"   },
};

function fmtINR(n) { return "₹" + Number(n || 0).toLocaleString("en-IN"); }
function fmtDate(d) {
  if (!d) return "—";
  // Handle Firestore Timestamp objects {seconds, nanoseconds}
  if (typeof d === "object" && d !== null && d.seconds !== undefined) {
    return new Date(d.seconds * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });
  }
  const dt = new Date(d);
  return isNaN(dt) ? String(d) : dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });
}

// Guards against Firestore Timestamps or objects sneaking into JSX as children
function safeStr(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "object" && v.seconds !== undefined) return fmtDate(v);
  return String(v);
}

function Blink() {
  const [on, setOn] = useState(true);
  useEffect(() => { const t = setInterval(() => setOn(p => !p), 530); return () => clearInterval(t); }, []);
  return <span style={{ opacity: on ? 1 : 0 }}>█</span>;
}

function Scanlines() {
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999,
      background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
    }} />
  );
}

function StatusBar({ message }) {
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000,
      background: "#071a07", borderTop: "1px solid #39ff14",
      padding: "6px 24px", fontSize: 11, letterSpacing: 2,
      color: "#39ff14", textShadow: "0 0 8px #39ff14",
    }}>
      ► {message}
    </div>
  );
}

export default function TrackerOS() {
  const [tab, setTab]       = useState("TASKS");
  const [booted, setBooted] = useState(false);
  const [bootLine, setBootLine] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const flash = (msg) => { setStatus(msg); setTimeout(() => setStatus(""), 2500); };

  const bootLines = [
    "INITIALIZING TRACKER OS v3.0.0...",
    "CONNECTING TO FIREBASE............OK",
    "LOADING TASK MODULE...............OK",
    "LOADING LOAN MODULE...............OK",
    "SYNCING ACROSS DEVICES............OK",
    "SYSTEM READY.",
  ];

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setBootLine(i);
      if (i >= bootLines.length) { clearInterval(t); setTimeout(() => setBooted(true), 400); }
    }, 320);
    return () => clearInterval(t);
  }, []);

  // ── TASKS ──────────────────────────────────────────────────────────────────
  const [tasks, setTasks]   = useState([]);
  const [tf, setTf]         = useState({ title: "", hours: "", priority: "HIGH", notes: "" });
  const [tFilter, setTFilter] = useState("ALL");
  const [editT, setEditT]   = useState(null); // holds Firestore doc id when editing

  // Load tasks from Firestore
  async function loadTasks() {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "tasks"));
      const list = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setTasks(list);
    } catch (e) {
      flash("ERROR: Could not load tasks — " + e.message);
    }
    setLoading(false);
  }

  useEffect(() => { if (booted) loadTasks(); }, [booted]);

  // Save (add or update) task
  async function saveTask() {
    if (!tf.title.trim()) return;
    try {
      if (editT) {
        // Update existing doc
        await updateDoc(doc(db, "tasks", editT), {
          title: tf.title, hours: tf.hours, priority: tf.priority, notes: tf.notes,
        });
        flash("RECORD UPDATED.");
        setEditT(null);
      } else {
        // Add new doc
        await addDoc(collection(db, "tasks"), {
          title: tf.title, hours: tf.hours, priority: tf.priority, notes: tf.notes, done: false,
        });
        flash("RECORD WRITTEN TO DATABASE.");
      }
      setTf({ title: "", hours: "", priority: "HIGH", notes: "" });
      await loadTasks();
    } catch (e) {
      flash("ERROR: " + e.message);
    }
  }

  async function toggleTask(task) {
    try {
      await updateDoc(doc(db, "tasks", task.id), { done: !task.done });
      setTasks(tasks.map(t => t.id === task.id ? { ...t, done: !t.done } : t));
    } catch (e) {
      flash("ERROR: " + e.message);
    }
  }

  async function delTask(id) {
    try {
      await deleteDoc(doc(db, "tasks", id));
      setTasks(tasks.filter(t => t.id !== id));
      flash("RECORD DELETED.");
    } catch (e) {
      flash("ERROR: " + e.message);
    }
  }

  function startEditTask(task) {
    setTf({ title: task.title, hours: task.hours, priority: task.priority, notes: task.notes || "" });
    setEditT(task.id);
  }

  const shownTasks = tasks.filter(t =>
    tFilter === "ALL" ? true : tFilter === "DONE" ? t.done : !t.done
  );

  // ── LOANS ──────────────────────────────────────────────────────────────────
  const [loans, setLoans]   = useState([]);
  const [lf, setLf]         = useState({ name: "", amount: "", date: "", notes: "" });
  const [lFilter, setLFilter] = useState("ALL");
  const [editL, setEditL]   = useState(null); // holds Firestore doc id when editing

  // Load loans from Firestore
  async function loadLoans() {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "loans"));
      const list = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setLoans(list);
    } catch (e) {
      flash("ERROR: Could not load loans — " + e.message);
    }
    setLoading(false);
  }

  useEffect(() => { if (booted) loadLoans(); }, [booted]);

  async function saveLoan() {
    if (!lf.name.trim() || !lf.amount) return;
    try {
      if (editL) {
        await updateDoc(doc(db, "loans", editL), {
          name: lf.name, amount: lf.amount, date: lf.date, notes: lf.notes,
        });
        flash("RECORD UPDATED.");
        setEditL(null);
      } else {
        await addDoc(collection(db, "loans"), {
          name: lf.name, amount: lf.amount, date: lf.date, notes: lf.notes,
          closed: false, closedDate: null,
        });
        flash("LOAN RECORD WRITTEN TO DATABASE.");
      }
      setLf({ name: "", amount: "", date: "", notes: "" });
      await loadLoans();
    } catch (e) {
      flash("ERROR: " + e.message);
    }
  }

  async function closeLoan(loan) {
    try {
      const nowClosed = !loan.closed;
      await updateDoc(doc(db, "loans", loan.id), {
        closed: nowClosed,
        closedDate: nowClosed ? new Date().toLocaleDateString("en-IN") : null,
      });
      await loadLoans();
      flash(nowClosed ? "LOAN MARKED RETURNED." : "LOAN REOPENED.");
    } catch (e) {
      flash("ERROR: " + e.message);
    }
  }

  async function delLoan(id) {
    try {
      await deleteDoc(doc(db, "loans", id));
      setLoans(loans.filter(l => l.id !== id));
      flash("RECORD DELETED.");
    } catch (e) {
      flash("ERROR: " + e.message);
    }
  }

  function startEditLoan(loan) {
    setLf({ name: loan.name, amount: loan.amount, date: loan.date, notes: loan.notes || "" });
    setEditL(loan.id);
  }

  const shownLoans   = loans.filter(l => lFilter === "ALL" ? true : lFilter === "RETURNED" ? l.closed : !l.closed);
  const outstanding  = loans.filter(l => !l.closed).reduce((s, l) => s + Number(l.amount), 0);
  const returned     = loans.filter(l =>  l.closed).reduce((s, l) => s + Number(l.amount), 0);

  // ── STYLES ─────────────────────────────────────────────────────────────────
  const GREEN = "#39ff14";
  const AMBER = "#ffb703";
  const DIM   = "#1a3a1a";
  const BG    = "#030d03";

  const css = {
    wrap:         { minHeight: "100vh", background: BG, fontFamily: "'Courier New', 'Lucida Console', monospace", color: GREEN, textShadow: `0 0 8px ${GREEN}`, boxSizing: "border-box" },
    crt:          { background: `radial-gradient(ellipse at center, #071a07 0%, ${BG} 100%)`, minHeight: "100vh" },
    header:       { borderBottom: `2px solid ${GREEN}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: `0 2px 20px rgba(57,255,20,0.2)` },
    logo:         { fontSize: 20, fontWeight: "bold", letterSpacing: 4, color: AMBER, textShadow: `0 0 16px ${AMBER}, 0 0 30px ${AMBER}` },
    syncDot:      { display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: loading ? AMBER : GREEN, boxShadow: `0 0 8px ${loading ? AMBER : GREEN}`, marginRight: 8, verticalAlign: "middle" },
    tabBar:       { display: "flex", gap: 0, borderBottom: `1px solid ${GREEN}`, padding: "0 24px" },
    tab:          (a) => ({ padding: "10px 28px", cursor: "pointer", fontFamily: "inherit", background: a ? GREEN : "transparent", color: a ? BG : GREEN, border: "none", borderRight: `1px solid ${GREEN}`, fontSize: 13, letterSpacing: 2, fontWeight: "bold", textShadow: a ? "none" : `0 0 8px ${GREEN}`, transition: "all .15s" }),
    body:         { padding: "20px 24px", maxWidth: 760, margin: "0 auto", paddingBottom: 60 },
    section:      { border: `1px solid ${GREEN}`, boxShadow: `0 0 12px rgba(57,255,20,0.1), inset 0 0 20px rgba(57,255,20,0.03)`, borderRadius: 2, padding: 18, marginBottom: 20 },
    sectionTitle: { fontSize: 11, letterSpacing: 4, color: AMBER, textShadow: `0 0 10px ${AMBER}`, marginBottom: 14, borderBottom: `1px solid ${DIM}`, paddingBottom: 8 },
    inp:          { background: "transparent", border: "none", borderBottom: `1px solid ${GREEN}`, color: GREEN, fontFamily: "inherit", fontSize: 13, padding: "6px 4px", outline: "none", width: "100%", textShadow: `0 0 6px ${GREEN}`, boxSizing: "border-box" },
    textarea:     { background: "transparent", border: `1px solid ${GREEN}`, color: GREEN, fontFamily: "inherit", fontSize: 13, padding: "8px", outline: "none", width: "100%", textShadow: `0 0 6px ${GREEN}`, boxSizing: "border-box", resize: "vertical", minHeight: 72, lineHeight: 1.6, borderRadius: 2 },
    sel:          { background: BG, border: `1px solid ${GREEN}`, color: GREEN, fontFamily: "inherit", fontSize: 12, padding: "6px 8px", outline: "none", width: "100%" },
    btn:          (col) => ({ background: "transparent", border: `1px solid ${col || GREEN}`, color: col || GREEN, fontFamily: "inherit", fontSize: 11, padding: "7px 16px", cursor: "pointer", letterSpacing: 2, textShadow: `0 0 8px ${col || GREEN}`, transition: "all .15s" }),
    row:          { borderBottom: `1px solid ${DIM}`, padding: "12px 4px", display: "flex", gap: 12, alignItems: "flex-start" },
    badge:        (p) => ({ fontSize: 9, padding: "2px 6px", letterSpacing: 2, border: `1px solid ${PRI[p]?.color || GREEN}`, color: PRI[p]?.color || GREEN, textShadow: `0 0 6px ${PRI[p]?.glow}`, whiteSpace: "nowrap" }),
    stat:         { border: `1px solid ${GREEN}`, padding: "10px 16px", textAlign: "center", flex: 1, boxShadow: `inset 0 0 10px rgba(57,255,20,0.05)` },
    fieldLabel:   { fontSize: 10, letterSpacing: 2, color: "#4a7a4a", marginBottom: 4 },
    iconBtn:      (col) => ({ background: "none", border: "none", color: col, cursor: "pointer", fontSize: 14, textShadow: `0 0 8px ${col}`, padding: "2px 4px" }),
    emptyMsg:     { textAlign: "center", color: "#1a4a1a", fontSize: 12, letterSpacing: 3, padding: 40 },
  };

  // ── BOOT SCREEN ────────────────────────────────────────────────────────────
  if (!booted) return (
    <div style={{ ...css.crt, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Scanlines />
      <div style={{ fontFamily: "'Courier New', monospace", color: GREEN, textShadow: `0 0 8px ${GREEN}`, maxWidth: 420, padding: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: AMBER, textShadow: `0 0 10px ${AMBER}`, marginBottom: 24 }}>TRACKER OS v3.0.0 — FIREBASE EDITION</div>
        {bootLines.slice(0, bootLine).map((l, i) => (
          <div key={i} style={{ fontSize: 13, marginBottom: 6, letterSpacing: 1 }}>{l}</div>
        ))}
        <div style={{ marginTop: 16 }}><Blink /></div>
      </div>
    </div>
  );

  // ── MAIN UI ────────────────────────────────────────────────────────────────
  return (
    <div style={css.wrap}>
      <Scanlines />
      <StatusBar message={status} />
      <div style={css.crt}>

        {/* HEADER */}
        <div style={css.header}>
          <span style={css.logo}>[ TRACKER OS ]</span>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 11, letterSpacing: 1, color: "#4a7a4a" }}>
              <span style={css.syncDot} />
              {loading ? "SYNCING..." : "FIREBASE LIVE"}
            </span>
            <span style={{ fontSize: 11, letterSpacing: 2, color: "#4a7a4a" }}>
              {new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </span>
          </div>
        </div>

        {/* TABS */}
        <div style={css.tabBar}>
          {["TASKS", "LOANS"].map(t => (
            <button key={t} style={css.tab(tab === t)} onClick={() => setTab(t)}>
              {t === "TASKS" ? "◆ TASK_MGR" : "◆ LOAN_MGR"}
            </button>
          ))}
        </div>

        <div style={css.body}>

          {/* ══ TASKS ══ */}
          {tab === "TASKS" && <>
            <div style={css.section}>
              <div style={css.sectionTitle}>► {editT ? "EDIT_RECORD" : "NEW_RECORD"}</div>
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <div style={css.fieldLabel}>TASK_TITLE</div>
                  <input style={css.inp} placeholder="e.g. ISO 27001 Learning and updating in Gitbook"
                    value={tf.title} onChange={e => setTf({ ...tf, title: e.target.value })} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={css.fieldLabel}>HOURS/DAY</div>
                    <input style={css.inp} placeholder="2hrs" value={tf.hours} onChange={e => setTf({ ...tf, hours: e.target.value })} />
                  </div>
                  <div>
                    <div style={css.fieldLabel}>PRIORITY</div>
                    <select style={css.sel} value={tf.priority} onChange={e => setTf({ ...tf, priority: e.target.value })}>
                      <option value="HIGH">HIGH</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>
                </div>
                <div>
                  <div style={css.fieldLabel}>NOTES (multiline)</div>
                  <textarea style={css.textarea} placeholder="Enter notes... (Enter for new lines)"
                    value={tf.notes} onChange={e => setTf({ ...tf, notes: e.target.value })} rows={3} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={css.btn(AMBER)} onClick={saveTask}>{editT ? "[ UPDATE ]" : "[ WRITE_RECORD ]"}</button>
                  {editT && <button style={css.btn()} onClick={() => { setEditT(null); setTf({ title: "", hours: "", priority: "HIGH", notes: "" }); }}>[ CANCEL ]</button>}
                  <button style={{ ...css.btn(), marginLeft: "auto" }} onClick={loadTasks}>[ REFRESH ]</button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {[["TOTAL", tasks.length, GREEN], ["PENDING", tasks.filter(t=>!t.done).length, AMBER], ["COMPLETE", tasks.filter(t=>t.done).length, "#6bcb77"]].map(([l, v, c]) => (
                <div key={l} style={{ ...css.stat, borderColor: c, color: c, textShadow: `0 0 10px ${c}`, cursor: "pointer" }}
                  onClick={() => setTFilter(l === "TOTAL" ? "ALL" : l === "PENDING" ? "PENDING" : "DONE")}>
                  <div style={{ fontSize: 28, fontWeight: "bold" }}>{v}</div>
                  <div style={{ fontSize: 9, letterSpacing: 3, marginTop: 2, opacity: 0.7 }}>{l}</div>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {["ALL","PENDING","DONE"].map(f => (
                <button key={f} style={{ ...css.btn(tFilter===f ? AMBER : undefined), background: tFilter===f ? "rgba(255,183,3,0.1)" : "transparent" }} onClick={() => setTFilter(f)}>{f}</button>
              ))}
            </div>

            {loading && <div style={css.emptyMsg}>QUERYING DATABASE <Blink /></div>}
            {!loading && shownTasks.length === 0 && <div style={css.emptyMsg}>NO_RECORDS_FOUND <Blink /></div>}

            {shownTasks.map(t => (
              <div key={t.id} style={{ ...css.row, opacity: t.done ? 0.5 : 1 }}>
                <input type="checkbox" checked={!!t.done} onChange={() => toggleTask(t)}
                  style={{ accentColor: GREEN, marginTop: 4, cursor: "pointer", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, textDecoration: t.done ? "line-through" : "none", letterSpacing: 0.5 }}>{safeStr(t.title)}</div>
                  <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                    {t.hours && <span style={{ fontSize: 11, color: "#4a9a4a" }}>⏱ {t.hours}/day</span>}
                    <span style={css.badge(t.priority)}>{PRI[t.priority]?.label}</span>
                  </div>
                  {t.notes && (
                    <div style={{ fontSize: 11, color: "#4a7a4a", marginTop: 6, whiteSpace: "pre-wrap", lineHeight: 1.6, borderLeft: `2px solid ${DIM}`, paddingLeft: 8 }}>
                      {t.notes}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => startEditTask(t)} style={css.iconBtn(AMBER)}>✎</button>
                  <button onClick={() => delTask(t.id)} style={css.iconBtn("#ff4444")}>✕</button>
                </div>
              </div>
            ))}
          </>}

          {/* ══ LOANS ══ */}
          {tab === "LOANS" && <>
            <div style={css.section}>
              <div style={css.sectionTitle}>► {editL ? "EDIT_RECORD" : "NEW_LOAN_RECORD"}</div>
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
                  <div>
                    <div style={css.fieldLabel}>BORROWER_NAME</div>
                    <input style={css.inp} placeholder="Person's name" value={lf.name} onChange={e => setLf({ ...lf, name: e.target.value })} />
                  </div>
                  <div>
                    <div style={css.fieldLabel}>AMOUNT (₹)</div>
                    <input style={css.inp} placeholder="5000" type="number" value={lf.amount} onChange={e => setLf({ ...lf, amount: e.target.value })} />
                  </div>
                </div>
                <div>
                  <div style={css.fieldLabel}>DATE_GIVEN</div>
                  <input style={{ ...css.inp, colorScheme: "dark" }} type="date" value={lf.date} onChange={e => setLf({ ...lf, date: e.target.value })} />
                </div>
                <div>
                  <div style={css.fieldLabel}>NOTES (multiline)</div>
                  <textarea style={css.textarea} placeholder="Enter notes... (Enter for new lines)"
                    value={lf.notes} onChange={e => setLf({ ...lf, notes: e.target.value })} rows={3} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={css.btn(AMBER)} onClick={saveLoan}>{editL ? "[ UPDATE ]" : "[ WRITE_RECORD ]"}</button>
                  {editL && <button style={css.btn()} onClick={() => { setEditL(null); setLf({ name: "", amount: "", date: "", notes: "" }); }}>[ CANCEL ]</button>}
                  <button style={{ ...css.btn(), marginLeft: "auto" }} onClick={loadLoans}>[ REFRESH ]</button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <div style={{ ...css.stat, borderColor: "#ff6b6b", color: "#ff6b6b", textShadow: "0 0 10px rgba(255,107,107,0.6)" }}>
                <div style={{ fontSize: 20, fontWeight: "bold" }}>{fmtINR(outstanding)}</div>
                <div style={{ fontSize: 9, letterSpacing: 3, marginTop: 2, opacity: 0.7 }}>OUTSTANDING</div>
              </div>
              <div style={{ ...css.stat, borderColor: "#6bcb77", color: "#6bcb77", textShadow: "0 0 10px rgba(107,203,119,0.6)" }}>
                <div style={{ fontSize: 20, fontWeight: "bold" }}>{fmtINR(returned)}</div>
                <div style={{ fontSize: 9, letterSpacing: 3, marginTop: 2, opacity: 0.7 }}>RECOVERED</div>
              </div>
              <div style={{ ...css.stat }}>
                <div style={{ fontSize: 28, fontWeight: "bold" }}>{loans.length}</div>
                <div style={{ fontSize: 9, letterSpacing: 3, marginTop: 2, opacity: 0.7 }}>TOTAL_RECORDS</div>
              </div>
            </div>

            {/* Filter */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {["ALL","ACTIVE","RETURNED"].map(f => (
                <button key={f} style={{ ...css.btn(lFilter===f ? AMBER : undefined), background: lFilter===f ? "rgba(255,183,3,0.1)" : "transparent" }} onClick={() => setLFilter(f)}>{f}</button>
              ))}
            </div>

            {loading && <div style={css.emptyMsg}>QUERYING DATABASE <Blink /></div>}
            {!loading && shownLoans.length === 0 && <div style={css.emptyMsg}>NO_RECORDS_FOUND <Blink /></div>}

            {shownLoans.map(l => (
              <div key={l.id} style={{ ...css.row, opacity: l.closed ? 0.6 : 1 }}>
                <div style={{ fontSize: 20, flexShrink: 0, color: l.closed ? "#6bcb77" : "#ff6b6b", textShadow: `0 0 10px ${l.closed ? "#6bcb77" : "#ff6b6b"}` }}>
                  {l.closed ? "◉" : "◎"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: "bold", letterSpacing: 1 }}>{safeStr(l.name).toUpperCase()}</div>
                  <div style={{ fontSize: 22, fontWeight: "bold", color: l.closed ? "#6bcb77" : AMBER, textShadow: `0 0 12px ${l.closed ? "#6bcb77" : AMBER}`, margin: "4px 0" }}>
                    {fmtINR(l.amount)}
                  </div>
                  <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#4a7a4a", flexWrap: "wrap" }}>
                    {l.date && <span>GIVEN: {fmtDate(l.date)}</span>}
                    {l.closed && l.closedDate && <span style={{ color: "#6bcb77" }}>RETURNED: {fmtDate(l.closedDate)}</span>}
                  </div>
                  {l.notes && (
                    <div style={{ fontSize: 11, color: "#4a7a4a", marginTop: 6, whiteSpace: "pre-wrap", lineHeight: 1.6, borderLeft: `2px solid ${DIM}`, paddingLeft: 8 }}>
                      {safeStr(l.notes)}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  <button onClick={() => closeLoan(l)} style={{ ...css.btn(l.closed ? "#4a7a4a" : "#6bcb77"), fontSize: 10, padding: "5px 10px", letterSpacing: 1 }}>
                    {l.closed ? "[ REOPEN ]" : "[ RETURNED ]"}
                  </button>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => startEditLoan(l)} style={css.iconBtn(AMBER)}>✎</button>
                    <button onClick={() => delLoan(l.id)} style={css.iconBtn("#ff4444")}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </>}

        </div>
      </div>
    </div>
  );
}