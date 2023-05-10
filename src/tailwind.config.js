/* eslint-disable no-undef */
module.exports = {
    content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
    theme: {
        extend: {
            fontSize: {
                '3xs': '.5rem',
                '2xs': '.6rem',
            },
            spacing: {
                32: '8rem',
                128: '32rem',
                160: '40rem',
                192: '48rem',
                full: '100%',
            },
            maxWidth: {
                '2xs': '16rem',
            },
            borderRadius: {
                inherit: 'inherit',
            },
        },
    },
    corePlugins: {
        aspectRatio: false,
    },
    variants: {
        extend: {
            margin: ['first', 'last'],
        },
    },
};
