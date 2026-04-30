import { state } from "../state.js";

const BG = {
    intro: "assets/textures/bg/intro.png",
    lose_hold: "assets/textures/bg/bg_death.png",
    lose_exit: "assets/textures/bg/bg_death.png",
    foul_hold: "assets/textures/bg/bg_foul.png",
    foul_exit: "assets/textures/bg/bg_foul.png",
};

const MSG = {
    foul: "assets/textures/message/foul.png",
    lose: "assets/textures/message/death.png",
};

export const setBackgroundImage = (bgEl, gameState) => {
    bgEl.src = BG[gameState] ?? "assets/textures/bg/bg.png";
};

export const showMessage = (flag, messageEl) => {
    state.messageContent = MSG[flag] ?? "assets/textures/message/win.png";
    messageEl.classList.remove("hidden");
};

export const hideMessage = (messageEl) => messageEl.classList.add("hidden");

// ====== Formatters ======
const formatTime = (time) => time === null ? "0.00" : time.toFixed(2);
const formatScore = (value) => String(value).padStart(6, "0");
const formatLive = (time, gameState) => {
    if (time < 0) return "0.00";
    if (gameState === "foul_hold" || gameState === "foul_exit") return "foul";
    if (gameState === "lose_hold" || gameState === "lose_exit") return "over";
    return time.toFixed(2);
};

export const updateUI = (els) => {
    const { enemyTimeEl, playerTimeEl, hpEl, scoreEl, coinEl, winsEl, messageEl } = els;
    enemyTimeEl.textContent = formatTime(state.enemyTime);
    playerTimeEl.textContent = formatLive(state.playerTimer, state.gameState);
    hpEl.textContent = state.hp;
    scoreEl.textContent = formatScore(state.score);
    coinEl.textContent = state.coin;
    winsEl.textContent = state.wins;
    messageEl.src = state.messageContent;
};