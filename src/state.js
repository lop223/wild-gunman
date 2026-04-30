export const state = {
    // Game
    gameState: "intro",
    isGameRunning: false,
    lastTime: 0,
    round: 0,

    // Player
    hp: 3,
    wins: 0,
    score: 0,
    coin: 2800,
    playerTime: null,
    playerTimer: 0,
    canShoot: false,

    // Enemy
    currentEnemy: null,
    enemyX: 0,
    targetX: 0,
    enemyTime: null,
    waitTime: 0,
    attackStarted: false,
    attackAnimationPlaying: false,

    // Animation
    currentFrame: 0,
    frameTimer: 0,

    // Timers
    winTimer: 0,
    loseTimer: 0,
    foulTimer: 0,
    gameOverTimer: 0,
    restartGameTimer: 0,

    // Bonus
    bonusScore: 0,
    bonusTimeRemaining: 0,
    bonusTickTimer: 0,
    bonusFinished: false,

    // Flash
    flashActive: false,
    flashTimer: 0,
    flashTick: 0,
    flashIsRed: false,

    // Hat
    hatActive: false,
    hatX: 0, hatY: 0,
    hatVx: 0, hatVy: 0,
    hatRotation: 0,

    // UI
    messageContent: "assets/textures/message/foul.png",
};