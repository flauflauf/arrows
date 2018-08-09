let canv
let ctx;

class Entity {
    last_xv: number
    last_yv: number

    constructor(public color: String, public x: number, public y: number, public width: number, public height: number, private xv: number, private yv: number, private game_width: number, private game_height: number) {
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

    reset() {
        this.x = Math.floor(Math.random() * game_width);
        this.y = Math.floor(Math.random() * game_height);
    }

    fireArrow(): Entity {
        return new Entity("yellow", this.x, this.y, 20, 20, this.last_xv * 3, this.last_yv * 3, game_width, game_height);
    }
}

window.onload = function () {
    canv = <HTMLCanvasElement>document.getElementById("gc");
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

let player1 = new Entity("lime", 0, 0, 20, 20, 0, 0, game_width, game_height)
let player2 = new Entity("red", 10, 10, 20, 20, 0, 0, game_width, game_height)
let arrows: Entity[] = [];

function update(delta) {
    player1.updatePosition(delta);

    for (var i = 0; i < arrows.length; i++) {
        arrows[i].updatePosition(delta);
    }

    for (var i = 0; i < arrows.length; i++) {
        if (collide(arrows[i], player1)) {
            player1.reset();
        }
        if (collide(arrows[i], player2)) {
            player2.reset();
        }
    }
}

function collide(a: Entity, b: Entity) {
    let xOverlapAB = a.x < b.x && b.x < (a.x + a.width) // b overlaps a from right
    let xOverlapBA = b.x < a.x && a.x < (b.x + b.width) // a overlaps b from right
    let xOverlap = xOverlapAB || xOverlapBA

    let yOverlapAB = a.y < b.y && b.y < (a.y + a.height) // b overlaps a from bottom
    let yOverlapBA = b.y < a.y && a.y < (b.y + b.height) // a overlaps b from bottom
    let yOverlap = yOverlapAB || yOverlapBA

    let overlap = xOverlap && yOverlap
    return overlap
}

function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);

    // ctx.fillStyle = "white";
    // ctx.font = "30px Arial";
    // ctx.fillText(player1.last_xv, 20, 50);
    // ctx.fillText(player1.last_yv, 20, 80);

    player1.draw();
    player2.draw();

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
            player1.setXDirection(-0.1);
            break;
        case "ArrowUp":
            player1.setYDirection(-0.1);
            break;
        case "ArrowRight":
            player1.setXDirection(0.1);
            break;
        case "ArrowDown":
            player1.setYDirection(0.1);
            break;
        case "Space":
            let arrow = player1.fireArrow();
            arrows.push(arrow);
            break;
    }
}

function keyUp(event) {
    switch (event.code) {
        case "ArrowLeft":
            player1.stopX();
            break;
        case "ArrowUp":
            player1.stopY();
            break;
        case "ArrowRight":
            player1.stopX();
            break;
        case "ArrowDown":
            player1.stopY();
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