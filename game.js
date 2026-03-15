const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

let snakes = []
let kebabs = []
let broccolis = []

let mission = "big"
let skin = "classic"
let mapType = "jungle"

let trees = []
let cacti = []

let gameInterval = null
let gameTime = 0
let gameSpeed = 100
let gameMode = "solo"

const grid = 20
let playerDir = "RIGHT"

function chooseMode(mode) {
    gameMode = mode;
    document.getElementById("modeSelect").style.display = "none";
    document.getElementById("menu").style.display = "grid";

    if (mode === "bots") {
        document.getElementById("missionSection").style.display = "none";
    } else {
        document.getElementById("missionSection").style.display = "block";
    }
}

function startGame() {
    mission = document.getElementById("missionSelect").value
    skin = document.getElementById("skinSelect").value
    mapType = document.getElementById("mapSelect").value

    document.getElementById("menu").style.display = "none"

    snakes = []
    playerDir = "RIGHT"
    
    // Create Player
    let playerLength = (mission === "small") ? 15 : 5;
    snakes.push({
        id: "player",
        isBot: false,
        body: [{ x: 200, y: 200 }],
        length: playerLength,
        dir: "RIGHT",
        skin: skin,
        dead: false
    });

    if (gameMode === "bots") {
        for (let i = 0; i < 4; i++) {
            snakes.push({
                id: "bot" + i,
                isBot: true,
                body: [{ x: 400 + (i * 100), y: 100 + (i * 100) }],
                length: 5,
                dir: "DOWN",
                skin: ["classic", "demogorgon", "dog"][Math.floor(Math.random() * 3)],
                dead: false
            });
        }
    }

    gameTime = 0
    gameSpeed = 100

    spawnFood()

    if (mapType === "jungle") spawnTrees()
    else if (mapType === "desert") spawnCacti()
    else { trees = []; cacti = []; }

    if (gameInterval) clearTimeout(gameInterval)
    gameInterval = setTimeout(gameLoop, gameSpeed)

    document.getElementById("statusText").innerText = "Gra trwa..."
}

function resetGame() {
    clearTimeout(gameInterval)
    document.querySelectorAll('.menu-screen').forEach(el => el.style.display = "none");
    document.getElementById("modeSelect").style.display = "grid";
    document.getElementById("statusText").innerText = "Gotowy do gry"
}

function spawnFood() {
    kebabs = []
    broccolis = []
    for (let i = 0; i < 15; i++) { // More food for bots mode
        kebabs.push({ x: Math.floor(Math.random() * 50) * grid, y: Math.floor(Math.random() * 35) * grid })
    }
    for (let i = 0; i < 5; i++) {
        broccolis.push({ x: Math.floor(Math.random() * 50) * grid, y: Math.floor(Math.random() * 35) * grid })
    }
}

function spawnTrees() {
    trees = []
    for (let i = 0; i < 12; i++) {
        trees.push({ x: Math.floor(Math.random() * 50) * grid, y: Math.floor(Math.random() * 35) * grid })
    }
}

function spawnCacti() {
    cacti = []
    for (let i = 0; i < 12; i++) {
        cacti.push({ x: Math.floor(Math.random() * 50) * grid, y: Math.floor(Math.random() * 35) * grid })
    }
}

document.addEventListener("keydown", e => {
    let p = snakes.find(s => s.id === "player");
    if (!p || p.dead) return;

    if (e.key == "ArrowUp" && p.dir != "DOWN") playerDir = "UP"
    if (e.key == "ArrowDown" && p.dir != "UP") playerDir = "DOWN"
    if (e.key == "ArrowLeft" && p.dir != "RIGHT") playerDir = "LEFT"
    if (e.key == "ArrowRight" && p.dir != "LEFT") playerDir = "RIGHT"
})

// Touch Controls
function setDirection(newDir) {
    let p = snakes.find(s => s.id === "player");
    if (!p || p.dead) return;

    if (newDir == "UP" && p.dir != "DOWN") playerDir = "UP"
    if (newDir == "DOWN" && p.dir != "UP") playerDir = "DOWN"
    if (newDir == "LEFT" && p.dir != "RIGHT") playerDir = "LEFT"
    if (newDir == "RIGHT" && p.dir != "LEFT") playerDir = "RIGHT"
}

document.getElementById("ctrl-up").addEventListener("touchstart", (e) => { e.preventDefault(); setDirection("UP"); });
document.getElementById("ctrl-down").addEventListener("touchstart", (e) => { e.preventDefault(); setDirection("DOWN"); });
document.getElementById("ctrl-left").addEventListener("touchstart", (e) => { e.preventDefault(); setDirection("LEFT"); });
document.getElementById("ctrl-right").addEventListener("touchstart", (e) => { e.preventDefault(); setDirection("RIGHT"); });

// Swipe Detection
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

canvas.addEventListener("touchend", (e) => {
    let touchEndX = e.changedTouches[0].screenX;
    let touchEndY = e.changedTouches[0].screenY;
    
    let dx = touchEndX - touchStartX;
    let dy = touchEndY - touchStartY;
    
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) setDirection("RIGHT");
        else if (dx < -30) setDirection("LEFT");
    } else {
        if (dy > 30) setDirection("DOWN");
        else if (dy < -30) setDirection("UP");
    }
}, { passive: true });

function moveSnakes() {
    snakes.forEach(s => {
        if (s.dead) return;

        if (s.isBot) {
            // Simple Bot AI: Find nearest kebab
            let head = s.body[0];
            let target = null;
            let minDist = Infinity;
            
            kebabs.forEach(k => {
                let d = Math.abs(k.x - head.x) + Math.abs(k.y - head.y);
                if (d < minDist) {
                    minDist = d;
                    target = k;
                }
            });

            if (target) {
                if (head.x < target.x && s.dir !== "LEFT") s.dir = "RIGHT";
                else if (head.x > target.x && s.dir !== "RIGHT") s.dir = "LEFT";
                else if (head.y < target.y && s.dir !== "UP") s.dir = "DOWN";
                else if (head.y > target.y && s.dir !== "DOWN") s.dir = "UP";
            }
            
            // Avoid walls
            let nextX = head.x, nextY = head.y;
            if (s.dir === "RIGHT") nextX += grid;
            if (s.dir === "LEFT") nextX -= grid;
            if (s.dir === "UP") nextY -= grid;
            if (s.dir === "DOWN") nextY += grid;

            if (nextX < 0 || nextX > 980 || nextY < 0 || nextY > 680) {
                if (s.dir === "RIGHT" || s.dir === "LEFT") s.dir = Math.random() > 0.5 ? "UP" : "DOWN";
                else s.dir = Math.random() > 0.5 ? "LEFT" : "RIGHT";
            }
        } else {
            s.dir = playerDir;
        }

        let newHead = { ...s.body[0] };
        if (s.dir == "RIGHT") newHead.x += grid;
        if (s.dir == "LEFT") newHead.x -= grid;
        if (s.dir == "UP") newHead.y -= grid;
        if (s.dir == "DOWN") newHead.y += grid;

        s.body.unshift(newHead);
        while (s.body.length > s.length) {
            s.body.pop();
        }
    });
}

function checkFood() {
    snakes.forEach(s => {
        if (s.dead) return;
        let head = s.body[0];

        kebabs.forEach((food, index) => {
            if (head.x === food.x && head.y === food.y) {
                s.length += 2;
                kebabs.splice(index, 1);
                // Respawn food
                kebabs.push({ x: Math.floor(Math.random() * 50) * grid, y: Math.floor(Math.random() * 35) * grid });
            }
        });

        broccolis.forEach((food, index) => {
            if (head.x === food.x && head.y === food.y) {
                s.length -= 2;
                if (s.length < 3) s.length = 3;
                broccolis.splice(index, 1);
                broccolis.push({ x: Math.floor(Math.random() * 50) * grid, y: Math.floor(Math.random() * 35) * grid });
            }
        });
    });
}

function checkCollision() {
    snakes.forEach(s => {
        if (s.dead) return;
        let head = s.body[0];

        // Wall collision
        if (head.x < 0 || head.y < 0 || head.x > 980 || head.y > 680) {
            killSnake(s, "Wypadłeś poza mapę!");
            return;
        }

        // Map obstacles
        if (mapType === "jungle") {
            for (let tree of trees) {
                if (head.x === tree.x && head.y === tree.y) {
                    killSnake(s, "Uderzyłeś w drzewo!");
                    return;
                }
            }
        }
        if (mapType === "desert") {
            for (let cactus of cacti) {
                if (head.x === cactus.x && head.y === cactus.y) {
                    killSnake(s, "Uderzyłeś w kaktusa!");
                    return;
                }
            }
        }

        // Snake vs Snake collision
        snakes.forEach(other => {
            if (other.dead) return;
            
            for (let i = 0; i < other.body.length; i++) {
                // If head hits other snake's body (or own body)
                if (s === other && i === 0) continue; // Skip head vs head of same snake

                if (head.x === other.body[i].x && head.y === other.body[i].y) {
                    if (i === 0) {
                        // Head to Head
                        if (s.length > other.length) {
                            killSnake(other);
                            s.length += Math.floor(other.length / 2);
                        } else if (s.length < other.length) {
                            killSnake(s, "Zostałeś zjedzony!");
                        } else {
                            killSnake(s, "Zderzenie czołowe!");
                            killSnake(other);
                        }
                    } else {
                        // Head to Body
                        killSnake(s, "Uderzyłeś w innego węża!");
                    }
                    return;
                }
            }
        });
    });
}

function killSnake(s, message) {
    s.dead = true;
    // Drop food
    s.body.forEach(part => {
        if (Math.random() > 0.5) {
            kebabs.push({ x: part.x, y: part.y });
        }
    });

    if (s.id === "player") {
        endGame("PRZEGRAŁEŚ! " + (message || ""));
    } else {
        // Check if all bots are dead
        let aliveBots = snakes.filter(sn => sn.isBot && !sn.dead);
        if (aliveBots.length === 0 && gameMode === "bots") {
            endGame("WYGRAŁEŚ!");
        }
    }
}

function endGame(text) {
    clearTimeout(gameInterval);
    document.getElementById("statusText").innerText = text;
    setTimeout(() => {
        resetGame();
    }, 3000);
}

function checkMission() {
    if (gameMode !== "solo") return;

    let p = snakes.find(s => s.id === "player");
    if (!p || p.dead) return;

    if (mission === "big" && p.length >= 40) {
        endGame("Misja wykonana: największy wąż!");
    }
    if (mission === "small" && p.length <= 5 && gameTime > 5000) {
        endGame("Misja wykonana: najmniejszy wąż!");
    }
}

function draw() {
    // Clear background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 1000, 700);

    // Map drawing
    if (mapType === "sky") {
        let gradient = ctx.createLinearGradient(0, 0, 0, 700);
        gradient.addColorStop(0, "#87ceeb");
        gradient.addColorStop(1, "#cfefff");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1000, 700);
        for (let i = 0; i < 6; i++) {
            ctx.fillStyle = "white";
            let x = 100 + i * 150;
            let y = 80 + (i % 2) * 50;
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, Math.PI * 2);
            ctx.arc(x + 40, y, 30, 0, Math.PI * 2);
            ctx.arc(x + 20, y - 20, 30, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (mapType === "desert") {
        let gradient = ctx.createLinearGradient(0, 0, 0, 700);
        gradient.addColorStop(0, "#f4d03f");
        gradient.addColorStop(1, "#d4ac0d");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1000, 700);
    } else {
        let gradient = ctx.createLinearGradient(0, 0, 0, 700);
        gradient.addColorStop(0, "#1e5f1e");
        gradient.addColorStop(1, "#0b3d0b");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1000, 700);
    }

    // Obstacles
    if (mapType === "jungle") {
        for (let tree of trees) {
            ctx.fillStyle = "#3b2a1a";
            ctx.fillRect(tree.x + 6, tree.y + 10, 8, 10);
            ctx.fillStyle = "darkgreen";
            ctx.beginPath();
            ctx.arc(tree.x + 10, tree.y + 10, 10, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    if (mapType === "desert") {
        for (let cactus of cacti) {
            ctx.fillStyle = "#229954";
            ctx.fillRect(cactus.x + 6, cactus.y + 4, 8, 14);
            ctx.fillRect(cactus.x + 2, cactus.y + 8, 4, 4);
            ctx.fillRect(cactus.x + 14, cactus.y + 6, 4, 4);
            ctx.fillRect(cactus.x + 2, cactus.y + 4, 2, 4);
            ctx.fillRect(cactus.x + 16, cactus.y + 2, 2, 4);
        }
    }

    // Food
    kebabs.forEach(food => {
        ctx.fillStyle = "#c97a2b";
        ctx.fillRect(food.x, food.y, 20, 20);
    });
    broccolis.forEach(food => {
        ctx.fillStyle = "#2ecc71";
        ctx.beginPath();
        ctx.arc(food.x + 10, food.y + 10, 10, 0, Math.PI * 2);
        ctx.fill();
    });

    // Snakes
    snakes.forEach(s => {
        if (s.dead) return;
        s.body.forEach((part, index) => {
            if (s.skin === "classic") ctx.fillStyle = s.isBot ? "orange" : "lime";
            if (s.skin === "demogorgon") ctx.fillStyle = "#cc0000";
            if (s.skin === "dog") ctx.fillStyle = "#a0522d";
            
            // Highlight player head
            if (!s.isBot && index === 0) ctx.fillStyle = "white";

            ctx.fillRect(part.x, part.y, 20, 20);
        });
    });
}

function gameLoop() {
    moveSnakes();
    checkFood();
    checkCollision();
    checkMission();
    draw();

    gameTime += gameSpeed;
    gameInterval = setTimeout(gameLoop, gameSpeed);
}