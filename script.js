// 게임 화면 설정값
const CONFIG = {
	canvas: {
		width: 800,
		height: 600,
	},
};

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// 장애물의 위치, 모양과 속도
const obstacles = [
	{ x: Math.random() * (canvas.width - 38), y: -40, width: 38, height: 54, speed: 3.5, type: "fork" },
	{ x: Math.random() * (canvas.width - 38), y: -140, width: 38, height: 54, speed: 4, type: "knife" },
	{ x: Math.random() * (canvas.width - 38), y: -240, width: 38, height: 54, speed: 4.5, type: "fork" },
	{ x: Math.random() * (canvas.width - 38), y: -340, width: 38, height: 54, speed: 5, type: "knife" },
	{ x: Math.random() * (canvas.width - 38), y: -440, width: 38, height: 54, speed: 3.8, type: "fork" },
	{ x: Math.random() * (canvas.width - 38), y: -540, width: 38, height: 54, speed: 4.8, type: "knife" },
	{ x: Math.random() * (canvas.width - 38), y: -640, width: 38, height: 54, speed: 5.2, type: "fork" },
];
let obstacleSpeedMultiplier = 1;
let previousFrameTime = null;
const MAX_OBSTACLE_SPEED_MULTIPLIER = 2;

// 쿠키 캐릭터의 위치와 크기
const player = {
	x: (canvas.width - 48) / 2,
	y: canvas.height - 78,
	width: 48,
	height: 52,
};
let lives = 3;
const MAX_LIVES = 3;
let invulnerabilityFrames = 0;
let gameOver = false;
let score = 0;

// 점수 아이템과 회복 아이템의 위치와 하강 속도
const scoreItems = [
	{ x: 120, y: -80, width: 28, height: 28, speed: 2.8 },
	{ x: 430, y: -300, width: 28, height: 28, speed: 3.2 },
	{ x: 680, y: -520, width: 28, height: 28, speed: 3 },
];
const healthItem = {
	x: 560,
	y: -220,
	width: 30,
	height: 30,
	speed: 2.6,
};
const scoreEffects = [];
const restartButton = {
	x: (canvas.width - 200) / 2,
	y: 350,
	width: 200,
	height: 58,
};

// 마우스 위치에 맞춰 캐릭터를 화면 아래에서 좌우로 움직입니다.
canvas.addEventListener("mousemove", (event) => {
	const bounds = canvas.getBoundingClientRect();
	const mouseX = (event.clientX - bounds.left) * (canvas.width / bounds.width);
	player.x = Math.max(0, Math.min(canvas.width - player.width, mouseX - player.width / 2));
});

// 게임 오버 화면의 다시 시작 버튼을 클릭하면 게임 상태를 초기화합니다.
canvas.addEventListener("click", (event) => {
	if (!gameOver) {
		return;
	}

	const bounds = canvas.getBoundingClientRect();
	const clickX = (event.clientX - bounds.left) * (canvas.width / bounds.width);
	const clickY = (event.clientY - bounds.top) * (canvas.height / bounds.height);
	const clickedRestart =
		clickX >= restartButton.x &&
		clickX <= restartButton.x + restartButton.width &&
		clickY >= restartButton.y &&
		clickY <= restartButton.y + restartButton.height;

	if (clickedRestart) {
		restartGame();
	}
});

function restartGame() {
	lives = MAX_LIVES;
	score = 0;
	invulnerabilityFrames = 0;
	obstacleSpeedMultiplier = 1;
	previousFrameTime = null;
	gameOver = false;
	player.x = (canvas.width - player.width) / 2;
	scoreEffects.length = 0;

	obstacles.forEach((obstacle, index) => {
		obstacle.x = Math.random() * (canvas.width - obstacle.width);
		obstacle.y = -40 - index * 100;
		obstacle.type = Math.random() < 0.5 ? "fork" : "knife";
	});
	scoreItems.forEach((item, index) => {
		item.x = Math.random() * (canvas.width - item.width);
		item.y = -80 - index * 220;
	});
	healthItem.x = Math.random() * (canvas.width - healthItem.width);
	healthItem.y = -220;
}

// 따뜻한 빛과 철제 선반이 있는 오븐 내부를 그립니다.
function drawScene() {
	ctx.fillStyle = "#17232b";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const ovenGlow = ctx.createLinearGradient(0, 30, 0, 570);
	ovenGlow.addColorStop(0, "#542c2c");
	ovenGlow.addColorStop(0.48, "#a84827");
	ovenGlow.addColorStop(1, "#f29b3d");
	ctx.fillStyle = ovenGlow;
	ctx.fillRect(34, 32, 732, 520);

	// 오븐 벽의 은은한 열기 무늬를 그립니다.
	for (let row = 0; row < 6; row += 1) {
		for (let column = 0; column < 8; column += 1) {
			const tileX = 48 + column * 92 + (row % 2) * 24;
			const tileY = 72 + row * 72;
			ctx.fillStyle = (row + column) % 2 === 0
				? "rgba(255, 190, 105, 0.08)"
				: "rgba(70, 25, 24, 0.1)";
			ctx.fillRect(tileX, tileY, 68, 42);
		}
	}

	// 철제 선반과 오븐 가장자리를 그립니다.
	ctx.strokeStyle = "rgba(255, 220, 170, 0.42)";
	ctx.lineWidth = 5;
	[150, 270, 390, 510].forEach((shelfY) => {
		ctx.beginPath();
		ctx.moveTo(56, shelfY);
		ctx.lineTo(744, shelfY);
		ctx.stroke();
	});
	ctx.strokeStyle = "#b7c1c4";
	ctx.lineWidth = 12;
	ctx.strokeRect(28, 26, 744, 532);
	ctx.fillStyle = "#829095";
	[48, 752].forEach((boltX) => {
		[48, 542].forEach((boltY) => {
			ctx.beginPath();
			ctx.arc(boltX, boltY, 5, 0, Math.PI * 2);
			ctx.fill();
		});
	});

	// 오븐 하단의 불빛을 표현합니다.
	const fireGlow = ctx.createLinearGradient(0, 480, 0, 600);
	fireGlow.addColorStop(0, "rgba(255, 190, 45, 0)");
	fireGlow.addColorStop(1, "rgba(255, 95, 20, 0.72)");
	ctx.fillStyle = fireGlow;
	ctx.fillRect(36, 470, 728, 100);
}

// 무적 시간 동안 깜빡이는 쿠키 캐릭터를 그립니다.
function drawPlayer() {
	if (invulnerabilityFrames > 0 && Math.floor(invulnerabilityFrames / 8) % 2 === 0) {
		return;
	}

	const centerX = player.x + player.width / 2;
	ctx.fillStyle = "#d98b3a";
	ctx.strokeStyle = "#75401f";
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.ellipse(centerX, player.y + 24, 21, 23, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();

	// 초콜릿 칩과 표정을 그립니다.
	ctx.fillStyle = "#63351f";
	[
		[centerX - 11, player.y + 14, 3],
		[centerX + 12, player.y + 20, 3.5],
		[centerX - 8, player.y + 33, 2.5],
		[centerX + 7, player.y + 38, 3],
	].forEach(([chipX, chipY, radius]) => {
		ctx.beginPath();
		ctx.arc(chipX, chipY, radius, 0, Math.PI * 2);
		ctx.fill();
	});
	ctx.fillStyle = "#35251e";
	ctx.beginPath();
	ctx.arc(centerX - 6, player.y + 22, 2, 0, Math.PI * 2);
	ctx.arc(centerX + 6, player.y + 22, 2, 0, Math.PI * 2);
	ctx.fill();
	ctx.strokeStyle = "#35251e";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.arc(centerX, player.y + 26, 5, 0.15, Math.PI - 0.15);
	ctx.stroke();

	// 팔과 다리를 그립니다.
	ctx.strokeStyle = "#75401f";
	ctx.lineWidth = 4;
	ctx.beginPath();
	ctx.moveTo(centerX - 18, player.y + 29);
	ctx.lineTo(centerX - 23, player.y + 36);
	ctx.moveTo(centerX + 18, player.y + 29);
	ctx.lineTo(centerX + 23, player.y + 36);
	ctx.moveTo(centerX - 8, player.y + 44);
	ctx.lineTo(centerX - 10, player.y + 50);
	ctx.moveTo(centerX + 8, player.y + 44);
	ctx.lineTo(centerX + 10, player.y + 50);
	ctx.stroke();
}

// 포크와 나이프를 오븐에서 떨어지는 장애물로 그립니다.
function drawObstacle(obstacle) {
	const centerX = obstacle.x + obstacle.width / 2;
	ctx.save();
	ctx.lineCap = "round";
	ctx.lineJoin = "round";

	// 장애물 뒤에 속도감 있는 빛의 궤적을 그립니다.
	const trailLength = 28 + obstacle.speed * obstacleSpeedMultiplier * 7;
	const trail = ctx.createLinearGradient(0, obstacle.y - trailLength, 0, obstacle.y + 8);
	trail.addColorStop(0, "rgba(255, 225, 175, 0)");
	trail.addColorStop(1, obstacle.type === "fork"
		? "rgba(210, 235, 255, 0.18)"
		: "rgba(255, 205, 145, 0.18)");
	ctx.strokeStyle = trail;
	ctx.lineWidth = 6;
	ctx.beginPath();
	ctx.moveTo(centerX, obstacle.y - trailLength);
	ctx.lineTo(centerX, obstacle.y + 8);
	ctx.stroke();
	ctx.strokeStyle = "rgba(255, 245, 220, 0.18)";
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(centerX - 11, obstacle.y - trailLength * 0.72);
	ctx.lineTo(centerX - 11, obstacle.y + 1);
	ctx.moveTo(centerX + 11, obstacle.y - trailLength * 0.52);
	ctx.lineTo(centerX + 11, obstacle.y + 1);
	ctx.stroke();

	if (obstacle.type === "fork") {
		ctx.strokeStyle = "#dce5e8";
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(centerX - 8, obstacle.y + 2);
		ctx.lineTo(centerX - 8, obstacle.y + 17);
		ctx.moveTo(centerX - 3, obstacle.y + 1);
		ctx.lineTo(centerX - 3, obstacle.y + 17);
		ctx.moveTo(centerX + 3, obstacle.y + 1);
		ctx.lineTo(centerX + 3, obstacle.y + 17);
		ctx.moveTo(centerX + 8, obstacle.y + 2);
		ctx.lineTo(centerX + 8, obstacle.y + 17);
		ctx.moveTo(centerX - 8, obstacle.y + 15);
		ctx.quadraticCurveTo(centerX, obstacle.y + 25, centerX + 8, obstacle.y + 15);
		ctx.moveTo(centerX, obstacle.y + 22);
		ctx.lineTo(centerX, obstacle.y + 50);
		ctx.stroke();
		ctx.strokeStyle = "#82949a";
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.moveTo(centerX + 3, obstacle.y + 25);
		ctx.lineTo(centerX + 3, obstacle.y + 47);
		ctx.stroke();
	} else {
		ctx.fillStyle = "#e5ecee";
		ctx.strokeStyle = "#788a90";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(centerX - 2, obstacle.y + 2);
		ctx.quadraticCurveTo(centerX - 14, obstacle.y + 15, centerX - 10, obstacle.y + 27);
		ctx.lineTo(centerX - 6, obstacle.y + 32);
		ctx.lineTo(centerX + 7, obstacle.y + 32);
		ctx.lineTo(centerX + 10, obstacle.y + 27);
		ctx.quadraticCurveTo(centerX + 13, obstacle.y + 15, centerX + 2, obstacle.y + 2);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#8b5534";
		ctx.strokeStyle = "#55331f";
		ctx.fillRect(centerX - 6, obstacle.y + 30, 12, 22);
		ctx.strokeRect(centerX - 6, obstacle.y + 30, 12, 22);
	}

	ctx.restore();
}

// 별을 먹었을 때 반짝이는 파편과 점수 팝업을 그립니다.
function drawScoreEffects() {
	scoreEffects.forEach((effect) => {
		const progress = effect.age / effect.duration;
		const particleDistance = 8 + progress * 30;
		const alpha = 1 - progress;

		ctx.save();
		ctx.globalAlpha = alpha;
		for (let particle = 0; particle < 10; particle += 1) {
			const angle = (particle / 10) * Math.PI * 2;
			const x = effect.x + Math.cos(angle) * particleDistance;
			const y = effect.y + Math.sin(angle) * particleDistance;
			ctx.fillStyle = particle % 2 === 0 ? "#fff8bd" : "#ff9f43";
			ctx.beginPath();
			ctx.arc(x, y, 2 + (1 - progress) * 2, 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.font = "bold 22px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.lineWidth = 4;
		ctx.strokeStyle = "rgba(114, 55, 20, 0.8)";
		ctx.strokeText("+10", effect.x, effect.y - 16 - progress * 28);
		ctx.fillStyle = "#fff3a6";
		ctx.fillText("+10", effect.x, effect.y - 16 - progress * 28);
		ctx.restore();
	});
}

// 별 모양 설탕 사탕을 그립니다.
function drawScoreItem(item) {
	const centerX = item.x + item.width / 2;
	const centerY = item.y + item.height / 2;
	ctx.fillStyle = "#ffe66d";
	ctx.strokeStyle = "#fff8cf";
	ctx.lineWidth = 2;
	ctx.beginPath();
	for (let point = 0; point < 10; point += 1) {
		const radius = point % 2 === 0 ? item.width / 2 : item.width / 4;
		const angle = -Math.PI / 2 + (point * Math.PI) / 5;
		const x = centerX + Math.cos(angle) * radius;
		const y = centerY + Math.sin(angle) * radius;
		if (point === 0) {
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
		}
	}
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
}

// 하트 모양 체력 아이템을 그립니다.
function drawHealthItem(item) {
	const centerX = item.x + item.width / 2;
	const centerY = item.y + item.height / 2;
	ctx.fillStyle = "#ff5c70";
	ctx.strokeStyle = "#ffe0e4";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(centerX, centerY + 11);
	ctx.bezierCurveTo(centerX + 20, centerY - 1, centerX + 11, centerY - 13, centerX, centerY - 5);
	ctx.bezierCurveTo(centerX - 11, centerY - 13, centerX - 20, centerY - 1, centerX, centerY + 11);
	ctx.fill();
	ctx.stroke();
}

function isColliding(first, second) {
	return first.x < second.x + second.width &&
		first.x + first.width > second.x &&
		first.y < second.y + second.height &&
		first.y + first.height > second.y;
}

function gameLoop(timestamp) {
	// 지우기: 이전 프레임의 화면을 지웁니다.
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// 계산: 장애물과 아이템을 움직이고 충돌 및 획득을 처리합니다.
	const frameScale = previousFrameTime === null
		? 1
		: Math.min((timestamp - previousFrameTime) / (1000 / 60), 2);
	previousFrameTime = timestamp;

	if (!gameOver) {
		obstacleSpeedMultiplier = Math.min(
			MAX_OBSTACLE_SPEED_MULTIPLIER,
			obstacleSpeedMultiplier + 0.0004 * frameScale
		);

		obstacles.forEach((obstacle) => {
			obstacle.y += obstacle.speed * obstacleSpeedMultiplier * frameScale;
			if (obstacle.y > canvas.height) {
				obstacle.y = -obstacle.height - Math.random() * 100;
				obstacle.x = Math.random() * (canvas.width - obstacle.width);
				obstacle.type = Math.random() < 0.5 ? "fork" : "knife";
			}
		});

		scoreItems.forEach((item) => {
			item.y += item.speed * obstacleSpeedMultiplier * frameScale;
			if (item.y > canvas.height) {
				item.y = -item.height - Math.random() * 180;
				item.x = Math.random() * (canvas.width - item.width);
			}
			if (isColliding(player, item)) {
				score += 10;
				scoreEffects.push({
					x: item.x + item.width / 2,
					y: item.y + item.height / 2,
					age: 0,
					duration: 42,
				});
				item.y = -item.height - Math.random() * 180;
				item.x = Math.random() * (canvas.width - item.width);
			}
		});
		scoreEffects.forEach((effect) => {
			effect.age += frameScale;
		});
		for (let index = scoreEffects.length - 1; index >= 0; index -= 1) {
			if (scoreEffects[index].age >= scoreEffects[index].duration) {
				scoreEffects.splice(index, 1);
			}
		}

		healthItem.y += healthItem.speed * obstacleSpeedMultiplier * frameScale;
		if (healthItem.y > canvas.height) {
			healthItem.y = -healthItem.height - Math.random() * 220;
			healthItem.x = Math.random() * (canvas.width - healthItem.width);
		}
		if (lives < MAX_LIVES && isColliding(player, healthItem)) {
			lives += 1;
			healthItem.y = -healthItem.height - Math.random() * 220;
			healthItem.x = Math.random() * (canvas.width - healthItem.width);
		}

		if (invulnerabilityFrames > 0) {
			invulnerabilityFrames -= frameScale;
		} else {
			const hit = obstacles.some((obstacle) => isColliding(player, obstacle));

			if (hit) {
				lives -= 1;
				invulnerabilityFrames = 90;
				if (lives === 0) {
					gameOver = true;
				}
			}
		}
	}

	// 그리기: 오븐 배경, 포크와 나이프, 아이템, 쿠키와 점수를 그립니다.
	drawScene();
	obstacles.forEach(drawObstacle);
	scoreItems.forEach(drawScoreItem);
	drawHealthItem(healthItem);
	drawScoreEffects();
	drawPlayer();

	if (gameOver) {
		ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 48px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("게임 오버", canvas.width / 2, canvas.height / 2 - 38);

		ctx.fillStyle = "#f39c3d";
		ctx.fillRect(restartButton.x, restartButton.y, restartButton.width, restartButton.height);
		ctx.strokeStyle = "#fff0c2";
		ctx.lineWidth = 3;
		ctx.strokeRect(restartButton.x, restartButton.y, restartButton.width, restartButton.height);
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 24px sans-serif";
		ctx.fillText("다시 시작", canvas.width / 2, restartButton.y + restartButton.height / 2);
		ctx.textAlign = "left";
	}

	// 좌측 위에는 점수, 우측 위에는 남은 목숨을 표시합니다.
	ctx.fillStyle = "rgba(24, 30, 35, 0.78)";
	ctx.fillRect(14, 14, 170, 42);
	ctx.fillRect(canvas.width - 144, 14, 130, 42);
	ctx.fillStyle = "#ffe66d";
	ctx.font = "bold 20px sans-serif";
	ctx.textBaseline = "top";
	ctx.textAlign = "left";
	ctx.fillText(`점수: ${score}`, 26, 24);
	ctx.fillStyle = "#ffffff";
	ctx.textAlign = "right";
	ctx.fillText(`목숨: ${lives}/${MAX_LIVES}`, canvas.width - 26, 24);
	ctx.textAlign = "left";

	requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
