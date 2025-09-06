document.addEventListener('DOMContentLoaded', () => {

    let appData = {
        totalPoints: 0,
        characters: [],
        stamps: {},
        boss: {
            currentStage: 1,
            lastAttackDate: null,
            currentHp: 0
        }
    };

    const CHARACTER_MASTER_DATA = {
        1: {
            evolutions: [
                { name: "ひよこナイト", image: "images-n001.png", rank: "Normal", initialAttack: 10, maxLevel: 30 },
                { name: "にわとり騎士", image: "images/niwatori_knight.png", rank: "Rare", initialAttack: 25, maxLevel: 50 },
                { name: "イーグルライダー", image: "images/eagle_rider.png", rank: "Super Rare", initialAttack: 50, maxLevel: 75 },
            ]
        },
        2: {
            evolutions: [
                { name: "みならい魔法使い", image: "images-sr001.png", rank: "Normal", initialAttack: 15, maxLevel: 30 },
                { name: "一人前の魔導士", image: "images/ichininmae_madoushi.png", rank: "Super Rare", initialAttack: 40, maxLevel: 75 },
                { name: "大賢者", image: "images/daikenja.png", rank: "Ultimate Rare", initialAttack: 80, maxLevel: 99 },
            ]
        },
        3: {
            evolutions: [
                { name: "ちびドラゴン", image: "images-sr003.png", rank: "Normal", initialAttack: 20, maxLevel: 30 },
                { name: "ファイヤードラゴン", image: "images/fire_dragon.png", rank: "Rare", initialAttack: 50, maxLevel: 60 },
                { name: "レジェンドドラゴン", image: "images/legend_dragon.png", rank: "Legend", initialAttack: 100, maxLevel: 99 },
            ]
        }
    };

    const BOSS_MASTER_DATA = {
        1: { name: "ゴブリン", image: "images-sr003.png", maxHp: 1000, rewardPoints: 500 },
        2: { name: "巨大スライム", image: "images/boss_slime.png", maxHp: 2500, rewardPoints: 1000 },
        3: { name: "オーガ", image: "images/boss_ogre.png", maxHp: 5000, rewardPoints: 2000 },
    };

    // DOM要素のキャッシュ
    const navLinks = document.querySelectorAll('.nav-menu a');
    const pages = document.querySelectorAll('.page');
    const totalPointsDisplay_stamp = document.getElementById('totalPointsDisplay_stamp');
    const totalPointsDisplay_characters = document.getElementById('totalPointsDisplay_characters');
    const todayDateEl = document.getElementById('todayDate');
    const stampContainerEl = document.getElementById('stampContainer');
    const stampInputEl = document.getElementById('stampInput');
    const completeStampButtonEl = document.getElementById('completeStampButton');
    const inputSectionEl = document.getElementById('inputSection');
    const stampMessageEl = document.getElementById('stampMessage');
    const characterListContainerEl = document.getElementById('characterListContainer');
    const characterHintEl = document.getElementById('characterHint');
    const totalAttackPowerEl = document.getElementById('totalAttackPower');
    const totalCharacterCountEl = document.getElementById('totalCharacterCount');
    const imageModal = document.getElementById('image-modal');
    const expandedImage = document.getElementById('expanded-image');
    const modalClose = document.getElementsByClassName('modal-close')[0];
    const currentMonthYearEl = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const calendarGridEl = document.getElementById('calendarGrid');
    let currentCalendarDate = new Date();
    
    // ボス関連の要素
    const stageNameEl = document.getElementById('stageName');
    const bossNameEl = document.getElementById('bossName');
    const bossImageEl = document.getElementById('bossImage');
    const bossCurrentHpEl = document.getElementById('bossCurrentHp');
    const bossMaxHpEl = document.getElementById('bossMaxHp');
    const healthFillEl = document.getElementById('healthFill');
    const attackButtonEl = document.getElementById('attackButton');
    const attackMessageEl = document.getElementById('attackMessage');
    const clearModalEl = document.getElementById('clear-modal');
    const clearMessageEl = document.getElementById('clearMessage');
    const clearRewardEl = document.getElementById('clearReward');
    const nextStageButtonEl = document.getElementById('nextStageButton');

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
    function showPage(pageId) {
        pages.forEach(page => page.classList.remove('active-page'));
        document.getElementById(pageId).classList.add('active-page');
        navLinks.forEach(link => link.closest('.nav-item').classList.remove('active'));
        document.querySelector(`.nav-item[data-page="${pageId}"]`).classList.add('active');
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPageId = e.target.closest('.nav-item').dataset.page;
            
            showPage(targetPageId);
            
            if (targetPageId === 'stamp') {
                initializeStampPage();
            } else if (targetPageId === 'characters') {
                initializeCharacterPage();
            } else if (targetPageId === 'boss') {
                initializeBossPage();
            } else if (targetPageId === 'calendar') {
                initializeCalendarPage();
            }
        });
    });

    // --- ページ1: スタンプ機能 ---
    function initializeStampPage() {
        const today = new Date().toISOString().split('T')[0];
        todayDateEl.textContent = today;
        updatePointDisplay();
        renderStamps();
    }

    function updatePointDisplay() {
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

        const stampEffectContainer = document.createElement('div');
        stampEffectContainer.className = 'stamp-effect-container';

        for (let i = 0; i < stampedCountToday; i++) {
            const stampIcon = document.createElement('span');
            stampIcon.className = 'stamp-icon';
            stampIcon.textContent = '✅';
            stampEffectContainer.appendChild(stampIcon);
        }

        stampContainerEl.appendChild(stampEffectContainer);

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
    function initializeCharacterPage() {
        loadData();
        const existingCharacterIds = appData.characters.map(c => c.id);
        if (appData.characters.length < 3) {
            for (let i = 1; i <= 3; i++) {
                if (!existingCharacterIds.includes(i)) {
                    appData.characters.push({
                        id: i,
                        level: 1,
                        evolutionIndex: 0
                    });
                    break;
                }
            }
        }
        saveData();
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
            
            const attackPower = currentEvolution.initialAttack * charData.level;
            totalAttackPower += attackPower;
            
            const requiredPoints = (charData.level + 1) * 10;
            const canLevelUp = appData.totalPoints >= requiredPoints && !isMaxLevel;
            
            const requiredEvolvePoints = 500;
            const canEvolve = appData.totalPoints >= requiredEvolvePoints;

            const card = document.createElement('div');
            card.className = 'card character-card';
            card.innerHTML = `
                <img src="${currentEvolution.image}" alt="${currentEvolution.name}">
                <h3>${currentEvolution.name} (Lv. ${charData.level})</h3>
                <p>ランク: ${currentEvolution.rank}</p>
                <p>攻撃力: ${attackPower}</p>
                ${!isMaxLevel ? `<p>次のレベルまで: ${requiredPoints} P</p>` : `<p>この形態は最大レベルです！</p>`}
                
                ${isMaxLevel && master.evolutions[charData.evolutionIndex + 1]
                    ? `<button class="evolve-button" data-character-id="${charData.id}" ${canEvolve ? '' : 'disabled'}>進化する！(${requiredEvolvePoints}P)</button>`
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
        
        document.querySelectorAll('.character-card img').forEach(image => {
            image.addEventListener('click', handleImageClick);
        });

        if (appData.characters.length < 3) {
            characterHintEl.textContent = 'キャラクターを30レベルにすると、新しいキャラクターが追加できます！';
        } else {
            characterHintEl.textContent = 'すべてのキャラクターが揃っています！';
        }
    }

    function handleImageClick(event) {
        expandedImage.src = event.target.src;
        imageModal.style.display = 'flex';
    }

    modalClose.onclick = () => {
        imageModal.style.display = 'none';
    }

    imageModal.onclick = (event) => {
        if (event.target === imageModal) {
            imageModal.style.display = 'none';
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
        
        const requiredEvolvePoints = 500;
        if (appData.totalPoints < requiredEvolvePoints) {
            alert('進化に必要なポイントが足りません！');
            return;
        }

        const master = CHARACTER_MASTER_DATA[characterToUpdate.id];
        const nextEvolutionIndex = characterToUpdate.evolutionIndex + 1;
        
        if (master.evolutions[nextEvolutionIndex]) {
            appData.totalPoints -= requiredEvolvePoints;
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

    // --- ページ3: ボス機能 ---
    function initializeBossPage() {
        loadData();
        const currentBossData = BOSS_MASTER_DATA[appData.boss.currentStage];
        if (!currentBossData) {
            // 全ボスを倒した場合の処理
            bossImageEl.src = '';
            stageNameEl.textContent = '全ステージクリア！';
            bossNameEl.textContent = '新しいボスを待て！';
            attackButtonEl.disabled = true;
            attackButtonEl.textContent = '完了';
            attackMessageEl.textContent = 'おめでとうございます！すべてのボスを撃破しました！';
            healthFillEl.style.width = '0%';
            bossCurrentHpEl.textContent = '0';
            bossMaxHpEl.textContent = '0';
            return;
        }

        // データの初期化
        if (appData.boss.currentHp === 0 && appData.boss.currentStage > 0) {
            appData.boss.currentHp = currentBossData.maxHp;
            saveData();
        }

        renderBossStatus();
        checkAttackButtonState();
    }

    function renderBossStatus() {
        const currentBossData = BOSS_MASTER_DATA[appData.boss.currentStage];
        if (!currentBossData) return;
        
        stageNameEl.textContent = `ステージ ${appData.boss.currentStage}`;
        bossNameEl.textContent = `ボス: ${currentBossData.name}`;
        bossImageEl.src = currentBossData.image;
        bossMaxHpEl.textContent = currentBossData.maxHp;
        bossCurrentHpEl.textContent = appData.boss.currentHp;
        const hpPercentage = (appData.boss.currentHp / currentBossData.maxHp) * 100;
        healthFillEl.style.width = `${hpPercentage}%`;
    }

    function calculateTotalAttackPower() {
        let totalAttack = 0;
        appData.characters.forEach(charData => {
            const master = CHARACTER_MASTER_DATA[charData.id];
            const currentEvolution = master.evolutions[charData.evolutionIndex];
            totalAttack += currentEvolution.initialAttack * charData.level;
        });
        return totalAttack;
    }

    function checkAttackButtonState() {
        const today = new Date().toISOString().split('T')[0];
        if (appData.boss.lastAttackDate === today) {
            attackButtonEl.disabled = true;
            attackButtonEl.textContent = '今日の攻撃は終了しました';
            attackMessageEl.textContent = '次の攻撃は明日になります。';
        } else {
            attackButtonEl.disabled = false;
            attackButtonEl.textContent = '攻撃！';
            attackMessageEl.textContent = '1日1回攻撃できます！';
        }
    }
    
    attackButtonEl.addEventListener('click', () => {
        const totalAttack = calculateTotalAttackPower();
        const currentBossData = BOSS_MASTER_DATA[appData.boss.currentStage];
        
        // ボス画像の揺れアニメーション
        bossImageEl.classList.add('shake');
        
        // ダメージ計算
        appData.boss.currentHp -= totalAttack;
        if (appData.boss.currentHp < 0) {
            appData.boss.currentHp = 0;
        }
        
        // 最終攻撃日の記録
        const today = new Date().toISOString().split('T')[0];
        appData.boss.lastAttackDate = today;

        // データ保存とUI更新
        saveData();
        renderBossStatus();
        checkAttackButtonState();

        attackMessageEl.textContent = `${totalAttack}のダメージを与えた！`;

        // アニメーション終了後にクラスを削除
        bossImageEl.addEventListener('animationend', () => {
            bossImageEl.classList.remove('shake');
        }, { once: true });

        // HPが0になったかチェック
        if (appData.boss.currentHp <= 0) {
            setTimeout(() => {
                showClearModal(currentBossData.rewardPoints);
            }, 500);
        }
    });

    function showClearModal(reward) {
        appData.totalPoints += reward;
        saveData();
        updatePointDisplay();
        clearMessageEl.textContent = 'ステージクリア！🎉';
        clearRewardEl.textContent = `${reward}Pを獲得しました！`;
        clearModalEl.style.display = 'flex';
    }

    nextStageButtonEl.addEventListener('click', () => {
        appData.boss.currentStage++;
        appData.boss.currentHp = 0; // 次のステージのHPが初期化されるように設定
        saveData();
        clearModalEl.style.display = 'none';
        initializeBossPage();
    });

    // --- ページ4: カレンダー機能 ---
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
    showPage('stamp');
});
