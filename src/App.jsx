import { useState, useEffect } from "react";

const workoutPlan = {
  Mon: {
    label: "Chest & Shoulders",
    icon: "💪",
    exercises: [
      { name: "Press-ups", sets: 3, reps: "8–12", tip: "Keep body straight, elbows at 45°" },
      { name: "Pike Press-ups", sets: 3, reps: "8–10", tip: "Hips high, targets shoulders" },
      { name: "Incline Press-ups", sets: 2, reps: "10–12", tip: "Hands on elevated surface" },
      { name: "Decline Press-ups", sets: 2, reps: "8–10", tip: "Feet elevated, upper chest focus" },
    ],
  },
  Tue: {
    label: "Abs & Core",
    icon: "🔥",
    exercises: [
      { name: "Plank", sets: 3, reps: "20–30 sec", tip: "Straight line head to heels, squeeze glutes" },
      { name: "Crunches", sets: 3, reps: "15", tip: "Lower back stays on ground, don't pull neck" },
      { name: "Reverse Crunch", sets: 3, reps: "12", tip: "Lift hips off floor, control the movement" },
      { name: "Dead Bug", sets: 3, reps: "8 each side", tip: "Slow and controlled, lower back flat" },
      { name: "Mountain Climbers", sets: 2, reps: "20 sec", tip: "Keep hips level, drive knees to chest" },
    ],
  },
  Wed: {
    label: "Chest & Shoulders",
    icon: "💪",
    exercises: [
      { name: "Press-ups", sets: 3, reps: "8–12", tip: "Try to beat Monday's reps!" },
      { name: "Pike Press-ups", sets: 3, reps: "8–10", tip: "Hips high, targets shoulders" },
      { name: "Incline Press-ups", sets: 2, reps: "10–12", tip: "Hands on elevated surface" },
      { name: "Decline Press-ups", sets: 2, reps: "8–10", tip: "Feet elevated, upper chest focus" },
    ],
  },
  Thu: {
    label: "Abs & Core",
    icon: "🔥",
    exercises: [
      { name: "Plank", sets: 3, reps: "20–30 sec", tip: "Push that time a little further today" },
      { name: "Crunches", sets: 3, reps: "15", tip: "Lower back stays on ground" },
      { name: "Reverse Crunch", sets: 3, reps: "12", tip: "Lift hips, control the movement" },
      { name: "Dead Bug", sets: 3, reps: "8 each side", tip: "Slow and controlled" },
      { name: "Mountain Climbers", sets: 2, reps: "20 sec", tip: "Add 5 sec vs Tuesday" },
    ],
  },
  Fri: {
    label: "Chest & Shoulders",
    icon: "💪",
    exercises: [
      { name: "Press-ups", sets: 4, reps: "8–12", tip: "Extra set to finish the week strong" },
      { name: "Pike Press-ups", sets: 3, reps: "8–10", tip: "Hips high, targets shoulders" },
      { name: "Incline Press-ups", sets: 2, reps: "10–12", tip: "Hands on elevated surface" },
      { name: "Decline Press-ups", sets: 2, reps: "8–10", tip: "Feet elevated, upper chest focus" },
    ],
  },
  Sat: {
    label: "Abs & Core",
    icon: "🔥",
    exercises: [
      { name: "Plank", sets: 3, reps: "30–45 sec", tip: "Push for a new personal best!" },
      { name: "Crunches", sets: 3, reps: "15–20", tip: "Lower back stays on ground" },
      { name: "Bicycle Crunch", sets: 2, reps: "15 each side", tip: "Twist fully, elbow to knee" },
      { name: "Reverse Crunch", sets: 3, reps: "12", tip: "Controlled movement" },
      { name: "Side Plank", sets: 2, reps: "20 sec each side", tip: "Body in straight line, don't let hips drop" },
    ],
  },
  Sun: {
    label: "Active Recovery",
    icon: "🚶",
    exercises: [
      { name: "Brisk Walk", sets: 1, reps: "20–30 min", tip: "Get outside, fresh air helps recovery" },
      { name: "Chest Stretch", sets: 2, reps: "30 sec hold", tip: "Hands clasped behind back, open chest" },
      { name: "Cat-Cow Stretch", sets: 2, reps: "10 slow reps", tip: "On hands and knees, arch and round your back" },
      { name: "Child's Pose", sets: 2, reps: "30 sec hold", tip: "Arms extended, breathe deeply into back" },
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

  useEffect(() => {
    const saved = localStorage.getItem(weekKey);
    if (saved) setCompleted(JSON.parse(saved));

    const savedPerf = localStorage.getItem(`perf_${weekKey}`);
    if (savedPerf) setPerfLog(JSON.parse(savedPerf));

    const savedPrev = localStorage.getItem(prevWeekKey);
    if (savedPrev) setPrevCompleted(JSON.parse(savedPrev));

    const savedPrevPerf = localStorage.getItem(`perf_${prevWeekKey}`);
    if (savedPrevPerf) setPrevPerf(JSON.parse(savedPrevPerf));
  }, [weekKey, prevWeekKey]);

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

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#f0f0f0",
      padding: "0 0 80px 0",
    }}>
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding: "28px 20px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#e94560", textTransform: "uppercase", marginBottom: 4 }}>
            Daily Workout
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>
            {workout.icon} {workout.label}
          </h1>
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
    </div>
  );
}
