import { base } from '@theme-ui/presets'
import { Theme } from 'theme-ui'

const breakpointMap: { [key: string]: number } = {
  xs: 370,
  sm: 576,
  md: 852,
  lg: 968,
  xl: 1080,
  xxl: 1200,
};

const common = {
  button: {
    '&:hover': {
      cursor: 'pointer',
      opacity: 0.7
    },
    "&:disabled": {
      opacity: 0.4
    }
  }
}

const mediaQueries = {
  xs: `@media screen and (min-width: ${breakpointMap.xs}px)`,
  sm: `@media screen and (min-width: ${breakpointMap.sm}px)`,
  md: `@media screen and (min-width: ${breakpointMap.md}px)`,
  lg: `@media screen and (min-width: ${breakpointMap.lg}px)`,
  xl: `@media screen and (min-width: ${breakpointMap.xl}px)`,
  xxl: `@media screen and (min-width: ${breakpointMap.xxl}px)`,
  nav: `@media screen and (min-width: ${breakpointMap.lg}px)`,
};

const customTheme: Theme = {
  breakpoints: Object.values(breakpointMap).sort((a, b) => a - b).map(v => `${v}px`),
  fontSizes: [
    12, 14, 16, 20, 24, 32, 48, 64
  ],
  mediaQueries,
  colors: {
    green: '#508b33',
    greens: [
      '#508b33',
      '#8dd668'
    ],

    text: 'black',
    grey: '#f3f3f3',

    white: 'white',
    blue: '#07c',
    
    

    lightgray: '#f6f6ff',

    primary: '#508b33',
    secondary: "lightgrey",
    success: 'green',
    failure: 'red',
    warning: '#dbdb7a'
  },
  space: [
    0, 4, 8, 16, 32, 64, 128, 256
  ],
  fonts: {
    body: 'system-ui, sans-serif',
    heading: 'inherit',
    monospace: 'Menlo, monospace',
  },
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.25,
  },
  shadows: {
    small: '0 0 4px rgba(0, 0, 0, .2)',
    large: '0 0 24px rgba(0, 0, 0, .2)'
  },
  text: {
  },
  
  cards: {
    primary: {
      padding: 2,
      borderRadius: 4,
      boxShadow: '0 0 8px rgba(0, 0, 0, 0.125)',
    },
    compact: {
      padding: 1,
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'muted',
    },
  },
  
  buttons: {
    primary: {
      ...common.button,
      color: 'white',
      bg: 'primary',
    },
    secondary: {
      ...common.button,
      color: 'white',
      bg: "secondary"
    }
  }
}

export const theme: Theme = {
  ...customTheme,

  //...base,
} as const 

export type MyTheme = typeof theme

