const SPRITE = "/src/assets/textures/gunman.png";
const SCALE = 4;
const FRAME_WIDTH = 32;

const animations = {
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
	bonus: { start: 7, frames: 1, speed: 9999 }
};

const sounds = {
	intro: new Audio("/src/assets/sounds/intro.m4a"),
	wait: new Audio("/src/assets/sounds/wait.m4a"),
	shot: new Audio("/src/assets/sounds/shot.m4a"),
	shot_fall: new Audio("/src/assets/sounds/shot_fall.m4a"),
	fire: new Audio("/src/assets/sounds/fire.m4a"),
	win: new Audio("/src/assets/sounds/win.m4a"),
	foul: new Audio("/src/assets/sounds/foul.m4a"),
	death: new Audio("/src/assets/sounds/death.m4a"),
	tick: new Audio("/src/assets/sounds/tick.m4a"),
	winPlayed: false
};
sounds.intro.loop = true;
sounds.wait.loop = true;

const enemies = [
	{
		name: "gunman1",
		startY: 0,
		size: {
			width: 32,
			height: 64
		},
		hasHat: true,
		hat: { offsetX: 2, offsetY: 0, vx: -0.5, vy: -1.5 }
	},
	{
		name: "gunman2",
		startY: 72,
		size: {
			width: 32,
			height: 72
		},
		hasHat: false,
		hat: null
	},
	{
		name: "gunman3",
		startY: 144,
		size: {
			width: 32,
			height: 80
		},
		hasHat: true,
		hat: { offsetX: 4, offsetY: -25, vx: 0.7, vy: -1.8 }
	},
	{
		name: "gunman4",
		startY: 224,
		size: {
			width: 32,
			height: 64
		},
		hasHat: true,
		hat: { offsetX: 2, offsetY: 0, vx: -0.6, vy: -2.0 }
	},
	{
		name: "gunman5",
		startY: 296,
		size: {
			width: 32,
			height: 69
		},

		hasHat: true,
		hat: { offsetX: 3, offsetY: 0, vx: 0.5, vy: -1.5 }
	}
];

const game = document.querySelector(".game");

// ====== СТАН ГРИ ======
let gameState = "intro";
let gameOverTimer = 0;

let currentEnemy = null;
let waitTime = 0;
let currentFrame = 0;
let enemyX = 0;
const rect = game.getBoundingClientRect();
let targetX = 0;

let frameTimer = 0;

let enemyTime = null;
let playerTime = null;

let attackStarted = false;
let attackAnimationPlaying = false;
let playerTimer = 0;
let canShoot = false;

let loseTimer = 0;
let foulTimer = 0;

let messageContent = "/src/assets/textures/message/foul.png";

let hp = 3;
let wins = 0;
let score = 0;
let coin = 2800;

let winTimer = 0;
let restartGameTimer = 0;

let isGameRunning = false;

// Bonus
let bonusScore = 0;
let bonusTimeRemaining = 0;
let bonusTickTimer = 0;
let bonusFinished = false;
const BONUS_TICK_INTERVAL = 0.01;
const BONUS_PER_TICK = 5;

let round = 0;
const ROUNDS_TO_MAX = 10;

let flashTimer = 0;
const FLASH_DURATION = 0.5;
const FLASH_INTERVAL = 0.05;
let flashIsRed = false;
let flashTick = 0;
let flashActive = false;

let hatActive = false;
let hatX = 0;
let hatY = 0;
let hatVx = 0;
let hatVy = 0;
let hatRotation = 0;
const HAT_GRAVITY = 0.05;



// ====== DOM ======
const enemyEl = document.getElementById("enemy");
const enemyTimeEl = document.getElementById("enemy-time");
const playerTimeEl = document.getElementById("player-time");
const bgEl = document.getElementById("bg");
const hpEl = document.getElementById("hp");
const winsEl = document.getElementById("win");
const scoreEl = document.getElementById("score");
const coinEl = document.getElementById("coin");
const messageEl = document.getElementById("message");
const bonusEl = document.querySelector(".bonus");
const bonusScoreEl = document.getElementById("bonus");
const hatEl = document.getElementById("hat");

document.addEventListener("click", () => {
	if (gameState !== "intro") return; // ← додай перевірку
	sounds.intro.play();
	startGame();
}, { once: true });

enemyEl.addEventListener("click", () => {

	if (!canShoot) {
		if (gameState === "wait") {
			foul();
		}
		return;
	}

	if (playerTime !== null) return;

	playerTime = playerTimer;
	canShoot = false;

	if (playerTime < enemyTime) {
		startFlash();
		win();
	}

});

function startFlash() {
	flashActive = true;
	flashTimer = FLASH_DURATION;
	flashTick = 0;
}

// ====== ЛОГІКА ======
function getRandomEnemy() {
	return enemies[Math.floor(Math.random() * enemies.length)];
}

function getCenterX() {
	console.log(game.offsetWidth / 2);
	return game.offsetWidth / 2;
}

function formatTime(time) {
	if (time === null) return "0.00";
	return time.toFixed(2);
}

function formatLive(time) {
	if (time < 0) return "0.00";
	if (gameState === "foul_hold" || gameState === "foul_exit") {
		return "foul";
	} else if (gameState === "lose_hold" || gameState === "lose_exit") {
		return "over";
	}
	return time.toFixed(2);
}

function showMessage(flag) {
	switch (flag) {
		case "foul": {
			messageContent = "/src/assets/textures/message/foul.png";
			break;
		}
		case "lose": {
			messageContent = "/src/assets/textures/message/death.png";
			break;
		}
		default: {
			messageContent = "/src/assets/textures/message/win.png";
			break;
		}
	}
	messageEl.classList.remove("hidden");
}

function hideMessage() {
	messageEl.classList.add("hidden");
}

function hasMessage() {
	return messageEl.classList.contains("hidden");
}

function getWaitTime() {
	return Math.random() * (2 - 1.2) + 1.2;
}

function getEnemyTime() {
	const t = Math.min(round / ROUNDS_TO_MAX, 1);

	const minStart = 1.00, minEnd = 0.20;
	const maxStart = 1.30, maxEnd = 0.40;

	const min = minStart + (minEnd - minStart) * t;
	const max = maxStart + (maxEnd - maxStart) * t;

	return Math.random() * (max - min) + min;
}

function spawnHat() {
	if (!currentEnemy.hasHat || !currentEnemy.hat) return;

	const hat = currentEnemy.hat;

	// спрайт капелюха — 11й кадр (індекс 10) того ж рядка ворога
	hatEl.style.backgroundImage = `url(${SPRITE})`;
	hatEl.style.backgroundPosition = `-${10 * FRAME_WIDTH}px -${currentEnemy.startY}px`;
	hatEl.style.backgroundSize = "468px 365px";
	hatEl.style.width = currentEnemy.size.width + "px";
	hatEl.style.height = currentEnemy.size.height + "px";

	hatX = enemyX + hat.offsetX - 15;  // ← трохи лівіше
	hatY = hat.offsetY - 15;
	hatVx = hat.vx;
	hatVy = hat.vy;
	hatRotation = 0;
	hatActive = true;

	hatEl.style.display = "block";
	hatEl.classList.remove("hidden");
}

function updateHat(delta) {
	if (!hatActive) return;

	hatVy += HAT_GRAVITY;
	hatX += hatVx;
	hatY += hatVy;
	hatRotation += hatVx * 2;

	hatEl.style.left = hatX + "px";
	hatEl.style.top = hatY + "px";
	hatEl.style.transform = `rotate(${hatRotation}deg)`;

	if (hatY > game.offsetHeight + 50) {
		hatActive = false;
		hatEl.classList.add("hidden");
	}
}

function spawnEnemy() {
	setBackgroundImage();
	currentEnemy = getRandomEnemy();
	console.log("Spawn:", currentEnemy);

	gameState = "spawn";
	currentFrame = 0;
	enemyTime = getEnemyTime();
	playerTime = null;
	waitTime = getWaitTime();
	attackStarted = false;
	attackAnimationPlaying = false;

	hatActive = false;
	hatEl.classList.add("hidden");


	const gameWidth = game.offsetWidth;
	const fromLeft = Math.random() < 0.5;
	enemyX = fromLeft
		? -FRAME_WIDTH
		: gameWidth + currentEnemy.size.width;
	targetX = getCenterX();


}

// ====== АНІМАЦІЯ ======
function updateAnimation(delta) {
	frameTimer += delta;

	const anim = animations[gameState];
	if (!anim) return;

	if (frameTimer < anim.speed) return;
	if (frameTimer >= anim.speed) {
		frameTimer = 0;

		currentFrame++;

		if (
			gameState === "win" || (gameState === "lose" && attackAnimationPlaying)
		) {
			if (currentFrame >= anim.frames) {
				currentFrame = anim.frames - 1;
				if (gameState === "lose") {
					gameState = "lose_hold";
					setBackgroundImage();
					sounds.death.currentTime = 0;
					sounds.death.play();
				}
			}
		} else {
			if (currentFrame >= anim.frames) {
				currentFrame = 0;
			}
		}
	}
}

// ====== РЕНДЕР ======
function renderEnemy() {
	if (!currentEnemy) return;

	const anim = animations[gameState];

	const frameIndex = anim.start + currentFrame;

	const x = frameIndex * FRAME_WIDTH;
	const y = currentEnemy.startY;

	enemyEl.style.backgroundImage = `url(${SPRITE})`;
	enemyEl.style.backgroundPosition = `-${x}px -${y}px`;
	enemyEl.style.backgroundSize = "468px 365px";

	enemyEl.style.left = enemyX + "px";

	enemyEl.style.width = currentEnemy.size.width + "px";
	enemyEl.style.height = currentEnemy.size.height + "px";
}

function setBackgroundImage() {
	if (gameState === "intro") {
		bgEl.src = "/src/assets/textures/bg/intro.png";
	} else if (gameState === "lose_hold" || gameState === "lose_exit") {
		bgEl.src = "/src/assets/textures/bg/bg_death.png";
	} else if (gameState === "foul_hold" || gameState === "foul_exit") {
		bgEl.src = "/src/assets/textures/bg/bg_foul.png";
	} else {
		bgEl.src = "/src/assets/textures/bg/bg.png";
	}
}

function foul() {
	gameState = "foul_hold"
	damage();
	sounds.foul.play();
	showMessage("foul");
	foulTimer = 3;
	setBackgroundImage();
}

function death() {
	startFlash();
	attackAnimationPlaying = true;
	sounds.shot.currentTime = 0;
	sounds.shot.play();
	showMessage("lose");

	if (playerTime === null) {
		gameState = "lose";
		damage();
		canShoot = false;
		loseTimer = 3;
	}
}

function win() {
	gameState = "win";
	wins++;
	spawnHat();
	currentFrame = 0;
	frameTimer = 0;
	coin += getCoinReward();
	showMessage("win");
	sounds.shot_fall.play();
	winTimer = 7;
}

function damage() {
	hp--;
	if (hp <= 0) {
		hp = 0;
		gameOverTimer = 3;
		setBackgroundImage();
	}
}

function getCoinReward() {
	return 200 + round * 50;
}

function updateEnemy(delta) {

	switch (gameState) {
		case "spawn": {
			const speed = 0.6;

			const dx = targetX - enemyX;

			enemyX += Math.sign(dx) * speed;

			if (Math.abs(dx) < 2) {
				enemyX = targetX;
				gameState = "wait";
			}
			break;
		}
		case "wait": {
			waitTime -= delta / 1000;

			if (waitTime <= 0) {
				waitTime = 0;
				gameState = "attack";
			}
			break;
		}
		case "attack": {

			if (!attackStarted) {
				attackStarted = true;

				sounds.fire.currentTime = 0;
				sounds.fire.play();

				playerTimer = 0;
				canShoot = true;

				currentFrame = 0;
			}

			playerTimer += delta / 1000;

			if (playerTimer >= enemyTime && !attackAnimationPlaying) {
				death();
			}

			break;
		}
		case "lose_hold": {
			loseTimer -= delta / 1000;

			if (loseTimer <= 0) {
				gameState = "lose_exit";
			}
			break;
		}

		case "lose_exit": {
			const speed = 0.7;
			enemyX -= speed;

			if (enemyX < -32) {
				enemyX = 9999;
				restartGameTimer = 3;
			}
			break;
		}
		case "foul_hold": {
			foulTimer -= delta / 1000;

			if (foulTimer <= 0) {
				gameState = "foul_exit";
			}
			break;
		}

		case "foul_exit": {
			const speed = 0.7;
			enemyX -= speed;

			if (enemyX < -32) {
				enemyX = 9999;
				restartGameTimer = 3;
			}
			break;
		}

		case "win": {
			if (winTimer > 0) {
				winTimer -= delta / 1000;

				// запуск звуку один раз
				if (winTimer <= 4 && !sounds.winPlayed) {
					sounds.win.currentTime = 0;
					sounds.win.play();
					sounds.winPlayed = true;
				}

				if (winTimer <= 0) {
					gameState = "bonus";
					currentFrame = animations.death.frames - 1; // останній кадр death
					frameTimer = 0;
					sounds.winPlayed = false;

					// Ініціалізація бонусу
					bonusScore = 0;
					bonusTimeRemaining = enemyTime - playerTime; // залишок часу
					bonusTickTimer = 0;
					bonusFinished = false;
					hideMessage();

					bonusEl.classList.remove("hidden");
					bonusScoreEl.textContent = 0;
				}
			}
			break;
		}

		case "bonus": {
			if (bonusFinished) break;

			bonusTickTimer += delta / 1000;

			if (bonusTickTimer >= BONUS_TICK_INTERVAL) {
				bonusTickTimer = 0;

				if (bonusTimeRemaining > 0) {
					bonusTimeRemaining -= BONUS_TICK_INTERVAL;
					bonusScore += BONUS_PER_TICK;
					playerTime += BONUS_TICK_INTERVAL;
					playerTimer = playerTime;

					bonusScoreEl.textContent = Math.round(bonusScore);
					sounds.tick.play();
				} else {
					bonusFinished = true;
					score += 500;
					score += Math.round(bonusScore);

					setTimeout(() => {
						bonusEl.classList.add("hidden");
						restartGameTimer = 1.5;
					}, 800);
				}
			}

			break;
		}
	}

}

function formatScore(value) {
	return String(value).padStart(6, '0');
}

function updateUI() {
	enemyTimeEl.textContent = formatTime(enemyTime);
	playerTimeEl.textContent = formatLive(playerTimer);
	hpEl.textContent = hp;
	scoreEl.textContent = formatScore(score);
	coinEl.textContent = coin;
	winsEl.textContent = wins;
	messageEl.src = messageContent;
}

function updateAudio() {
	if (gameState === "spawn") {
		if (sounds.intro.paused) {
			sounds.intro.play();
		}
	} else {
		if (!sounds.intro.paused) {
			sounds.intro.pause();
			sounds.intro.currentTime = 0;
		}
	}

	if (gameState === "wait") {
		if (sounds.wait.paused) {
			sounds.wait.play();
		}
	} else {
		if (!sounds.wait.paused) {
			sounds.wait.pause();
			sounds.wait.currentTime = 0;
		}
	}
}

let lastTime = 0;

function gameLoop(time) {
	const delta = time - lastTime;
	lastTime = time;

	updateAnimation(delta);
	updateEnemy(delta);
	renderEnemy();
	updateHat(delta);
	updateUI();
	updateAudio();

	if (restartGameTimer > 0) {
		restartGameTimer -= delta / 1000;
		if (restartGameTimer <= 0) {
			restartGame();
		}
	}

	if (gameOverTimer > 0) {
		gameOverTimer -= delta / 1000;
		if (gameOverTimer <= 0) {
			resetToIntro();
		}
	}

	if (flashActive) {
		flashTimer -= delta / 1000;
		flashTick += delta / 1000;

		if (flashTick >= FLASH_INTERVAL) {
			flashTick = 0;
			flashIsRed = !flashIsRed;
			bgEl.src = flashIsRed
				? "/src/assets/textures/bg/bg_death.png"
				: "/src/assets/textures/bg/bg.png";
		}

		if (flashTimer <= 0) {
			flashActive = false;
			flashIsRed = false;
			setBackgroundImage();
		}
	}

	requestAnimationFrame(gameLoop);
}

function resetToIntro() {
	gameState = "intro";
	hp = 3;
	wins = 0;
	score = 0;
	coin = 0;
	round = 0;
	playerTimer = 0;
	enemyTime = null;
	canShoot = false;
	restartGameTimer = 0;
	hatActive = false;
	hatEl.classList.add("hidden");
	bonusEl.classList.add("hidden");
	hideMessage();
	enemyEl.style.left = "-9999px";
	setBackgroundImage();
}

function restartGame() {
	round++;
	playerTimer = 0;
	enemyTime = null;
	canShoot = false;
	restartGameTimer = 0;

	startGame();
	setBackgroundImage();
}

function startGame() {
	if (!isGameRunning) {
		isGameRunning = true;
		requestAnimationFrame(gameLoop);
	}

	gameState = "spawn";
	hideMessage();
	spawnEnemy();
}

setBackgroundImage();