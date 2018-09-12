class Vector {
    static ZERO = new Vector(0, 0)
    constructor(public x: number, public y: number) {
    }
    static of(orientation: Direction) {
        let v = new Vector(0, 0)
        if (orientation & Direction.Up)
            v.y -= 1
        if (orientation & Direction.Down)
            v.y += 1
        if (orientation & Direction.Left)
            v.x -= 1
        if (orientation & Direction.Right)
            v.x += 1
        return v.normalize()
    }
    multiply(scalarFactor: number) {
        return new Vector(this.x * scalarFactor, this.y * scalarFactor)
    }
    normalize() : Vector {
        let norm = this.norm()
        return norm === 0 ? this : this.multiply(1 / norm)
    }
    norm() : number {
        let norm = Math.sqrt(this.x * this.x + this.y * this.y)
        console.log("norm: " + norm);
        return norm
    }
}
