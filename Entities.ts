class Entity {
    constructor(public htmlElement : HTMLElement, public color: String, public x: number, public y: number, public width: number, public height: number, public orientation: Direction, public speed: number, protected game_width: number, protected game_height: number) {
    }
    updatePosition(delta: number) {
        let velocity = Vector.of(this.orientation).multiply(this.speed);
        this.x += velocity.x * delta;
        this.y += velocity.y * delta;
    }
    draw() {
        this.htmlElement.style.left = this.x + "px"
        this.htmlElement.style.top = this.y + "px"
    }
}

class Arrow extends Entity {

    constructor(public htmlElement : HTMLElement, public x: number, public y: number, public orientation: Direction, protected game_width: number, protected game_height: number) {
        super(htmlElement, "yellow", x, y, 20, 20, orientation, 0.3, game_width, game_height)
    }

    isOutOfBounds(): boolean {
        return (this.x + this.width < 0)
            || (this.y + this.height < 0)
            || (this.x >= this.game_width)
            || (this.y >= this.game_height)
    }
}

class Player extends Entity {
    last_direction: Direction = Direction.Right
    health: number = 3
    invincibleTimeMs: number = 0

    face(direction: Direction) {
        this.orientation |= direction
        this.last_direction = direction
    }

    updatePosition(delta: number) {
        super.updatePosition(delta)

        if (this.x < 0) {
            this.x = 0
        }
        if (this.y < 0) {
            this.y = 0
        }
        if (this.x >= this.game_width - this.width) {
            this.x = this.game_width - this.width
        }
        if (this.y >= this.game_height - this.height) {
            this.y = this.game_width - this.width
        }

        this.invincibleTimeMs -= delta
    }

    stopDirection(direction: Direction) {
        this.orientation &= ~direction
    }

    hit() {
        if (!this.isInvincible()) {
            this.health--
            if (this.health <= 0) this.reset()
            this.invincibleTimeMs = 2000
        }
    }

    // TODO: Wieder bei isInvicible() weiß zeichnen

    // draw() {
        // ctx.fillStyle = this.isInvincible() ? "white" : this.color
        // ctx.fillRect(this.x, this.y, this.width, this.height)
    // }

    isInvincible(): boolean {
        return this.invincibleTimeMs > 0
    }

    reset() {
        this.health = 3
        this.x = Math.floor(Math.random() * game_width)
        this.y = Math.floor(Math.random() * game_height)
    }

    fireArrow(arrowHtmlElement: HTMLElement) : Arrow {
        let offset: Vector
        switch (this.last_direction) {
            case (Direction.Left):
                offset = new Vector(-this.width, 0)
                break
            case (Direction.Up):
                offset = new Vector(0, -this.height)
                break
            case (Direction.Right):
                offset = new Vector(this.width, 0)
                break
            case (Direction.Down):
                offset = new Vector(0, this.height)
                break
            default:
                offset = new Vector(0, 0)
        }
        return new Arrow(arrowHtmlElement, this.x + offset.x, this.y + offset.y, this.last_direction, game_width, game_height)
    }
}
