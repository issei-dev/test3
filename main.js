document.addEventListener('DOMContentLoaded', () => {

    // --- アプリケーションデータの管理 ---
    let appData = {
        totalPoints: 0,
        characters: [],
        stamps: {}
    };

    const CHARACTER_MASTER_DATA = {
        1: {
            initialAttack: 10,
            evolutions: [
                { name: "コドラゴン", image: "images-n001.png", rank: "Normal" },
                { name: "トゥントゥントゥン サ フール", image: "images/niwatori_knight.png", rank: "Rare" },
                { name: "見習い騎士", image: "images/eagle_rider.png", rank: "Normal" },
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
            
            // すべてのページを非表示にし、アクティブクラスを削除
            pages.forEach(page => page.classList.remove('active-page'));
            navLinks.forEach(nav => nav.classList.remove('active'));

            // 対象ページとナビゲーションを表示/アクティブ化
            document.getElementById(targetPageId).classList.add('active-page');
            e.target.closest('.nav-item').classList.add('active');

            // ページが切り替わったときに各ページを初期化
            if (targetPageId === 'stamp') {
                initializeStampPage();
            } else if (targetPageId === 'characters') {
                initializeCharacterPage();
            } else if (targetPageId === 'calendar') {
                renderCalendar(new Date());
            }
        });
    });

    // --- ページ1: スタンプ機能 ---
    const todayDateEl = document.getElementById('todayDate');
    const totalPointsDisplay_stamp = document.getElementById('totalPointsDisplay_stamp');
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
        totalPointsDisplay_stamp.textContent = appData.totalPoints;
        totalPointsDisplay_characters.textContent = appData.totalPoints;
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
    const totalPointsDisplay_characters = document.getElementById('totalPointsDisplay_characters');
    const characterListContainerEl = document.getElementById('characterListContainer');
    const characterHintEl = document.getElementById('characterHint');

    function initializeCharacterPage() {
        if (appData.characters.length === 0) {
            appData.characters.push({
                id: 1,
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
        appData.characters.forEach(charData => {
            const master = CHARACTER_MASTER_DATA[charData.id];
            const currentEvolution = master.evolutions[charData.evolutionIndex];
            
            const requiredPoints = (charData.level + 1) * 10;
            const canLevelUp = appData.totalPoints >= requiredPoints && charData.level < 99;
            const attackPower = master.initialAttack * charData.level;

            const card = document.createElement('div');
            card.className = 'card character-card';
            card.innerHTML = `
                <img src="${currentEvolution.image}" alt="${currentEvolution.name}">
                <h3>${currentEvolution.name} (Lv. ${charData.level})</h3>
                <p>ランク: ${currentEvolution.rank}</p>
                <p>攻撃力: ${attackPower}</p>
                <p>次のレベルまで: ${requiredPoints} P</p>
                <button class="level-up-button" data-character-id="${charData.id}" ${canLevelUp ? '' : 'disabled'}>
                    レベルアップ！
                </button>
            `;
            characterListContainerEl.appendChild(card);
            
            if (charData.level >= 30) {
                characterHintEl.textContent = '次のキャラクターを追加する準備ができました！';
            }
        });
        
        document.querySelectorAll('.level-up-button').forEach(button => {
            button.addEventListener('click', handleLevelUpClick);
        });
    }

    function handleLevelUpClick(event) {
        const charId = parseInt(event.target.dataset.characterId, 10);
        const characterToUpdate = appData.characters.find(c => c.id === charId);
        
        const requiredPoints = (characterToUpdate.level + 1) * 10;
        
        if (appData.totalPoints >= requiredPoints) {
            appData.totalPoints -= requiredPoints;
            characterToUpdate.level++;
            
            const master = CHARACTER_MASTER_DATA[characterToUpdate.id];
            if (master.evolutions[characterToUpdate.evolutionIndex + 1] && characterToUpdate.level % 10 === 0) {
                characterToUpdate.evolutionIndex++;
                alert('おめでとう！キャラクターが進化したよ！');
            }
            
            saveData();
            updatePointDisplay();
            renderCharacters();
        } else {
            alert('ポイントが足りません！');
        }
    }

    // --- ページ3: カレンダー機能 ---
    const currentMonthYearEl = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const calendarGridEl = document.getElementById('calendarGrid');

    let currentCalendarDate = new Date();

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
});
