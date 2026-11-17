/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Dark clinical scanner palette (built from Ink Navy, Warm Ivory and Quiet Taupe)
        ink: {
          DEFAULT: '#0A1116', // page canvas
          900: '#070C10',
          800: '#0E171E',
          700: '#111C24',
          600: '#16232D'
        },
        ivory: '#F6F2EA',
        mist: '#C3CBD0',   // body text on ink (11:1)
        fog: '#A9B4BB',    // secondary text on ink (8.5:1)
        slate: '#8E9BA4',  // meta text on ink (6.4:1)
        sand: '#DCD4C6',
        amber: {
          DEFAULT: '#E9B872',
          light: '#F1CF95',
          pale: '#F3E3C4',
          deep: '#D9932F'
        },
        mint: '#9BD3A8',
        canvas: {
          DEFAULT: '#F6F2EA', // Warm Ivory
          warm: '#F6F2EA',
          muted: '#EDE7DC',
          subtle: '#F0ECE4'
        },
        navy: {
          DEFAULT: '#263947', // Ink Navy
          deep: '#1C2B36',
          light: '#324A5C',
          dark: '#16222B'
        },
        stone: {
          soft: '#D8D1C6', // Soft Stone (rules and borders)
          rule: '#E2DCD2'
        },
        taupe: {
          quiet: '#9A8A72', // Quiet Taupe (labels and accents)
          dark: '#7A6C56',
          light: '#B3A58F'
        }
      },
      fontFamily: {
        serif: ['"EB Garamond"', 'Garamond', 'Georgia', 'serif'],
        sans: ['Lato', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif']
      },
      screens: {
        xs: '390px'
      }
    }
  },
  plugins: []
};
