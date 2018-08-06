let canv
let ctx;
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

let player = {
    color: "lime",
    x: 0,
    y: 0,
    xv: 0,
    yv: 0,
    width: 20,
    height: 20,
    last_xv: 1,
    last_yv: 0,
    updatePosition: function (delta) {
        this.x += this.xv * delta;
        this.y += this.yv * delta;
        if (this.x + this.width < 0) {
            this.x = game_width - 1;
        }
        if (this.y + this.height < 0) {
            this.y = game_height - 1;
        }
        if (this.x >= game_width) {
            this.x = 0;
        }
        if (this.y >= game_height) {
            this.y = 0;
        }
    },
    setXDirection: function (xv) {
        player.xv = xv;
        this.last_xv = this.xv;
        this.last_yv = 0;
    },
    setYDirection: function (yv) {
        player.yv = yv;
        this.last_xv = 0;
        this.last_yv = this.yv;
    },
    stopX: function () {
        player.xv = 0;
    },
    stopY: function () {
        player.yv = 0;
    }
};

let enemy = {
    color: "red",
    x: 10,
    y: 10,
    width: 20,
    height: 20
};

let arrows = [];

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

    drawEntity(player);
    drawEntity(enemy);

    for (var i = 0; i < arrows.length; i++) {
        drawEntity(arrows[i]);
    }
}

function panic() {
    delta = 0;
}

function drawEntity(entity) {
    ctx.fillStyle = entity.color;
    ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
}

function createArrow(x, y, xv, yv) {
    var arrow = {
        color: "yellow",
        x: x,
        y: y,
        xv: xv,
        yv: yv,
        width: 20,
        height: 20,
        updatePosition: function (delta) {
            this.x += this.xv * delta;
            this.y += this.yv * delta;
            if (this.x + this.width < 0) {
                this.x = game_width - 1;
            }
            if (this.y + this.height < 0) {
                this.y = game_height - 1;
            }
            if (this.x >= game_width) {
                this.x = 0;
            }
            if (this.y >= game_height) {
                this.y = 0;
            }
        }
    };

    return arrow;
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
            var arrow = createArrow(player.x, player.y, player.last_xv*3, player.last_yv*3);
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