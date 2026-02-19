/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js}'],
    theme: {
        extend: {
            colors: {
                // Monokai-inspired dark theme
                monokai: {
                    bg: '#272822',
                    'bg-light': '#3e3d32',
                    'bg-lighter': '#49483e',
                    text: '#f8f8f2',
                    'text-muted': '#b0b0a8',
                    accent: '#a6e22e',      // green
                    'accent-hover': '#b8f339',
                    yellow: '#e6db74',
                    orange: '#fd971f',
                    red: '#f92672',
                    brown: '#8b7355',       // warm brown (replaces purple)
                    'brown-light': '#a08060',
                    cyan: '#66d9ef',
                },
            },
            fontSize: {
                // Accessible font sizes
                'xs': ['0.875rem', { lineHeight: '1.4' }],
                'sm': ['1rem', { lineHeight: '1.5' }],
                'base': ['1.125rem', { lineHeight: '1.6' }],
                'lg': ['1.25rem', { lineHeight: '1.6' }],
                'xl': ['1.5rem', { lineHeight: '1.4' }],
                '2xl': ['1.875rem', { lineHeight: '1.3' }],
                '3xl': ['2.25rem', { lineHeight: '1.2' }],
                '4xl': ['2.75rem', { lineHeight: '1.1' }],
                '5xl': ['3.5rem', { lineHeight: '1.1' }],
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
            },
        },
    },
    plugins: [require('@tailwindcss/forms')],
};
