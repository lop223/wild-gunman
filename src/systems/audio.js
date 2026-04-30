export const sounds = {
    intro: new Audio("assets/sounds/intro.m4a"),
    wait: new Audio("assets/sounds/wait.m4a"),
    shot: new Audio("assets/sounds/shot.m4a"),
    shot_fall: new Audio("assets/sounds/shot_fall.m4a"),
    fire: new Audio("assets/sounds/fire.m4a"),
    win: new Audio("assets/sounds/win.m4a"),
    foul: new Audio("assets/sounds/foul.m4a"),
    death: new Audio("assets/sounds/death.m4a"),
    tick: new Audio("assets/sounds/tick.m4a"),
    winPlayed: false,
};

sounds.intro.loop = true;
sounds.wait.loop = true;

const toggle = (sound, shouldPlay) =>
    shouldPlay
        ? sound.paused && sound.play()
        : !sound.paused && (sound.pause(), (sound.currentTime = 0));

export const updateAudio = (gameState) => {
    toggle(sounds.intro, gameState === "spawn");
    toggle(sounds.wait, gameState === "wait");
};