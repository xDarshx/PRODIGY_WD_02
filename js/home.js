let startTime = 0;
let updatedTime = 0;
let difference = 0;
let tInterval;
let running = false;
let lapCounter = 0;
let countdownTime = 0;
let countdownRemaining = 0;
let countdownRunning = false;
let countdownInterval;

const display = document.getElementById('display');
const startStopBtn = document.getElementById('startStopBtn');
const resetBtn = document.getElementById('resetBtn');
const lapBtn = document.getElementById('lapBtn');
const lapsContainer = document.getElementById('laps');
const countdownMinutesInput = document.getElementById('countdownMinutesInput');
const countdownSecondsInput = document.getElementById('countdownSecondsInput');
const setCountdownBtn = document.getElementById('setCountdownBtn');
const pauseCountdownBtn = document.getElementById('pauseCountdownBtn');
const resetCountdownBtn = document.getElementById('resetCountdownBtn');
const countdownDisplay = document.getElementById('countdownDisplay');
const exportLapsBtn = document.getElementById('exportLapsBtn');
const importLapsBtn = document.getElementById('importLapsBtn');
const fileInput = document.getElementById('fileInput');
const themeSelect = document.getElementById('themeSelect');

startStopBtn.addEventListener('click', startStop);
resetBtn.addEventListener('click', reset);
lapBtn.addEventListener('click', addLap);
setCountdownBtn.addEventListener('click', setCountdown);
pauseCountdownBtn.addEventListener('click', pauseCountdown);
resetCountdownBtn.addEventListener('click', resetCountdown);
exportLapsBtn.addEventListener('click', exportLaps);
importLapsBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', importLaps);
themeSelect.addEventListener('change', changeTheme);

// Add event listeners for sound select dropdowns
const startSoundSelect = document.getElementById('startSoundSelect');
const pauseSoundSelect = document.getElementById('pauseSoundSelect');
const lapSoundSelect = document.getElementById('lapSoundSelect');

// Add event listeners to play selected sound alerts
startStopBtn.addEventListener('click', () => playSound(startSoundSelect.value));
pauseCountdownBtn.addEventListener('click', () => playSound(pauseSoundSelect.value));
lapBtn.addEventListener('click', () => playSound(lapSoundSelect.value));

function startStop() {
    if (!running) {
        startTime = new Date().getTime() - difference;
        tInterval = setInterval(updateTime, 1);
        startStopBtn.innerHTML = "Pause";
        playSound('start');
        running = true;
    } else {
        clearInterval(tInterval);
        difference = new Date().getTime() - startTime;
        startStopBtn.innerHTML = "Start";
        playSound('pause');
        running = false;
    }
}

function reset() {
    clearInterval(tInterval);
    running = false;
    difference = 0;
    startTime = 0;
    updatedTime = 0;
    display.innerHTML = "00:00:00";
    startStopBtn.innerHTML = "Start";
    lapsContainer.innerHTML = "";
    lapCounter = 0;
    playSound('reset');
}

function addLap() {
    if (running) {
        const lapTime = document.createElement('div');
        lapCounter++;
        lapTime.innerHTML = `Lap ${lapCounter}: ${formatTime(updatedTime)}`;
        lapsContainer.appendChild(lapTime);
        playSound('lap');
    }
}

function updateTime() {
    updatedTime = new Date().getTime() - startTime;
    display.innerHTML = formatTime(updatedTime);
}

function formatTime(time) {
    const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds)}`;
}

function pad(number) {
    return number < 10 ? `0${number}` : number;
}

function setCountdown() {
    clearInterval(countdownInterval);
    const minutes = parseInt(countdownMinutesInput.value) || 0;
    const seconds = parseInt(countdownSecondsInput.value) || 0;
    countdownTime = (minutes * 60 + seconds) * 1000;
    countdownRemaining = countdownTime;
    countdownDisplay.innerHTML = formatCountdown(countdownRemaining);
    countdownInterval = setInterval(updateCountdown, 1000);
    countdownRunning = true;
}

function updateCountdown() {
    if (countdownRemaining <= 0) {
        clearInterval(countdownInterval);
        countdownDisplay.innerHTML = "Time's up!";
        playSound('alert');
        countdownRunning = false;
    } else {
        countdownRemaining -= 1000;
        countdownDisplay.innerHTML = formatCountdown(countdownRemaining);
    }
}

function pauseCountdown() {
    if (countdownRunning) {
        clearInterval(countdownInterval);
        pauseCountdownBtn.innerHTML = "Resume";
        countdownRunning = false;
    } else {
        countdownInterval = setInterval(updateCountdown, 1000);
        pauseCountdownBtn.innerHTML = "Pause";
        countdownRunning = true;
    }
}

function resetCountdown() {
    clearInterval(countdownInterval);
    countdownRemaining = 0;
    countdownDisplay.innerHTML = "00:00";
    pauseCountdownBtn.innerHTML = "Pause";
    countdownRunning = false;
}

function formatCountdown(time) {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${pad(minutes)}:${pad(seconds)}`;
}

function exportLaps() {
    const laps = [];
    lapsContainer.querySelectorAll('div').forEach(div => {
        laps.push(div.textContent);
    });
    const blob = new Blob([laps.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'laps.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function importLaps(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const lines = e.target.result.split('\n');
            lapsContainer.innerHTML = '';
            lines.forEach(line => {
                const lapTime = document.createElement('div');
                lapTime.textContent = line;
                lapsContainer.appendChild(lapTime);
            });
        };
        reader.readAsText(file);
    }
}

// Share lap time via sharing dialog
function shareLapTime(lapTimeString) {
    if (navigator.share) {
        navigator.share({
            title: 'Check out my lap time!',
            text: `I completed a lap in ${lapTimeString}!`,
        })
        .then(() => console.log('Shared successfully'))
        .catch((error) => console.error('Error sharing:', error));
    } else {
        // Fallback if sharing API is not supported
        alert(`Share lap time: ${lapTimeString}`);
    }
}

function playSound(type) {
    const audio = new Audio();
    switch (type) {
        case 'start':
            audio.src = 'start.mp3';
            break;
        case 'pause':
            audio.src = 'pause.mp3';
            break;
        case 'reset':
            audio.src = 'reset.mp3';
            break;
        case 'lap':
            audio.src = 'lap.mp3';
            break;
        case 'alert':
            audio.src = 'alert.mp3';
            break;
    }
    audio.play();
}

function changeTheme() {
    const isDarkMode = themeSelect.value === 'dark';
    document.body.classList.toggle('dark-mode', isDarkMode);
    const elements = document.querySelectorAll('#display, #countdownDisplay');
    elements.forEach(el => {
        el.style.color = isDarkMode ? '#fff' : '#000';
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    if (event.key === 's' || event.key === 'S') {
        startStop();
    } else if (event.key === 'r' || event.key === 'R') {
        reset();
    } else if (event.key === 'l' || event.key === 'L') {
        addLap();
    }
});