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
            darkBg: 'dark:bg-gradient-to-br dark:from-indigo-900 dark:via-purple-900 dark:to-blue-900',
            icon: <Sun className="text-amber-500 animate-pulse" size={56} />,
            decor: <Cloud className="absolute text-white/80 animate-float" size={40} />
        },
        afternoon: {
            bg: 'bg-gradient-to-br from-sky-200 via-cyan-100 to-emerald-100',
            darkBg: 'dark:bg-gradient-to-br dark:from-blue-900 dark:via-emerald-900 dark:to-cyan-900',
            icon: <Sun className="text-yellow-500/90" size={56} />,
            decor: <Cloud className="absolute text-gray-100/80 animate-float-delayed" size={40} />
        },
        evening: {
            bg: 'bg-gradient-to-br from-orange-200 via-rose-300 to-violet-400',
            darkBg: 'dark:bg-gradient-to-br dark:from-orange-900 dark:via-rose-900 dark:to-violet-900',
            icon: <Moon className="text-amber-400/90" size={56} />,
            decor: <Star className="absolute text-yellow-300/80 animate-twinkle" size={32} />
        },
        night: {
            bg: 'bg-gradient-to-br from-indigo-900 to-purple-800',
            darkBg: 'dark:bg-gradient-to-br dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900',
            icon: <Moon className="text-blue-200/90" size={56} />,
            decor: <Star className="absolute text-white/80 animate-twinkle-delayed" size={32} />
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
            {/* Enhanced Hero Section */}
            {/* Hero Section */}
            <div className={`${timeThemes[timeOfDay].bg} ${timeThemes[timeOfDay].darkBg} rounded-3xl p-12 mb-16 
               relative overflow-hidden transition-all duration-500 shadow-xl`}>
                <div className="max-w-3xl relative z-10">
                    <h1 className={`text-5xl font-bold mb-6 ${
                        ['morning', 'afternoon'].includes(timeOfDay)
                            ? 'text-gray-800 dark:text-white/90'
                            : 'text-white dark:text-white/90'
                    }`}>
                        Good {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}! 🌟
                    </h1>
                    <p className={`text-xl mb-8 ${
                        ['morning', 'afternoon'].includes(timeOfDay)
                            ? 'text-gray-700/95 dark:text-gray-300/90'
                            : 'text-white/90 dark:text-gray-300/90'
                    }`}>
                        {timeOfDay === 'morning' && 'Rise and shine! Discover perfect breakfast ideas'}
                        {timeOfDay === 'afternoon' && 'Fuel your day with delicious creations'}
                        {timeOfDay === 'evening' && 'Craft memorable dinners with our recipes'}
                        {timeOfDay === 'night' && 'Late-night culinary inspiration awaits'}
                    </p>
                    <Link to="/search" className={`inline-block px-8 py-4 rounded-xl transition-all
                                    duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-lg
                                    font-semibold ${
                        ['morning', 'afternoon'].includes(timeOfDay)
                            ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white/95 hover:from-purple-700 hover:to-blue-600'
                            : 'bg-gradient-to-r from-purple-400 to-blue-300 text-gray-800 hover:from-purple-300 hover:to-blue-200'
                    }`}>
                        Explore Recipes →
                    </Link>
                </div>

                {/* Animated Decorations */}
                <div className="absolute top-8 right-12 opacity-60">
                    {timeThemes[timeOfDay].icon}
                </div>
                <div className="absolute top-24 right-32 opacity-40">
                    {timeThemes[timeOfDay].decor}
                </div>
            </div>

            {/* Enhanced Categories */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white/90 mb-8">Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                    {tags.map((tag) => (
                        <Link to={`/search?tag=${tag.name}`} key={tag.name}
                              className="bg-white/95 dark:bg-gray-800/95 p-5 rounded-2xl shadow-lg hover:shadow-xl
                                      transition-all duration-300 text-center hover:-translate-y-1.5 group
                                      backdrop-blur-sm border border-white/20 dark:border-gray-700/50">
                            <span className="text-4xl mb-3 block transition-transform group-hover:scale-125
                                           group-hover:drop-shadow-lg">
                                {tag.icon}
                            </span>
                            <span className="text-gray-800/90 dark:text-gray-300/90 group-hover:text-purple-600
                                          dark:group-hover:text-purple-400 transition-colors font-medium">
                                {tag.displayName}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Enhanced Featured Recipes */}
            <section>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white/90 mb-8">Featured Recipes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredRecipes.map((recipe) => (
                        <div key={recipe.id}
                             className="bg-white/95 dark:bg-gray-800/95 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl
                                     transition-all duration-300 hover:-translate-y-1.5 group backdrop-blur-sm
                                     border border-white/20 dark:border-gray-700/50">
                            <div className="relative">
                                <img src={recipe.image} alt={recipe.title}
                                     className="w-full h-56 object-cover rounded-t-2xl"/>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-4">
                                    {recipe.title}
                                </h3>
                                <div className="flex items-center justify-between text-sm text-gray-700/90 dark:text-gray-400/90">
                                    <div className="flex items-center space-x-1.5">
                                        <Clock size={18} className="text-purple-600 dark:text-purple-400"/>
                                        <span>{recipe.time}</span>
                                    </div>
                                    <div className="flex items-center space-x-1.5">
                                        <ChefHat size={18} className="text-emerald-600 dark:text-emerald-400"/>
                                        <span>{recipe.difficulty}</span>
                                    </div>
                                    <div className="flex items-center space-x-1.5">
                                        <Users size={18} className="text-amber-600 dark:text-amber-400"/>
                                        <span>{recipe.servings}</span>
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