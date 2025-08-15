const imageSquareSize = 24; 
const size = 35; 
const framePerSecond = 24; 
const gameSpeed = 5; 

const canvas = document.getElementById("canvas");
const nextShapeCanvas = document.getElementById("next-shape-canvas");
const scoreElement = document.getElementById("score");
const image = document.getElementById("image");

image.src = "rotations.png";

const ctx = canvas.getContext("2d");
const nextCtx = nextShapeCanvas.getContext("2d");

const squareCountX = 10; 
const squareCountY = 20;
canvas.width = squareCountX * size;
canvas.height = squareCountY * size;

 
class Tetris {
    constructor(imageX, imageY, template) {
        this.imageX = imageX;
        this.imageY = imageY;
        this.template = template;
        // Centraliza a peça horizontalmente, ajustando pela sua largura
        this.x = Math.floor((squareCountX - this.template[0].length) / 2);
        this.y = 0;
    }

    /**
     * Verifica se a peça pode se mover um passo para baixo.
     * @returns {boolean} - True se puder mover, false caso contrário.
     */
    checkBottom() {
        for (let i = 0; i < this.template.length; i++) {
            for (let j = 0; j < this.template[i].length; j++) {
                if (this.template[i][j] === 0) continue;
                let realX = j + Math.trunc(this.x);
                let realY = i + Math.trunc(this.y);
                if (realY + 1 >= squareCountY || (gameMap[realY + 1] && gameMap[realY + 1][realX].imageX !== -1)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Verifica se a peça pode se mover um passo para a esquerda.
     * @returns {boolean} - True se puder mover, false caso contrário.
     */
    checkLeft() {
        for (let i = 0; i < this.template.length; i++) {
            for (let j = 0; j < this.template[i].length; j++) {
                if (this.template[i][j] === 0) continue;
                let realX = j + Math.trunc(this.x);
                let realY = i + Math.trunc(this.y);
                if (realX - 1 < 0 || (gameMap[realY] && gameMap[realY][realX - 1].imageX !== -1)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Verifica se a peça pode se mover um passo para a direita.
     * @returns {boolean} - True se puder mover, false caso contrário.
     */
    checkRight() {
        for (let i = 0; i < this.template.length; i++) {
            for (let j = 0; j < this.template[i].length; j++) {
                if (this.template[i][j] === 0) continue;
                let realX = j + Math.trunc(this.x);
                let realY = i + Math.trunc(this.y);
                if (realX + 1 >= squareCountX || (gameMap[realY] && gameMap[realY][realX + 1].imageX !== -1)) {
                    return false;
                }
            }
        }
        return true;
    }

    /** Move a peça para a direita */
    moveRight() {
        if (this.checkRight()) {
            this.x++;
        }
    }

    /** Move a peça para a esquerda */
    moveLeft() {
        if (this.checkLeft()) {
            this.x--;
        }
    }

    /** Move a peça para baixo */
    moveBottom() {
        if (this.checkBottom()) {
            this.y++;
        }
    }

    /** Gira a peça no sentido horário */
    changeRotation() {
        const originalTemplate = this.template.map(row => row.slice());
        const n = this.template.length;
        const m = this.template[0].length;
        const newTemplate = Array(m).fill(0).map(() => Array(n).fill(0));

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                newTemplate[j][n - 1 - i] = this.template[i][j];
            }
        }
        this.template = newTemplate;

        // Verifica colisão após a rotação e reverte se necessário
        for (let i = 0; i < this.template.length; i++) {
            for (let j = 0; j < this.template[i].length; j++) {
                if (this.template[i][j] === 0) continue;
                let realX = j + Math.trunc(this.x);
                let realY = i + Math.trunc(this.y);
                if (realX < 0 || realX >= squareCountX || realY < 0 || realY >= squareCountY || (gameMap[realY] && gameMap[realY][realX].imageX !== -1)) {
                    this.template = originalTemplate; // Reverte
                    return;
                }
            }
        }
    }
}

// DEFINIÇÕES DAS PEÇAS 
const shapes = [
    new Tetris(0, 0, [[1, 1], [1, 1]]), // O
    new Tetris(0, 24, [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]]), // I
    new Tetris(0, 48, [[0, 1, 1], [1, 1, 0], [0, 0, 0]]), // S
    new Tetris(0, 72, [[1, 1, 0], [0, 1, 1], [0, 0, 0]]), // Z
    new Tetris(0, 96, [[0, 1, 0], [1, 1, 1], [0, 0, 0]]), // T
    new Tetris(0, 120, [[1, 0, 0], [1, 1, 1], [0, 0, 0]]), // L
    new Tetris(0, 144, [[0, 0, 1], [1, 1, 1], [0, 0, 0]]), // J
];

// VARIÁVEIS DE ESTADO DO JOGO
let gameMap;
let gameOver;
let currentShape;
let nextShape;
let score;
let whiteLineThickness = 2;

// LÓGICA DO JOGO
let update = () => {
    if (gameOver) return;

    if (currentShape.checkBottom()) {
        currentShape.y++;
    } else {
        for (let i = 0; i < currentShape.template.length; i++) {
            for (let j = 0; j < currentShape.template[i].length; j++) {
                if (currentShape.template[i][j] === 0) continue;
                let realX = j + Math.trunc(currentShape.x);
                let realY = i + Math.trunc(currentShape.y);
                
                if (realY < 0) {
                    gameOver = true;
                    return;
                }
                gameMap[realY][realX] = { imageX: currentShape.imageX, imageY: currentShape.imageY };
            }
        }

        let completedLines = 0;
        for (let i = 0; i < gameMap.length; i++) {
            if (gameMap[i].every(square => square.imageX !== -1)) {
                completedLines++;
                gameMap.splice(i, 1);
                gameMap.unshift(Array(squareCountX).fill({ imageX: -1, imageY: -1 }));
                i--;
            }
        }
        
        if (completedLines > 0) {
            score += 100 * Math.pow(2, completedLines - 1);
        }

        currentShape = nextShape;
        nextShape = getRandomShape();
        
        for (let i = 0; i < currentShape.template.length; i++) {
            for (let j = 0; j < currentShape.template[i].length; j++) {
                if (currentShape.template[i][j] === 0) continue;
                let realX = j + Math.trunc(currentShape.x);
                let realY = i + Math.trunc(currentShape.y);
                if (gameMap[realY] && gameMap[realY][realX].imageX !== -1) {
                    gameOver = true;
                    return;
                }
            }
        }
    }
};

// FUNÇÕES DE DESENHO
let drawRect = (ctx, x, y, width, height, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
};

let drawBackground = () => {
    drawRect(ctx, 0, 0, canvas.width, canvas.height, "#16213e");
    for (let i = 1; i < squareCountX; i++) {
        drawRect(ctx, size * i - whiteLineThickness / 2, 0, whiteLineThickness, canvas.height, "#0f0c29");
    }
    for (let i = 1; i < squareCountY; i++) {
        drawRect(ctx, 0, size * i - whiteLineThickness / 2, canvas.width, whiteLineThickness, "#0f0c29");
    }
};

let drawCurrentTetris = () => {
    for (let i = 0; i < currentShape.template.length; i++) {
        for (let j = 0; j < currentShape.template[i].length; j++) {
            if (currentShape.template[i][j] === 0) continue;
            ctx.drawImage(
                image,
                currentShape.imageX,
                currentShape.imageY,
                imageSquareSize,
                imageSquareSize,
                (Math.trunc(currentShape.x) + j) * size,
                (Math.trunc(currentShape.y) + i) * size,
                size,
                size
            );
        }
    }
};

let drawSquares = () => {
    for (let i = 0; i < gameMap.length; i++) {
        for (let j = 0; j < gameMap[i].length; j++) {
            let square = gameMap[i][j];
            if (square.imageX === -1) continue;
            ctx.drawImage(
                image,
                square.imageX,
                square.imageY,
                imageSquareSize,
                imageSquareSize,
                j * size,
                i * size,
                size,
                size
            );
        }
    }
};

let drawNextShape = () => {
    nextCtx.clearRect(0, 0, nextShapeCanvas.width, nextShapeCanvas.height);
    const template = nextShape.template;
    const offsetX = (nextShapeCanvas.width - template[0].length * size) / 2;
    const offsetY = (nextShapeCanvas.height - template.length * size) / 2;

    for (let i = 0; i < template.length; i++) {
        for (let j = 0; j < template[i].length; j++) {
            if (template[i][j] === 0) continue;
            nextCtx.drawImage(
                image,
                nextShape.imageX,
                nextShape.imageY,
                imageSquareSize,
                imageSquareSize,
                offsetX + j * size,
                offsetY + i * size,
                size,
                size
            );
        }
    }
};

let drawGameOver = () => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '28px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText("FIM DE JOGO", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '14px "Press Start 2P"';
    ctx.fillText("Pressione Enter para Reiniciar", canvas.width / 2, canvas.height / 2 + 20);
    ctx.textAlign = 'left';
};

let draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawSquares();
    drawCurrentTetris();
    drawNextShape();
    scoreElement.innerText = score;
    if (gameOver) {
        drawGameOver();
    }
    requestAnimationFrame(draw);
};

// INICIALIZAÇÃO E LOOP DO JOGO 
let getRandomShape = () => {
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    return new Tetris(shape.imageX, shape.imageY, shape.template.map(row => row.slice()));
};

let resetVars = () => {
    gameMap = Array(squareCountY).fill(0).map(() => Array(squareCountX).fill({ imageX: -1, imageY: -1 }));
    score = 0;
    gameOver = false;
    currentShape = getRandomShape();
    nextShape = getRandomShape();
};

// EVENT LISTENERS
window.addEventListener("keydown", (event) => {
    if (gameOver && event.key === "Enter") {
        resetVars();
        return;
    }
    if (gameOver) return;

    switch (event.key) {
        case "ArrowLeft":
            currentShape.moveLeft();
            break;
        case "ArrowRight":
            currentShape.moveRight();
            break;
        case "ArrowDown":
            currentShape.moveBottom();
            break;
        case "ArrowUp":
            currentShape.changeRotation();
            break;
    }
});

// INICIAR JOGO
image.onload = () => {
    resetVars();
    setInterval(update, 1000 / gameSpeed);
    requestAnimationFrame(draw);
};

image.onerror = () => {
    console.error("Erro ao carregar a imagem de sprite. Verifique se o nome do ficheiro 'rotations.png' está correto e na mesma pasta.");
};

if (image.complete) {
    image.onload();
}