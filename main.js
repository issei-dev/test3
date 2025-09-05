document.addEventListener('DOMContentLoaded', () => {

    let appData = {
        totalPoints: 0,
        characters: [],
        stamps: {}
    };

    const CHARACTER_MASTER_DATA = {
        1: {
            // initialAttackは、evolution配列の各段階に移動します
            evolutions: [
                { name: "ひよこナイト", image: "images/hiyoko_knight.png", rank: "Normal", initialAttack: 10, maxLevel: 30 },
                { name: "にわとり騎士", image: "images/niwatori_knight.png", rank: "Rare", initialAttack: 25, maxLevel: 50 },
                { name: "イーグルライダー", image: "images/eagle_rider.png", rank: "Super Rare", initialAttack: 50, maxLevel: 75 },
            ]
        },
        2: {
            // initialAttackは、evolution配列の各段階に移動します
            evolutions: [
                { name: "みならい魔法使い", image: "images/minarai_mahoutsukai.png", rank: "Normal", initialAttack: 15, maxLevel: 30 },
                { name: "一人前の魔導士", image: "images/ichininmae_madoushi.png", rank: "Super Rare", initialAttack: 40, maxLevel: 75 },
                { name: "大賢者", image: "images/daikenja.png", rank: "Ultimate Rare", initialAttack: 80, maxLevel: 99 },
            ]
        }
    };
