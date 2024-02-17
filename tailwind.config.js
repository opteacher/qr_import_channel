/** @type {import('tailwindcss').Config} */
import myLib from './src/lib/frontend-library/tailwind.config'

export default {
  corePlugins: {
    preflight: false
  },
  important: true,
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  media: false, // or 'media' or 'class'
  theme: {
    extend: {
      ...myLib.theme.extend,
      backgroundImage: {
        login: 'url(/assets/background.png)'
      },
      lineHeight: {
        16: '4rem'
      }
    },
    textColor: theme => ({
      ...myLib.theme.textColor(theme)
    }),
    backgroundColor: theme => ({
      ...myLib.theme.backgroundColor(theme)
    }),
    borderColor: theme => ({
      ...myLib.theme.borderColor(theme)
    })
  },
  variants: {
    extend: {}
  },
  plugins: []
}
