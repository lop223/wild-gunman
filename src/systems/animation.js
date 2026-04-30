import { animations } from "../config.js";

export const updateAnimationState = (state, delta) => {
    const anim = animations[state.gameState];
    if (!anim) return state;

    const frameTimer = state.frameTimer + delta;
    if (frameTimer < anim.speed) return { ...state, frameTimer };

    const nextFrame = state.currentFrame + 1;
    const freeze    = state.gameState === "win" ||
                     (state.gameState === "lose" && state.attackAnimationPlaying);

    if (freeze) {
        if (nextFrame >= anim.frames) {
            const isLose = state.gameState === "lose";
            return {
                ...state,
                frameTimer: 0,
                currentFrame: anim.frames - 1,
                ...(isLose && { gameState: "lose_hold" }),
            };
        }
    }

    return {
        ...state,
        frameTimer: 0,
        currentFrame: nextFrame >= anim.frames ? 0 : nextFrame,
    };
};