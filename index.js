
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
        menubar: $("#menu"),
        sidebar: $("#sidebar"),
        logsHistory: $(".logs-history"),
        streakCount: $("#streak-count"),
        hideMenu: $("#hide-menu"),
        successMsg: $("#success-msg"),
        coinsDisplay: $("#coins"),
        moodChartCanvas: $("#moodChart", false) // Silent fail if missing
    };

    // App state
    const state = {
        logs: JSON.parse(localStorage.getItem("logs") || "[]"),
        theme: localStorage.getItem("theme") || "lightmode",
        visitorCount: parseInt(localStorage.getItem("visitorCount")) || 1,
        coins: parseInt(localStorage.getItem("coins")) || 0
    };

    // Initialize app
    function init() {
        try{
            applyTheme();
            showWelcome();
            attachEvents();
            renderLogs();
            renderHistory();
            updateCoinsDisplay();
            calculateStreak();
            setupMotivationalQuote();
            checkGoalCompletion();
            updateStats();
        } catch(error){
            // console.error("initialization failed:",error);
            console.log(error);
            showToast("Error initializing app, Please refresh");
        }
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
            state.visitorCount +1;
            localStorage.setItem("visitorCount", state.visitorCount);
        }
    }

    // Event listeners
    function attachEvents() {
        dom.saveBtn?.addEventListener("click", saveLog);
        dom.toggleBtn?.addEventListener("click", toggleTheme);
        dom.deleteAllBtn?.addEventListener("dblclick", clearLogs);
        dom.logsContainer.addEventListener("click", handleLogActions);
        dom.menubar.addEventListener("click",showSideBar);
        dom.hideMenu.addEventListener("click",hideSideBar);
    }

    function handleLogActions(e) {
        const btn = e.target.closest("button");
        if (!btn) return;
        const index = btn.dataset.id;
        if (btn.classList.contains("delete-entry")) deleteLog(index);
        if (btn.classList.contains("edit-entry")) editLog(index);
    }

    //show sidebar
    function showSideBar(){
        const menubars = dom.sidebar.classList;
        if(menubars.contains("hidden")){
            menubars.replace("hidden","visible");
        }
    }

    //hide sidebar
    function hideSideBar(){
        const menu= dom.hideMenu.classList
        if(menu.contains("visible")){
            dom.sidebar.classList.replace("visible" ,"hidden");
        } else{
            dom.menubar.classList.replace("hidden" ,"visible");
        }
    }
    // Log management
    function saveLog() {
        try{
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
            awardCoins(10,"Daily log"); //10 coins for logging;
            saveToStorage("coins",state.coins);
            clearInputs();
            renderLogs();
            updateStats();
            giveInsights(log);
            suggestGoal();
        } catch(error){
            console.error("Save failed",error);
            showToast("Error Saving log. Please try again.");
        }
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
        dom.logsContainer.innerHTML = "";
        state.logs.map((log, i) =>{
            const logContent =document.createElement("div");
            logContent.classList.add("log-content");
        const completionStatus = log.goalCompleted == null ? "Pending": log.goalCompleted ? "Completed ✅" : "Not Completed &#x2715";
        
        logContent.innerHTML =`
                <p id="win-para"><span>Today's Win:</span> ${log.win}</p>
                <p id="struggle-para"><span>Today's Challenge:</span> ${log.struggle}</p>
                <p id="goal-para"><span>Goal:</span> ${log.goal}</p>
                <p id="mood-para"><span>Mood:</span> ${getEmoji(log.mood)} ${log.mood}</p>
                <p id="time-stamp"><small>[ ${log.datestamp} ${log.timestamp} ]</small></p>
                <button data-id="${i}" class="edit-entry"><i class="fa-solid fa-pen-to-square"></i></button>
                <button data-id="${i}" class="delete-entry"><i class="fa-solid fa-trash"></i></button>
                ${log.goalCompleted == null && isNextDay(log.datestamp)?
                    `<button class= "complete-goal" data-index="${i}">Mark Completed</button>
                    <button class= "fail-goal" data-index="${i}">Mark failed</button>` : ""}`;
                dom.logsContainer.appendChild(logContent);
                showToast("Log saved Successfully!");
        updateCoinsDisplay();
        calculateStreak();
        
    })
    if(state.logs.length == 0){
        dom.successMsg.innerHTML = ("[ Your logs will be displayed here! ]");
    } else {
        dom.successMsg.innerHTML = ("Log saved Successfully!");
        dom.coinsDisplay.innerHTML =`Coins <i class="fas fa-coins" id="coin"></i> : ${state.coins}`
        showToast("Logs refreshed Successfully!");
    }};

    function renderHistory(){
        if(!dom.logsHistory) return;
        dom.logsHistory.innerHTML = state.logs.map((log, i)=>
            `
            <div class ="log-history-content">
                    <p id="date"><span>Dated:</span>${log.datestamp}</p>
                    <p id="date"><span>mood:</span>${getEmoji(log.mood)}${log.mood}</p>
                    <p id="winPara"><span>Win :</span>${log.win}</p>
            </div>  `
        ).join("");
    }

    function deleteLog(index) {
        state.logs.splice(index, 1);
        saveToStorage("coins",state.coins);
        saveToStorage("logs", state.logs);
        renderLogs();
        updateStats();
        showToast("Log deleted successfully!");
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
        showToast("Log saved Successfully!");
    }

    function clearLogs() {
        if (confirm("Are you sure you want to delete all logs?")) {
            state.logs = [];
            state.coins = 0;
            localStorage.removeItem("coins");
            localStorage.removeItem("logs");
            renderLogs();
            updateStats();
            showToast("All logs Cleared");
        }
        console.log("clicked")
    }

    //Goal Completion handling
    function isNextDay(log){
        const logDate = new Date(log.datestamp);
        const today = new Date();
        const diffDays = Math.floor((today-logDate) /(1000 *60*60*24));
        return diffDays === 1;
    }

    function markGoalCompletion(i){
       state.logs[i].goalCompleted =true;
       awardCoins(50,"Goal Completed"); //50 coins for completing a goal
       saveToStorage();
       renderLogs();
       dom.successMsg.innerHTML = ("Great job completing your goal! +50coins");
       showToast("Great job completing your goal! +50coins");
    }

    function markGoalFailed(i){
        state.logs[i].goalCompleted =false;
        saveToStorage();
        renderLogs();
        dom.successMsg.innerHTML = "Goal marked as not completed. Keep trying!";
        showToast("Goal marked as not completed. Keep trying!");
     }

     function checkGoalCompletion(){
        state.logs.map((log ,i)=>{
            if(log.goalCompleted ==null && !isNextDay(log.datestamp) && 
        (new Date() - new Date(log.datestamp))/(1000 *60 *60 *24)>1 ){
            log.goalCompleted =false ; //auto fail if more than one day has [passed]
        }
        });
        saveToStorage();
     }

     //Reward System 
     function awardCoins(amount,reason =""){
        state.coins += amount;
        saveToStorage("coin",state.coins);
        updateCoinsDisplay();
        showToast(`+${amount} coins for ${reason}!`);
     }

     function updateCoinsDisplay(){
        if(dom.coinsDisplay){
            dom.coinsDisplay.innerHTML =`Coins <i class="fa-solid fa-coins"></i>: ${state.coins}`;
        }
     }

    // Utility functions
    function saveToStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
        checkStorageLimit();
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
                "Take 5 deep breathing excercise 🌬️",
                //breathing excercises
                "Try the 4-7-8 Breathing:  Inhale for 4 seconds ,hold for 7 seconds ,exhale for 8 second. Repeat for 4 times",
                "Box-breathing: Inhale for 4sec, hold for 4sec, exhale for 4sec, hold for 4sec. Do this for 2 minutes.",
                "Deep Belly Breath: Place a hand on your belly, breathe deeply so it rises, exhale slowly. 5 Repetitions.",

                //quick meditation
                "1-minute reset: Close your eyes, focus on your breath, let thoughts pass like clouds.",
                "Gratitude Pause: Think of three things you are thankful for right now. Feel the warmth for 30 seconds.",
                "Body Scan: Close your eyes, slowly focus on each part form toes to head, releasing tension.",

                //Physical activity
                "Stretch Break: Stand up, reach for the sky, then touch your toes. Hold each for 10 seconds",
                "Quick Walk: Step outside for 5 minutes, notice 5 things you see, hear, or feel.",
                "Dance it out: Put on a favorrite song, move freely for 3 minutes to shake off the funk",
                "Step outside for fresh air 🌳",
                "Listen to your favorite uplifting music 🎶"
            ];
            showToast((tips[Math.floor(Math.random() * tips.length)]));
            alert((tips[Math.floor(Math.random() * tips.length)]));
        }

        //struggle pattern recognition
        const struggleCount = state.logs.filter(i => i.struggle === log.struggle).length;
        if(struggleCount > 2){
            showToast(`"${log.struggle}" appears often. Try breaking it into smaller tasks ?`);
        }

        //positive reinforcement 
        const positiveMood =["happy","excited","motivated","confident"];
        if(positiveMood.includes(log.mood)){
            awardCoins(5,"Positive vibe");
            if(Math.random() >0.5) setupMotivationalQuote();
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
        showToast(ideas[Math.floor(Math.random() * ideas.length)])
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
        let streak =calculateStreak();
        dom.statsContainer.innerHTML = `
            <p>Total Logs: ${state.logs.length}</p>
            <p>Top Mood: ${getEmoji(topMood)} ${topMood}</p>
            <p>Most Active Day: ${mostActiveDay}</p>
            <p>Visitors: ${state.visitorCount}</p>
        `;

        if(streak>1) {
            awardCoins(5*streak,"Streak bonus"); //5coins per streak day
            saveToStorage("coins",state.coins);
        }
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

    function calculateStreak() {
        if (state.logs.length === 0) {
            dom.streakCount.innerHTML = `Streak <i class="fas fa-bolt"></i>: 0 Days`;
            return;
        }
    
        state.logs.sort((a, b) => new Date(b.datestamp) - new Date(a.datestamp));
    
        // Check if latest log is from yesterday
        if (!isNextDay(state.logs[0])) {
            dom.streakCount.innerHTML = `Streak <i class="fas fa-bolt"></i>: 0 Days`;
            return;
        }
        let streak = 1;
        for (let i = 1; i < state.logs.length; i++) {
            const prev = new Date(state.logs[i - 1].datestamp);
            const curr = new Date(state.logs[i].datestamp);
    
            // Difference in days (absolute value, rounded)
            const diffInDays = Math.round(
                (curr - prev) / (1000 * 60 * 60 * 24)
            );
    
            if (diffInDays === 1) {
                streak++;
            } else {
                break;
            }
        }
        dom.streakCount.innerHTML =`Streak <i class="fas fa-bolt"></i>: ${streak} Days`;
    }
    

    function getMostActiveDay() {
        const dayCount = state.logs.reduce((acc,log)=>{
            const day = new Date(log.datestamp).getDay();
            acc[day] = (acc[day] || 0) +1;
            return acc;
        },{});

        const maxDay =Object.entries(dayCount).reduce((a,b)=> a[1] > b[1] ? a: b ,["none",0]) [0];
        return ["sun","Mon","Tue", "Wed" ,"Thu","Fri","Sat"][maxDay[0]];
    }

    // Motivational quote
    function setupMotivationalQuote() {
        if (!dom.goal) return;
        const quotes = [
            "The best way out is always through. -Robert Frost",
            "You are enough just as you are .-Meghan Markle",
            "Believe you can and you're halfway there.",
            "Small steps every day lead to big change.",
            "The only limit to our realization of tomorrow is our doubt of today -Franklin D. Roosevelt",
            "Start where you are. Use what you have. Do what you can. -Arthur Ashe",
            "Believe You can and you are halfway there. -Theodore Roosevelt",
            "Everyday is a new beginning. Take a deep Breath and start again.",
            "You don't have to see the whole staircase, just take the first step. -Martin Luther king Jr.",
            "Difficult roads often lead to beautiful destinations.",
            "The only way to do great work is to love what you do. -Steve Jobs",
            "You are stronger then you think , brave than you believe, and smarter than you know.",
        ];
        dom.goal.title = quotes[Math.floor(Math.random() * quotes.length)];
        showToast(quotes[Math.floor(Math.random() * quotes.length)])
    };

    //utility functions 
    function checkStorageLimit(){
        const size = JSON.stringify(localStorage).length * 2;
        if(size >50*1024){
            showToast("Storage nearly full! Consider cleaning old logs.");
        }
    }

    function showToast(message){
        const toast =document.createElement("div");
        toast.classList.add("toast");
        toast.textContent = message;
        dom.body.appendChild(toast);
        setTimeout(()=>
            toast.remove(), 3000)
    };

    init();
});