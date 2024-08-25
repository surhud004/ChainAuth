import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../common/context/AuthContext';
import { Container, Paper, Alert, Typography, Button } from '@mui/material';
import Header from '../components/Header';
import { useSDK } from '@metamask/sdk-react';
import { Colors } from '../ui/theme/colors';
import MetamaskIcon from '../assets/Metamask';
import FreighterIcon from '../assets/Freighter';
import { getNetworkName } from '../helpers/networkName';
import { siweSign, verifySignature } from '../common/api/ethereum/metamask';
import {
  freighterConnect,
  siwsSign,
  freighterVerifySignature,
  freighterRetrieveNetwork
} from '../common/api/stellar/freighter';
import { createStore } from '../common/api';
import { NATIVE_ASSET } from '../helpers/nativeAsset';

const Login = () => {
  const { setAuthenticated, setUserAccount } = useContext(AuthContext);
  const { sdk, chainId } = useSDK();

  const navigate = useNavigate();

  window.Buffer = window.Buffer || require('buffer').Buffer;

  const [error, setError] = useState('');

  const metamaskConnect = async () => {
    try {
      const accounts = await sdk?.connect();
      if (accounts && Array.isArray(accounts)) {
        return accounts?.[0];
      }
    } catch (err) {
      console.warn('failed to connect..', err);
      return err;
    }
  };

  const handleMetamaskSignIn = async (e: any) => {
    e.preventDefault();
    try {
      const account = await metamaskConnect();
      const response = await siweSign(account, chainId);
      const isVerified = await verifySignature(account, response.msg, response.signature as string);
      if (response && isVerified) {
        const network = chainId ? getNetworkName(parseInt(chainId, 16)) : '';
        createStore(account, network, NATIVE_ASSET.ETHEREUM, response.signature as string);
        setAuthenticated(true);
        setUserAccount(account);
        navigate('/dashboard');
      } else {
        setError('Invalid signature');
      }
    } catch (e: any) {
      if (e.code === 4001) {
        setError(e.message);
      }
    }
  };

  const handleFreighterSignIn = async (e: any) => {
    try {
      e.preventDefault();
      const account = await freighterConnect();
      const response = await siwsSign(account);
      const isVerified = freighterVerifySignature(account, response.address);
      if (response && isVerified) {
        createStore(account, await freighterRetrieveNetwork(), NATIVE_ASSET.STELLAR, response.signedMessage);
        setAuthenticated(true);
        setUserAccount(account);
        navigate('/dashboard');
      } else {
        setError('Invalid signature');
      }
    } catch (e: any) {
      if (e.code === -4) {
        setError(e.message);
      }
    }
  };

  return (
    <>
      <Header />
      <Container component="main" maxWidth="xs" style={{ paddingTop: '40px' }}>
        <Paper
          elevation={3}
          sx={{
            padding: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: Colors.darkBackground
          }}
        >
          {error && (
            <Alert variant="filled" severity="error">
              {error}
            </Alert>
          )}
          <Typography component="h2" variant="h5" color={Colors.white}>
            Login
          </Typography>
          <form onSubmit={handleMetamaskSignIn} style={{ width: '100%', marginTop: 1 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ marginTop: 2, color: Colors.font }}
              startIcon={<MetamaskIcon />}
            >
              Login with Metamask
            </Button>
          </form>
          <form onSubmit={handleFreighterSignIn} style={{ width: '100%', marginTop: 1 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ marginTop: 2, color: Colors.font }}
              startIcon={<FreighterIcon />}
            >
              Login with Freighter
            </Button>
          </form>
        </Paper>
      </Container>
    </>
  );
};

export default Login;
