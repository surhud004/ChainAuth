import React, { useContext } from 'react';
import { Nav, NavLink, NavMenu } from './NavbarElements';
import logo from '../assets/logo.jpg';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../common/context/AuthContext';
import { Colors } from '../ui/theme/colors';
import { Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { deleteStore } from '../common/api';

const Navbar: React.FC = () => {
  const { setAuthenticated, setUserAccount, userAccount } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = (e: any) => {
    e.preventDefault();
    deleteStore();
    setAuthenticated(false);
    setUserAccount('');
    navigate('/');
  };
  return (
    <>
      <Nav>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: Colors.lightFont
          }}
        >
          <img src={logo} alt="logo" width="50px" height="50px" />
          <h2 style={{ paddingLeft: '10px' }}>ChainAuth</h2>
        </div>
        <NavMenu>
          <NavLink to="/dashboard">Dashboard</NavLink>
          {userAccount && <NavLink to="">{userAccount}</NavLink>}
          <Button variant="text" style={{ color: Colors.white }} onClick={handleLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </NavMenu>
      </Nav>
    </>
  );
};

export default Navbar;
