import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Container, Paper, Typography, Alert } from '@mui/material';
import { AuthContext } from '../common/context/AuthContext';
import { Colors } from '../ui/theme/colors';
import { useSDK } from '@metamask/sdk-react';
import { getNetworkName } from '../helpers/networkName';

type Props = {};

const Dashboard: React.FC = (props: Props) => {
  const { userAccount, setAuthenticated, setUserAccount } = useContext(AuthContext);
  const { chainId, balance } = useSDK();
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  window.Buffer = window.Buffer || require('buffer').Buffer;

  useEffect(() => {
    let signedMessage = localStorage.getItem('signed');
    signedMessage && setSuccess(`Login successful! Signed: ${signedMessage}`);
    if (window.ethereum && window.ethereum.isMetaMask) {
      const handleAccountsChanged = () => {
        localStorage.removeItem('account');
        setAuthenticated(false);
        setUserAccount('');
        navigate('/');
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Navbar />
      <Container component="main" maxWidth="lg" style={{ paddingTop: '40px' }}>
        <Paper
          elevation={3}
          sx={{
            padding: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'left',
            backgroundColor: Colors.darkBackground
          }}
        >
          {success && (
            <Alert variant="filled" severity="success">
              {success}
            </Alert>
          )}
          <Typography component="h2" variant="h5" sx={{ margin: '10px' }} color={Colors.white}>
            Welcome, {userAccount.substring(0, 4) + `...` + userAccount.substring(userAccount.length - 4)}!
          </Typography>
          <Typography component="h4" variant="subtitle1" sx={{ margin: '10px' }} color={Colors.white}>
            Account Balance: {balance && parseInt(balance, 16) / 1000000000000000000} ETH
          </Typography>
          <Typography component="h4" variant="subtitle1" sx={{ margin: '10px' }} color={Colors.white}>
            Network: {chainId && getNetworkName(parseInt(chainId, 16))}
          </Typography>
        </Paper>
      </Container>
    </>
  );
};

export default Dashboard;
