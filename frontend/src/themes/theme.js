import { createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  palette: {
    mode: 'light',

    primary: {
      main: '#123458',
      light: '#345A80',
      dark: '#0B223D',
      contrastText: '#FFFFFF',
    },

    secondary: {
      main: '#90CAF9',
      contrastText: '#0B223D',
    },

    background: {
      default: '#F4F6F8',
      paper: '#FFFFFF',
    },

    text: {
      primary: '#1F2937',
      secondary: '#526174',
    },

    primaryLight: {
      main: '#345A80',
      contrastText: '#FFFFFF',
    },
  },
})