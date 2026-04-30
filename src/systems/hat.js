import { state } from "../state.js";
import { SPRITE, FRAME_WIDTH, HAT_GRAVITY } from "../config.js";

export const spawnHat = (hatEl, game) => {
    const { currentEnemy, enemyX } = state;
    if (!currentEnemy.hasHat || !currentEnemy.hat) return;

    const hat = currentEnemy.hat;
    hatEl.style.backgroundImage = `url(${SPRITE})`;
    hatEl.style.backgroundPosition = `-${10 * FRAME_WIDTH}px -${currentEnemy.startY}px`;
    hatEl.style.backgroundSize = "468px 365px";
    hatEl.style.width = currentEnemy.size.width + "px";
    hatEl.style.height = currentEnemy.size.height + "px";

    state.hatX = enemyX + hat.offsetX - 15;
    state.hatY = hat.offsetY - 15;
    state.hatVx = hat.vx;
    state.hatVy = hat.vy;
    state.hatRotation = 0;
    state.hatActive = true;
    hatEl.classList.remove("hidden");
};

export const updateHat = (hatEl, game) => {
    if (!state.hatActive) return;

    state.hatVy += HAT_GRAVITY;
    state.hatX += state.hatVx;
    state.hatY += state.hatVy;
    state.hatRotation += state.hatVx * 2;

    hatEl.style.left = state.hatX + "px";
    hatEl.style.top = state.hatY + "px";
    hatEl.style.transform = `rotate(${state.hatRotation}deg)`;

    if (state.hatY > game.offsetHeight + 50) {
        state.hatActive = false;
        hatEl.classList.add("hidden");
    }
};