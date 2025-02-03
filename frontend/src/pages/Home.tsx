import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Clock, Users, Sun, Moon, Cloud, Star } from 'lucide-react';

const Home: React.FC = () => {
    const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

    useEffect(() => {
        const hour = new Date().getHours();
        
        if (hour >= 5 && hour < 12) setTimeOfDay('morning');
        else if (hour >= 12 && hour < 17) setTimeOfDay('afternoon');
        else if (hour >= 17 && hour < 21) setTimeOfDay('evening');
        else setTimeOfDay('night');
    }, []);

    const timeThemes = {
        morning: {
            bg: 'bg-gradient-to-br from-amber-100 via-yellow-100 to-blue-100',
            darkBg: 'dark:bg-gradient-to-br dark:from-indigo-900 dark:to-purple-900',
            icon: <Sun className="text-amber-500 animate-pulse" size={48} />,
            decor: <Cloud className="absolute text-white animate-float" size={32} />
        },
        afternoon: {
            bg: 'bg-gradient-to-br from-sky-200 via-cyan-100 to-emerald-100',
            darkBg: 'dark:bg-gradient-to-br dark:from-blue-900 dark:to-emerald-900',
            icon: <Sun className="text-yellow-500" size={48} />,
            decor: <Cloud className="absolute text-gray-100 animate-float-delayed" size={32} />
        },
        evening: {
            bg: 'bg-gradient-to-br from-orange-200 via-rose-300 to-violet-400',
            darkBg: 'dark:bg-gradient-to-br dark:from-orange-900 dark:to-rose-900',
            icon: <Moon className="text-amber-400" size={48} />,
            decor: <Star className="absolute text-yellow-300 animate-twinkle" size={24} />
        },
        night: {
            bg: 'bg-gradient-to-br from-indigo-900 to-purple-800',
            darkBg: 'dark:bg-gradient-to-br dark:from-gray-900 dark:to-blue-900',
            icon: <Moon className="text-blue-200" size={48} />,
            decor: <Star className="absolute text-white animate-twinkle-delayed" size={24} />
        }
    };
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
        { name: "main-dish", displayName: "Main Courses", icon: "🍖" },
        { name: "salads", displayName: "Salads", icon: "🥗" },
        { name: "desserts", displayName: "Desserts", icon: "🍰" },
        { name: "beverages", displayName: "Beverages", icon: "🥤" },
        { name: "snacks", displayName: "Snacks", icon: "🥨" }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Hero Section */}
            <div className={`${timeThemes[timeOfDay].bg} ${timeThemes[timeOfDay].darkBg} rounded-2xl p-8 mb-12 
                           relative overflow-hidden transition-all duration-500`}>
                <div className="max-w-3xl relative z-10">
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                        Good {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}! 🌟
                    </h1>
                    <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">
                        {timeOfDay === 'morning' && 'Start your day with delicious recipes!'}
                        {timeOfDay === 'afternoon' && 'What will you create for today\'s meal?'}
                        {timeOfDay === 'evening' && 'Perfect time to cook something special!'}
                        {timeOfDay === 'night' && 'Late night cravings? We\'ve got you covered!'}
                    </p>
                    <Link to="/search" className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-3
                                                rounded-lg hover:from-purple-700 hover:to-blue-600 transition-all
                                                duration-300 shadow-lg hover:shadow-xl">
                        Explore Recipes
                    </Link>
                </div>

                {/* Animated Decorations */}
                <div className="absolute top-4 right-8 opacity-50">
                    {timeThemes[timeOfDay].icon}
                </div>
                <div className="absolute top-16 right-24 opacity-30">
                    {timeThemes[timeOfDay].decor}
                </div>
            </div>

            {/* Categories */}
            <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {tags.map((tag) => (
                        <Link to={`/search?tag=${tag.name}`} key={tag.name}
                              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md
                                      transition duration-300 text-center hover:-translate-y-1 group">
                            <span className="text-3xl mb-2 block transition-transform group-hover:scale-110">
                                {tag.icon}
                            </span>
                            <span className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600
                                          dark:group-hover:text-purple-400 transition-colors">
                                {tag.displayName}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Recipes */}
            <section>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Featured Recipes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredRecipes.map((recipe) => (
                        <div key={recipe.id}
                             className="bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-300">
                            <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover"/>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{recipe.title}</h3>
                                <div
                                    className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center">
                                        <Clock size={16} className="mr-1"/>
                                        <span>{recipe.time}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <ChefHat size={16} className="mr-1"/>
                                        <span>{recipe.difficulty}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Users size={16} className="mr-1"/>
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