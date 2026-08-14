const toggleBtn = document.getElementById("themeToggle");

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
});

const timerElement = document.getElementById("timer");
const optWrapper = document.getElementById("optWrapper");
const activeSession = document.getElementById("activeSession");
const brewIcon = document.getElementById("brewIcon");
const brewName = document.getElementById("brewName");
const pauseBtn = document.getElementById("pauseBtn");

const BREWS = {
  espresso: { icon: "☕", label: "Espresso" },
  latte:    { icon: "🥛", label: "Latte" },
  matcha:   { icon: "🍵", label: "Matcha" },
};

let timerInterval;
let endTime = 0;        
let remainingOnPause = 0; 
let isPaused = false;

function secondsRemaining() {
  return Math.max(0, Math.round((endTime - Date.now()) / 1000));
}

function renderTimer(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  timerElement.textContent =
    `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function tick() {
  const remaining = secondsRemaining();
  renderTimer(remaining);

  if (remaining <= 0) {
    clearInterval(timerInterval);
    brewIcon.classList.remove("pulse");
    pauseBtn.disabled = true;
    pauseBtn.style.opacity = 0.4;
    playAlarm();
  }
}

function chooseBrew(drink, minutes) {
  Object.keys(BREWS).forEach((key) => {
    const el = document.getElementById(`opt-${key}`);
    if (key !== drink) {
      el.classList.add("hide");
    }
  });

  setTimeout(() => {
    optWrapper.classList.add("collapsed");
    activeSession.classList.add("show");
  }, 200);

  brewIcon.textContent = BREWS[drink].icon;
  brewIcon.classList.add("pulse");
  brewName.textContent = BREWS[drink].label;

  pauseBtn.disabled = false;
  pauseBtn.style.opacity = 1;
  pauseBtn.textContent = "Pause";
  isPaused = false;

  clearInterval(timerInterval);
  const totalSeconds = 15 * 60; 
  endTime = Date.now() + totalSeconds * 1000;
  renderTimer(totalSeconds);
  timerInterval = setInterval(tick, 1000);
}

function togglePause() {
  if (secondsRemaining() <= 0 && !isPaused) return;

  isPaused = !isPaused;
  if (isPaused) {
    remainingOnPause = secondsRemaining();
    clearInterval(timerInterval);
    pauseBtn.textContent = "Resume";
    brewIcon.classList.remove("pulse");
  } else {
    endTime = Date.now() + remainingOnPause * 1000;
    timerInterval = setInterval(tick, 1000);
    pauseBtn.textContent = "Pause";
    brewIcon.classList.add("pulse");
  }
}

function stopBrew() {
  clearInterval(timerInterval);
  endTime = 0;
  isPaused = false;
  renderTimer(0);

  activeSession.classList.remove("show");
  optWrapper.classList.remove("collapsed");

  Object.keys(BREWS).forEach((key) => {
    document.getElementById(`opt-${key}`).classList.remove("hide");
  });
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && timerInterval && !isPaused) {
    tick();
  }
});

function playAlarm() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();

  const notes = [523.25, 659.25, 783.99];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const start = ctx.currentTime + i * 0.15;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.25, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.4);
  });

  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }

  document.querySelector('.container').classList.add('done-flash');
  setTimeout(() => {
    document.querySelector('.container').classList.remove('done-flash');
  }, 1500);
}