import { state } from "../state.js";
import { FLASH_INTERVAL, FLASH_DURATION } from "../config.js";
import { setBackgroundImage } from "./ui.js";

export const startFlash = () => {
    state.flashActive = true;
    state.flashTimer = FLASH_DURATION;
    state.flashTick = 0;
};

export const updateFlash = (delta, bgEl) => {
    if (!state.flashActive) return;

    state.flashTimer -= delta / 1000;
    state.flashTick += delta / 1000;

    if (state.flashTick >= FLASH_INTERVAL) {
        state.flashTick = 0;
        state.flashIsRed = !state.flashIsRed;
        bgEl.src = state.flashIsRed
            ? "assets/textures/bg/bg_death.png"
            : "assets/textures/bg/bg.png";
    }

    if (state.flashTimer <= 0) {
        state.flashActive = false;
        state.flashIsRed = false;
        setBackgroundImage(bgEl, state.gameState);
    }
};