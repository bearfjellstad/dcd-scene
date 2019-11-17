class Inertia {
    constructor(from, to, acc, dec) {
        this.from = from;
        this.to = to;
        this.acc = acc;
        this.dec = dec;
        this.value = this.from;
        this.speed = 0;
    }

    update = newValue => {
        this.speed = this.speed + (newValue - this.value) * this.acc;
        this.speed = this.speed * this.dec;
        this.value += this.speed;
        this.value = this._clamp(this.value);

        return this.value;
    };

    setValue = value => {
        this.speed = 0;
        this.value = this._clamp(value);
        return this.value;
    };

    _clamp = value => {
        return Math.min(this.to, Math.max(this.from, value));
    };
}

export default Inertia;
