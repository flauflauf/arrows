class Vector {
    static ZERO = new Vector(0, 0);
    constructor(public x: number, public y: number) {
    }
    static of(orientation: Direction) {
        let v = new Vector(0, 0);
        if (orientation & Direction.Up)
            v.y -= 1;
        if (orientation & Direction.Down)
            v.y += 1;
        if (orientation & Direction.Left)
            v.x -= 1;
        if (orientation & Direction.Right)
            v.x += 1;
        return v;
    }
    multiply(scalarFactor: number) {
        return new Vector(this.x * scalarFactor, this.y * scalarFactor);
    }
}
