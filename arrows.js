var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
    Entity.prototype.draw = function () {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };
    return Entity;
}());
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Player.prototype.setXDirection = function (xv) {
        this.xv = xv;
        this.last_xv = this.xv;
        this.last_yv = 0;
    };
    Player.prototype.setYDirection = function (yv) {
        this.yv = yv;
        this.last_xv = 0;
        this.last_yv = this.yv;
    };
    Player.prototype.stopX = function () {
        this.xv = 0;
    };
    Player.prototype.stopY = function () {
        this.yv = 0;
    };
    Player.prototype.reset = function () {
        this.x = Math.floor(Math.random() * game_width);
        this.y = Math.floor(Math.random() * game_height);
    };
    Player.prototype.fireArrow = function () {
        return new Entity("yellow", this.x, this.y, 20, 20, this.last_xv * 3, this.last_yv * 3, game_width, game_height);
    };
    return Player;
}(Entity));
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
var player1 = new Player("lime", 0, 0, 20, 20, 0, 0, game_width, game_height);
var player2 = new Player("red", 10, 10, 20, 20, 0, 0, game_width, game_height);
var arrows = [];
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
            var arrow = player1.fireArrow();
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
