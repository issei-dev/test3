function renderCharacters() {
        characterListContainerEl.innerHTML = '';
        
        let totalAttackPower = 0;
        appData.characters.forEach(charData => {
            const master = CHARACTER_MASTER_DATA[charData.id];
            const currentEvolution = master.evolutions[charData.evolutionIndex];
            
            const maxLevel = currentEvolution.maxLevel;
            const isMaxLevel = charData.level >= maxLevel;
            
            // 修正: 攻撃力の計算に、進化段階ごとのinitialAttackを使用する
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

        if (appData.characters.some(char => char.level >= 30)) {
            characterHintEl.textContent = '次のキャラクターを追加する準備ができました！';
        } else {
            characterHintEl.textContent = 'キャラクターを30レベルにしてみよう。';
        }
    }
