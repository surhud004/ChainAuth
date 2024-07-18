import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './common/context/AuthContext';
import { MetaMaskProvider } from '@metamask/sdk-react';
import { ThemeProvider } from '@mui/material';
import AppRoutes from './routes/AppRoutes';
import { theme } from './ui/theme/colors';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <MetaMaskProvider
          debug={false}
          sdkOptions={{
            dappMetadata: {
              name: 'ChainAuth',
              url: window.location.href
            }
          }}
        >
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </MetaMaskProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
