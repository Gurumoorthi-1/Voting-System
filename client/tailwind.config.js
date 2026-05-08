/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontSize: {
                'xs': ['0.7rem', { lineHeight: '1rem' }],
                'sm': ['0.8rem', { lineHeight: '1.25rem' }],
                'base': ['0.9rem', { lineHeight: '1.5rem' }],
                'lg': ['1rem', { lineHeight: '1.75rem' }],
                'xl': ['1.1rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.25rem', { lineHeight: '2rem' }],
                '3xl': ['1.5rem', { lineHeight: '2.25rem' }],
                '4xl': ['1.75rem', { lineHeight: '2.5rem' }],
                '5xl': ['2.25rem', { lineHeight: '1' }],
                '6xl': ['2.75rem', { lineHeight: '1' }],
            },
            fontWeight: {
                thin: '100',
                extralight: '200',
                light: '300',
                normal: '400',
                medium: '500',
                semibold: '500',
                bold: '600',
                extrabold: '700',
                black: '700',
            },
            fontFamily: {
                outfit: ['Outfit', 'sans-serif'],
            },
            animation: {
                'card-entrance': 'card-entrance 0.5s ease-out forwards',
                'fade-in': 'fade-in 0.5s ease-out forwards',
                'slide-up': 'slide-up 0.5s ease-out forwards',
            },
            keyframes: {
                'card-entrance': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'slide-up': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
