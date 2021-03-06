import { smoothstep, easeInOut } from '.';

export default (pattern, progress) => {
    switch (pattern) {
        case 'spiral': {
            const eased = easeInOut(1.2, 1.5)(progress);
            const rounds = 2;
            const offset = Math.PI * 1;
            const additionalZoomOnLastRound = 0.3;

            const effect =
                smoothstep(0, 0.1, eased) * smoothstep(0, 0.1, 1 - eased) +
                smoothstep(0.5, 1, eased) *
                    smoothstep(0, 0.03, 1 - eased) *
                    additionalZoomOnLastRound;
            const angle = eased * Math.PI * rounds * 2 + offset;

            const x = Math.cos(angle) * effect * 0.5 + 0.5;
            const y = Math.sin(angle) * effect * 0.5 + 0.5;

            return {
                x,
                y,
            };
        }
        case 'circle': {
            const eased = easeInOut(1.2, 1.5)(progress);
            const rounds = 2;
            const offset = Math.PI * 1;

            const effect = 0.8;
            const angle = eased * Math.PI * rounds * 2 + offset;

            const x = Math.cos(angle) * effect * 0.5 + 0.5;
            const y = Math.sin(angle) * effect * 0.5 + 0.5;

            return {
                x,
                y,
            };
        }
        case 'upDown': {
            const eased = easeInOut(1.2, 1.5)(progress);
            const rounds = 2;
            const offset = Math.PI * 1;
            const additionalZoomOnLastRound = 0.3;

            const effect =
                smoothstep(0, 0.1, eased) * smoothstep(0, 0.1, 1 - eased) +
                smoothstep(0.5, 1, eased) *
                    smoothstep(0, 0.03, 1 - eased) *
                    additionalZoomOnLastRound;
            const angle = eased * Math.PI * rounds * 2 + offset;

            const x = Math.cos(angle) * effect * 0.5 * 0.1 + 0.5;
            const y = Math.sin(angle) * effect * 0.5 + 0.5;

            return {
                x,
                y,
            };
        }
        case 'fastSpiral': {
            const eased = easeInOut(0.8, 1.5)(progress);
            const rounds = 8;
            const offset = Math.PI * 1;
            const additionalZoomOnLastRound = 0.0;

            const effect =
                Math.max(
                    0.4,
                    smoothstep(0, 0.45, eased) * smoothstep(0, 0.45, 1 - eased)
                ) +
                smoothstep(0.5, 1, eased) * additionalZoomOnLastRound;

            const angle = eased * Math.PI * rounds * 2 + offset;

            const x = Math.cos(angle) * effect * 0.45 + 0.5;
            const y = Math.sin(angle) * effect * 0.45 + 0.5;

            return {
                x,
                y,
            };
        }
    }

    return {
        x: 0.5,
        y: 0.5,
    };
};
