export const clamp = (min, max, value) => Math.min(Math.max(value, min), max);

export const smoothstep = (min, max, value) => {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
};

export const pow = (x, n) => {
    if (n === 0) return 1;
    if (n === -1) return 1 / x;
    if (n === 1) return x;

    return Math.exp(n * Math.log(Math.abs(x)));
};

export const easeIn = power => t =>
    power % 1 === 0 ? t ** power : pow(t, power);
export const easeOut = power => t =>
    power % 1 === 0
        ? 1 - Math.abs((t - 1) ** power)
        : 1 - Math.abs(pow(t - 1, power));
export const easeInOut = (power1, power2) => t =>
    t < 0.5
        ? easeIn(power1)(t * 2) / 2
        : easeOut(power2 || power1)(t * 2 - 1) / 2 + 0.5;
