export const SPRITE = "assets/textures/gunman.png";
export const FRAME_WIDTH = 32;
export const HAT_GRAVITY = 0.05;
export const BONUS_TICK_INTERVAL = 0.01;
export const BONUS_PER_TICK = 5;
export const ROUNDS_TO_MAX = 10;
export const FLASH_DURATION = 0.5;
export const FLASH_INTERVAL = 0.05;

export const animations = {
    spawn: { start: 0, frames: 3, speed: 120 },
    wait: { start: 0, frames: 1, speed: 200 },
    lose: { start: 4, frames: 3, speed: 150 },
    attack: { start: 3, frames: 1, speed: 150 },
    lose_hold: { start: 0, frames: 1, speed: 200 },
    lose_exit: { start: 0, frames: 3, speed: 120 },
    foul: { start: 0, frames: 1, speed: 200 },
    foul_hold: { start: 0, frames: 1, speed: 200 },
    foul_exit: { start: 0, frames: 3, speed: 120 },
    win: { start: 7, frames: 2, speed: 300 },
    death: { start: 7, frames: 2, speed: 300 },
    bonus: { start: 7, frames: 1, speed: 9999 },
};

export const enemies = [
    {
        name: "gunman1", startY: 0,
        size: { width: 32, height: 64 },
        hasHat: true,
        hat: { offsetX: 2, offsetY: 0, vx: -0.5, vy: -1.5 },
    },
    {
        name: "gunman2", startY: 72,
        size: { width: 32, height: 72 },
        hasHat: false, hat: null,
    },
    {
        name: "gunman3", startY: 144,
        size: { width: 32, height: 80 },
        hasHat: true,
        hat: { offsetX: 4, offsetY: -25, vx: 0.7, vy: -1.8 },
    },
    {
        name: "gunman4", startY: 224,
        size: { width: 32, height: 64 },
        hasHat: true,
        hat: { offsetX: 2, offsetY: 0, vx: -0.6, vy: -2.0 },
    },
    {
        name: "gunman5", startY: 296,
        size: { width: 32, height: 69 },
        hasHat: true,
        hat: { offsetX: 3, offsetY: 0, vx: 0.5, vy: -1.5 },
    },
];