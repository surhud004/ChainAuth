export const createStore = (account: string, network: string, native: string, signed: string) => {
  localStorage.setItem('account', account);
  localStorage.setItem('network', network);
  localStorage.setItem('native', native);
  localStorage.setItem('signed', signed);
};

export const getStore = (key: string): string | null => {
  return localStorage.getItem(key);
};

export const deleteStore = () => {
  localStorage.removeItem('account');
  localStorage.removeItem('network');
  localStorage.removeItem('native');
  localStorage.removeItem('signed');
};
