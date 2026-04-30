import { state } from "./state.js";
import {
	animations, enemies,
	FRAME_WIDTH, SPRITE,
	BONUS_TICK_INTERVAL, BONUS_PER_TICK,
	ROUNDS_TO_MAX, FLASH_DURATION,
} from "./config.js";
import { sounds, updateAudio } from "./systems/audio.js";
import { startFlash, updateFlash } from "./systems/flash.js";
import { spawnHat, updateHat } from "./systems/hat.js";
import { setBackgroundImage, showMessage, hideMessage, updateUI } from "./systems/ui.js";

// ====== DOM ======
const game = document.querySelector(".game");
const enemyEl = document.getElementById("enemy");
const hatEl = document.getElementById("hat");
const bgEl = document.getElementById("bg");
const messageEl = document.getElementById("message");
const bonusEl = document.querySelector(".bonus");
const bonusScoreEl = document.getElementById("bonus-score"); // окремий id, не конфліктує

const els = {
	enemyTimeEl: document.getElementById("enemy-time"),
	playerTimeEl: document.getElementById("player-time"),
	hpEl: document.getElementById("hp"),
	winsEl: document.getElementById("win"),
	scoreEl: document.getElementById("score"),
	coinEl: document.getElementById("coin"),
	messageEl,
};

// ====== Init ======
setBackgroundImage(bgEl, state.gameState);

// ====== Events ======
document.addEventListener("click", () => {
	if (state.gameState !== "intro") return;
	sounds.intro.play();
	startGame();
}, { once: true });

enemyEl.addEventListener("click", () => {
	if (!state.canShoot) {
		if (state.gameState === "wait") foul();
		return;
	}
	if (state.playerTime !== null) return;

	state.playerTime = state.playerTimer;
	state.canShoot = false;

	if (state.playerTime < state.enemyTime) {
		startFlash();
		win();
	}
});

// ====== Utils ======
const lerp = (a, b, t) => a + (b - a) * t;
const getRandomEnemy = () => enemies[Math.floor(Math.random() * enemies.length)];
const getCenterX = () => game.offsetWidth / 2;
const getWaitTime = () => Math.random() * 0.8 + 1.2;
const getCoinReward = () => 200 + state.round * 50;
const getEnemyTime = () => {
	const t = Math.min(state.round / ROUNDS_TO_MAX, 1);
	const min = lerp(1.00, 0.20, t);
	const max = lerp(1.30, 0.40, t);
	return Math.random() * (max - min) + min;
};

// ====== Game Logic ======
function damage() {
	state.hp--;
	if (state.hp <= 0) {
		state.hp = 0;
		state.gameOverTimer = 3;
		setBackgroundImage(bgEl, state.gameState);
	}
}

function foul() {
	state.gameState = "foul_hold";
	state.foulTimer = 3;
	damage();
	sounds.foul.play();
	showMessage("foul", messageEl);
	setBackgroundImage(bgEl, state.gameState);
}

function death() {
	startFlash();
	state.attackAnimationPlaying = true;
	sounds.shot.currentTime = 0;
	sounds.shot.play();
	showMessage("lose", messageEl);

	if (state.playerTime === null) {
		state.gameState = "lose";
		damage();
		state.canShoot = false;
		state.loseTimer = 3;
	}
}

function win() {
	state.gameState = "win";
	state.wins++;
	state.coin += getCoinReward();
	state.currentFrame = 0;
	state.frameTimer = 0;
	state.winTimer = 7;
	spawnHat(hatEl, game);
	showMessage("win", messageEl);
	sounds.shot_fall.play();
}

function spawnEnemy() {
	state.currentEnemy = getRandomEnemy();
	state.gameState = "spawn";
	state.currentFrame = 0;
	state.enemyTime = getEnemyTime();
	state.playerTime = null;
	state.waitTime = getWaitTime();
	state.attackStarted = false;
	state.attackAnimationPlaying = false;
	state.hatActive = false;
	hatEl.classList.add("hidden");

	const fromLeft = Math.random() < 0.5;
	state.enemyX = fromLeft
		? -FRAME_WIDTH
		: game.offsetWidth + state.currentEnemy.size.width;
	state.targetX = getCenterX();
	setBackgroundImage(bgEl, state.gameState);
}

// ====== Animation ======
function updateAnimation(delta) {
	const anim = animations[state.gameState];
	if (!anim) return;

	state.frameTimer += delta;
	if (state.frameTimer < anim.speed) return;
	state.frameTimer = 0;
	state.currentFrame++;

	const freeze = state.gameState === "win" ||
		(state.gameState === "lose" && state.attackAnimationPlaying);

	if (freeze) {
		if (state.currentFrame >= anim.frames) {
			state.currentFrame = anim.frames - 1;
			if (state.gameState === "lose") {
				state.gameState = "lose_hold";
				setBackgroundImage(bgEl, state.gameState);
				sounds.death.currentTime = 0;
				sounds.death.play();
			}
		}
	} else {
		if (state.currentFrame >= anim.frames) state.currentFrame = 0;
	}
}

// ====== Render ======
function renderEnemy() {
	if (!state.currentEnemy) return;
	const anim = animations[state.gameState];
	if (!anim) return;

	const x = (anim.start + state.currentFrame) * FRAME_WIDTH;
	const y = state.currentEnemy.startY;

	enemyEl.style.backgroundImage = `url(${SPRITE})`;
	enemyEl.style.backgroundPosition = `-${x}px -${y}px`;
	enemyEl.style.backgroundSize = "468px 365px";
	enemyEl.style.left = state.enemyX + "px";
	enemyEl.style.width = state.currentEnemy.size.width + "px";
	enemyEl.style.height = state.currentEnemy.size.height + "px";
}

// ====== Update ======
function updateEnemy(delta) {
	switch (state.gameState) {
		case "spawn": {
			const dx = state.targetX - state.enemyX;
			state.enemyX += Math.sign(dx) * 0.6;
			if (Math.abs(dx) < 2) {
				state.enemyX = state.targetX;
				state.gameState = "wait";
			}
			break;
		}
		case "wait": {
			state.waitTime -= delta / 1000;
			if (state.waitTime <= 0) state.gameState = "attack";
			break;
		}
		case "attack": {
			if (!state.attackStarted) {
				state.attackStarted = true;
				state.playerTimer = 0;
				state.canShoot = true;
				state.currentFrame = 0;
				sounds.fire.currentTime = 0;
				sounds.fire.play();
			}
			state.playerTimer += delta / 1000;
			if (state.playerTimer >= state.enemyTime && !state.attackAnimationPlaying) death();
			break;
		}
		case "lose_hold": {
			state.loseTimer -= delta / 1000;
			if (state.loseTimer <= 0) state.gameState = "lose_exit";
			break;
		}
		case "lose_exit":
		case "foul_exit": {
			state.enemyX -= 0.7;
			if (state.enemyX < -32) {
				state.enemyX = 9999;
				state.restartGameTimer = 3;
			}
			break;
		}
		case "foul_hold": {
			state.foulTimer -= delta / 1000;
			if (state.foulTimer <= 0) state.gameState = "foul_exit";
			break;
		}
		case "win": {
			state.winTimer -= delta / 1000;
			if (state.winTimer <= 4 && !sounds.winPlayed) {
				sounds.win.currentTime = 0;
				sounds.win.play();
				sounds.winPlayed = true;
			}
			if (state.winTimer <= 0) {
				Object.assign(state, {
					gameState: "bonus",
					currentFrame: animations.death.frames - 1,
					frameTimer: 0,
					bonusScore: 0,
					bonusTimeRemaining: state.enemyTime - state.playerTime,
					bonusTickTimer: 0,
					bonusFinished: false,
				});
				sounds.winPlayed = false;
				hideMessage(messageEl);
				bonusEl.classList.remove("hidden");
				bonusScoreEl.textContent = 0;
			}
			break;
		}
		case "bonus": {
			if (state.bonusFinished) break;
			state.bonusTickTimer += delta / 1000;
			if (state.bonusTickTimer < BONUS_TICK_INTERVAL) break;
			state.bonusTickTimer = 0;

			if (state.bonusTimeRemaining > 0) {
				state.bonusTimeRemaining -= BONUS_TICK_INTERVAL;
				state.bonusScore += BONUS_PER_TICK;
				state.playerTime += BONUS_TICK_INTERVAL;
				state.playerTimer = state.playerTime;
				bonusScoreEl.textContent = Math.round(state.bonusScore);
				sounds.tick.play();
			} else {
				state.bonusFinished = true;
				state.score += 500 + Math.round(state.bonusScore);
				setTimeout(() => {
					bonusEl.classList.add("hidden");
					state.restartGameTimer = 1.5;
				}, 800);
			}
			break;
		}
	}
}

// ====== Game Flow ======
function startGame() {
	if (!state.isGameRunning) {
		state.isGameRunning = true;
		requestAnimationFrame(gameLoop);
	}
	state.gameState = "spawn";
	hideMessage(messageEl);
	spawnEnemy();
}

function restartGame() {
	state.round++;
	state.playerTimer = 0;
	state.enemyTime = null;
	state.canShoot = false;
	state.restartGameTimer = 0;
	startGame();
	setBackgroundImage(bgEl, state.gameState);
}

function resetToIntro() {
	Object.assign(state, {
		gameState: "intro",
		hp: 3, wins: 0, score: 0, coin: 0, round: 0,
		playerTimer: 0, enemyTime: null,
		canShoot: false, restartGameTimer: 0,
		hatActive: false,
	});
	hatEl.classList.add("hidden");
	bonusEl.classList.add("hidden");
	hideMessage(messageEl);
	enemyEl.style.left = "-9999px";
	setBackgroundImage(bgEl, state.gameState);
}

// ====== Game Loop ======
function gameLoop(time) {
	const delta = time - state.lastTime;
	state.lastTime = time;

	updateAnimation(delta);
	updateEnemy(delta);
	renderEnemy();
	updateHat(hatEl, game);
	updateFlash(delta, bgEl);
	updateUI(els);
	updateAudio(state.gameState);

	if (state.restartGameTimer > 0) {
		state.restartGameTimer -= delta / 1000;
		if (state.restartGameTimer <= 0) restartGame();
	}

	if (state.gameOverTimer > 0) {
		state.gameOverTimer -= delta / 1000;
		if (state.gameOverTimer <= 0) resetToIntro();
	}

	requestAnimationFrame(gameLoop);
}