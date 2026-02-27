// ============================================================
// RoutineOS — Full Script
// ============================================================

const KEY = "routineos-v1";
const today = new Date().toDateString();

// ===== DEFAULT STATE =====
let S = {
  date: today,
  tasks: [],
  habits: [],
  reminders: [],
  goals: [],
  streak: 0,
  bestStreak: 0,
  history: {},
  light: false,
  activeTimers: {}
};

// ===== LOAD STATE =====
try {
  const raw = JSON.parse(localStorage.getItem(KEY));
  if (raw) {
    if (raw.date !== today) {
      const pct = raw.tasks.length
        ? Math.round((raw.tasks.filter(t => t.done).length / raw.tasks.length) * 100)
        : 0;
      raw.history[raw.date] = pct;
      raw.tasks.forEach(t => { t.done = false; t.elapsed = 0; });

      // Streak
      const yest = new Date(); yest.setDate(yest.getDate() - 1);
      if (raw.history[yest.toDateString()] >= 60) {
        raw.streak = (raw.streak || 0) + 1;
        raw.bestStreak = Math.max(raw.bestStreak || 0, raw.streak);
      } else if (raw.history[yest.toDateString()] !== undefined) {
        raw.streak = 0;
      }
      raw.date = today;
    }
    S = { ...S, ...raw };
  }
} catch(e) { console.warn("State load error", e); }

function save() { localStorage.setItem(KEY, JSON.stringify(S)); }

// ===== QUOTES =====
const QUOTES = [
  { q: "The secret of getting ahead is getting started.", a: "Mark Twain" },
  { q: "Focus on progress, not perfection.", a: "Bill Phillips" },
  { q: "Discipline is choosing between what you want now and what you want most.", a: "Abraham Lincoln" },
  { q: "Small daily improvements are the key to staggering long-term results.", a: "Robin Sharma" },
  { q: "You don't have to be great to start, but you have to start to be great.", a: "Zig Ziglar" },
  { q: "What gets measured gets managed.", a: "Peter Drucker" },
  { q: "Excellence is not an act, but a habit.", a: "Aristotle" },
  { q: "The way to get started is to quit talking and begin doing.", a: "Walt Disney" },
  { q: "It always seems impossible until it's done.", a: "Nelson Mandela" },
  { q: "One day or day one. You decide.", a: "Paulo Coelho" },
  { q: "The future depends on what you do today.", a: "Mahatma Gandhi" },
  { q: "Productivity is never an accident. It is always the result of commitment to excellence.", a: "Paul J. Meyer" },
];

const AFFIRMATIONS = [
  "I am capable of achieving everything I set my mind to.",
  "Today I choose focus, discipline, and growth.",
  "Every small step I take brings me closer to my goals.",
  "I have the strength to overcome any challenge today.",
  "I am building the life I deserve, one habit at a time.",
  "My consistency creates my destiny.",
  "Today is a new opportunity to become a better version of myself.",
  "I am in control of my time, energy, and attention.",
];

const CATEGORY_EMOJI = { health: "💪", mind: "🧠", work: "💼", social: "🤝" };
const PRIORITY_COLORS = { high: "#ff4757", med: "#ffd166", low: "#4fffb0" };

// ===== NAVIGATION =====
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("sec-" + btn.dataset.section).classList.add("active");
    if (btn.dataset.section === "insights") renderInsights();
    if (btn.dataset.section === "motivation") renderMotivation();
    if (btn.dataset.section === "dashboard") renderDashboard();
  });
});

document.querySelectorAll(".link-btn[data-goto]").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.goto;
    document.querySelector(`.nav-btn[data-section="${target}"]`)?.click();
  });
});

// ===== DARK / LIGHT TOGGLE =====
document.getElementById("darkBtn").onclick = () => {
  S.light = !S.light;
  document.body.classList.toggle("light", S.light);
  document.getElementById("darkBtn").textContent = S.light ? "☽" : "☀";
  save();
};
document.body.classList.toggle("light", S.light);
document.getElementById("darkBtn").textContent = S.light ? "☽" : "☀";

// ===== ANIMATED BACKGROUND =====
(function initBg() {
  const canvas = document.getElementById("bgCanvas");
  const ctx = canvas.getContext("2d");
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 1.5 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.4 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  // Orbs
  const orbs = [
    { x: 0.2, y: 0.3, r: 300, c: [79,255,176] },
    { x: 0.8, y: 0.7, r: 250, c: [0,191,255] },
    { x: 0.5, y: 0.9, r: 200, c: [255,107,157] },
  ];

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Dark base
    const isLight = document.body.classList.contains("light");
    ctx.fillStyle = isLight ? "#eef1ff" : "#080b12";
    ctx.fillRect(0, 0, W, H);

    // Orbs
    orbs.forEach((o, i) => {
      const x = o.x * W + Math.sin(t * 0.0005 + i) * 60;
      const y = o.y * H + Math.cos(t * 0.0004 + i * 1.5) * 40;
      const g = ctx.createRadialGradient(x, y, 0, x, y, o.r);
      const alpha = isLight ? 0.12 : 0.08;
      g.addColorStop(0, `rgba(${o.c},${alpha})`);
      g.addColorStop(1, `rgba(${o.c},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });

    // Particles
    particles.forEach(p => {
      p.update();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      const col = isLight ? "0,0,0" : "255,255,255";
      ctx.fillStyle = `rgba(${col},${p.alpha * 0.4})`;
      ctx.fill();
    });

    // Connect nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i+1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const col = isLight ? "0,0,0" : "255,255,255";
          ctx.strokeStyle = `rgba(${col},${(1 - dist/100) * 0.05})`;
          ctx.stroke();
        }
      }
    }

    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();

// ===== TOAST =====
function toast(msg, dur = 2500) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), dur);
}

// ===== GREETING =====
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

// ===== DASHBOARD =====
function renderDashboard() {
  document.getElementById("greeting").textContent = getGreeting();
  document.getElementById("fullDate").textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
  });
  document.getElementById("streakNum").textContent = S.streak;

  // Task stats
  const done = S.tasks.filter(t => t.done).length;
  const total = S.tasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById("dash-tasksDone").textContent = `${done}/${total}`;
  document.getElementById("dash-taskBar").style.width = pct + "%";

  // Habit stats
  const hDone = S.habits.filter(h => (h.log || {})[today]).length;
  const hTotal = S.habits.length;
  const hPct = hTotal ? Math.round((hDone / hTotal) * 100) : 0;
  document.getElementById("dash-habitsDone").textContent = `${hDone}/${hTotal}`;
  document.getElementById("dash-habitBar").style.width = hPct + "%";

  // Best streak & avg
  document.getElementById("dash-bestStreak").textContent = S.bestStreak || S.streak;
  const vals = Object.values(S.history).slice(-7);
  const avg = vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 0;
  document.getElementById("dash-avgScore").textContent = avg + "%";

  // Motivation
  const q = QUOTES[new Date().getDay() % QUOTES.length];
  document.querySelector("#dashMotivation .motive-text").textContent = `"${q.q}" — ${q.a}`;

  // Task preview (top 4)
  const prev = document.getElementById("dash-taskPreview");
  const tasks4 = S.tasks.slice(0, 4);
  if (!tasks4.length) {
    prev.innerHTML = `<p class="empty-state">No tasks for today.</p>`;
  } else {
    prev.innerHTML = tasks4.map(t => `
      <div class="preview-item">
        <div class="preview-dot" style="background:${PRIORITY_COLORS[t.priority]}"></div>
        <span class="preview-name ${t.done ? "done" : ""}">${esc(t.title)}</span>
        ${t.time ? `<span class="preview-time">${t.time}</span>` : ""}
      </div>
    `).join("");
  }
  document.getElementById("dash-prog").style.width = pct + "%";
  document.getElementById("dash-progLabel").textContent = pct + "%";

  // Upcoming reminders (next 3 by time)
  const remDiv = document.getElementById("dash-reminders");
  const now = new Date();
  const upcoming = S.reminders
    .filter(r => r.time)
    .sort((a,b) => a.time.localeCompare(b.time))
    .slice(0, 3);
  if (!upcoming.length) {
    remDiv.innerHTML = `<p class="empty-state">No reminders set.</p>`;
  } else {
    remDiv.innerHTML = upcoming.map(r => `
      <div class="dash-reminder-item">
        <span class="dash-r-time">${r.time}</span>
        <span class="dash-r-text">${esc(r.text)}</span>
      </div>
    `).join("");
  }

  // Weak areas
  renderWeakAreas("dash-weakAreas", true);
}

// ===== TASKS =====
let activeFilter = "all";
let runningTimers = {};

document.getElementById("addTaskBtn").onclick = addTask;
document.getElementById("taskInput").addEventListener("keydown", e => e.key === "Enter" && addTask());

function addTask() {
  const title = document.getElementById("taskInput").value.trim();
  if (!title) return;
  S.tasks.push({
    id: Date.now(),
    title,
    done: false,
    time: document.getElementById("taskTime").value,
    priority: document.getElementById("taskPriority").value,
    duration: parseInt(document.getElementById("taskDuration").value) || null,
    elapsed: 0,
    created: Date.now()
  });
  document.getElementById("taskInput").value = "";
  document.getElementById("taskTime").value = "";
  document.getElementById("taskDuration").value = "";
  save();
  renderTasks();
  renderDashboard();
  toast("✓ Task added");
}

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    renderTasks();
  });
});

document.getElementById("resetBtn").onclick = () => {
  if (!confirm("Reset all tasks?")) return;
  S.tasks.forEach(t => { t.done = false; t.elapsed = 0; });
  save(); renderTasks(); renderDashboard();
  toast("↺ Tasks reset");
};

function renderTasks() {
  const list = document.getElementById("taskList");
  let tasks = [...S.tasks];

  if (activeFilter === "pending") tasks = tasks.filter(t => !t.done);
  else if (activeFilter === "done") tasks = tasks.filter(t => t.done);
  else if (activeFilter === "high") tasks = tasks.filter(t => t.priority === "high");

  // Sort: high priority first, then undone first
  tasks.sort((a,b) => {
    const pOrd = {high:0, med:1, low:2};
    if (a.done !== b.done) return a.done ? 1 : -1;
    return (pOrd[a.priority]||1) - (pOrd[b.priority]||1);
  });

  if (!tasks.length) {
    list.innerHTML = `<p class="empty-state">No tasks here. Add one above!</p>`;
    document.getElementById("task-prog").style.width = "0%";
    document.getElementById("task-progLabel").textContent = "0/0";
    return;
  }

  list.innerHTML = tasks.map(task => {
    const elapsed = formatTime(task.elapsed || 0);
    const isRunning = !!runningTimers[task.id];
    return `
      <div class="task-item ${task.done ? "done" : ""}" data-id="${task.id}">
        <button class="task-check" onclick="toggleTask(${task.id})">${task.done ? "✓" : ""}</button>
        <div class="task-body">
          <div class="task-name">${esc(task.title)}</div>
          <div class="task-meta">
            <span class="task-tag tag-${task.priority}">${task.priority.toUpperCase()}</span>
            ${task.time ? `<span class="task-tag tag-time">⏰ ${task.time}</span>` : ""}
            ${task.duration ? `<span class="task-tag tag-dur">~${task.duration}min</span>` : ""}
            ${task.elapsed ? `<span class="task-tag tag-dur">⏱ ${elapsed}</span>` : ""}
          </div>
        </div>
        <button class="task-timer-btn ${isRunning ? "running" : ""}" onclick="toggleTimer(${task.id})">
          ${isRunning ? "⏸ " + elapsed : "▷ Start"}
        </button>
        <button class="task-del" onclick="delTask(${task.id})">🗑</button>
      </div>
    `;
  }).join("");

  const done = S.tasks.filter(t => t.done).length;
  const pct = S.tasks.length ? Math.round((done / S.tasks.length) * 100) : 0;
  document.getElementById("task-prog").style.width = pct + "%";
  document.getElementById("task-progLabel").textContent = `${done}/${S.tasks.length}`;
}

window.toggleTask = (id) => {
  const t = S.tasks.find(t => t.id === id);
  if (!t) return;
  t.done = !t.done;
  if (t.done && runningTimers[id]) stopTimer(id);
  save(); renderTasks(); renderDashboard();
  if (t.done) toast("✓ Task completed! 🎉");
};

window.delTask = (id) => {
  if (runningTimers[id]) stopTimer(id);
  S.tasks = S.tasks.filter(t => t.id !== id);
  save(); renderTasks(); renderDashboard();
  toast("🗑 Task removed");
};

window.toggleTimer = (id) => {
  if (runningTimers[id]) { stopTimer(id); return; }
  runningTimers[id] = setInterval(() => {
    const t = S.tasks.find(t => t.id === id);
    if (!t) { clearInterval(runningTimers[id]); delete runningTimers[id]; return; }
    t.elapsed = (t.elapsed || 0) + 1;
    save();
    renderTasks();
  }, 1000);
  renderTasks();
};

function stopTimer(id) {
  clearInterval(runningTimers[id]);
  delete runningTimers[id];
  save(); renderTasks();
}

function formatTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}
function pad(n) { return String(n).padStart(2, "0"); }

// ===== HABITS =====
document.getElementById("addHabitBtn").onclick = addHabit;
document.getElementById("habitInput").addEventListener("keydown", e => e.key === "Enter" && addHabit());

function addHabit() {
  const name = document.getElementById("habitInput").value.trim();
  if (!name) return;
  S.habits.push({
    id: Date.now(),
    name,
    category: document.getElementById("habitCategory").value,
    target: document.getElementById("habitTarget").value,
    log: {}
  });
  document.getElementById("habitInput").value = "";
  save(); renderHabits(); renderDashboard();
  toast("◉ Habit added");
}

function renderHabits() {
  const list = document.getElementById("habitList");
  if (!S.habits.length) {
    list.innerHTML = `<p class="empty-state" style="padding:20px;text-align:center">No habits yet. Add one above!</p>`;
    return;
  }

  list.innerHTML = S.habits.map(h => {
    const days = getLast7Days();
    const streakN = habitStreak(h);
    const weekDone = days.filter(d => (h.log||{})[d.key]).length;
    const pct = Math.round((weekDone / 7) * 100);
    const emoji = CATEGORY_EMOJI[h.category] || "✦";

    const dotsHtml = days.map(d => {
      const done = (h.log||{})[d.key];
      const isToday = d.key === today;
      return `<div class="habit-dot ${done?"done":""} ${isToday?"today":""}"
        data-id="${h.id}" data-date="${d.key}" title="${d.key}">
        <span class="habit-dot-label">${d.label}</span>
        <span class="habit-dot-mark">✓</span>
      </div>`;
    }).join("");

    return `
      <div class="habit-card">
        <div class="habit-top">
          <div class="habit-info">
            <div class="habit-emoji">${emoji}</div>
            <div>
              <div class="habit-name">${esc(h.name)}</div>
              <div class="habit-sub">${h.target} · ${h.category}</div>
            </div>
          </div>
          <div class="habit-right">
            <span class="habit-streak-badge">🔥 ${streakN}</span>
            <button class="habit-del" data-id="${h.id}">🗑</button>
          </div>
        </div>
        <div class="habit-dots" data-habit="${h.id}">${dotsHtml}</div>
        <div class="habit-progress">
          <div class="prog-track" style="flex:1"><div class="prog-fill" style="width:${pct}%"></div></div>
          <span class="habit-prog-label">${pct}% this week</span>
        </div>
      </div>
    `;
  }).join("");

  // Events
  list.querySelectorAll(".habit-dot").forEach(dot => {
    dot.addEventListener("click", () => {
      const id = parseInt(dot.dataset.id);
      const date = dot.dataset.date;
      const h = S.habits.find(h => h.id === id);
      if (!h) return;
      if (!h.log) h.log = {};
      h.log[date] = !h.log[date];
      save(); renderHabits(); renderDashboard();
    });
  });

  list.querySelectorAll(".habit-del").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      S.habits = S.habits.filter(h => h.id !== id);
      save(); renderHabits(); renderDashboard();
      toast("🗑 Habit removed");
    });
  });
}

function getLast7Days() {
  return Array.from({length:7}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate() - (6-i));
    return {
      key: d.toDateString(),
      label: d.toLocaleDateString("en",{weekday:"narrow"})
    };
  });
}

function habitStreak(h) {
  if (!h.log) return 0;
  let s = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    if (h.log[d.toDateString()]) s++;
    else break;
  }
  return s;
}

// ===== REMINDERS =====
document.getElementById("addReminderBtn").onclick = addReminder;

function addReminder() {
  const text = document.getElementById("reminderText").value.trim();
  const time = document.getElementById("reminderTime").value;
  if (!text || !time) { toast("⚠ Please enter text and time"); return; }
  S.reminders.push({
    id: Date.now(),
    text,
    time,
    repeat: document.getElementById("reminderRepeat").value
  });
  document.getElementById("reminderText").value = "";
  document.getElementById("reminderTime").value = "";
  save(); renderReminders(); renderDashboard();
  toast("🔔 Reminder set for " + time);
}

function renderReminders() {
  const list = document.getElementById("reminderList");
  if (!S.reminders.length) {
    list.innerHTML = `<p class="empty-state">No reminders yet.</p>`;
    return;
  }
  const sorted = [...S.reminders].sort((a,b) => a.time.localeCompare(b.time));
  list.innerHTML = sorted.map(r => `
    <div class="reminder-item">
      <div class="reminder-time">${r.time}</div>
      <div class="reminder-body">
        <div class="reminder-text">${esc(r.text)}</div>
        <div class="reminder-sub">${r.repeat}</div>
      </div>
      <button class="reminder-del" data-id="${r.id}">🗑</button>
    </div>
  `).join("");

  list.querySelectorAll(".reminder-del").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      S.reminders = S.reminders.filter(r => r.id !== id);
      save(); renderReminders(); renderDashboard();
      toast("🗑 Reminder removed");
    });
  });
}

// Notification permission
document.getElementById("notifBtn").onclick = () => {
  if (!("Notification" in window)) {
    document.getElementById("notifStatus").textContent = "Your browser doesn't support notifications.";
    return;
  }
  Notification.requestPermission().then(p => {
    document.getElementById("notifStatus").textContent =
      p === "granted" ? "✓ Notifications enabled! You'll be reminded." :
      "Notifications blocked. Enable in browser settings.";
  });
};

// Check reminders every minute
function checkReminders() {
  const now = new Date();
  const hhmm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  S.reminders.forEach(r => {
    if (r.time === hhmm) {
      toast(`🔔 Reminder: ${r.text}`, 5000);
      if (Notification.permission === "granted") {
        new Notification("RoutineOS Reminder", { body: r.text, icon: "" });
      }
    }
  });
}
setInterval(checkReminders, 60000);

// ===== INSIGHTS =====
function renderInsights() {
  drawTaskChart();
  drawHabitChart();
  renderTimeInsights();
  renderWeakAreas("weakAreas", false);
  renderHeatmap();
  generateConclusion();
}

function drawTaskChart() {
  const canvas = document.getElementById("taskChart");
  const ctx = canvas.getContext("2d");
  const W = canvas.width = canvas.offsetWidth;
  const H = 160; canvas.height = H;
  ctx.clearRect(0, 0, W, H);

  const isLight = document.body.classList.contains("light");
  const textCol = isLight ? "#6b7799" : "#6b7799";
  const days = Object.keys(S.history).slice(-7);
  const values = days.map(d => S.history[d]);

  if (!values.length) {
    ctx.fillStyle = textCol;
    ctx.font = "13px DM Sans, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Complete tasks to see history", W/2, H/2);
    return;
  }

  const pad = 10, barW = Math.min(32, (W - pad*2) / 7 - 8);
  const slotW = (W - pad*2) / 7;

  // Grid lines
  [25,50,75,100].forEach(v => {
    const y = H - 20 - (v/100) * (H - 40);
    ctx.strokeStyle = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W-pad, y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = textCol;
    ctx.font = "9px DM Mono, monospace";
    ctx.textAlign = "left";
    ctx.fillText(v + "%", pad, y - 3);
  });

  values.forEach((v, i) => {
    const x = pad + i * slotW + (slotW - barW) / 2;
    const barH = (v / 100) * (H - 40);
    const y = H - 20 - barH;

    // Bar gradient
    const g = ctx.createLinearGradient(0, y, 0, H-20);
    g.addColorStop(0, "#4fffb0");
    g.addColorStop(1, "#00bfff");
    ctx.fillStyle = g;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, barW, barH, [6,6,0,0]);
    else ctx.rect(x, y, barW, barH);
    ctx.fill();

    // Value label
    ctx.fillStyle = isLight ? "#1a1f36" : "#e8edf8";
    ctx.font = "bold 10px DM Mono, monospace";
    ctx.textAlign = "center";
    ctx.fillText(v + "%", x + barW/2, y - 5);

    // Day label
    const d = new Date(days[i]);
    ctx.fillStyle = textCol;
    ctx.font = "10px DM Sans, sans-serif";
    ctx.fillText(d.toLocaleDateString("en",{weekday:"narrow"}), x + barW/2, H - 4);
  });
}

function drawHabitChart() {
  const canvas = document.getElementById("habitChart");
  const ctx = canvas.getContext("2d");
  const W = canvas.width = canvas.offsetWidth;
  const H = 140; canvas.height = H;
  ctx.clearRect(0, 0, W, H);

  const isLight = document.body.classList.contains("light");
  const textCol = "#6b7799";

  if (!S.habits.length) {
    ctx.fillStyle = textCol;
    ctx.font = "13px DM Sans, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Add habits to see consistency", W/2, H/2);
    return;
  }

  const days = getLast7Days();
  const barH_max = H - 40;
  const slotW = (W - 20) / S.habits.length;
  const barW = Math.min(28, slotW - 10);

  S.habits.forEach((h, i) => {
    const weekDone = days.filter(d => (h.log||{})[d.key]).length;
    const pct = weekDone / 7;
    const bH = pct * barH_max;
    const x = 10 + i * slotW + (slotW - barW) / 2;
    const y = H - 20 - bH;

    const emoji = CATEGORY_EMOJI[h.category] || "✦";
    const colors = { health:"#4fffb0", mind:"#00bfff", work:"#ffd166", social:"#ff6b9d" };
    const col = colors[h.category] || "#4fffb0";

    if (bH > 0) {
      ctx.fillStyle = col + "33";
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, barW, bH, [4,4,0,0]);
      else ctx.rect(x, y, barW, bH);
      ctx.fill();

      ctx.fillStyle = col;
      ctx.fillRect(x, H-20-Math.min(bH, 4), barW, Math.min(bH, 4));
    }

    ctx.fillStyle = textCol;
    ctx.font = "10px DM Sans";
    ctx.textAlign = "center";
    ctx.fillText(emoji, x + barW/2, H - 4);

    ctx.fillStyle = isLight ? "#1a1f36" : "#e8edf8";
    ctx.font = "bold 10px DM Mono";
    ctx.fillText(Math.round(pct*100) + "%", x + barW/2, y - 4);
  });
}

function renderTimeInsights() {
  const el = document.getElementById("timeInsights");
  const totalEst = S.tasks.reduce((a,t) => a + (t.duration||0), 0);
  const totalSpent = S.tasks.reduce((a,t) => a + Math.round((t.elapsed||0)/60), 0);
  const highCount = S.tasks.filter(t => t.priority === "high").length;
  const highDone = S.tasks.filter(t => t.priority === "high" && t.done).length;

  el.innerHTML = `
    <div class="time-insight-grid">
      <div class="time-insight-item">
        <div class="ti-label">Estimated Time</div>
        <div class="ti-val" style="color:var(--accent2)">${totalEst}m</div>
        <div class="ti-sub">for today's tasks</div>
      </div>
      <div class="time-insight-item">
        <div class="ti-label">Time Spent</div>
        <div class="ti-val" style="color:var(--accent)">${totalSpent}m</div>
        <div class="ti-sub">tracked via timers</div>
      </div>
      <div class="time-insight-item">
        <div class="ti-label">Efficiency</div>
        <div class="ti-val" style="color:var(--warn)">${totalEst > 0 ? Math.round((totalSpent/totalEst)*100) : 0}%</div>
        <div class="ti-sub">actual vs estimated</div>
      </div>
      <div class="time-insight-item">
        <div class="ti-label">High-Priority</div>
        <div class="ti-val" style="color:var(--danger)">${highDone}/${highCount}</div>
        <div class="ti-sub">critical tasks done</div>
      </div>
    </div>
  `;
}

function renderWeakAreas(containerId, compact) {
  const el = document.getElementById(containerId);
  const areas = [];

  // Check task completion
  const taskPct = S.tasks.length ? Math.round((S.tasks.filter(t=>t.done).length / S.tasks.length)*100) : null;
  if (taskPct !== null && taskPct < 50) {
    areas.push({
      icon: "📋",
      title: "Low Task Completion",
      desc: `Only ${taskPct}% of today's tasks are done.`,
      fix: "Try breaking large tasks into smaller steps."
    });
  }

  // High priority undone
  const highUndone = S.tasks.filter(t => t.priority === "high" && !t.done).length;
  if (highUndone > 0) {
    areas.push({
      icon: "🔴",
      title: "Unfinished High-Priority Tasks",
      desc: `${highUndone} critical task${highUndone>1?"s":""} still pending.`,
      fix: "Prioritize these first thing tomorrow."
    });
  }

  // Habit consistency
  S.habits.forEach(h => {
    const streak = habitStreak(h);
    const days = getLast7Days();
    const weekDone = days.filter(d => (h.log||{})[d.key]).length;
    if (weekDone < 3 && h.target === "daily") {
      areas.push({
        icon: CATEGORY_EMOJI[h.category] || "◉",
        title: `Inconsistent: "${h.name}"`,
        desc: `Only ${weekDone}/7 days completed this week.`,
        fix: "Set a specific time each day for this habit."
      });
    }
  });

  // Avg score
  const vals = Object.values(S.history).slice(-7);
  if (vals.length >= 3) {
    const avg = vals.reduce((a,b)=>a+b,0)/vals.length;
    if (avg < 40) {
      areas.push({
        icon: "📉",
        title: "Declining Weekly Score",
        desc: `Your 7-day average is ${Math.round(avg)}%.`,
        fix: "Reduce your task count and focus on consistency."
      });
    }
  }

  if (!areas.length) {
    el.innerHTML = `<p style="color:var(--accent);text-align:center;padding:16px;font-weight:600">✅ No weak areas detected. You're crushing it!</p>`;
    return;
  }

  const show = compact ? areas.slice(0,2) : areas;
  el.innerHTML = show.map(a => `
    <div class="weak-item">
      <div class="weak-icon">${a.icon}</div>
      <div>
        <div class="weak-title">${a.title}</div>
        <div class="weak-desc">${a.desc}</div>
        <div class="weak-fix">→ ${a.fix}</div>
      </div>
    </div>
  `).join("");
}

function generateConclusion() {
  const vals = Object.values(S.history).slice(-7);
  const el = document.getElementById("conclusion");
  if (!vals.length) { el.textContent = "No history yet. Start completing tasks!"; return; }
  const avg = vals.reduce((a,b)=>a+b,0)/vals.length;
  if (avg >= 80) el.textContent = "✅ Excellent week! You're in the top tier of consistency.";
  else if (avg >= 60) el.textContent = "👍 Good performance. Small improvements will take you far.";
  else if (avg >= 40) el.textContent = "⚠️ Moderate. Try reducing task count for better focus.";
  else el.textContent = "❌ Tough week. Reset expectations and build small wins.";
}

function renderHeatmap() {
  const el = document.getElementById("heatmap");
  const cells = Array.from({length:30}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate() - (29-i));
    const k = d.toDateString();
    const v = S.history[k] ?? null;
    let level = 0;
    if (v !== null) {
      if (v >= 80) level = 4;
      else if (v >= 60) level = 3;
      else if (v >= 40) level = 2;
      else if (v > 0) level = 1;
    }
    return `<div class="heat-cell heat-${level}" title="${k}: ${v !== null ? v+'%' : 'no data'}"></div>`;
  });
  el.innerHTML = cells.join("");
}

// ===== MOTIVATION =====
let currentQuoteIdx = new Date().getDay() % QUOTES.length;

function renderMotivation() {
  showQuote(currentQuoteIdx);
  showAffirmation();
  renderGoals();
  renderMilestones();
}

function showQuote(idx) {
  const q = QUOTES[idx];
  document.getElementById("heroQuote").textContent = `"${q.q}"`;
  document.getElementById("heroAuthor").textContent = `— ${q.a}`;
}

function showAffirmation() {
  const idx = Math.floor(Math.random() * AFFIRMATIONS.length);
  document.getElementById("affirmationBox").textContent = AFFIRMATIONS[idx];
}

document.getElementById("newQuoteBtn").onclick = () => {
  currentQuoteIdx = (currentQuoteIdx + 1) % QUOTES.length;
  showQuote(currentQuoteIdx);
};
document.getElementById("newAffirmBtn").onclick = showAffirmation;

// Goals
document.getElementById("addGoalBtn").onclick = addGoal;

function addGoal() {
  const text = document.getElementById("goalInput").value.trim();
  if (!text) return;
  S.goals.push({
    id: Date.now(),
    text,
    deadline: document.getElementById("goalDeadline").value,
    done: false
  });
  document.getElementById("goalInput").value = "";
  document.getElementById("goalDeadline").value = "";
  save(); renderGoals();
  toast("🎯 Goal added");
}

function renderGoals() {
  const el = document.getElementById("goalList");
  if (!S.goals.length) {
    el.innerHTML = `<p class="empty-state">No goals yet. Set your first one!</p>`;
    return;
  }
  el.innerHTML = S.goals.map(g => `
    <div class="goal-item ${g.done?"done":""}">
      <div class="goal-check" data-id="${g.id}">${g.done?"✓":""}</div>
      <span class="goal-text">${esc(g.text)}</span>
      ${g.deadline ? `<span class="goal-deadline">${g.deadline}</span>` : ""}
      <button class="goal-del" data-id="${g.id}">🗑</button>
    </div>
  `).join("");

  el.querySelectorAll(".goal-check").forEach(btn => {
    btn.addEventListener("click", () => {
      const g = S.goals.find(g => g.id === parseInt(btn.dataset.id));
      if (g) { g.done = !g.done; save(); renderGoals(); }
    });
  });
  el.querySelectorAll(".goal-del").forEach(btn => {
    btn.addEventListener("click", () => {
      S.goals = S.goals.filter(g => g.id !== parseInt(btn.dataset.id));
      save(); renderGoals();
    });
  });
}

function renderMilestones() {
  const milestones = [
    { days: 3, icon: "🌱", label: "3-Day Streak" },
    { days: 7, icon: "⭐", label: "Week Warrior" },
    { days: 21, icon: "🏆", label: "21-Day Habit" },
    { days: 30, icon: "💎", label: "30-Day Legend" },
  ];
  const streak = S.streak;
  document.getElementById("milestones").innerHTML = milestones.map(m => `
    <div class="milestone-item ${streak >= m.days ? "achieved" : ""}">
      <div class="milestone-icon">${m.icon}</div>
      <div class="milestone-days">${m.days}</div>
      <div class="milestone-label">${m.label}</div>
    </div>
  `).join("");
}

// ===== UTILS =====
function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

// ===== INIT =====
renderDashboard();
renderTasks();
renderHabits();
renderReminders();
