let teams = [
    { id: 1, name: "Robbit Lions", players: [] },
    { id: 2, name: "Young Titans", players: [] },
    { id: 3, name: "Next Generation", players: [] },
    { id: 4, name: "AI Stars", players: [] },
    { id: 5, name: "Robbit Warriors", players: [] },
    { id: 6, name: "Dream Team", players: [] },
    { id: 7, name: "Smart Kids", players: [] },
    { id: 8, name: "Future Legends", players: [] },
    { id: 9, name: "Techno Boys", players: [] },
    { id: 10, name: "Victory Kids", players: [] },
    { id: 11, name: "Thunder Team", players: [] },
    { id: 12, name: "Galaxy Juniors", players: [] },
    { id: 13, name: "Robbit Friends", players: [] },
    { id: 14, name: "Goal Makers", players: [] },
    { id: 15, name: "Champions", players: [] },
    { id: 16, name: "Star Boys", players: [] }
];

let playerStats = {}; // { "Player Name": { goals: 0 } }
let suspensions = []; // ["Player Name", ...]

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
    renderInitialTeams();
    createBallsInBowl();
    
    // Set a placeholder image if not set
    const heroImg = document.getElementById('hero-img-element');
    if (!heroImg.getAttribute('src')) {
        heroImg.src = 'https://images.unsplash.com/photo-1518605368461-1eb53460dfcc?q=80&w=2000&auto=format&fit=crop';
        heroImg.style.display = 'block';
    }
    
    document.getElementById('start-draw-btn').addEventListener('click', performDraw);
    document.getElementById('add-team-btn').addEventListener('click', addTeam);
    document.getElementById('new-team-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') addTeam();
    });

    // Modals close buttons
    document.getElementById('close-players-modal').addEventListener('click', () => {
        document.getElementById('players-modal').style.display = 'none';
    });
    document.getElementById('close-live-match').addEventListener('click', () => {
        document.getElementById('live-match-modal').style.display = 'none';
        clearInterval(timerInterval);
    });
    document.getElementById('timer-toggle-btn').addEventListener('click', toggleTimer);
    document.getElementById('end-match-btn').addEventListener('click', endMatch);
});

function getNextId() {
    return teams.length > 0 ? Math.max(...teams.map(t => t.id)) + 1 : 1;
}

function addTeam() {
    const input = document.getElementById('new-team-input');
    const val = input.value.trim();
    if(val) {
        teams.push({ id: getNextId(), name: val, players: [] });
        input.value = '';
        renderInitialTeams();
        createBallsInBowl();
    }
}

function removeTeam(index, event) {
    event.stopPropagation();
    teams.splice(index, 1);
    renderInitialTeams();
    createBallsInBowl();
}

function renderInitialTeams() {
    const listEl = document.getElementById('initial-teams-list');
    document.getElementById('teams-count').innerText = teams.length;
    listEl.innerHTML = '';
    
    teams.forEach((team, index) => {
        const li = document.createElement('li');
        li.className = 'team-item';
        li.id = `team-item-${team.id}`;
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.cursor = 'pointer';
        li.title = "O'yinchilarni qo'shish uchun bosing";
        li.onclick = () => openPlayersModal(index);
        
        const playersCount = team.players.length;
        const countBadge = playersCount > 0 ? `<span style="font-size:10px; background:#e2e8f0; padding:2px 6px; border-radius:10px; margin-left:10px;">${playersCount} ta o'yinchi</span>` : `<span style="font-size:10px; background:#fee2e2; color:#ef4444; padding:2px 6px; border-radius:10px; margin-left:10px;">O'yinchilar yo'q</span>`;
        
        li.innerHTML = `
            <div><span class="team-number">${index + 1}</span> <span class="team-name-text">${team.name}</span> ${countBadge}</div>
            <button onclick="removeTeam(${index}, event)" style="background:none; border:none; color:#ef4444; cursor:pointer; padding:0 5px;" title="O'chirish">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
        `;
        listEl.appendChild(li);
    });
}

// Manage Players Modal
let editingTeamIndex = -1;
function openPlayersModal(index) {
    editingTeamIndex = index;
    const team = teams[index];
    document.getElementById('modal-team-name').innerText = team.name + " tarkibi";
    
    const inputs = document.querySelectorAll('.player-input');
    inputs.forEach((input, i) => {
        input.value = team.players[i] || '';
    });
    
    document.getElementById('players-modal').style.display = 'flex';
    
    document.getElementById('save-players-btn').onclick = () => {
        const newPlayers = [];
        inputs.forEach(input => {
            const val = input.value.trim();
            if(val) newPlayers.push(val);
        });
        teams[editingTeamIndex].players = newPlayers;
        document.getElementById('players-modal').style.display = 'none';
        renderInitialTeams();
    };
}

function createBallsInBowl() {
    const bowl = document.getElementById('bowl-balls');
    bowl.innerHTML = '';
    for(let i=0; i<teams.length; i++) {
        const ball = document.createElement('div');
        ball.className = 'ball';
        ball.style.animationDelay = `${Math.random() * 2}s`;
        bowl.appendChild(ball);
    }
}

async function performDraw() {
    if(teams.length === 0) return;
    
    const schedulePanel = document.getElementById('schedule-panel');
    schedulePanel.style.display = 'none';
    document.getElementById('results-panel').style.display = 'none';
    const scheduleGrid = document.getElementById('schedule-grid');
    scheduleGrid.innerHTML = '';

    const btn = document.getElementById('start-draw-btn');
    btn.disabled = true;
    btn.innerHTML = `QUR'A TASHLANMOQDA...`;
    
    const balls = document.querySelectorAll('.ball');
    balls.forEach(ball => ball.classList.add('shaking'));
    document.querySelectorAll('.team-item').forEach(item => item.classList.remove('drawn'));
    
    let shuffledTeams = [...teams];
    for (let i = shuffledTeams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledTeams[i], shuffledTeams[j]] = [shuffledTeams[j], shuffledTeams[i]];
    }

    // Determine number of groups (max 4 teams per group)
    const numGroups = Math.max(1, Math.ceil(teams.length / 4));
    const allGroupNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const activeGroupNames = allGroupNames.slice(0, numGroups);
    
    const groupsContainer = document.getElementById('groups-grid-container');
    groupsContainer.innerHTML = '';
    
    activeGroupNames.forEach(gn => {
        groupsContainer.innerHTML += `
            <div class="group-card group-${gn}">
                <h3 class="group-title">${gn.toUpperCase()} GURUHI</h3>
                <ul class="group-list" id="group-${gn}-list"></ul>
            </div>
        `;
    });

    const groups = {};
    activeGroupNames.forEach(gn => groups[gn] = []);
    
    for (let i = 0; i < shuffledTeams.length; i++) {
        groups[activeGroupNames[i % numGroups]].push(shuffledTeams[i]);
    }

    for (const [groupName, groupTeams] of Object.entries(groups)) {
        const listEl = document.getElementById(`group-${groupName}-list`);
        
        for (let i = 0; i < groupTeams.length; i++) {
            await new Promise(r => setTimeout(r, 400));
            const team = groupTeams[i];
            
            const originalIndex = teams.findIndex(t => t.id === team.id);
            if(originalIndex !== -1) {
                document.getElementById(`team-item-${team.id}`).classList.add('drawn');
            }
            
            const currentBalls = document.querySelectorAll('.ball');
            if(currentBalls.length > 0) currentBalls[currentBalls.length - 1].remove();
            
            const li = document.createElement('li');
            li.innerHTML = `<span>${i + 1}.</span> ${team.name}`;
            listEl.appendChild(li);
        }
    }
    
    generateSchedule(groups);
    
    btn.innerHTML = `QUR'A YAKUNLANDI`;
    document.querySelectorAll('.ball').forEach(ball => ball.classList.remove('shaking'));
    btn.disabled = false;
    
    // Show results panel
    document.getElementById('results-panel').style.display = 'block';
    updateStatsUI();
}

function generateSchedule(groups) {
    const schedulePanel = document.getElementById('schedule-panel');
    const scheduleGrid = document.getElementById('schedule-grid');
    scheduleGrid.innerHTML = '';
    
    for (const [groupName, groupTeams] of Object.entries(groups)) {
        let scheduleHtml = `<div class="schedule-group">
            <div class="schedule-group-title">${groupName.toUpperCase()} GURUHI O'YINLARI</div>`;
            
        if (groupTeams.length === 4) {
            const t1 = groupTeams[0], t2 = groupTeams[1], t3 = groupTeams[2], t4 = groupTeams[3];
            scheduleHtml += `
                <div class="match-day">
                    <div class="match-day-title">1-tur</div>
                    ${createMatchHtml(t1, t2)}
                    ${createMatchHtml(t3, t4)}
                </div>
                <div class="match-day">
                    <div class="match-day-title">2-tur</div>
                    ${createMatchHtml(t1, t3)}
                    ${createMatchHtml(t2, t4)}
                </div>
                <div class="match-day">
                    <div class="match-day-title">3-tur</div>
                    ${createMatchHtml(t1, t4)}
                    ${createMatchHtml(t2, t3)}
                </div>`;
        } else if (groupTeams.length === 3) {
            const t1 = groupTeams[0], t2 = groupTeams[1], t3 = groupTeams[2];
            scheduleHtml += `
                <div class="match-day">
                    <div class="match-day-title">1-tur</div>
                    ${createMatchHtml(t1, t2)}
                </div>
                <div class="match-day">
                    <div class="match-day-title">2-tur</div>
                    ${createMatchHtml(t1, t3)}
                </div>
                <div class="match-day">
                    <div class="match-day-title">3-tur</div>
                    ${createMatchHtml(t2, t3)}
                </div>`;
        } else if (groupTeams.length === 2) {
            const t1 = groupTeams[0], t2 = groupTeams[1];
            scheduleHtml += `
                <div class="match-day">
                    <div class="match-day-title">1-tur</div>
                    ${createMatchHtml(t1, t2)}
                </div>`;
        } else if (groupTeams.length > 0) {
            scheduleHtml += `<div style="font-size:12px; color:#666; text-align:center;">Jamoalar yetarli emas (kamida 2 ta jamoa kerak).</div>`;
        }
        
        scheduleHtml += `</div>`;
        scheduleGrid.innerHTML += scheduleHtml;
    }
    
    schedulePanel.style.opacity = '1';
    schedulePanel.style.display = 'block';
}

function createMatchHtml(team1, team2) {
    // Escaping quotes just in case
    const t1Json = encodeURIComponent(JSON.stringify(team1));
    const t2Json = encodeURIComponent(JSON.stringify(team2));
    
    return `
    <div class="match" style="cursor: pointer;" onclick="openLiveMatch('${t1Json}', '${t2Json}')" title="O'yinni boshlash">
        <span class="match-team">${team1.name}</span>
        <span class="match-vs">vs</span>
        <span class="match-team right">${team2.name}</span>
        <span style="font-size:10px; background:#00a651; color:white; padding:2px 4px; border-radius:3px; margin-left:5px;">PLAY</span>
    </div>
    `;
}

// LIVE MATCH LOGIC
let currentLiveMatch = null;
let timerInterval = null;
let secondsElapsed = 0;
let isTimerRunning = false;

function openLiveMatch(t1Json, t2Json) {
    const team1 = JSON.parse(decodeURIComponent(t1Json));
    const team2 = JSON.parse(decodeURIComponent(t2Json));
    
    currentLiveMatch = {
        team1,
        team2,
        score1: 0,
        score2: 0,
        events: []
    };
    
    document.getElementById('live-team1-name').innerText = team1.name;
    document.getElementById('live-team2-name').innerText = team2.name;
    document.getElementById('live-team1-score').innerText = '0';
    document.getElementById('live-team2-score').innerText = '0';
    
    document.getElementById('live-events-list').innerHTML = '';
    
    // Reset Timer
    clearInterval(timerInterval);
    secondsElapsed = 0;
    isTimerRunning = false;
    updateTimerDisplay();
    document.getElementById('timer-toggle-btn').innerText = 'Boshlash';
    document.getElementById('live-half-text').innerText = '1-TAYM';
    
    document.getElementById('live-match-modal').style.display = 'flex';
}

function toggleTimer() {
    const btn = document.getElementById('timer-toggle-btn');
    if(isTimerRunning) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        btn.innerText = 'Davom etish';
        btn.style.background = '#3b82f6';
    } else {
        timerInterval = setInterval(() => {
            secondsElapsed++;
            updateTimerDisplay();
            
            // Check half time (20 mins = 1200 seconds)
            if(secondsElapsed >= 1200 && secondsElapsed < 1201) {
                document.getElementById('live-half-text').innerText = '2-TAYM';
            }
            // Auto stop at 40 mins (2400 seconds)
            if(secondsElapsed >= 2400) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                btn.innerText = 'Tugadi';
                btn.disabled = true;
            }
        }, 1000);
        isTimerRunning = true;
        btn.innerText = 'To' + 'xtatish';
        btn.style.background = '#f59e0b';
    }
}

function updateTimerDisplay() {
    const m = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
    const s = (secondsElapsed % 60).toString().padStart(2, '0');
    document.getElementById('live-timer-display').innerText = `${m}:${s}`;
}

// Action Triggering
let pendingAction = null; // { teamKey: 'team1', action: 'goal' }

function triggerAction(teamKey, action) {
    if(!isTimerRunning) {
        alert("Oldin taymerni ishga tushiring!");
        return;
    }
    
    pendingAction = { teamKey, action };
    const team = teamKey === 'team1' ? currentLiveMatch.team1 : currentLiveMatch.team2;
    
    // Populate players select
    const select = document.getElementById('action-player-select');
    select.innerHTML = '<option value="">-- O' + 'yinchi tanlang --</option>';
    
    team.players.forEach(p => {
        // Only show if not suspended
        if(!suspensions.includes(p)) {
            select.innerHTML += `<option value="${p}">${p}</option>`;
        }
    });
    
    const assistContainer = document.getElementById('assist-container');
    const assistSelect = document.getElementById('action-assist-select');
    if(action === 'goal') {
        assistContainer.style.display = 'block';
        assistSelect.innerHTML = '<option value="">-- Assistent yo' + 'q --</option>';
        team.players.forEach(p => {
            if(!suspensions.includes(p)) {
                assistSelect.innerHTML += `<option value="${p}">${p}</option>`;
            }
        });
    } else {
        assistContainer.style.display = 'none';
    }
    
    let actionName = action === 'goal' ? "Gol" : (action === 'yellow' ? "Sariq kartochka" : "Qizil kartochka");
    document.getElementById('action-modal-title').innerText = `${team.name} - ${actionName}`;
    document.getElementById('action-modal').style.display = 'flex';
}

function closeActionModal() {
    document.getElementById('action-modal').style.display = 'none';
    pendingAction = null;
}

document.getElementById('save-action-btn').addEventListener('click', () => {
    if(!pendingAction) return;
    
    const player = document.getElementById('action-player-select').value;
    if(!player) {
        alert("O'yinchini tanlang!");
        return;
    }
    
    const team = pendingAction.teamKey === 'team1' ? currentLiveMatch.team1 : currentLiveMatch.team2;
    const timeStr = document.getElementById('live-timer-display').innerText;
    
    let eventText = `${timeStr} - ${team.name} - ${player}`;
    
    if(pendingAction.action === 'goal') {
        if(pendingAction.teamKey === 'team1') {
            currentLiveMatch.score1++;
            document.getElementById('live-team1-score').innerText = currentLiveMatch.score1;
        } else {
            currentLiveMatch.score2++;
            document.getElementById('live-team2-score').innerText = currentLiveMatch.score2;
        }
        
        // Update stats
        if(!playerStats[player]) playerStats[player] = { goals: 0 };
        playerStats[player].goals++;
        
        const assist = document.getElementById('action-assist-select').value;
        if(assist && assist !== player) {
            eventText += ` ⚽ Gol (assist: ${assist})`;
        } else {
            eventText += ` ⚽ Gol`;
        }
    } else if(pendingAction.action === 'yellow') {
        eventText += ` 🟨 Sariq`;
    } else if(pendingAction.action === 'red') {
        eventText += ` 🟥 Qizil`;
        if(!suspensions.includes(player)) {
            suspensions.push(player);
        }
    }
    
    // Add to timeline
    const list = document.getElementById('live-events-list');
    if(list.querySelector('li').innerText.includes("Hodisalar hali yo'q")) {
        list.innerHTML = '';
    }
    const li = document.createElement('li');
    li.style.padding = "5px 0";
    li.style.borderBottom = "1px solid #eee";
    li.innerText = eventText;
    list.prepend(li);
    
    updateStatsUI();
    closeActionModal();
});

function endMatch() {
    if(confirm("O'yinni yakunlashni xohlaysizmi?")) {
        clearInterval(timerInterval);
        document.getElementById('live-match-modal').style.display = 'none';
        alert(`O'yin yakunlandi! Hisob: ${currentLiveMatch.team1.name} ${currentLiveMatch.score1} - ${currentLiveMatch.score2} ${currentLiveMatch.team2.name}`);
    }
}

function updateStatsUI() {
    // Update Top Scorers
    const scorersList = document.getElementById('top-scorers-list');
    const sortedScorers = Object.entries(playerStats)
        .sort((a, b) => b[1].goals - a[1].goals)
        .slice(0, 10);
        
    if(sortedScorers.length > 0) {
        scorersList.innerHTML = '';
        sortedScorers.forEach(([name, stats]) => {
            scorersList.innerHTML += `<li><b>${name}</b> - ${stats.goals} gol</li>`;
        });
    }
    
    // Update Suspensions
    const suspList = document.getElementById('suspensions-list');
    if(suspensions.length > 0) {
        suspList.innerHTML = '';
        suspensions.forEach(name => {
            suspList.innerHTML += `<li><b>${name}</b> <span style="color:#dc2626;">(Qizil kartochka)</span></li>`;
        });
    }
}
