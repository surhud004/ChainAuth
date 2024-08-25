import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../common/context/AuthContext';
import { Container, Paper, Alert, Typography, Button } from '@mui/material';
import Header from '../components/Header';
import { useSDK } from '@metamask/sdk-react';
import { Colors } from '../ui/theme/colors';
import MetamaskIcon from '../assets/Metamask';
import FreighterIcon from '../assets/Freighter';
import { verifyMessage } from 'ethers';
import {
  isConnected,
  isAllowed,
  signMessage,
  setAllowed,
  requestAccess,
  getNetwork,
  getAddress
} from '@stellar/freighter-api';
// import { Keypair } from '@stellar/stellar-sdk';
// import * as nacl from 'tweetnacl';
import { getNetworkName } from '../helpers/networkName';

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
        localStorage.setItem('network', chainId ? getNetworkName(parseInt(chainId, 16)) : '');
        localStorage.setItem('native', 'ETH');
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

  const freighterRetrieveNetwork = async (): Promise<string> => {
    const networkObj = await getNetwork();

    if (networkObj.error) {
      return networkObj.error;
    } else {
      return networkObj.network;
    }
  };

  const freighterConnect = async () => {
    try {
      // check freighter installed
      const connected = await isConnected();
      if (!connected.isConnected) {
        throw new Error('Freighter not installed');
      }
      // check freighter allowed
      const allowed = await isAllowed();
      if (!allowed.isAllowed) {
        // allow freighter access permissions
        const allow = await setAllowed();
        if (!allow.isAllowed) {
          throw new Error('User denied connection permissions');
        } else {
          // retrieve address
          const accessObj = await requestAccess();

          if (accessObj.error) {
            return accessObj.error;
          } else {
            return accessObj.address;
          }
        }
      } else {
        // already permissions, retrieve address
        const addressObj = await getAddress();

        if (addressObj.error) {
          return addressObj.error;
        } else {
          return addressObj.address;
        }
      }
    } catch (err: any) {
      console.warn('failed to connect..', err);
      throw err;
    }
  };

  const siwsSign = async (account: string) => {
    try {
      const domain = window.location.host;
      const from = account;
      const network = await freighterRetrieveNetwork();
      const siwsMessage = `${domain} wants you to sign in with your Stellar account:\n${from}\n\nURI: https://${domain}\n\nNETWORK: ${network}\n\nIssued At: ${new Date().toISOString()}`;
      const signedMessage = await signMessage(siwsMessage);
      if (signedMessage.error) {
        throw signedMessage.error;
      }
      return {
        message: siwsMessage,
        signedMessage: Buffer.from(signedMessage.signedMessage ?? '').toString('hex'),
        address: signedMessage.signerAddress
      };
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  };

  const freighterVerifySignature = (account: string, signerAddress: string) => {
    try {
      // todo improve verification logic - freighter returns signed message instead of signature
      // const isValid = nacl.sign.open(account, signedMessage);
      return account === signerAddress;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleFreighterSignIn = async (e: any) => {
    try {
      e.preventDefault();
      const account = await freighterConnect();
      const response = await siwsSign(account);
      const isVerified = freighterVerifySignature(account, response.address);
      if (isVerified) {
        localStorage.setItem('account', account);
        localStorage.setItem('network', await freighterRetrieveNetwork());
        localStorage.setItem('native', 'XLM');
        response && localStorage.setItem('signed', response.signedMessage);
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
