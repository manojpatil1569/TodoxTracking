const today = new Date().toDateString();
const KEY = "routine-tracker-analytics";

let state = {
  date: today,
  tasks: [],
  streak: 0,
  dark: false,
  history: {}
};

const saved = JSON.parse(localStorage.getItem(KEY));
if (saved) {
  if (saved.date !== today) {
    const donePct = Math.round(
      (saved.tasks.filter(t => t.completed).length / saved.tasks.length || 0) * 100
    );
    saved.history[saved.date] = donePct;
    saved.tasks.forEach(t => t.completed = false);
    saved.date = today;
  }
  state = saved;
}

const list = document.getElementById("taskList");
const bar = document.getElementById("progress-bar");
const text = document.getElementById("progressText");
const dateEl = document.getElementById("date");
const streakEl = document.getElementById("streak");
const concl = document.getElementById("conclusion");
const ctx = document.getElementById("chart").getContext("2d");
const input = document.getElementById("taskInput");

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function updateStreak() {
  if (state.tasks.length && state.tasks.every(t => t.completed)) {
    const last = localStorage.getItem("lastDone");
    if (last !== today) {
      state.streak++;
      localStorage.setItem("lastDone", today);
    }
  }
}

function render() {
  document.body.classList.toggle("dark", state.dark);
  dateEl.textContent = state.date;
  streakEl.textContent = `🔥 Streak: ${state.streak} days`;

  list.innerHTML = "";
  let completed = 0;

  state.tasks.forEach(task => {
    const li = document.createElement("li");
    if (task.completed) {
      li.classList.add("completed");
      completed++;
    }

    const doneBtn = document.createElement("button");
    doneBtn.className = "done-btn";
    doneBtn.textContent = task.completed ? "✓ Done" : "○ Todo";
    doneBtn.onclick = () => {
      task.completed = !task.completed;
      updateStreak();
      save();
      render();
    };

    const span = document.createElement("span");
    span.textContent = task.title;

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "🗑";
    del.onclick = () => {
      state.tasks = state.tasks.filter(t => t.id !== task.id);
      save();
      render();
    };

    li.append(doneBtn, span, del);
    list.appendChild(li);
  });

  text.textContent = `${completed}/${state.tasks.length} completed`;
  bar.style.width = state.tasks.length
    ? (completed / state.tasks.length) * 100 + "%"
    : "0%";

  drawChart();
  generateConclusion();
}

function drawChart() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const days = Object.keys(state.history).slice(-7);
  const values = days.map(d => state.history[d]);
  const w = ctx.canvas.width / 7;

  values.forEach((v, i) => {
    ctx.fillStyle = "#667eea";
    ctx.fillRect(i * w + 10, ctx.canvas.height - v, 20, v);
    ctx.fillText(v + "%", i * w + 5, ctx.canvas.height - 5);
  });
}

function generateConclusion() {
  const vals = Object.values(state.history).slice(-7);
  if (!vals.length) {
    concl.textContent = "No data yet. Start completing tasks!";
    return;
  }
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  if (avg >= 80) concl.textContent = "✅ Excellent consistency this week!";
  else if (avg >= 50) concl.textContent = "⚠️ Moderate performance. Improve consistency.";
  else concl.textContent = "❌ Low productivity. Reset routine & focus.";
}

document.getElementById("addBtn").onclick = () => {
  if (!input.value.trim()) return;
  state.tasks.push({ id: Date.now(), title: input.value, completed: false });
  input.value = "";
  save();
  render();
};

document.getElementById("darkBtn").onclick = () => {
  state.dark = !state.dark;
  save();
  render();
};

document.getElementById("resetBtn").onclick = () => {
  state.tasks.forEach(t => t.completed = false);
  save();
  render();
};

render();
