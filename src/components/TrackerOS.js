import { useState, useEffect } from "react";

const STORAGE_KEY_TASKS = "tracker_tasks_v1";
const STORAGE_KEY_LOANS = "tracker_loans_v1";

const priorityConfig = {
  High: { color: "#ff4d6d", bg: "rgba(255,77,109,0.12)" },
  Medium: { color: "#ffd166", bg: "rgba(255,209,102,0.12)" },
  Low: { color: "#06d6a0", bg: "rgba(6,214,160,0.12)" },
};

function formatCurrency(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

export default function TrackerOS() {
  const [tab, setTab] = useState("tasks");

  // ── TASKS ──────────────────────────────────────────────
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY_TASKS)) || []; } catch { return []; }
  });
  const [taskForm, setTaskForm] = useState({ title: "", hours: "", priority: "High", notes: "" });
  const [taskFilter, setTaskFilter] = useState("All");
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks)); }, [tasks]);

  const addTask = () => {
    if (!taskForm.title.trim()) return;
    if (editingTask !== null) {
      setTasks(tasks.map((t, i) => i === editingTask ? { ...taskForm, done: t.done, id: t.id } : t));
      setEditingTask(null);
    } else {
      setTasks([...tasks, { ...taskForm, done: false, id: Date.now() }]);
    }
    setTaskForm({ title: "", hours: "", priority: "High", notes: "" });
  };

  const toggleTask = (id) => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = (id) => setTasks(tasks.filter(t => t.id !== id));
  const editTask = (i) => { setTaskForm({ title: tasks[i].title, hours: tasks[i].hours, priority: tasks[i].priority, notes: tasks[i].notes || "" }); setEditingTask(i); };

  const filteredTasks = tasks.filter(t =>
    taskFilter === "All" ? true : taskFilter === "Done" ? t.done : !t.done
  );

  // ── LOANS ──────────────────────────────────────────────
  const [loans, setLoans] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY_LOANS)) || []; } catch { return []; }
  });
  const [loanForm, setLoanForm] = useState({ name: "", amount: "", date: "", notes: "" });
  const [loanFilter, setLoanFilter] = useState("All");
  const [editingLoan, setEditingLoan] = useState(null);

  useEffect(() => { localStorage.setItem(STORAGE_KEY_LOANS, JSON.stringify(loans)); }, [loans]);

  const addLoan = () => {
    if (!loanForm.name.trim() || !loanForm.amount) return;
    if (editingLoan !== null) {
      setLoans(loans.map((l, i) => i === editingLoan ? { ...loanForm, closed: l.closed, id: l.id, closedDate: l.closedDate } : l));
      setEditingLoan(null);
    } else {
      setLoans([...loans, { ...loanForm, closed: false, id: Date.now(), closedDate: null }]);
    }
    setLoanForm({ name: "", amount: "", date: "", notes: "" });
  };

  const closeLoan = (id) => setLoans(loans.map(l => l.id === id ? { ...l, closed: !l.closed, closedDate: l.closed ? null : new Date().toLocaleDateString("en-IN") } : l));
  const deleteLoan = (id) => setLoans(loans.filter(l => l.id !== id));
  const editLoan = (i) => { setLoanForm({ name: loans[i].name, amount: loans[i].amount, date: loans[i].date, notes: loans[i].notes || "" }); setEditingLoan(i); };

  const filteredLoans = loans.filter(l =>
    loanFilter === "All" ? true : loanFilter === "Returned" ? l.closed : !l.closed
  );

  const totalOut = loans.filter(l => !l.closed).reduce((s, l) => s + Number(l.amount), 0);
  const totalReturned = loans.filter(l => l.closed).reduce((s, l) => s + Number(l.amount), 0);

  // ── STYLES ─────────────────────────────────────────────
  const s = {
    app: { minHeight: "100vh", background: "#0d0d14", color: "#e8e6f0", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: "0 0 60px" },
    header: { background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)", borderBottom: "1px solid #252540", padding: "28px 24px 0" },
    headerTitle: { fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", margin: "0 0 20px", background: "linear-gradient(90deg,#a78bfa,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    tabs: { display: "flex", gap: 4 },
    tab: (active) => ({ padding: "10px 24px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, borderRadius: "8px 8px 0 0", transition: "all .2s", background: active ? "#0d0d14" : "transparent", color: active ? "#a78bfa" : "#888", borderBottom: active ? "2px solid #a78bfa" : "2px solid transparent" }),
    body: { padding: "24px 20px", maxWidth: 700, margin: "0 auto" },
    card: { background: "#13131f", border: "1px solid #1e1e35", borderRadius: 14, padding: 20, marginBottom: 16 },
    formGrid: { display: "grid", gap: 10 },
    input: { width: "100%", background: "#1a1a2e", border: "1px solid #2a2a45", borderRadius: 8, padding: "10px 14px", color: "#e8e6f0", fontSize: 14, outline: "none", boxSizing: "border-box" },
    select: { width: "100%", background: "#1a1a2e", border: "1px solid #2a2a45", borderRadius: 8, padding: "10px 14px", color: "#e8e6f0", fontSize: 14, outline: "none" },
    btn: (color) => ({ padding: "10px 20px", background: color, border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "opacity .2s" }),
    row: { display: "flex", alignItems: "flex-start", gap: 12, background: "#0f0f1c", border: "1px solid #1e1e35", borderRadius: 12, padding: "14px 16px", marginBottom: 10 },
    badge: (p) => ({ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, color: priorityConfig[p]?.color || "#aaa", background: priorityConfig[p]?.bg || "#222", whiteSpace: "nowrap" }),
    statBox: { background: "#13131f", border: "1px solid #1e1e35", borderRadius: 12, padding: "14px 18px", flex: 1, textAlign: "center" },
    filterBar: { display: "flex", gap: 6, marginBottom: 16 },
    filterBtn: (active) => ({ padding: "6px 16px", borderRadius: 20, border: "1px solid " + (active ? "#a78bfa" : "#2a2a45"), background: active ? "rgba(167,139,250,0.15)" : "transparent", color: active ? "#a78bfa" : "#888", fontSize: 12, fontWeight: 600, cursor: "pointer" }),
  };

  return (
    <div style={s.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={s.header}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h1 style={s.headerTitle}>📋 My Trackers</h1>
          <div style={s.tabs}>
            <button style={s.tab(tab === "tasks")} onClick={() => setTab("tasks")}>✅ Task Tracker</button>
            <button style={s.tab(tab === "loans")} onClick={() => setTab("loans")}>💸 Loan Tracker</button>
          </div>
        </div>
      </div>

      <div style={s.body}>

        {/* ═══ TASKS ═══ */}
        {tab === "tasks" && <>
          <div style={s.card}>
            <div style={{ fontWeight: 700, marginBottom: 14, color: "#a78bfa" }}>{editingTask !== null ? "✏️ Edit Task" : "➕ Add Task"}</div>
            <div style={s.formGrid}>
              <input style={s.input} placeholder="Task title (e.g. ISO 27001 Learning)" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input style={s.input} placeholder="Daily hours (e.g. 2hrs)" value={taskForm.hours} onChange={e => setTaskForm({ ...taskForm, hours: e.target.value })} />
                <select style={s.select} value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                  <option>High</option><option>Medium</option><option>Low</option>
                </select>
              </div>
              <input style={s.input} placeholder="Notes (optional)" value={taskForm.notes} onChange={e => setTaskForm({ ...taskForm, notes: e.target.value })} />
              <div style={{ display: "flex", gap: 8 }}>
                <button style={s.btn("#7c3aed")} onClick={addTask}>{editingTask !== null ? "Update Task" : "Add Task"}</button>
                {editingTask !== null && <button style={s.btn("#444")} onClick={() => { setEditingTask(null); setTaskForm({ title: "", hours: "", priority: "High", notes: "" }); }}>Cancel</button>}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            {[["All", tasks.length], ["Pending", tasks.filter(t=>!t.done).length], ["Done", tasks.filter(t=>t.done).length]].map(([f, c]) => (
              <div key={f} style={{ ...s.statBox, borderColor: taskFilter === f ? "#a78bfa" : "#1e1e35" }} onClick={() => setTaskFilter(f)}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#a78bfa" }}>{c}</div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{f}</div>
              </div>
            ))}
          </div>

          <div style={s.filterBar}>
            {["All","Pending","Done"].map(f => <button key={f} style={s.filterBtn(taskFilter===f)} onClick={() => setTaskFilter(f)}>{f}</button>)}
          </div>

          {filteredTasks.length === 0 && <div style={{ textAlign: "center", color: "#555", padding: 40 }}>No tasks here yet.</div>}

          {filteredTasks.map((t, i) => {
            const realIdx = tasks.findIndex(x => x.id === t.id);
            return (
              <div key={t.id} style={{ ...s.row, opacity: t.done ? 0.6 : 1, borderLeft: `3px solid ${priorityConfig[t.priority]?.color || "#aaa"}` }}>
                <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} style={{ marginTop: 3, accentColor: "#7c3aed", width: 16, height: 16, cursor: "pointer", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, textDecoration: t.done ? "line-through" : "none", color: t.done ? "#666" : "#e8e6f0" }}>{t.title}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                    {t.hours && <span style={{ fontSize: 12, color: "#60a5fa" }}>⏱ {t.hours}</span>}
                    <span style={s.badge(t.priority)}>{t.priority}</span>
                    {t.notes && <span style={{ fontSize: 12, color: "#888" }}>📝 {t.notes}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => editTask(realIdx)} style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: 16 }}>✏️</button>
                  <button onClick={() => deleteTask(t.id)} style={{ background: "none", border: "none", color: "#ff4d6d", cursor: "pointer", fontSize: 16 }}>🗑</button>
                </div>
              </div>
            );
          })}
        </>}

        {/* ═══ LOANS ═══ */}
        {tab === "loans" && <>
          <div style={s.card}>
            <div style={{ fontWeight: 700, marginBottom: 14, color: "#60a5fa" }}>{editingLoan !== null ? "✏️ Edit Loan" : "➕ Add Loan"}</div>
            <div style={s.formGrid}>
              <input style={s.input} placeholder="Person's name" value={loanForm.name} onChange={e => setLoanForm({ ...loanForm, name: e.target.value })} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input style={s.input} placeholder="Amount (₹)" type="number" value={loanForm.amount} onChange={e => setLoanForm({ ...loanForm, amount: e.target.value })} />
                <input style={s.input} type="date" value={loanForm.date} onChange={e => setLoanForm({ ...loanForm, date: e.target.value })} />
              </div>
              <input style={s.input} placeholder="Notes (optional, e.g. reason)" value={loanForm.notes} onChange={e => setLoanForm({ ...loanForm, notes: e.target.value })} />
              <div style={{ display: "flex", gap: 8 }}>
                <button style={s.btn("#1d4ed8")} onClick={addLoan}>{editingLoan !== null ? "Update Loan" : "Add Loan"}</button>
                {editingLoan !== null && <button style={s.btn("#444")} onClick={() => { setEditingLoan(null); setLoanForm({ name: "", amount: "", date: "", notes: "" }); }}>Cancel</button>}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div style={s.statBox}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#ff4d6d" }}>{formatCurrency(totalOut)}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Outstanding</div>
            </div>
            <div style={s.statBox}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#06d6a0" }}>{formatCurrency(totalReturned)}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Returned</div>
            </div>
            <div style={s.statBox}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#60a5fa" }}>{loans.length}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Total</div>
            </div>
          </div>

          <div style={s.filterBar}>
            {["All","Active","Returned"].map(f => <button key={f} style={s.filterBtn(loanFilter===f)} onClick={() => setLoanFilter(f)}>{f}</button>)}
          </div>

          {filteredLoans.length === 0 && <div style={{ textAlign: "center", color: "#555", padding: 40 }}>No loans here yet.</div>}

          {filteredLoans.map((l, i) => {
            const realIdx = loans.findIndex(x => x.id === l.id);
            return (
              <div key={l.id} style={{ ...s.row, opacity: l.closed ? 0.65 : 1, borderLeft: `3px solid ${l.closed ? "#06d6a0" : "#ff4d6d"}` }}>
                <div style={{ fontSize: 22, flexShrink: 0 }}>{l.closed ? "✅" : "💸"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{l.name}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: l.closed ? "#06d6a0" : "#ffd166", margin: "4px 0" }}>{formatCurrency(l.amount)}</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: "#888" }}>
                    {l.date && <span>📅 Given: {new Date(l.date).toLocaleDateString("en-IN")}</span>}
                    {l.closed && l.closedDate && <span>✅ Returned: {l.closedDate}</span>}
                    {l.notes && <span>📝 {l.notes}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button onClick={() => closeLoan(l.id)} style={{ ...s.btn(l.closed ? "#374151" : "#065f46"), fontSize: 11, padding: "6px 10px" }}>{l.closed ? "Reopen" : "Mark Returned"}</button>
                  <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                    <button onClick={() => editLoan(realIdx)} style={{ background: "none", border: "none", color: "#60a5fa", cursor: "pointer", fontSize: 15 }}>✏️</button>
                    <button onClick={() => deleteLoan(l.id)} style={{ background: "none", border: "none", color: "#ff4d6d", cursor: "pointer", fontSize: 15 }}>🗑</button>
                  </div>
                </div>
              </div>
            );
          })}
        </>}
      </div>
    </div>
  );
}