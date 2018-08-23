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
var Direction;
(function (Direction) {
    Direction[Direction["None"] = 0] = "None";
    Direction[Direction["Up"] = 1] = "Up";
    Direction[Direction["Down"] = 2] = "Down";
    Direction[Direction["Left"] = 4] = "Left";
    Direction[Direction["Right"] = 8] = "Right";
})(Direction || (Direction = {}));
var Vector = /** @class */ (function () {
    function Vector(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector.of = function (orientation) {
        var v = new Vector(0, 0);
        if (orientation & Direction.Up)
            v.y -= 1;
        if (orientation & Direction.Down)
            v.y += 1;
        if (orientation & Direction.Left)
            v.x -= 1;
        if (orientation & Direction.Right)
            v.x += 1;
        return v;
    };
    Vector.prototype.multiply = function (scalarFactor) {
        return new Vector(this.x * scalarFactor, this.y * scalarFactor);
    };
    Vector.ZERO = new Vector(0, 0);
    return Vector;
}());
var Entity = /** @class */ (function () {
    function Entity(color, x, y, width, height, orientation, speed, game_width, game_height) {
        this.color = color;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.orientation = orientation;
        this.speed = speed;
        this.game_width = game_width;
        this.game_height = game_height;
    }
    Entity.prototype.updatePosition = function (delta) {
        var velocity = Vector.of(this.orientation).multiply(this.speed);
        this.x += velocity.x * delta;
        this.y += velocity.y * delta;
    };
    Entity.prototype.draw = function () {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };
    return Entity;
}());
var Arrow = /** @class */ (function (_super) {
    __extends(Arrow, _super);
    function Arrow(x, y, orientation, game_width, game_height) {
        var _this = _super.call(this, "yellow", x, y, 20, 20, orientation, 0.3, game_width, game_height) || this;
        _this.x = x;
        _this.y = y;
        _this.orientation = orientation;
        _this.game_width = game_width;
        _this.game_height = game_height;
        return _this;
    }
    Arrow.prototype.isOutOfBounds = function () {
        return (this.x + this.width < 0)
            || (this.y + this.height < 0)
            || (this.x >= this.game_width)
            || (this.y >= this.game_height);
    };
    return Arrow;
}(Entity));
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.last_direction = Direction.Right;
        _this.health = 3;
        _this.invincibleTimeMs = 0;
        return _this;
    }
    Player.prototype.face = function (direction) {
        this.orientation |= direction;
        this.last_direction = direction;
    };
    Player.prototype.updatePosition = function (delta) {
        _super.prototype.updatePosition.call(this, delta);
        if (this.x < 0) {
            this.x = 0;
        }
        if (this.y < 0) {
            this.y = 0;
        }
        if (this.x >= this.game_width - this.width) {
            this.x = this.game_width - this.width;
        }
        if (this.y >= this.game_height - this.height) {
            this.y = this.game_width - this.width;
        }
        this.invincibleTimeMs -= delta;
    };
    Player.prototype.stopDirection = function (direction) {
        this.orientation &= ~direction;
    };
    Player.prototype.hit = function () {
        if (!this.isInvincible()) {
            this.health--;
            if (this.health <= 0)
                this.reset();
            this.invincibleTimeMs = 2000;
        }
    };
    Player.prototype.draw = function () {
        ctx.fillStyle = this.isInvincible() ? "white" : this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };
    Player.prototype.isInvincible = function () {
        return this.invincibleTimeMs > 0;
    };
    Player.prototype.reset = function () {
        this.health = 3;
        this.x = Math.floor(Math.random() * game_width);
        this.y = Math.floor(Math.random() * game_height);
    };
    Player.prototype.fireArrow = function () {
        var offset;
        switch (this.last_direction) {
            case (Direction.Left):
                offset = new Vector(-this.width, 0);
                break;
            case (Direction.Up):
                offset = new Vector(0, -this.height);
                break;
            case (Direction.Right):
                offset = new Vector(this.width, 0);
                break;
            case (Direction.Down):
                offset = new Vector(0, this.height);
                break;
            default:
                offset = new Vector(0, 0);
        }
        return new Arrow(this.x + offset.x, this.y + offset.y, this.last_direction, game_width, game_height);
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
var player1 = new Player("lime", 0, 0, 20, 20, Direction.None, 0.1, game_width, game_height);
var player2 = new Player("red", 10, 10, 20, 20, Direction.None, 0.1, game_width, game_height);
var arrows = [];
function update(delta) {
    player1.updatePosition(delta);
    player2.updatePosition(delta);
    for (var i = 0; i < arrows.length; i++) {
        arrows[i].updatePosition(delta);
    }
    arrows = arrows.filter(function (a) { return !a.isOutOfBounds(); });
    for (var i = 0; i < arrows.length; i++) {
        if (collide(arrows[i], player1)) {
            player1.hit();
        }
        if (collide(arrows[i], player2)) {
            player2.hit();
        }
    }
}
function collide(a, b) {
    var xOverlapAB = a.x <= b.x && b.x < (a.x + a.width); // b overlaps a from right
    var xOverlapBA = b.x <= a.x && a.x < (b.x + b.width); // a overlaps b from right
    var xOverlap = xOverlapAB || xOverlapBA;
    var yOverlapAB = a.y <= b.y && b.y < (a.y + a.height); // b overlaps a from bottom
    var yOverlapBA = b.y <= a.y && a.y < (b.y + b.height); // a overlaps b from bottom
    var yOverlap = yOverlapAB || yOverlapBA;
    var overlap = xOverlap && yOverlap;
    return overlap;
}
function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);
    player1.draw();
    player2.draw();
    for (var i = 0; i < arrows.length; i++) {
        arrows[i].draw();
    }
    ctx.font = "30px Arial";
    ctx.fillStyle = "lime";
    ctx.fillText(player1.health, 20, 50);
    ctx.fillStyle = "red";
    ctx.fillText(player2.health, game_width - 50 - 20, 50);
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
            player2.stopDirection(Direction.Left);
            break;
        case "ArrowUp":
            player2.stopDirection(Direction.Up);
            break;
        case "ArrowRight":
            player2.stopDirection(Direction.Right);
            break;
        case "ArrowDown":
            player2.stopDirection(Direction.Down);
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
