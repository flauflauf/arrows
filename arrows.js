var canv;
var ctx;
var Entity = /** @class */ (function () {
    function Entity(color, x, y, width, height, xv, yv, game_width, game_height) {
        this.color = color;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.xv = xv;
        this.yv = yv;
        this.game_width = game_width;
        this.game_height = game_height;
        this.last_xv = 1;
        this.last_yv = 0;
    }
    Entity.prototype.updatePosition = function (delta) {
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
    };
    Entity.prototype.setXDirection = function (xv) {
        this.xv = xv;
        this.last_xv = this.xv;
        this.last_yv = 0;
    };
    Entity.prototype.setYDirection = function (yv) {
        this.yv = yv;
        this.last_xv = 0;
        this.last_yv = this.yv;
    };
    Entity.prototype.stopX = function () {
        this.xv = 0;
    };
    Entity.prototype.stopY = function () {
        this.yv = 0;
    };
    Entity.prototype.draw = function () {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };
    return Entity;
}());
window.onload = function () {
    canv = document.getElementById("gc");
    ctx = canv.getContext("2d");
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
    requestAnimationFrame(mainLoop);
};
var lastFrameTimeMs = 0;
var delta = 0;
var timestep = 1000 / 60;
var maxFPS = 60;
var game_width = 600;
var game_height = 600;
var player = new Entity("lime", 0, 0, 20, 20, 0, 0, game_width, game_height);
var enemy = new Entity("red", 10, 10, 20, 20, 0, 0, game_width, game_height);
var arrows = [];
function update(delta) {
    player.updatePosition(delta);
    for (var i = 0; i < arrows.length; i++) {
        arrows[i].updatePosition(delta);
    }
    if (collide(player, enemy)) {
        resetEnemy();
    }
    for (var i = 0; i < arrows.length; i++) {
        if (collide(arrows[i], enemy)) {
            resetEnemy();
        }
    }
}
function collide(a, b) {
    var xOverlapAB = a.x < b.x && b.x < (a.x + a.width); // b overlaps a from right
    var xOverlapBA = b.x < a.x && a.x < (b.x + b.width); // a overlaps b from right
    var xOverlap = xOverlapAB || xOverlapBA;
    var yOverlapAB = a.y < b.y && b.y < (a.y + a.height); // b overlaps a from bottom
    var yOverlapBA = b.y < a.y && a.y < (b.y + b.height); // a overlaps b from bottom
    var yOverlap = yOverlapAB || yOverlapBA;
    var overlap = xOverlap && yOverlap;
    return overlap;
}
function resetEnemy() {
    enemy.x = Math.floor(Math.random() * game_width);
    enemy.y = Math.floor(Math.random() * game_height);
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
            var arrow = new Entity("yellow", player.x, player.y, 20, 20, player.last_xv * 3, player.last_yv * 3, game_width, game_height);
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
