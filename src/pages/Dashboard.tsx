import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Container, Paper, Typography, Alert } from '@mui/material';
import { AuthContext } from '../common/context/AuthContext';
import { Colors } from '../ui/theme/colors';
import { useSDK } from '@metamask/sdk-react';
import * as StellarSdk from '@stellar/stellar-sdk';
import { deleteStore, getStore } from '../common/api';

type Props = {};

const Dashboard: React.FC = (props: Props) => {
  const { userAccount, setAuthenticated, setUserAccount } = useContext(AuthContext);
  const { balance } = useSDK();
  const [success, setSuccess] = useState('');
  const [calcBalance, setCalcBalance] = useState('');
  const navigate = useNavigate();

  const network = getStore('network');
  const nativeAsset = getStore('native');
  const server = new StellarSdk.Horizon.Server(
    network === 'TESTNET' ? 'https://horizon-testnet.stellar.org' : 'https://horizon.stellar.org'
  );

  window.Buffer = window.Buffer || require('buffer').Buffer;

  const fetchStellarNativeBalance = async () => {
    try {
      const account = await server.loadAccount(userAccount);
      return account.balances[0].balance;
    } catch (err) {
      throw err;
    }
  };

  const getBalance = async () => {
    let calcBalance = 0;
    if (nativeAsset === 'ETH') {
      calcBalance = balance ? parseInt(balance, 16) / 1000000000000000000 : 0;
    } else if (nativeAsset === 'XLM') {
      calcBalance = Number(await fetchStellarNativeBalance());
    }
    setCalcBalance(`${calcBalance} ${nativeAsset}`);
  };

  useEffect(() => {
    let signedMessage = getStore('signed');
    signedMessage && setSuccess(`Login successful! Verified Signature: ${signedMessage}`);
    const fetchBalance = async () => {
      await getBalance();
    };
    fetchBalance();
    if (window.ethereum && window.ethereum.isMetaMask) {
      const handleAccountsChanged = () => {
        deleteStore();
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
            Account Balance: {calcBalance}
          </Typography>
          <Typography component="h4" variant="subtitle1" sx={{ margin: '10px' }} color={Colors.white}>
            Network: {network}
          </Typography>
        </Paper>
      </Container>
    </>
  );
};

export default Dashboard;
