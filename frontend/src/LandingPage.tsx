import React from 'react';
import './LandingPage.css';

interface LandingPageProps {
  handleLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ handleLogin }) => {
  return (
    <div className="landing-page">
      <div className="content">
        <h1>Welcome to Forks-Up!</h1>
        <p>Your personal meal planner</p>
        <button className="get-started" onClick={handleLogin}>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
