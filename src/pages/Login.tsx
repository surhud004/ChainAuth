import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../common/context/AuthContext';
import { Container, Paper, Alert, Typography, Button } from '@mui/material';
import Header from '../components/Header';
import { useSDK } from '@metamask/sdk-react';
import { Colors } from '../ui/theme/colors';
import MetamaskIcon from '../assets/Metamask';
import { verifyMessage } from 'ethers';

const Login = () => {
  const { setAuthenticated, setUserAccount } = useContext(AuthContext);
  const { sdk, chainId } = useSDK();

  const navigate = useNavigate();

  window.Buffer = window.Buffer || require('buffer').Buffer;

  const [error, setError] = useState('');

  const siweSign = async (account: string) => {
    try {
      const domain = window.location.host;
      const from = account;
      const siweMessage = `${domain} wants you to sign in with your Ethereum account:\n${from}\n\nI accept the MetaMask Terms of Service: https://community.metamask.io/tos\n\nURI: https://${domain}\nVersion: 1\nChain ID: ${
        chainId && parseInt(chainId, 16)
      }\nIssued At: ${new Date().toISOString()}`;
      const msg = `0x${Buffer.from(siweMessage, 'utf8').toString('hex')}`;
      const sign = await window.ethereum?.request({
        method: 'personal_sign',
        params: [msg, from]
      });
      return {
        msg: siweMessage,
        signature: sign
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const connect = async () => {
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

  const verifySignature = async (account: string, message: string, signature: string) => {
    try {
      const signedPubKey = verifyMessage(message, signature);
      if (signedPubKey.toLowerCase() === account.toLowerCase()) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleMetamaskSignIn = async (e: any) => {
    e.preventDefault();
    try {
      const account = await connect();
      const response = await siweSign(account);
      const isVerified = await verifySignature(account, response.msg, response.signature as string);
      if (isVerified) {
        localStorage.setItem('account', account);
        response && localStorage.setItem('signed', response.signature as string);
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
        </Paper>
      </Container>
    </>
  );
};

export default Login;
