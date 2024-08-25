import { verifyMessage } from 'ethers';

export const siweSign = async (account: string, chainId: string | undefined) => {
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

export const verifySignature = async (account: string, message: string, signature: string) => {
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
