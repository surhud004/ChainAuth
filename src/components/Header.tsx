import React from 'react';
import logo from '../assets/logo.jpg';
import { Colors } from '../ui/theme/colors';

const Header: React.FC = () => {
  return (
    <div
      style={{
        background: Colors.darkBackground,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: Colors.lightFont
      }}
    >
      <img src={logo} alt="logo" width="50px" height="50px" />
      <h2 style={{ paddingLeft: '10px' }}>ChainAuth</h2>
    </div>
  );
};

export default Header;
