let canv
let ctx

window.onload = function () {
    canv = <HTMLCanvasElement>document.getElementById("gc")
    ctx = canv.getContext("2d")

    document.addEventListener("keydown", keyDown)
    document.addEventListener("keyup", keyUp)

    requestAnimationFrame(mainLoop)
}

let lastFrameTimeMs = 0
let delta = 0
let timestep = 1000 / 60
let maxFPS = 60

let game_width = 600
let game_height = 600

let player1 = new Player("lime", 0, 0, 20, 20, Direction.None, 0.1, game_width, game_height)
let player2 = new Player("red", 10, 10, 20, 20, Direction.None, 0.1, game_width, game_height)
let arrows: Arrow[] = []

function update(delta) {
    player1.updatePosition(delta)
    player2.updatePosition(delta)

    for (var i = 0; i < arrows.length; i++) {
        arrows[i].updatePosition(delta)
    }

    arrows = arrows.filter(a => !a.isOutOfBounds())

    for (var i = 0; i < arrows.length; i++) {
        if (collide(arrows[i], player1)) {
            player1.hit()
        }
        if (collide(arrows[i], player2)) {
            player2.hit()
        }
    }
}

function collide(a: Entity, b: Entity) {
    let xOverlapAB = a.x <= b.x && b.x < (a.x + a.width) // b overlaps a from right
    let xOverlapBA = b.x <= a.x && a.x < (b.x + b.width) // a overlaps b from right
    let xOverlap = xOverlapAB || xOverlapBA

    let yOverlapAB = a.y <= b.y && b.y < (a.y + a.height) // b overlaps a from bottom
    let yOverlapBA = b.y <= a.y && a.y < (b.y + b.height) // a overlaps b from bottom
    let yOverlap = yOverlapAB || yOverlapBA

    let overlap = xOverlap && yOverlap
    return overlap
}

function draw() {
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canv.width, canv.height)

    player1.draw()
    player2.draw()

    for (var i = 0; i < arrows.length; i++) {
        arrows[i].draw()
    }

    ctx.font = "30px Arial"
    ctx.fillStyle = "lime"
    ctx.fillText(player1.health, 20, 50)
    ctx.fillStyle = "red"
    ctx.fillText(player2.health, game_width - 50 - 20, 50)
}

function panic() {
    delta = 0
}

function keyDown(event) {
    switch (event.code) {
        case "KeyA":
            player1.face(Direction.Left)
            break
        case "KeyW":
            player1.face(Direction.Up)
            break
        case "KeyD":
            player1.face(Direction.Right)
            break
        case "KeyS":
            player1.face(Direction.Down)
            break
        case "Space":
            arrows.push(player1.fireArrow())
            break

        case "ArrowLeft":
            player2.face(Direction.Left)
            break
        case "ArrowUp":
            player2.face(Direction.Up)
            break
        case "ArrowRight":
            player2.face(Direction.Right)
            break
        case "ArrowDown":
            player2.face(Direction.Down)
            break
        case "Enter":
            arrows.push(player2.fireArrow())
            break
    }
}

function keyUp(event) {
    switch (event.code) {
        case "KeyA":
            player1.stopDirection(Direction.Left)
            break
        case "KeyW":
            player1.stopDirection(Direction.Up)
            break
        case "KeyD":
            player1.stopDirection(Direction.Right)
            break
        case "KeyS":
            player1.stopDirection(Direction.Down)
            break

        case "ArrowLeft":
            player2.stopDirection(Direction.Left)
            break
        case "ArrowUp":
            player2.stopDirection(Direction.Up)
            break
        case "ArrowRight":
            player2.stopDirection(Direction.Right)
            break
        case "ArrowDown":
            player2.stopDirection(Direction.Down)
            break
    }
}

function mainLoop(timestamp) {
    // Throttle the frame rate.
    if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
        requestAnimationFrame(mainLoop)
        return
    }

    // Track the accumulated time that hasn't been simulated yet
    delta += timestamp - lastFrameTimeMs; // note += here
    lastFrameTimeMs = timestamp

    // Simulate the total elapsed time in fixed-size chunks
    var numUpdateSteps = 0
    while (delta >= timestep) {
        update(timestep)
        delta -= timestep
        if (++numUpdateSteps >= 240) {
            panic()
            break
        }
    }
    draw()
    requestAnimationFrame(mainLoop)
}