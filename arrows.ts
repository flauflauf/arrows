let canv
let ctx;

enum Direction {
    None    = 0,
    Up      = 1 << 0,
    Down    = 1 << 1,
    Left    = 1 << 2,
    Right   = 1 << 3
}

class Vector {
    static ZERO = new Vector(0, 0)

    constructor(public x: number, public y: number) {

    }

    static of(orientation: Direction) {
        let v = new Vector(0, 0)
        if (orientation & Direction.Up) v.y -= 1
        if (orientation & Direction.Down) v.y += 1
        if (orientation & Direction.Left) v.x -= 1
        if (orientation & Direction.Right) v.x += 1
        return v
    }

    multiply(scalarFactor: number) {
        return new Vector(this.x * scalarFactor, this.y * scalarFactor);
    }
}

class Entity {
    constructor(
        public color: String,
        public x: number,
        public y: number,
        public width: number,
        public height: number,
        public orientation: Direction,
        public speed: number,
        protected game_width: number,
        protected game_height: number) {
    }

    updatePosition(delta: number) {
        let velocity = Vector.of(this.orientation).multiply(this.speed);
        this.x += velocity.x * delta;
        this.y += velocity.y * delta;
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

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Arrow extends Entity {

    constructor(public x: number, public y: number, public orientation: Direction, protected game_width: number, protected game_height: number) {
        super("yellow", x, y, 20, 20, orientation, 0.3, game_width, game_height);
    }
}

class Player extends Entity {
    last_direction: Direction = Direction.Right;

    face(direction: Direction) {
        this.orientation |= direction
        this.last_direction = direction
    }

    stopDirection(direction: Direction) {
        this.orientation &= ~direction
    }

    reset() {
        this.x = Math.floor(Math.random() * game_width);
        this.y = Math.floor(Math.random() * game_height);
    }

    fireArrow(): Arrow {
        return new Arrow(this.x, this.y, this.last_direction, game_width, game_height);
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

let player1 = new Player("lime", 0, 0, 20, 20, Direction.None, 0.1, game_width, game_height)
let player2 = new Player("red", 10, 10, 20, 20, Direction.None, 0.1, game_width, game_height)
let arrows: Arrow[] = [];

function update(delta) {
    player1.updatePosition(delta);
    player2.updatePosition(delta);

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
        case "KeyA":
            player1.face(Direction.Left);
            break;
        case "KeyW":
            player1.face(Direction.Up);
            break;
        case "KeyD":
            player1.face(Direction.Right);
            break;
        case "KeyS":
            player1.face(Direction.Down);
            break;
        case "Space":
            arrows.push(player1.fireArrow());
            break;

        case "ArrowLeft":
            player2.face(Direction.Left);
            break;
        case "ArrowUp":
            player2.face(Direction.Up);
            break;
        case "ArrowRight":
            player2.face(Direction.Right);
            break;
        case "ArrowDown":
            player2.face(Direction.Down);
            break;
        case "Enter":
            arrows.push(player2.fireArrow());
            break;
    }
}

function keyUp(event) {
    switch (event.code) {
        case "KeyA":
            player1.stopDirection(Direction.Left);
            break;
        case "KeyW":
            player1.stopDirection(Direction.Up);
            break;
        case "KeyD":
            player1.stopDirection(Direction.Right);
            break;
        case "KeyS":
            player1.stopDirection(Direction.Down);
            break;

        case "ArrowLeft":
            player2.stopDirection(Direction.Left)
            break;
        case "ArrowUp":
            player2.stopDirection(Direction.Up)
            break;
        case "ArrowRight":
            player2.stopDirection(Direction.Right)
            break;
        case "ArrowDown":
            player2.stopDirection(Direction.Down)
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