import { useState, useEffect, useCallback, useRef } from "react";
import { useGitHubSync } from "./hooks/useGitHubSync";
import { GitHubConnect } from "./components/GitHubConnect";
import { SyncIndicator } from "./components/SyncIndicator";

const workoutPlan = {
  Mon: {
    label: "Chest & Shoulders",
    icon: "💪",
    exercises: [
      { name: "Press-ups", sets: 3, reps: "8–12", tip: "Keep body straight, elbows at 45°", goal: 20,
        steps: ["Start in high plank, hands shoulder-width apart", "Lower chest toward floor, elbows at 45°", "Push back up explosively, arms fully extended"] },
      { name: "Pike Press-ups", sets: 3, reps: "8–10", tip: "Hips high, targets shoulders", goal: 15,
        steps: ["Form an inverted V with hips high in the air", "Bend elbows, lower crown toward the floor", "Press back up, keeping hips elevated throughout"] },
      { name: "Incline Press-ups", sets: 2, reps: "10–12", tip: "Hands on elevated surface", goal: 20,
        steps: ["Hands on elevated surface, body in a straight line", "Lower chest to the surface, elbows at 45°", "Push back up through palms, fully extend arms"] },
      { name: "Decline Press-ups", sets: 2, reps: "8–10", tip: "Feet elevated, upper chest focus", goal: 15,
        steps: ["Feet on elevated surface, hands on floor shoulder-width", "Lower chest toward floor with control", "Press up, feel the upper chest engage"] },
    ],
  },
  Tue: {
    label: "Abs & Core",
    icon: "🔥",
    exercises: [
      { name: "Plank", sets: 3, reps: "20–30 sec", tip: "Straight line head to heels, squeeze glutes", goal: 60,
        steps: ["Forearms flat, elbows directly under shoulders", "Lift into a straight line from head to heels", "Squeeze glutes and abs — breathe steadily"] },
      { name: "Crunches", sets: 3, reps: "15", tip: "Lower back stays on ground, don't pull neck", goal: 25,
        steps: ["Lie back, knees bent, fingertips lightly at temples", "Curl shoulders off the floor as you exhale", "Lower slowly, keep lower back pressed to ground"] },
      { name: "Reverse Crunch", sets: 3, reps: "12", tip: "Lift hips off floor, control the movement", goal: 20,
        steps: ["Lie back, arms at sides for stability", "Draw knees to chest, curl hips off the floor", "Lower with control — don't let legs swing"] },
      { name: "Dead Bug", sets: 3, reps: "8 each side", tip: "Slow and controlled, lower back flat", goal: 12,
        steps: ["Lie back, arms straight up, knees at 90°", "Lower opposite arm and leg toward the floor", "Return to start, switch sides and repeat"] },
      { name: "Mountain Climbers", sets: 2, reps: "20 sec", tip: "Keep hips level, drive knees to chest", goal: 40,
        steps: ["High plank position, hips level with shoulders", "Drive one knee explosively toward your chest", "Switch legs rapidly, keep core braced throughout"] },
    ],
  },
  Wed: {
    label: "Chest & Shoulders",
    icon: "💪",
    exercises: [
      { name: "Press-ups", sets: 3, reps: "8–12", tip: "Try to beat Monday's reps!", goal: 20,
        steps: ["Start in high plank, hands shoulder-width apart", "Lower chest toward floor, elbows at 45°", "Push back up explosively, arms fully extended"] },
      { name: "Pike Press-ups", sets: 3, reps: "8–10", tip: "Hips high, targets shoulders", goal: 15,
        steps: ["Form an inverted V with hips high in the air", "Bend elbows, lower crown toward the floor", "Press back up, keeping hips elevated throughout"] },
      { name: "Incline Press-ups", sets: 2, reps: "10–12", tip: "Hands on elevated surface", goal: 20,
        steps: ["Hands on elevated surface, body in a straight line", "Lower chest to the surface, elbows at 45°", "Push back up through palms, fully extend arms"] },
      { name: "Decline Press-ups", sets: 2, reps: "8–10", tip: "Feet elevated, upper chest focus", goal: 15,
        steps: ["Feet on elevated surface, hands on floor shoulder-width", "Lower chest toward floor with control", "Press up, feel the upper chest engage"] },
    ],
  },
  Thu: {
    label: "Abs & Core",
    icon: "🔥",
    exercises: [
      { name: "Plank", sets: 3, reps: "20–30 sec", tip: "Push that time a little further today", goal: 60,
        steps: ["Forearms flat, elbows directly under shoulders", "Lift into a straight line from head to heels", "Squeeze glutes and abs — breathe steadily"] },
      { name: "Crunches", sets: 3, reps: "15", tip: "Lower back stays on ground", goal: 25,
        steps: ["Lie back, knees bent, fingertips lightly at temples", "Curl shoulders off the floor as you exhale", "Lower slowly, keep lower back pressed to ground"] },
      { name: "Reverse Crunch", sets: 3, reps: "12", tip: "Lift hips, control the movement", goal: 20,
        steps: ["Lie back, arms at sides for stability", "Draw knees to chest, curl hips off the floor", "Lower with control — don't let legs swing"] },
      { name: "Dead Bug", sets: 3, reps: "8 each side", tip: "Slow and controlled", goal: 12,
        steps: ["Lie back, arms straight up, knees at 90°", "Lower opposite arm and leg toward the floor", "Return to start, switch sides and repeat"] },
      { name: "Mountain Climbers", sets: 2, reps: "20 sec", tip: "Add 5 sec vs Tuesday", goal: 40,
        steps: ["High plank position, hips level with shoulders", "Drive one knee explosively toward your chest", "Switch legs rapidly, keep core braced throughout"] },
    ],
  },
  Fri: {
    label: "Chest & Shoulders",
    icon: "💪",
    exercises: [
      { name: "Press-ups", sets: 4, reps: "8–12", tip: "Extra set to finish the week strong", goal: 20,
        steps: ["Start in high plank, hands shoulder-width apart", "Lower chest toward floor, elbows at 45°", "Push back up explosively, arms fully extended"] },
      { name: "Pike Press-ups", sets: 3, reps: "8–10", tip: "Hips high, targets shoulders", goal: 15,
        steps: ["Form an inverted V with hips high in the air", "Bend elbows, lower crown toward the floor", "Press back up, keeping hips elevated throughout"] },
      { name: "Incline Press-ups", sets: 2, reps: "10–12", tip: "Hands on elevated surface", goal: 20,
        steps: ["Hands on elevated surface, body in a straight line", "Lower chest to the surface, elbows at 45°", "Push back up through palms, fully extend arms"] },
      { name: "Decline Press-ups", sets: 2, reps: "8–10", tip: "Feet elevated, upper chest focus", goal: 15,
        steps: ["Feet on elevated surface, hands on floor shoulder-width", "Lower chest toward floor with control", "Press up, feel the upper chest engage"] },
    ],
  },
  Sat: {
    label: "Abs & Core",
    icon: "🔥",
    exercises: [
      { name: "Plank", sets: 3, reps: "30–45 sec", tip: "Push for a new personal best!", goal: 60,
        steps: ["Forearms flat, elbows directly under shoulders", "Lift into a straight line from head to heels", "Squeeze glutes and abs — breathe steadily"] },
      { name: "Crunches", sets: 3, reps: "15–20", tip: "Lower back stays on ground", goal: 25,
        steps: ["Lie back, knees bent, fingertips lightly at temples", "Curl shoulders off the floor as you exhale", "Lower slowly, keep lower back pressed to ground"] },
      { name: "Bicycle Crunch", sets: 2, reps: "15 each side", tip: "Twist fully, elbow to knee", goal: 20,
        steps: ["Lie back, hands lightly behind head", "Bring left elbow toward right knee, extend left leg", "Alternate in a smooth, controlled cycling motion"] },
      { name: "Reverse Crunch", sets: 3, reps: "12", tip: "Controlled movement", goal: 20,
        steps: ["Lie back, arms at sides for stability", "Draw knees to chest, curl hips off the floor", "Lower with control — don't let legs swing"] },
      { name: "Side Plank", sets: 2, reps: "20 sec each side", tip: "Body in straight line, don't let hips drop", goal: 40,
        steps: ["Lie on side, forearm on floor, elbow under shoulder", "Lift hips until body forms a straight line", "Hold steady — don't let hips sag"] },
    ],
  },
  Sun: {
    label: "Active Recovery",
    icon: "🚶",
    exercises: [
      { name: "Brisk Walk", sets: 1, reps: "20–30 min", tip: "Get outside, fresh air helps recovery", goal: 30,
        steps: ["Stand tall, head up, shoulders relaxed", "Swing arms naturally with each stride", "Pace where you can talk, but not easily sing"] },
      { name: "Chest Stretch", sets: 2, reps: "30 sec hold", tip: "Hands clasped behind back, open chest", goal: 45,
        steps: ["Stand tall, clasp hands behind your back", "Squeeze shoulder blades together and lift chest", "Hold and breathe deeply into the stretch"] },
      { name: "Cat-Cow Stretch", sets: 2, reps: "10 slow reps", tip: "On hands and knees, arch and round your back", goal: 10,
        steps: ["On hands and knees, spine in neutral position", "Exhale: round back up, tuck chin to chest (Cat)", "Inhale: dip belly down, lift head and tailbone (Cow)"] },
      { name: "Child's Pose", sets: 2, reps: "30 sec hold", tip: "Arms extended, breathe deeply into back", goal: 45,
        steps: ["Kneel and sit back toward your heels", "Extend arms forward on the floor", "Breathe deeply into your back and fully relax"] },
    ],
  },
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekKey(offset = 0) {
  const now = new Date();
  const week = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000)) + offset;
  return `week_${week}`;
}

// Returns { default: number, unit: 'reps'|'sec'|'min' } from a reps string like "8–12" or "20–30 sec"
function parseTarget(reps) {
  const secMatch = reps.match(/(\d+)[–-](\d+)\s*sec/);
  if (secMatch) return { default: parseInt(secMatch[2]), unit: 'sec' };
  const singleSec = reps.match(/(\d+)\s*sec/);
  if (singleSec) return { default: parseInt(singleSec[1]), unit: 'sec' };
  const minMatch = reps.match(/(\d+)[–-](\d+)\s*min/);
  if (minMatch) return { default: parseInt(minMatch[2]), unit: 'min' };
  const singleMin = reps.match(/(\d+)\s*min/);
  if (singleMin) return { default: parseInt(singleMin[1]), unit: 'min' };
  const rangeMatch = reps.match(/(\d+)[–-](\d+)/);
  if (rangeMatch) return { default: parseInt(rangeMatch[2]), unit: 'reps' };
  const singleMatch = reps.match(/(\d+)/);
  return { default: singleMatch ? parseInt(singleMatch[1]) : 10, unit: 'reps' };
}

function getCoachMessage(ex, day, exIdx, prevPerf, prevCompleted) {
  const completedSets = Array.from({ length: ex.sets }, (_, i) =>
    prevCompleted?.[`${day}_${exIdx}_${i}`]
  ).filter(Boolean).length;

  if (completedSets === 0) return null;

  const loggedValues = Array.from({ length: ex.sets }, (_, i) =>
    prevPerf?.[`${day}_${exIdx}_${i}`]
  ).filter(v => v != null);

  if (loggedValues.length > 0) {
    const avg = Math.round(loggedValues.reduce((a, b) => a + b, 0) / loggedValues.length);
    const rangeMatch = ex.reps.match(/(\d+)[–-](\d+)/);
    const target = parseTarget(ex.reps);

    if (rangeMatch && target.unit === 'reps') {
      const [, min, max] = rangeMatch.map(Number);
      if (avg >= max) return { text: `You averaged ${avg} reps last week — push past ${max} today!`, level: 'push' };
      if (avg < min) return { text: `You averaged ${avg} reps last week. Focus on form, aim for ${min}+.`, level: 'form' };
      return { text: `You averaged ${avg} reps last week. Work towards ${max} today.`, level: 'improve' };
    }
    if (target.unit === 'sec') {
      return { text: `You held ${avg}s last week. Add a few more seconds today.`, level: 'improve' };
    }
  }

  if (completedSets < ex.sets) {
    return { text: `You hit ${completedSets}/${ex.sets} sets last week. Aim for all ${ex.sets} today.`, level: 'form' };
  }
  return { text: `You completed all sets last week — keep the momentum!`, level: 'improve' };
}

export default function WorkoutApp() {
  const today = new Date().toLocaleDateString("en-NZ", { weekday: "short" }).slice(0, 3);
  const todayDay = days.includes(today) ? today : "Mon";
  const [activeDay, setActiveDay] = useState(todayDay);
  const [completed, setCompleted] = useState({});
  const [expandedEx, setExpandedEx] = useState(null);

  const weekKey = getWeekKey();
  const prevWeekKey = getWeekKey(-1);
  const [perfLog, setPerfLog] = useState({});
  const [prevCompleted, setPrevCompleted] = useState({});
  const [prevPerf, setPrevPerf] = useState({});
  const [activeSet, setActiveSet] = useState(null);
  const [tab, setTab] = useState("workout");
  const { token, setToken, syncState, loadFromGitHub, sync, retry } = useGitHubSync();
  const [activeStepIdx, setActiveStepIdx] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(weekKey);
    if (saved) setCompleted(JSON.parse(saved));
    const savedPerf = localStorage.getItem(`perf_${weekKey}`);
    if (savedPerf) setPerfLog(JSON.parse(savedPerf));
    const savedPrev = localStorage.getItem(prevWeekKey);
    if (savedPrev) setPrevCompleted(JSON.parse(savedPrev));
    const savedPrevPerf = localStorage.getItem(`perf_${prevWeekKey}`);
    if (savedPrevPerf) setPrevPerf(JSON.parse(savedPrevPerf));

    if (token) {
      loadFromGitHub(token).then(data => {
        if (!data) return;
        const week = data[weekKey];
        if (week) {
          if (week.completed) {
            const local = JSON.parse(localStorage.getItem(weekKey) || '{}');
            const merged = { ...week.completed, ...local };
            setCompleted(merged);
            localStorage.setItem(weekKey, JSON.stringify(merged));
          }
          if (week.perfLog) {
            const localPerf = JSON.parse(localStorage.getItem(`perf_${weekKey}`) || '{}');
            const mergedPerf = { ...week.perfLog, ...localPerf };
            setPerfLog(mergedPerf);
            localStorage.setItem(`perf_${weekKey}`, JSON.stringify(mergedPerf));
          }
        }
        const prev = data[prevWeekKey];
        if (prev) {
          if (prev.completed) {
            const localPrev = JSON.parse(localStorage.getItem(prevWeekKey) || '{}');
            const mergedPrev = { ...prev.completed, ...localPrev };
            setPrevCompleted(mergedPrev);
            localStorage.setItem(prevWeekKey, JSON.stringify(mergedPrev));
          }
          if (prev.perfLog) {
            const localPrevPerf = JSON.parse(localStorage.getItem(`perf_${prevWeekKey}`) || '{}');
            const mergedPrevPerf = { ...prev.perfLog, ...localPrevPerf };
            setPrevPerf(mergedPrevPerf);
            localStorage.setItem(`perf_${prevWeekKey}`, JSON.stringify(mergedPrevPerf));
          }
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // loadFromGitHub is stable (useCallback); omitted to prevent double-load on token changes
  }, [weekKey, prevWeekKey, token]);

  useEffect(() => {
    setActiveStepIdx(0);
  }, [expandedEx]);

  useEffect(() => {
    if (expandedEx === null) return;
    const ex = workoutPlan[activeDay].exercises[expandedEx];
    if (!ex.steps?.length) return;
    const timer = setInterval(() => {
      setActiveStepIdx(i => (i + 1) % ex.steps.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [expandedEx, activeDay]);

  function openSetCounter(day, exIdx, setIdx) {
    if (isSetDone(day, exIdx, setIdx)) {
      const key = `${day}_${exIdx}_${setIdx}`;
      const updatedDone = { ...completed, [key]: false };
      setCompleted(updatedDone);
      localStorage.setItem(weekKey, JSON.stringify(updatedDone));
      const updatedPerf = { ...perfLog };
      delete updatedPerf[key];
      setPerfLog(updatedPerf);
      localStorage.setItem(`perf_${weekKey}`, JSON.stringify(updatedPerf));
    } else {
      const ex = workoutPlan[day].exercises[exIdx];
      const target = parseTarget(ex.reps);
      setActiveSet({ day, exIdx, setIdx, value: target.default });
    }
  }

  function confirmSet(repCount) {
    if (!activeSet) return;
    const { day, exIdx, setIdx } = activeSet;
    const key = `${day}_${exIdx}_${setIdx}`;
    const updatedDone = { ...completed, [key]: true };
    setCompleted(updatedDone);
    localStorage.setItem(weekKey, JSON.stringify(updatedDone));
    const updatedPerf = { ...perfLog, [key]: repCount };
    setPerfLog(updatedPerf);
    localStorage.setItem(`perf_${weekKey}`, JSON.stringify(updatedPerf));
    sync(weekKey, updatedDone, updatedPerf);
    setActiveSet(null);
  }

  function isSetDone(day, exIdx, setIdx) {
    return !!completed[`${day}_${exIdx}_${setIdx}`];
  }

  function exerciseDoneCount(day, exIdx, totalSets) {
    return Array.from({ length: totalSets }, (_, i) => isSetDone(day, exIdx, i)).filter(Boolean).length;
  }

  function dayProgress(day) {
    const exercises = workoutPlan[day].exercises;
    let done = 0, total = 0;
    exercises.forEach((ex, ei) => {
      for (let s = 0; s < ex.sets; s++) {
        total++;
        if (isSetDone(day, ei, s)) done++;
      }
    });
    return { done, total };
  }

  const workout = workoutPlan[activeDay];
  const { done: dayDone, total: dayTotal } = dayProgress(activeDay);
  const isRecovery = activeDay === "Sun";

  function getWeeklyStats() {
    return [-3, -2, -1, 0].map(offset => {
      const wk = getWeekKey(offset);
      const comp = offset === 0 ? completed
        : offset === -1 ? prevCompleted
        : JSON.parse(localStorage.getItem(wk) || '{}');
      let done = 0, total = 0;
      days.forEach(d => {
        workoutPlan[d].exercises.forEach((ex, ei) => {
          for (let s = 0; s < ex.sets; s++) {
            total++;
            if (comp[`${d}_${ei}_${s}`]) done++;
          }
        });
      });
      return { offset, pct: total ? Math.round((done / total) * 100) : 0 };
    });
  }

  function getStreak() {
    let streak = 0;
    for (let i = 0; i >= -52; i--) {
      const wk = getWeekKey(i);
      const comp = i === 0 ? completed : i === -1 ? prevCompleted : JSON.parse(localStorage.getItem(wk) || '{}');
      if (Object.values(comp).some(Boolean)) streak++;
      else if (i < 0) break;
    }
    return streak;
  }

  const bottomNav = (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "#111118", borderTop: "1px solid rgba(255,255,255,0.08)",
      display: "flex", zIndex: 100,
    }}>
      {[["workout", "💪", "Workout"], ["progress", "📈", "Progress"]].map(([t, icon, label]) => (
        <button key={t} onClick={() => setTab(t)} style={{
          flex: 1, padding: "10px 0 14px", background: "none", border: "none",
          color: tab === t ? "#e94560" : "#555", cursor: "pointer",
          fontSize: 11, fontWeight: tab === t ? 700 : 400,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
        }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );

  if (tab === "progress") {
    const weeklyStats = getWeeklyStats();
    const streak = getStreak();
    const weekLabels = ["3 wks ago", "2 wks ago", "Last week", "This week"];

    const coachItems = [];
    days.filter(d => d !== "Sun").forEach(d => {
      workoutPlan[d].exercises.forEach((ex, ei) => {
        const msg = getCoachMessage(ex, d, ei, prevPerf, prevCompleted);
        if (msg) coachItems.push({ ex, d, ei, msg });
      });
    });

    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#f0f0f0", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: "0 0 80px 0" }}>
        <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", padding: "28px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <div style={{ fontSize: 11, letterSpacing: 3, color: "#e94560", textTransform: "uppercase", marginBottom: 4 }}>Your Stats</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>📈 Progress</h1>
              <SyncIndicator state={syncState} onRetry={retry} />
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>
          {/* Streak */}
          <div style={{ background: "rgba(233,69,96,0.08)", border: "1px solid rgba(233,69,96,0.2)", borderRadius: 14, padding: 16, marginBottom: 16, textAlign: "center" }}>
            <div style={{ fontSize: 36 }}>🔥</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#e94560" }}>{streak}</div>
            <div style={{ color: "#aaa", fontSize: 13, marginTop: 2 }}>week{streak !== 1 ? "s" : ""} active</div>
          </div>

          {/* Weekly bars */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: "#666", textTransform: "uppercase", marginBottom: 12 }}>Weekly Completion</div>
            {weeklyStats.map((s, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888", marginBottom: 4 }}>
                  <span style={{ color: i === 3 ? "#e94560" : "#666" }}>{weekLabels[i]}</span>
                  <span>{s.pct > 0 ? `${s.pct}%` : "—"}</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.08)" }}>
                  <div style={{
                    width: `${s.pct}%`, height: "100%", borderRadius: 4,
                    background: s.pct === 100 ? "#4caf50" : i === 3 ? "linear-gradient(90deg, #e94560, #f5a623)" : "rgba(233,69,96,0.4)",
                    transition: "width 0.6s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Coach tips */}
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#666", textTransform: "uppercase", marginBottom: 10 }}>
            Coaching
          </div>
          {coachItems.length === 0 ? (
            <div style={{ textAlign: "center", color: "#444", fontSize: 13, padding: "20px 0" }}>
              Complete workouts to unlock coaching insights.
            </div>
          ) : (
            coachItems.map(({ ex, d, ei, msg }) => {
              const colors = { push: '#f5a623', form: '#e94560', improve: '#4caf50' };
              return (
                <div key={`${d}_${ei}`} style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft: `3px solid ${colors[msg.level]}`,
                  borderRadius: 10, padding: "10px 14px", marginBottom: 8,
                }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>
                    {ex.name} <span style={{ color: "#555", fontWeight: 400, fontSize: 12 }}>{d}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>{msg.text}</div>
                </div>
              );
            })
          )}
        </div>
        {bottomNav}
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#f0f0f0",
      padding: "0 0 90px 0",
    }}>
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding: "28px 20px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#e94560", textTransform: "uppercase", marginBottom: 4 }}>
            Daily Workout · v1.4
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>
              {workout.icon} {workout.label}
            </h1>
            <SyncIndicator state={syncState} onRetry={retry} />
          </div>
          {!isRecovery && (
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                <div style={{
                  width: `${dayTotal ? (dayDone / dayTotal) * 100 : 0}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #e94560, #f5a623)",
                  borderRadius: 3,
                  transition: "width 0.4s ease",
                }} />
              </div>
              <span style={{ fontSize: 13, color: "#aaa", whiteSpace: "nowrap" }}>
                {dayDone}/{dayTotal} sets
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{
        overflowX: "auto",
        padding: "14px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "#111118",
      }}>
        <div style={{ display: "flex", gap: 8, maxWidth: 480, margin: "0 auto" }}>
          {days.map(d => {
            const { done, total } = dayProgress(d);
            const isActive = d === activeDay;
            const isToday = d === todayDay;
            const allDone = total > 0 && done === total;
            return (
              <button
                key={d}
                onClick={() => { setActiveDay(d); setExpandedEx(null); }}
                style={{
                  flex: 1, padding: "8px 4px", borderRadius: 10,
                  border: isActive ? "2px solid #e94560" : "2px solid transparent",
                  background: isActive ? "rgba(233,69,96,0.15)" : "rgba(255,255,255,0.04)",
                  color: isActive ? "#fff" : "#888",
                  cursor: "pointer", fontSize: 11,
                  fontWeight: isActive ? 700 : 500,
                  textAlign: "center", transition: "all 0.2s", position: "relative",
                }}
              >
                <div style={{ fontSize: 13 }}>{workoutPlan[d].icon}</div>
                <div>{d}</div>
                {isToday && (
                  <div style={{
                    position: "absolute", top: -4, right: -4,
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#e94560", boxShadow: "0 0 6px #e94560",
                  }} />
                )}
                {allDone && <div style={{ fontSize: 8, color: "#4caf50", marginTop: 1 }}>✓ done</div>}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "16px" }}>
        {!token && (
          <GitHubConnect onToken={setToken} />
        )}
        {workout.exercises.map((ex, ei) => {
          const doneSets = exerciseDoneCount(activeDay, ei, ex.sets);
          const allDone = doneSets === ex.sets;
          const isOpen = expandedEx === ei;

          return (
            <div key={ei} style={{
              marginBottom: 12, borderRadius: 14,
              background: allDone ? "rgba(76,175,80,0.08)" : "rgba(255,255,255,0.04)",
              border: allDone ? "1px solid rgba(76,175,80,0.3)" : "1px solid rgba(255,255,255,0.08)",
              overflow: "hidden", transition: "all 0.2s",
            }}>
              <button
                onClick={() => setExpandedEx(isOpen ? null : ei)}
                style={{
                  width: "100%", padding: "14px 16px", background: "none",
                  border: "none", color: "#f0f0f0", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 12, textAlign: "left",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: allDone ? "rgba(76,175,80,0.2)" : "rgba(233,69,96,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, flexShrink: 0,
                }}>
                  {allDone ? "✓" : isRecovery ? "🧘" : "⚡"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{ex.name}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                    {ex.sets} sets · {ex.reps}
                    {!isRecovery && ` · ${doneSets}/${ex.sets} done`}
                  </div>
                </div>
                <div style={{ fontSize: 18, color: "#555", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                  ›
                </div>
              </button>

              {isOpen && (
                <div style={{ padding: "0 16px 16px" }}>
                  <div style={{
                    background: "rgba(233,69,96,0.08)", border: "1px solid rgba(233,69,96,0.2)",
                    borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#ccc",
                    marginBottom: 12, fontStyle: "italic",
                  }}>
                    💡 {ex.tip}
                  </div>
                  {ex.steps && (
                    <div style={{ marginBottom: 12 }}>
                      {ex.steps.map((step, si) => (
                        <div key={si} style={{
                          display: "flex", gap: 10, alignItems: "flex-start", padding: "5px 0",
                          opacity: si === activeStepIdx ? 1 : 0.35,
                          transition: "opacity 0.5s ease",
                        }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                            background: si === activeStepIdx ? "#e94560" : "rgba(255,255,255,0.08)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 700,
                            color: si === activeStepIdx ? "#fff" : "#555",
                            transition: "all 0.5s ease",
                          }}>{si + 1}</div>
                          <span style={{ fontSize: 13, paddingTop: 3, transition: "color 0.5s ease",
                            color: si === activeStepIdx ? "#f0f0f0" : "#555" }}>
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {ex.goal && (() => {
                    const target = parseTarget(ex.reps);
                    const thisWeekValues = Array.from({ length: ex.sets }, (_, i) =>
                      perfLog[`${activeDay}_${ei}_${i}`]
                    ).filter(v => v != null);
                    const avg = thisWeekValues.length > 0
                      ? Math.round(thisWeekValues.reduce((a, b) => a + b, 0) / thisWeekValues.length)
                      : null;
                    const goalPct = avg != null ? Math.min(100, Math.round((avg / ex.goal) * 100)) : 0;
                    const unitLabel = target.unit === 'sec' ? 's' : target.unit === 'min' ? 'm' : ' reps';
                    const goalColor = avg == null ? null
                      : avg > ex.goal ? "#4caf50"
                      : avg === ex.goal ? "#f5a623"
                      : "#e94560";

                    return (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                          <span style={{ fontSize: 12, color: "#888" }}>
                            🎯 Goal: <span style={{ color: "#f5a623", fontWeight: 700 }}>{ex.goal}{unitLabel}</span>
                            <span style={{ fontSize: 11, color: "#555", marginLeft: 6 }}>fit & healthy at 56</span>
                          </span>
                          {avg != null && (
                            <span style={{ fontSize: 12, color: goalColor, fontWeight: 700 }}>
                              {avg > ex.goal ? `✓ ${avg}${unitLabel}` : `${avg} / ${ex.goal}${unitLabel}`}
                            </span>
                          )}
                        </div>
                        {avg != null && (
                          <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)" }}>
                            <div style={{
                              width: `${goalPct}%`, height: "100%", borderRadius: 2,
                              background: goalColor,
                              transition: "width 0.4s ease",
                            }} />
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  {(() => {
                    const msg = getCoachMessage(ex, activeDay, ei, prevPerf, prevCompleted);
                    if (!msg) return null;
                    const colors = { push: '#f5a623', form: '#e94560', improve: '#4caf50' };
                    return (
                      <div style={{
                        background: "rgba(255,255,255,0.04)", border: `1px solid ${colors[msg.level]}40`,
                        borderLeft: `3px solid ${colors[msg.level]}`,
                        borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#ccc", marginBottom: 12,
                      }}>
                        🏋️ {msg.text}
                      </div>
                    );
                  })()}
                  {!isRecovery && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {Array.from({ length: ex.sets }, (_, si) => {
                        const done = isSetDone(activeDay, ei, si);
                        const isCounterOpen = activeSet?.day === activeDay && activeSet?.exIdx === ei && activeSet?.setIdx === si;
                        const logged = perfLog[`${activeDay}_${ei}_${si}`];
                        const target = parseTarget(ex.reps);

                        if (isCounterOpen) {
                          return (
                            <div key={si} style={{
                              display: "flex", alignItems: "center", gap: 6,
                              background: "rgba(233,69,96,0.1)", border: "1px solid rgba(233,69,96,0.3)",
                              borderRadius: 8, padding: "6px 10px",
                            }}>
                              <span style={{ fontSize: 11, color: "#aaa" }}>Set {si + 1}</span>
                              <button onClick={() => setActiveSet(s => ({ ...s, value: Math.max(1, s.value - 1) }))}
                                style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)", color: "#fff", cursor: "pointer", fontSize: 16 }}>−</button>
                              <span style={{ width: 32, textAlign: "center", fontWeight: 700, fontSize: 15 }}>{activeSet.value}</span>
                              <button onClick={() => setActiveSet(s => ({ ...s, value: s.value + 1 }))}
                                style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)", color: "#fff", cursor: "pointer", fontSize: 16 }}>+</button>
                              <span style={{ fontSize: 11, color: "#888" }}>{target.unit}</span>
                              <button onClick={() => confirmSet(activeSet.value)}
                                style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "#4caf50", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>✓</button>
                              <button onClick={() => setActiveSet(null)}
                                style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.15)", background: "none", color: "#888", cursor: "pointer", fontSize: 13 }}>✕</button>
                            </div>
                          );
                        }

                        return (
                          <button key={si} onClick={() => openSetCounter(activeDay, ei, si)}
                            style={{
                              padding: "8px 16px", borderRadius: 8,
                              border: done ? "2px solid #4caf50" : "2px solid rgba(255,255,255,0.2)",
                              background: done ? "rgba(76,175,80,0.2)" : "rgba(255,255,255,0.05)",
                              color: done ? "#4caf50" : "#aaa",
                              cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s",
                            }}>
                            {done
                              ? `✓ ${logged != null ? logged + (target.unit === 'sec' ? 's' : target.unit === 'min' ? 'm' : '') : 'done'}`
                              : `Set ${si + 1}`}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {isRecovery && (
                    <div style={{ display: "flex", gap: 8 }}>
                      {(() => {
                        const done = isSetDone(activeDay, ei, 0);
                        const isCounterOpen = activeSet?.day === activeDay && activeSet?.exIdx === ei && activeSet?.setIdx === 0;
                        if (isCounterOpen) {
                          return (
                            <button onClick={() => confirmSet(1)}
                              style={{ padding: "8px 20px", borderRadius: 8, border: "2px solid #4caf50", background: "rgba(76,175,80,0.2)", color: "#4caf50", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                              ✓ Mark done
                            </button>
                          );
                        }
                        return (
                          <button onClick={() => openSetCounter(activeDay, ei, 0)}
                            style={{ padding: "8px 20px", borderRadius: 8, border: done ? "2px solid #4caf50" : "2px solid rgba(255,255,255,0.2)", background: done ? "rgba(76,175,80,0.2)" : "rgba(255,255,255,0.05)", color: done ? "#4caf50" : "#aaa", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                            {done ? "✓ Done" : "Mark done"}
                          </button>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {!isRecovery && dayDone === dayTotal && dayTotal > 0 && (
          <div style={{
            textAlign: "center", padding: "20px",
            background: "rgba(76,175,80,0.1)", border: "1px solid rgba(76,175,80,0.3)",
            borderRadius: 14, marginTop: 8,
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div style={{ fontWeight: 700, color: "#4caf50", fontSize: 16 }}>Workout complete!</div>
            <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Great work. Rest up and come back tomorrow.</div>
          </div>
        )}

        <div style={{
          marginTop: 20, background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px",
        }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#666", textTransform: "uppercase", marginBottom: 10 }}>
            This Week
          </div>
          {days.map(d => {
            const { done, total } = dayProgress(d);
            const pct = total ? (done / total) * 100 : 0;
            return (
              <div key={d} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                <div style={{ width: 32, fontSize: 12, color: d === activeDay ? "#e94560" : "#666", fontWeight: d === activeDay ? 700 : 400 }}>{d}</div>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)" }}>
                  <div style={{
                    width: `${pct}%`, height: "100%", borderRadius: 2,
                    background: pct === 100 ? "#4caf50" : "linear-gradient(90deg, #e94560, #f5a623)",
                    transition: "width 0.4s ease",
                  }} />
                </div>
                <div style={{ fontSize: 11, color: "#555", width: 40, textAlign: "right" }}>
                  {total > 0 ? `${Math.round(pct)}%` : "—"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {bottomNav}
    </div>
  );
}
