import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Clock, Users, Utensils } from 'lucide-react';

const Home: React.FC = () => {
    const featuredRecipes = [
        {
            id: 1,
            title: "Homemade Pizza",
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591",
            time: "45 min",
            difficulty: "Medium",
            servings: 4
        },
        {
            id: 2,
            title: "Seasonal Salad",
            image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
            time: "15 min",
            difficulty: "Easy",
            servings: 2
        },
        {
            id: 3,
            title: "Baked Chicken",
            image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435",
            time: "60 min",
            difficulty: "Medium",
            servings: 4
        }
    ];

    const tags = [
        { name: "breakfast", displayName: "Breakfast", icon: "🍳" },
        { name: "main-course", displayName: "Main Courses", icon: "🍖" },
        { name: "salads", displayName: "Salads", icon: "🥗" },
        { name: "desserts", displayName: "Desserts", icon: "🍰" },
        { name: "beverages", displayName: "Beverages", icon: "🥤" },
        { name: "snacks", displayName: "Snacks", icon: "🥨" }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl p-8 mb-12">
                <div className="max-w-3xl">
                    <h1 className="text-4xl font-bold text-purple-800 mb-4">
                        Discover Cooking
                    </h1>
                    <p className="text-lg text-gray-700 mb-6">
                        Create wonders in the kitchen with thousands of delicious recipes, step-by-step instructions, and cooking tips.
                    </p>
                    <Link to="/search" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-300">
                        Explore Recipes
                    </Link>
                </div>
            </div>

            {/* Categories */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {tags.map((tag) => (
                        <Link to={`/search?tag=${tag.name}`} key={tag.name} 
                              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition duration-300 text-center">
                            <span className="text-3xl mb-2 block">{tag.icon}</span>
                            <span className="text-gray-700">{tag.displayName}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Recipes */}
            <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Featured Recipes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredRecipes.map((recipe) => (
                        <div key={recipe.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-300">
                            <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover" />
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">{recipe.title}</h3>
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <Clock size={16} className="mr-1" />
                                        <span>{recipe.time}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <ChefHat size={16} className="mr-1" />
                                        <span>{recipe.difficulty}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Users size={16} className="mr-1" />
                                        <span>Serves {recipe.servings}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;