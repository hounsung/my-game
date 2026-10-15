// ============================================================
// 1. 게임 화면 설정값 (나중에 좌표나 크기, 색상을 바꾸기 쉽게 모아둠)
// ============================================================
const CONFIG = {
	// 전체 캔버스 크기 (가로 800, 세로 600)
	canvas: {
		width: 800,
		height: 600,
	},

	// 배경 영역 설정
	background: {
		wallColor: "#dcdde1",       // 위쪽 방의 벽 색상 (옅은 회색)
		wallHeight: 480,            // 벽의 높이 (전체 600 중 위쪽 4/5)
		inventoryColor: "#2f3640",  // 아래쪽 인벤토리 색상 (어두운 회색)
		inventoryY: 480,            // 인벤토리 시작 Y좌표
		inventoryHeight: 120,       // 인벤토리 영역 높이 (전체 600 중 아래쪽 1/5)
	},

	// 문 (Door) 설정
	door: {
		x: 320,                     // 가운데 배치 ((800 - 160) / 2)
		y: 160,                     // 벽 바닥(480)에 닿도록 배치 (480 - 320)
		width: 160,                 // 문의 가로 크기
		height: 320,                // 문의 세로 크기
		color: "#8B4513",           // 문의 색상 (갈색)
	},

	// 자물쇠 (Lock) 설정
	lock: {
		x: 445,                     // 문 손잡이 위치 (문의 오른쪽 부분)
		y: 310,                     // 자물쇠 Y좌표
		width: 18,                  // 자물쇠 가로 크기
		height: 26,                 // 자물쇠 세로 크기
		color: "#f1c40f",           // 자물쇠 색상 (노란색)
	},

	// 단서 아이템 (방 곳곳에 흩어진 하얀색 쪽지 3개)
	clues: [
		{ x: 120, y: 380, width: 28, height: 22, color: "#ffffff" }, // 쪽지 1: 왼쪽 바닥 부근
		{ x: 220, y: 200, width: 28, height: 22, color: "#ffffff" }, // 쪽지 2: 왼쪽 벽면
		{ x: 650, y: 260, width: 28, height: 22, color: "#ffffff" }, // 쪽지 3: 오른쪽 벽면
	],

	// 안내 텍스트 설정
	message: {
		text: "단서를 찾아 문을 여세요!", // 표시할 글씨
		x: 30,                            // 화면 왼쪽 X좌표
		y: 45,                            // 화면 위쪽 Y좌표
		color: "#000000",                 // 글씨 색상 (검은색)
		font: "bold 20px sans-serif",     // 글씨 폰트 및 크기
	},
};

// ============================================================
// 2. 캔버스 및 그래픽 컨텍스트 가져오기
// ============================================================
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ============================================================
// 3. 첫 화면 그리기 함수
// ============================================================
function drawScene() {
	// [1] 배경 그리기
	// 위쪽 4/5: 방의 벽 (옅은 회색)
	ctx.fillStyle = CONFIG.background.wallColor;
	ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.background.wallHeight);

	// 아래쪽 1/5: 인벤토리 영역 (어두운 회색)
	ctx.fillStyle = CONFIG.background.inventoryColor;
	ctx.fillRect(0, CONFIG.background.inventoryY, CONFIG.canvas.width, CONFIG.background.inventoryHeight);

	// [2] 문과 자물쇠 그리기
	// 화면 가운데 커다란 갈색 직사각형(문)
	ctx.fillStyle = CONFIG.door.color;
	ctx.fillRect(CONFIG.door.x, CONFIG.door.y, CONFIG.door.width, CONFIG.door.height);

	// 문 손잡이 위치의 작은 노란색 직사각형(자물쇠)
	ctx.fillStyle = CONFIG.lock.color;
	ctx.fillRect(CONFIG.lock.x, CONFIG.lock.y, CONFIG.lock.width, CONFIG.lock.height);

	// [3] 단서 아이템 그리기 (방 곳곳에 흩어진 작은 하얀색 직사각형 3개)
	CONFIG.clues.forEach((clue) => {
		ctx.fillStyle = clue.color;
		ctx.fillRect(clue.x, clue.y, clue.width, clue.height);
	});

	// [4] 안내 글씨 그리기 (화면 왼쪽 위 검은 글씨)
	ctx.fillStyle = CONFIG.message.color;
	ctx.font = CONFIG.message.font;
	ctx.textBaseline = "top";
	ctx.fillText(CONFIG.message.text, CONFIG.message.x, CONFIG.message.y);
}

// 첫 화면을 화면에 그립니다.
drawScene();

