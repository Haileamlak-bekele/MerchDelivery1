import colors from 'tailwindcss/colors'; // Use ES Module import

export default {
  darkMode: 'class', // Enable dark mode based on class
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan these files for Tailwind classes
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.emerald, // Use emerald palette for primary accent
        gray: colors.slate, // Use slate for gray tones
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
    },
  },
  plugins: [
    // eslint-disable-next-line no-undef
    require('@tailwindcss/forms'), // Optional: enhances form styling
  ],
};
