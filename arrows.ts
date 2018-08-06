let canv
let ctx;

class Entity {
    last_xv: number
    last_yv: number

    constructor(public color: String, public x: number, public y: number, private width: number, private height: number, private xv: number, private yv: number, private game_width: number, private game_height: number) {
        this.last_xv = 1
        this.last_yv = 0
    }

    updatePosition(delta: number) {
        this.x += this.xv * delta;
        this.y += this.yv * delta;
        if (this.x + this.width < 0) {
            this.x = this.game_width - 1;
        }
        if (this.y + this.height < 0) {
            this.y = this.game_height - 1;
        }
        if (this.x >= this.game_width) {
            this.x = 0;
        }
        if (this.y >= this.game_height) {
            this.y = 0;
        }
    }

    setXDirection(xv: number) {
        this.xv = xv;
        this.last_xv = this.xv;
        this.last_yv = 0;
    }

    setYDirection(yv: number) {
        this.yv = yv;
        this.last_xv = 0;
        this.last_yv = this.yv;
    }

    stopX() {
        this.xv = 0;
    }

    stopY() {
        this.yv = 0;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

window.onload = function () {
    canv = <HTMLCanvasElement> document.getElementById("gc");
    ctx = canv.getContext("2d");

    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);

    requestAnimationFrame(mainLoop);
}

let lastFrameTimeMs = 0;
let delta = 0;
let timestep = 1000 / 60;
let maxFPS = 60;

let game_width = 600;
let game_height = 600;

let player = new Entity("lime", 0, 0, 20, 20, 0, 0, game_width, game_height)
let enemy = new Entity("red", 10, 10, 20, 20, 0, 0, game_width, game_height)
let arrows: Entity[] = [];

function update(delta) {
    player.updatePosition(delta);

    for (var i = 0; i < arrows.length; i++) {
        arrows[i].updatePosition(delta);
    }

    // if (collide(player, enemy)) {
    //     enemy.x = Math.floor(Math.random() * game_width);
    //     enemy.y = Math.floor(Math.random() * game_height);
    // }
}

function collide(a, b) {
    return a.x == b.x && a.y == b.y;
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);

    // ctx.fillStyle = "white";
    // ctx.font = "30px Arial";
    // ctx.fillText(player.last_xv, 20, 50);
    // ctx.fillText(player.last_yv, 20, 80);

    player.draw();
    enemy.draw();

    for (var i = 0; i < arrows.length; i++) {
        arrows[i].draw();
    }
}

function panic() {
    delta = 0;
}

function keyDown(event) {
    switch (event.code) {
        case "ArrowLeft":
            player.setXDirection(-0.1);
            break;
        case "ArrowUp":
            player.setYDirection(-0.1);
            break;
        case "ArrowRight":
            player.setXDirection(0.1);
            break;
        case "ArrowDown":
            player.setYDirection(0.1);
            break;
        case "Space":
            let arrow = new Entity("yellow", player.x, player.y, 20, 20, player.last_xv*3, player.last_yv*3, game_width, game_height);
            arrows.push(arrow);
            break;
    }
}

function keyUp(event) {
    switch (event.code) {
        case "ArrowLeft":
            player.stopX();
            break;
        case "ArrowUp":
            player.stopY();
            break;
        case "ArrowRight":
            player.stopX();
            break;
        case "ArrowDown":
            player.stopY();
            break;
    }
}

function mainLoop(timestamp) {
    // Throttle the frame rate.
    if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
        requestAnimationFrame(mainLoop);
        return;
    }

    // Track the accumulated time that hasn't been simulated yet
    delta += timestamp - lastFrameTimeMs; // note += here
    lastFrameTimeMs = timestamp;

    // Simulate the total elapsed time in fixed-size chunks
    var numUpdateSteps = 0;
    while (delta >= timestep) {
        update(timestep);
        delta -= timestep;
        if (++numUpdateSteps >= 240) {
            panic();
            break;
        }
    }
    draw();
    requestAnimationFrame(mainLoop);
}