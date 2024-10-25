import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Welcome to Forks Up!</h1>
            <p className="text-gray-600 mb-8">Discover and save your favorite recipes.</p>

            <div className="flex justify-center space-x-4">
                {/* Giriş yapmış kullanıcıların kullanabileceği search butonu */}
                <Link to="/search" className="btn btn-secondary">
                    Search Recipes
                </Link>
            </div>
        </div>
    );
};

export default Home;
