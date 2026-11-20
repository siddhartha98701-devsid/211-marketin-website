/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Semantic brand tokens (211 Marketing Brand Guidelines v3.0).
        // Values come from CSS variables in global.css so that any Ink Navy
        // block (.theme-navy) automatically inverts text and surface colours.
        //   paper  = surface / canvas   (Warm Ivory on light, Ink Navy in navy blocks)
        //   ink    = headlines, logo, key UI (Ink Navy on light, Warm Ivory in navy blocks)
        //   body   = body copy          (Graphite on light, Soft Stone in navy blocks)
        //   meta   = small labels        (Deep Taupe on light, Soft Stone in navy blocks)
        //   accent = Quiet Taupe fills, dividers and large-type accents
        //   accent-ink = small accent text (Deep Taupe on light, Soft Stone in navy blocks)
        paper: {
          DEFAULT: 'rgb(var(--c-paper) / <alpha-value>)',
          2: 'rgb(var(--c-paper-2) / <alpha-value>)'
        },
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        body: 'rgb(var(--c-body) / <alpha-value>)',
        meta: 'rgb(var(--c-meta) / <alpha-value>)',
        accent: {
          DEFAULT: 'rgb(var(--c-accent) / <alpha-value>)',
          ink: 'rgb(var(--c-accent-ink) / <alpha-value>)'
        },
        // Fixed brand colours (approved palette only)
        brand: {
          navy: '#263947',     // Ink Navy
          ivory: '#F6F2EA',    // Warm Ivory
          stone: '#D8D1C6',    // Soft Stone
          taupe: '#9A8A72',    // Quiet Taupe
          graphite: '#3F454B', // text tint
          deeptaupe: '#746753' // text tint
        },
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
        serif: ['"Instrument Sans Variable"', '"Instrument Sans"', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
        sans: ['Lato', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif']
      },
      screens: {
        xs: '390px'
      }
    }
  },
  plugins: []
};
