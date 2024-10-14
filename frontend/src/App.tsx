import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import LandingPage from './LandingPage';

const App: React.FC = () => {
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect();
  };

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <div>
      {!isAuthenticated ? (
        <LandingPage handleLogin={handleLogin} /> 
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2>Welcome, {user?.name}!</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default App;
