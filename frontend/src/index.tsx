import React from 'react';
import ReactDOM from 'react-dom/client'; // Yeni import
import App from './App';
import { Auth0Provider } from '@auth0/auth0-react';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <Auth0Provider
    domain="dev-gf0mtdiw8skudwps.us.auth0.com"
    clientId="0X5OBMjMCUu4kSc61QpzUTMQ4pBIdjCA"
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
    <App />
  </Auth0Provider>
);
