document.addEventListener("DOMContentLoaded", () => {
    // Utility for DOM selection
    const $ = (selector, err) => {
        const el = document.querySelector(selector);
        if (!el && err !== false) console.error(err || `Missing ${selector}`);
        return el;
    };

    // DOM elements
    const dom = {
        win: $("#win"),
        struggle: $("#struggle"),
        goal: $("#goal"),
        mood: $("#mood"),
        saveBtn: $(".snap-btn"),
        toggleBtn: $(".toggle-mode"),
        deleteAllBtn: $(".delete-btn"),
        body: document.body,
        modeIcon: $(".fa"),
        logsContainer: $(".logs-container"),
        statsContainer: $(".stats-container"),
        moodChartCanvas: $("#moodChart", false) // Silent fail if missing
    };

    // App state
    const state = {
        logs: JSON.parse(localStorage.getItem("logs") || "[]"),
        theme: localStorage.getItem("theme") || "lightmode",
        visitorCount: parseInt(localStorage.getItem("visitorCount")) || 0
    };

    // Initialize app
    function init() {
        applyTheme();
        showWelcome();
        attachEvents();
        renderLogs();
        updateStats();
        setupMotivationalQuote();
    }

    // Theme management
    function applyTheme() {
        dom.body.classList.add(state.theme);
        dom.modeIcon?.classList.add(state.theme === "lightmode" ? "fa-moon" : "fa-sun");
    }

    function toggleTheme() {
        const oldTheme = state.theme;
        state.theme = state.theme === "lightmode" ? "darkmode" : "lightmode";
        dom.body.classList.replace(oldTheme, state.theme);
        if (dom.modeIcon) {
            dom.modeIcon.classList.replace(
                oldTheme === "lightmode" ? "fa-moon" : "fa-sun",
                state.theme === "lightmode" ? "fa-moon" : "fa-sun"
            );
        }
        localStorage.setItem("theme", state.theme);
    }

    // Welcome message
    function showWelcome() {
        if (!localStorage.getItem("hasSeenWelcome")) {
            alert("Welcome to Growth Snap! Log your wins, struggles, goals, and mood daily!");
            localStorage.setItem("hasSeenWelcome", "true");
            state.visitorCount++;
            localStorage.setItem("visitorCount", state.visitorCount);
        }
    }

    // Event listeners
    function attachEvents() {
        dom.saveBtn?.addEventListener("click", saveLog);
        dom.toggleBtn?.addEventListener("click", toggleTheme);
        dom.deleteAllBtn?.addEventListener("dblclick", clearLogs);
        dom.logsContainer.addEventListener("click", handleLogActions);
    }

    function handleLogActions(e) {
        const btn = e.target.closest("button");
        if (!btn) return;
        const index = btn.dataset.id;
        if (btn.classList.contains("delete-entry")) deleteLog(index);
        if (btn.classList.contains("edit-entry")) editLog(index);
    }

    // Log management
    function saveLog() {
        const log = {
            win: dom.win?.value.trim() || "",
            struggle: dom.struggle?.value.trim() || "",
            goal: dom.goal?.value.trim() || "",
            mood: dom.mood?.value || "neutral",
            timestamp: new Date().toLocaleTimeString(),
            datestamp: new Date().toLocaleDateString()
        };

        if (!log.win || !log.struggle || !log.goal) {
            alert("Please fill all fields!");
            return;
        }

        state.logs.unshift(log);
        saveToStorage("logs", state.logs);
        clearInputs();
        renderLogs();
        updateStats();
        giveInsights(log);
        suggestGoal();
    }

    function clearInputs() {
        if (dom.win) dom.win.value = "";
        if (dom.struggle) dom.struggle.value = "";
        if (dom.goal) dom.goal.value = "";
        if (dom.mood) dom.mood.value = "neutral";
        dom.win?.focus();
    }

    function renderLogs() {
        if (!dom.logsContainer) return;
        dom.logsContainer.innerHTML = state.logs.map((log, i) => `
            <div class="log-content">
                <p id="win-para"><span>Today's Win:</span> ${log.win}</p>
                <p id="struggle-para"><span>Today's Challenge:</span> ${log.struggle}</p>
                <p id="goal-para"><span>Goal:</span> ${log.goal}</p>
                <p id="mood-para"><span>Mood:</span> ${getEmoji(log.mood)} ${log.mood}</p>
                <p id="time-stamp"><small>${log.datestamp} ${log.timestamp}</small></p>
                <button data-id="${i}" class="edit-entry"><i class="fa-solid fa-pen-to-square"></i></button>
                <button data-id="${i}" class="delete-entry"><i class="fa-solid fa-trash"></i></button>
            </div>
        `).join("");
    }

    function deleteLog(index) {
        state.logs.splice(index, 1);
        saveToStorage("logs", state.logs);
        renderLogs();
        updateStats();
        alert("Log deleted.");
    }

    function editLog(index) {
        const log = state.logs[index];
        if (dom.win) dom.win.value = log.win;
        if (dom.struggle) dom.struggle.value = log.struggle;
        if (dom.goal) dom.goal.value = log.goal;
        if (dom.mood) dom.mood.value = log.mood;
        state.logs.splice(index, 1);
        saveToStorage("logs", state.logs);
        renderLogs();
        updateStats();
    }

    function clearLogs() {
        if (confirm("Clear all logs?")) {
            state.logs = [];
            localStorage.removeItem("logs");
            renderLogs();
            updateStats();
        }
    }

    // Utility functions
    function saveToStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    // Define mood emojis
    function getEmoji(mood) {
        const moodEmojis = {
            happy: "😃",
            excited: "🤩",
            cheerful: "😄",
            Grateful: "🙏😊",
            loved: "❤️",
            confident: "😎",
            motivated: "🚀💪",
            relaxed: "😌🧘‍♂️",
            inspired: "✨😃",
            hopeful: "🌟🙂",
            calm: "😌",
            thoughtful: "🤔",
            focused: "🎯😐",
            neutral: "😐",
            meh: "😑",
            tired: "😴",
            sad: "😢",
            stressed: "😫",
            angry: "😠",
            frustrated: "😤",
            anxious: "😟😰",
            depressed: "😔💔",
            heartbroken: "💔😞",
            annoyed: "😒",
            disappointed: "😞",
            silly: "🤪",
            mischievous: "😈",
            sarcastic: "🙃",
            goofy: "🤭",
            laughing: "😂🤣",
            "excited-hyper": "🤩🔥",
            romantic: "😘💕",
            flirty: "😉😍",
            cuddly: "🥰🤗",
            crush: "😍💘",
            blushing: "😊🥵",
            sick: "🤒🤢",
            sleepy: "💤😴",
            scared: "😨👻",
            shocked: "😱",
            nervous: "😬"
        };
        return moodEmojis[mood] || "❓"; // Return default emoji if mood is not found
    }

    // Insights and suggestions
    function giveInsights(log) {
        const negativeMoods = ["sad", "stressed", "anxious", "tired"];
        if (negativeMoods.includes(log.mood)) {
            const tips = [
                "Take 5 deep breaths 🌬️",
                "Step outside for fresh air 🌳",
                "Listen to uplifting music 🎶"
            ];
            alert(tips[Math.floor(Math.random() * tips.length)]);
        }
    }

    function suggestGoal() {
        if (!dom.goal) return;
        const ideas = [
            "Do 1 important task today.",
            "Practice self-care for 10 min.",
            "Learn something new!"
        ];
        dom.goal.placeholder = ideas[Math.floor(Math.random() * ideas.length)];
    }

    // Stats and chart
    function updateStats() {
        if (!dom.statsContainer) return;
        const moodMap = state.logs.reduce((acc, log) => {
            acc[log.mood] = (acc[log.mood] || 0) + 1;
            return acc;
        }, {});
        const topMood = Object.entries(moodMap).reduce((a, b) => a[1] > b[1] ? a : b, ["none", 0])[0];
        const mostActiveDay = getMostActiveDay();

        dom.statsContainer.innerHTML = `
            <p>Total Logs: ${state.logs.length}</p>
            <p>Top Mood: ${getEmoji(topMood)} ${topMood}</p>
            <p>Most Active Day: ${mostActiveDay}</p>
            <p>Visitors: ${state.visitorCount}</p>
        `;
        renderMoodChart(moodMap);
    }

    function renderMoodChart(moodMap) {
        if (!dom.moodChartCanvas || typeof Chart === "undefined") return;
        const ctx = dom.moodChartCanvas.getContext("2d");
        if (!ctx) return;

        if (window.moodChartInstance) window.moodChartInstance.destroy();

        window.moodChartInstance = new Chart(ctx, {
            type: "pie",
            data: {
                labels: Object.keys(moodMap),
                datasets: [{
                    data: Object.values(moodMap),
                    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: "bottom" }, title: { display: true, text: "Mood Trends" } }
            }
        });
    }

    function getMostActiveDay() {
        const dayMap = state.logs.reduce((acc, log) => {
            acc[log.datestamp] = (acc[log.datestamp] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(dayMap).reduce((a, b) => a[1] > b[1] ? a : b, ["none", 0])[0];
    }

    // Motivational quote
    function setupMotivationalQuote() {
        if (!dom.goal) return;
        const quotes = [
            "Believe you can and you're halfway there.",
            "Small steps every day lead to big change."
        ];
        dom.goal.title = quotes[Math.floor(Math.random() * quotes.length)];
    }

    init();
});