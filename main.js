document.addEventListener('DOMContentLoaded', () => {

    let appData = {
        totalPoints: 0,
        characters: [],
        stamps: {}
    };

    const CHARACTER_MASTER_DATA = {
        1: {
            initialAttack: 10,
            evolutions: [
                { name: "ひよこナイト", image: "images/hiyoko_knight.png", rank: "Normal", maxLevel: 30 },
                { name: "にわとり騎士", image: "images/niwatori_knight.png", rank: "Rare", maxLevel: 50 },
                { name: "イーグルライダー", image: "images/eagle_rider.png", rank: "Super Rare", maxLevel: 75 },
            ]
        },
        2: {
            initialAttack: 15,
            evolutions: [
                { name: "みならい魔法使い", image: "images/minarai_mahoutsukai.png", rank: "Normal", maxLevel: 30 },
                { name: "一人前の魔導士", image: "images/ichininmae_madoushi.png", rank: "Super Rare", maxLevel: 75 },
                { name: "大賢者", image: "images/daikenja.png", rank: "Ultimate Rare", maxLevel: 99 },
            ]
        }
    };

    function saveData() {
        localStorage.setItem('studyApp', JSON.stringify(appData));
    }

    function loadData() {
        const storedData = localStorage.getItem('studyApp');
        if (storedData) {
            appData = JSON.parse(storedData);
        }
    }

    // --- ページ切り替えのロジック ---
    const navLinks = document.querySelectorAll('.nav-menu a');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPageId = e.target.closest('.nav-item').dataset.page;
            
            pages.forEach(page => page.classList.remove('active-page'));
            navLinks.forEach(nav => nav.classList.remove('active'));

            document.getElementById(targetPageId).classList.add('active-page');
            e.target.closest('.nav-item').classList.add('active');

            if (targetPageId === 'stamp') {
                initializeStampPage();
            } else if (targetPageId === 'characters') {
                initializeCharacterPage();
            } else if (targetPageId === 'calendar') {
                initializeCalendarPage();
            }
        });
    });

    // --- ページ1: スタンプ機能 ---
    const todayDateEl = document.getElementById('todayDate');
    const stampContainerEl = document.getElementById('stampContainer');
    const stampInputEl = document.getElementById('stampInput');
    const completeStampButtonEl = document.getElementById('completeStampButton');
    const inputSectionEl = document.getElementById('inputSection');
    const stampMessageEl = document.getElementById('stampMessage');

    function initializeStampPage() {
        const today = new Date().toISOString().split('T')[0];
        todayDateEl.textContent = today;
        updatePointDisplay();
        renderStamps();
    }

    function updatePointDisplay() {
        const totalPointsDisplay_stamp = document.getElementById('totalPointsDisplay_stamp');
        const totalPointsDisplay_characters = document.getElementById('totalPointsDisplay_characters');
        if(totalPointsDisplay_stamp) totalPointsDisplay_stamp.textContent = appData.totalPoints;
        if(totalPointsDisplay_characters) totalPointsDisplay_characters.textContent = appData.totalPoints;
    }

    function renderStamps() {
        stampContainerEl.innerHTML = '';
        const today = new Date().toISOString().split('T')[0];
        const todayStamps = appData.stamps[today] || [];
        const stampedCountToday = todayStamps.length;

        if (stampedCountToday >= 5) {
            stampContainerEl.innerHTML = '<p>今日のスタンプは満タンです！</p>';
            inputSectionEl.style.display = 'none';
            return;
        }

        const stampButton = document.createElement('button');
        stampButton.className = 'main-button';
        stampButton.textContent = '今日のスタンプ';
        stampButton.addEventListener('click', () => {
            stampContainerEl.style.display = 'none';
            inputSectionEl.style.display = 'block';
            stampMessageEl.textContent = '今日取り組んだもの';
            stampInputEl.focus();
        });
        stampContainerEl.appendChild(stampButton);
    }

    completeStampButtonEl.addEventListener('click', () => {
        const stampText = stampInputEl.value.trim();
        if (stampText) {
            const today = new Date().toISOString().split('T')[0];
            const todayStamps = appData.stamps[today] || [];
            
            if (todayStamps.length < 5) {
                const newStamp = { text: stampText };
                todayStamps.push(newStamp);
                appData.stamps[today] = todayStamps;

                appData.totalPoints += 100;
                
                alert(`スタンプを押しました！100ポイント獲得！\n「${stampText}」を記録しました。`);
                
                stampInputEl.value = '';
                inputSectionEl.style.display = 'none';
                stampContainerEl.style.display = 'block';

                saveData();
                updatePointDisplay();
                renderStamps();
            }
        } else {
            alert('入力欄が空です。');
        }
    });

    // --- ページ2: キャラクター機能 ---
    const characterListContainerEl = document.getElementById('characterListContainer');
    const characterHintEl = document.getElementById('characterHint');
    const totalAttackPowerEl = document.getElementById('totalAttackPower');
    const totalCharacterCountEl = document.getElementById('totalCharacterCount');

    function initializeCharacterPage() {
        if (appData.characters.length === 0) {
            appData.characters.push({
                id: 1,
                level: 1,
                evolutionIndex: 0
            });
            appData.characters.push({
                id: 2,
                level: 1,
                evolutionIndex: 0
            });
            saveData();
        }
        updatePointDisplay();
        renderCharacters();
    }

    function renderCharacters() {
        characterListContainerEl.innerHTML = '';
        
        let totalAttackPower = 0;
        appData.characters.forEach(charData => {
            const master = CHARACTER_MASTER_DATA[charData.id];
            const currentEvolution = master.evolutions[charData.evolutionIndex];
            
            const maxLevel = currentEvolution.maxLevel;
            const isMaxLevel = charData.level >= maxLevel;
            
            const attackPower = master.initialAttack * charData.level;
            totalAttackPower += attackPower;
            
            const requiredPoints = (charData.level + 1) * 10;
            const canLevelUp = appData.totalPoints >= requiredPoints && !isMaxLevel;
            
            const card = document.createElement('div');
            card.className = 'card character-card';
            card.innerHTML = `
                <img src="${currentEvolution.image}" alt="${currentEvolution.name}">
                <h3>${currentEvolution.name} (Lv. ${charData.level})</h3>
                <p>ランク: ${currentEvolution.rank}</p>
                <p>攻撃力: ${attackPower}</p>
                ${!isMaxLevel ? `<p>次のレベルまで: ${requiredPoints} P</p>` : `<p>この形態は最大レベルです！</p>`}
                
                ${isMaxLevel && master.evolutions[charData.evolutionIndex + 1]
                    ? `<button class="evolve-button" data-character-id="${charData.id}">進化する！</button>`
                    : `<button class="level-up-button" data-character-id="${charData.id}" ${canLevelUp ? '' : 'disabled'}>レベルアップ！</button>`
                }
            `;
            characterListContainerEl.appendChild(card);
        });

        totalAttackPowerEl.textContent = totalAttackPower;
        totalCharacterCountEl.textContent = appData.characters.length;

        document.querySelectorAll('.level-up-button').forEach(button => {
            button.addEventListener('click', handleLevelUpClick);
        });
        document.querySelectorAll('.evolve-button').forEach(button => {
            button.addEventListener('click', handleEvolveClick);
        });

        if (appData.characters.some(char => char.level >= 30)) {
            characterHintEl.textContent = '次のキャラクターを追加する準備ができました！';
        } else {
            characterHintEl.textContent = 'キャラクターを30レベルにしてみよう。';
        }
    }

    function handleLevelUpClick(event) {
        const charId = parseInt(event.target.dataset.characterId, 10);
        const characterToUpdate = appData.characters.find(c => c.id === charId);
        
        const requiredPoints = (characterToUpdate.level + 1) * 10;
        
        if (appData.totalPoints >= requiredPoints) {
            appData.totalPoints -= requiredPoints;
            characterToUpdate.level++;
            
            saveData();
            updatePointDisplay();
            renderCharacters();
        } else {
            alert('ポイントが足りません！');
        }
    }

    function handleEvolveClick(event) {
        const charId = parseInt(event.target.dataset.characterId, 10);
        const characterToUpdate = appData.characters.find(c => c.id === charId);
        
        if (!characterToUpdate) return;

        const master = CHARACTER_MASTER_DATA[characterToUpdate.id];
        const nextEvolutionIndex = characterToUpdate.evolutionIndex + 1;
        
        if (master.evolutions[nextEvolutionIndex]) {
            characterToUpdate.evolutionIndex = nextEvolutionIndex;
            characterToUpdate.level = 1;
            
            alert('おめでとう！キャラクターが進化したよ！');
            
            saveData();
            updatePointDisplay();
            renderCharacters();
        } else {
            alert('このキャラクターはこれ以上進化できません！');
        }
    }

    // --- ページ3: カレンダー機能 ---
    const currentMonthYearEl = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const calendarGridEl = document.getElementById('calendarGrid');
    let currentCalendarDate = new Date();

    function initializeCalendarPage() {
        renderCalendar(currentCalendarDate);
    }

    function renderCalendar(date) {
        calendarGridEl.innerHTML = '';
        const year = date.getFullYear();
        const month = date.getMonth();

        currentMonthYearEl.textContent = `${year}年 ${month + 1}月`;

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay());
        
        let day = new Date(startDate);
        while (day <= lastDayOfMonth || day.getDay() !== 0) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            if (day.getMonth() !== month) {
                dayEl.classList.add('not-current-month');
            }

            const dayNumberEl = document.createElement('div');
            dayNumberEl.className = 'day-number';
            dayNumberEl.textContent = day.getDate();
            dayEl.appendChild(dayNumberEl);

            const formattedDate = day.toISOString().split('T')[0];
            const stampsForDay = appData.stamps[formattedDate] || [];
            stampsForDay.forEach(stamp => {
                const stampItemEl = document.createElement('div');
                stampItemEl.className = 'stamp-item';
                stampItemEl.textContent = stamp.text;
                dayEl.appendChild(stampItemEl);
            });

            calendarGridEl.appendChild(dayEl);
            day.setDate(day.getDate() + 1);
        }
    }

    prevMonthBtn.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar(currentCalendarDate);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar(currentCalendarDate);
    });

    // --- 初期化処理 ---
    loadData();
    initializeStampPage();

    // --- 管理者メニュー機能 ---
    const adminButton = document.getElementById('adminButton');
    const adminModal = document.getElementById('adminModal');
    const closeModalButton = document.getElementById('closeModalButton');
    const adminControls = document.getElementById('adminControls');

    adminButton.addEventListener('click', () => {
        adminModal.style.display = 'flex';
        renderAdminControls();
    });

    closeModalButton.addEventListener('click', () => {
        adminModal.style.display = 'none';
    });

    adminModal.addEventListener('click', (e) => {
        if (e.target.id === 'adminModal') {
            adminModal.style.display = 'none';
        }
    });

    function renderAdminControls() {
        adminControls.innerHTML = `
            <div class="button-group">
                <button id="add1000PointsBtn" class="main-button">1000P追加</button>
                <button id="resetPointsBtn" class="main-button">ポイントリセット</button>
            </div>
        `;
        
        document.getElementById('add1000PointsBtn').addEventListener('click', () => {
            appData.totalPoints += 1000;
            saveData();
            updatePointDisplay();
            alert('1000ポイントを追加しました！');
        });

        document.getElementById('resetPointsBtn').addEventListener('click', () => {
            if (confirm('本当にポイントをリセットしますか？')) {
                appData.totalPoints = 0;
                saveData();
                updatePointDisplay();
                alert('ポイントをリセットしました！');
            }
        });
    }
});
