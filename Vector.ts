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
    normalize(): Vector {
        let norm = this.norm()
        return norm === 0 ? this : this.multiply(1 / norm)
    }
    norm(): number {
        let norm = Math.sqrt(this.x * this.x + this.y * this.y)
        console.log("norm: " + norm);
        return norm
    }
    angle(): number {
        let otherVector = new Vector(0, -1)

        let x1 = this.x
        let y1 = this.y
        let x2 = otherVector.x
        let y2 = otherVector.y

        let scalarProduct = x1 * x2 + y1 * y2;
        let determinant = x1 * y2 - y1 * x2
        let angle = Math.atan2(determinant, scalarProduct)
        return angle
    }
}
