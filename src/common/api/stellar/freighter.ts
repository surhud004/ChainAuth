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

export const freighterRetrieveNetwork = async (): Promise<string> => {
  const networkObj = await getNetwork();

  if (networkObj.error) {
    return networkObj.error;
  } else {
    return networkObj.network;
  }
};

export const freighterConnect = async () => {
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

export const siwsSign = async (account: string) => {
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

export const freighterVerifySignature = (account: string, signerAddress: string) => {
  try {
    // todo improve verification logic - freighter returns signed message instead of signature
    // const isValid = nacl.sign.open(account, signedMessage);
    return account === signerAddress;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
