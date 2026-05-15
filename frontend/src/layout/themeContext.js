import React, { createContext, useState, useMemo } from 'react';
import { 
  createTheme, 
  ThemeProvider as MuiThemeProvider
} from '@material-ui/core/styles';

// Create the color mode context
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
  mode: 'light'
});

// Main theme provider component
export const ThemeProvider = ({ children }) => {
  // Get the user's preferred color scheme from localStorage or use system preference
  const getInitialMode = () => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      return savedMode;
    }
    // Check system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  };

  const [mode, setMode] = useState(getInitialMode);

  // Color mode toggler function
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', newMode);
          return newMode;
        });
      },
      mode,
    }),
    [mode],
  );

  // Generate theme based on current mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          type: mode,
          mode: mode,
          primary: {
            main: mode === 'light' ? '#682ee2' : '#8955ff',
            light: '#9d7aea',
            dark: '#4d21a9',
            contrastText: '#ffffff',
          },
          secondary: {
            main: mode === 'light' ? '#ff5722' : '#ff784e',
            light: '#ff8a65',
            dark: '#e64a19',
            contrastText: '#ffffff',
          },
          background: {
            default: mode === 'light' ? '#f5f5f7' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
          text: {
            primary: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
            secondary: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
          },
          error: {
            main: '#f44336',
            light: '#e57373',
            dark: '#d32f2f',
          },
          warning: {
            main: '#ff9800',
            light: '#ffb74d',
            dark: '#f57c00',
          },
          info: {
            main: '#2196f3',
            light: '#64b5f6',
            dark: '#1976d2',
          },
          success: {
            main: '#4caf50',
            light: '#81c784',
            dark: '#388e3c',
          },
          divider: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
          // Custom colors used in the app
          dark: {
            main: mode === 'light' ? '#333333' : '#ffffff',
          },
          fancyBackground: mode === 'light' ? '#f5f5f7' : '#121212',
          barraSuperior: mode === 'light' ? '#682ee2' : '#1a1a1a',
        },
        typography: {
          fontFamily: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
          ].join(','),
          h1: {
            fontSize: '2rem',
            fontWeight: 600,
            lineHeight: 1.2,
          },
          h2: {
            fontSize: '1.75rem',
            fontWeight: 600,
            lineHeight: 1.3,
          },
          h3: {
            fontSize: '1.5rem',
            fontWeight: 600,
            lineHeight: 1.3,
          },
          h4: {
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.4,
          },
          h5: {
            fontSize: '1.1rem',
            fontWeight: 600,
            lineHeight: 1.4,
          },
          h6: {
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.5,
          },
          body1: {
            fontSize: '1rem',
            lineHeight: 1.5,
          },
          body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
          },
          button: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
        shape: {
          borderRadius: 8,
        },
        overrides: {
          MuiButton: {
            root: {
              borderRadius: 8,
              textTransform: 'none',
              fontWeight: 500,
              padding: '8px 16px',
            },
            contained: {
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
              },
            },
          },
          MuiPaper: {
            rounded: {
              borderRadius: 8,
            },
            elevation1: {
              boxShadow: mode === 'light' 
                ? '0px 2px 8px rgba(0, 0, 0, 0.08)' 
                : '0px 2px 8px rgba(0, 0, 0, 0.5)',
            },
            elevation2: {
              boxShadow: mode === 'light' 
                ? '0px 3px 10px rgba(0, 0, 0, 0.1)' 
                : '0px 3px 10px rgba(0, 0, 0, 0.6)',
            },
          },
          MuiAppBar: {
            colorPrimary: {
              backgroundColor: mode === 'light' ? '#682ee2' : '#1a1a1a',
            },
          },
          MuiDrawer: {
            paper: {
              backgroundColor: mode === 'light' ? '#ffffff' : '#1c1c1c',
            },
          },
          MuiTableCell: {
            root: {
              borderBottom: mode === 'light' 
                ? '1px solid rgba(0, 0, 0, 0.1)' 
                : '1px solid rgba(255, 255, 255, 0.1)',
            },
            head: {
              fontWeight: 600,
              backgroundColor: mode === 'light' 
                ? '#f5f5f7' 
                : '#262626',
            },
          },
          MuiTabs: {
            indicator: {
              height: 3,
            },
          },
          MuiTab: {
            root: {
              textTransform: 'none',
              fontWeight: 500,
              '&$selected': {
                fontWeight: 600,
              },
            },
          },
          MuiListItem: {
            root: {
              '&$selected': {
                backgroundColor: mode === 'light' 
                  ? 'rgba(104, 46, 226, 0.1)' 
                  : 'rgba(137, 85, 255, 0.2)',
                '&:hover': {
                  backgroundColor: mode === 'light' 
                    ? 'rgba(104, 46, 226, 0.15)' 
                    : 'rgba(137, 85, 255, 0.25)',
                },
              },
            },
          },
          MuiChip: {
            root: {
              borderRadius: 16,
            },
          },
        },
        scrollbarStyles: {
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: mode === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.15)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: mode === 'light' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.25)',
          },
          '&::-webkit-scrollbar-track': {
            background: mode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px',
          },
        },
        scrollbarStylesSoft: {
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: mode === 'light' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: mode === 'light' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.2)',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
        },
        // Add the mode property to the theme
        mode,
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default ColorModeContext;