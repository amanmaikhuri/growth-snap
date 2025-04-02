document.addEventListener("DOMContentLoaded",() =>{
    let dom ={
        winToday : document.querySelector("#win"),
        struggle : document.querySelector("#struggle"),
        nextGoal : document.querySelector("#goal"),
        moodToday : document.querySelector("#mood"),
        btn : document.querySelector(".snap-btn"),
        toggle: document.querySelector(".toggle-mode"),
        body: document.body,
        logsContainer: document.querySelector(".logs-container"),
        deleteBtn: document.querySelector(".delete-btn"),
        mode: document.querySelector(".fa")
    }
    //setting initial toogle icon
    dom.mode.classList.add("fa-moon");

    //Welcome alert on first Load
    if(!localStorage.getItem("hasSeenWelcome")){
        alert(
            `welcome to Growth Snap ! 🌟✨
            ✨Track your daily journey with ease.
            ✨Pick a mood from 40+ emojis.
            ✨Switch between light and dark mode .
            ✨Save logs locally and delete as needed
        Reflect ,Grow , and snap your progress -let's get started!`
        );
        localStorage.setItem("hasSeenWelcome","true");
    }

    //switching betweeen dark/light themes
    if(dom.toggle){
        dom.toggle.addEventListener("click",toggleMode);
    }

    function toggleMode() {
        let currentTheme =dom.body.classList;
        let mode = dom.mode;
        if (currentTheme.contains("lightmode")) {
            currentTheme.replace("lightmode","darkmode");
            mode.classList.add("fa-sun")
        } else {
            currentTheme.replace("darkmode","lightmode");
            mode.classList.remove("fa-sun")
            mode.classList.add("fa-moon")
        }
    }

    //initiating Logs
    const localLogs =localStorage.getItem("logs");
    let growthSnaps;
    if(localLogs){
        growthSnaps =JSON.parse(localLogs);
        renderLogs();
    } else{
        growthSnaps =[];
        renderLogs();
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

    //initiate process
    dom.btn.addEventListener("click",captureValues);

    //render results
    function renderLogs(){
        dom.logsContainer.innerHTML ="";

        growthSnaps.forEach((log ,index)=>{
            let logContent = document.createElement("div");
            logContent.classList.add("log-content");


            logContent.innerHTML =`
                <p id="win-para"><span>Wins Today : </span>${log.wins}</p>
                <p id="struggle-para"><span>Struggle : </span>${log.struggleToday}</p>
                <p id="goal-para"><span>Next Goal : </span>${log.goal}</p>
                <p id="mood-para">${getEmoji(log.mood)} ${log.mood}</p>
                <p id="time-stamp">[ Date :${log.datestamp} at ${log.timestamp} ]</p>
                <button class="delete-entry" data-index="${index}">❌ Delete</button>
        `
        dom.logsContainer.appendChild(logContent);
        })

        // Add event listeners to delete buttons
    document.querySelectorAll(".delete-entry").forEach(button => {
        button.addEventListener("click", deleteLogEntry);
    });
    }


    function deleteLogEntry(event) {
        const index = event.target.getAttribute("data-index");
        growthSnaps.splice(index, 1); // Remove entry from the array
        localStorage.setItem("logs", JSON.stringify(growthSnaps));
        renderLogs();
    }

    //capture input values
    function captureValues(){
        const inputValues ={
            wins: dom.winToday.value,
            struggleToday: dom.struggle.value,
            mood: dom.moodToday.value,
            goal: dom.nextGoal.value,
            timestamp: new Date().toLocaleTimeString(),
            datestamp: new Date().toLocaleDateString()
        }
        // Check if any field is empty
    if (!inputValues.wins || !inputValues.struggleToday || !inputValues.mood || !inputValues.goal) {
        alert("Hey Fam ! You missed something !");
        return;
    }
        growthSnaps.unshift({...inputValues});
        localStorage.setItem("logs",JSON.stringify(growthSnaps));
        clearValues()
        renderLogs()
        checkStorageLimit()
    }

    //clear input fields
    function clearValues(){
        dom.winToday.value = "";
        dom.struggle.value ="";
        dom.moodToday.value = "loved";
        dom.nextGoal.value ="";
        dom.winToday.focus();
    }

    function checkStorageLimit() {
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length * 2; // Approximate bytes used
            }
        }
        if (totalSize > 5000000) { // 5MB limit
            alert("Storage limit is almost full. Consider deleting old logs.");
        }
    }


    //remove logs

    dom.deleteBtn.addEventListener("dblclick",removeLogs);
    function removeLogs(){
        localStorage.clear();
        dom.logsContainer.innerHTML ="";
    }
});