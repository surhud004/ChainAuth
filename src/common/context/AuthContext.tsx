import { createContext, ReactNode, useState } from 'react';

type Props = {
  children?: ReactNode;
};

type IAuthContext = {
  authenticated: boolean;
  userAccount: string;
  setAuthenticated: (newState: boolean) => void;
  setUserAccount: (newAccount: string) => void;
};

const initialValue = {
  authenticated: false,
  userAccount: '',
  setAuthenticated: () => {},
  setUserAccount: () => {}
};

const AuthContext = createContext<IAuthContext>(initialValue);

const AuthProvider = ({ children }: Props) => {
  //Initializing an auth state with false value (unauthenticated)
  const [authenticated, setAuthenticated] = useState(initialValue.authenticated);
  const [userAccount, setUserAccount] = useState(initialValue.userAccount);

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        userAccount,
        setAuthenticated,
        setUserAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
