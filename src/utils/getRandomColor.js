import sample from 'just-random';

const profiles = {
    cold: [
        '#fe1bfe',
        '#2bffff',
        '#2109ff',
        '#1a59ff',
        '#0703cb',
        '#fe9ffe',
        '#361f94',
    ],
    warm: [
        '#2d3561',
        '#c05c7e',
        '#f3826f',
        '#ffb961',
        '#ca5fa6',
        '#f36886',
        '#fa8282',
        '#ffaf65',
    ],
    tropical: [
        'rgb(43, 108, 239)',
        'rgb(0, 255, 243)',
        'rgb(255, 121, 180)',
        'rgb(255, 238, 73)',
    ],
    gray: [
        'rgb(25, 25, 25)',
        'rgb(100, 100, 100)',
        'rgb(250, 250, 250)',
        'rgb(0, 0, 0)',
    ],
};

function getRandomColor(profile) {
    if (!profile) {
        profile = sample(Object.keys(profiles));
    }

    return sample(profiles[profile]);
}

export default getRandomColor;
