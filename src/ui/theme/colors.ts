import { createTheme } from '@mui/material';

export const Colors = {
  font: '#a63700',
  lightFont: '#e16f37',
  lightBackground: '#b4ddf2',
  darkBackground: '#076b8b',
  white: '#ffffff',
  black: '#000000',
  error: '#b20000'
};

export const theme = createTheme({
  palette: {
    primary: {
      main: Colors.lightBackground
    },
    secondary: {
      main: Colors.lightFont
    }
  }
});
