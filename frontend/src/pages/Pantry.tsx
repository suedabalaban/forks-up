import React, { useEffect, useState } from 'react';
import { Search, Plus, Minus, Trash2 } from 'lucide-react';
import {PantryItem} from "../model/PantryItem";
import {Ingredient} from "../model/Ingredient";
import {addIngredient, getIngredients, getPantryItems, removeIngredient} from "../api/ForksUpAPI";
import { getIngredientEmoji } from '../assets/ingredientEmojis';

const Pantry = () => {
    const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPantryItems();
    }, []);

    // Ingredient arama
    useEffect(() => {
        const HandleSearchIngredients = async () => {
            if (searchQuery.trim() === '') {
                setSearchResults([]);
                return;
            }

            try {
                setSearchLoading(true);
                const response = await getIngredients(searchQuery)
                setSearchResults(response.data);
            } catch (err) {
                setError('An error occurred during the search\n');
            } finally {
                setSearchLoading(false);
            }
        };

        const timeoutId = setTimeout(HandleSearchIngredients, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const fetchPantryItems = async () => {
        try {
            setLoading(true);
            const  response = await getPantryItems()
            setPantryItems(response.data);
        } catch (err) {
            setError('An error occurred while loading Pantry\n');
        } finally {
            setLoading(false);
        }
    };

    const HandleAddIngredient = async (ingredientId: string) => {
        try {
            await addIngredient(ingredientId);
            await fetchPantryItems();
        } catch (err) {
            setError('An error occurred while adding the ingredient');
        }
    };

    const HandleUpdateQuantity = async (ingredientId: string, quantity: number) => {
        try {
            await addIngredient(ingredientId)
            await fetchPantryItems();
        } catch (err) {
            setError('An error occurred while updating the quantity\n');
        }
    };

    const handleRemoveIngredient = async (ingredientId: string) => {
        try {
            await removeIngredient(ingredientId);
            await fetchPantryItems();
        } catch (err) {
            setError('An error occurred while deleting the ingredient\n');
        }
    };

    return (
        <div className="container mx-auto p-4 ">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-purple-800 dark:text-purple-400 mb-2">My Pantry 🧺</h1>
                <p className="text-purple-600 dark:text-purple-300">Keep track of your ingredients! ✨</p>
            </div>

            {error && (
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4 animate-shake">
                    {error}
                </div>
            )}

            <div className="flex gap-6 flex-col md:flex-row">
                {/* Left Column - Search and Results */}
                <div className="w-full md:w-1/2">
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
                        <div className="relative mb-4">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search ingredients... 🔍"
                                className="w-full p-3 pl-12 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300"
                            />
                            <Search className="absolute left-4 top-3.5 text-purple-400 dark:text-purple-300" size={20} />
                        </div>

                        <div className="max-h-[calc(100vh-300px)] overflow-y-auto mt-4 scrollbar-thin scrollbar-thumb-purple-500 dark:scrollbar-thumb-purple-400 scrollbar-track-purple-100 dark:scrollbar-track-gray-700">
                            {searchLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin text-purple-600 dark:text-purple-300 text-2xl mb-2">🔄</div>
                                    <p className="text-purple-600 dark:text-purple-300">Searching for ingredients...</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {searchResults.map(ingredient => (
                                        <div
                                            key={ingredient.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-purple-50 dark:hover:bg-gray-600 transition-all duration-300"
                                        >
                                            <span className="text-gray-700 dark:text-gray-300">
                                                <span className="mr-2">{getIngredientEmoji(ingredient.name.toLowerCase())}</span>
                                                {ingredient.name}
                                            </span>
                                            <button
                                                onClick={() => HandleAddIngredient(ingredient.id)}
                                                className="p-2 hover:bg-purple-100 dark:hover:bg-gray-600 rounded-full transition-all duration-300"
                                            >
                                                <Plus size={20} className="text-purple-600 dark:text-purple-300" />
                                            </button>
                                        </div>
                                    ))}
                                    {searchQuery && searchResults.length === 0 && (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <span className="text-2xl mb-2 block">🔍</span>
                                            No ingredients found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Pantry Contents */}
                <div className="w-full md:w-1/2">
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
                        <h2 className="text-xl font-semibold mb-4 text-purple-800 dark:text-purple-400">Current Pantry Items 🗄️</h2>
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin text-purple-600 dark:text-purple-300 text-2xl mb-2">🔄</div>
                                <p className="text-purple-600 dark:text-purple-300">Loading your pantry...</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pantryItems.length !== 0 && pantryItems.map(item => (
                                    <div
                                        key={item.ingredient.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-purple-50 dark:hover:bg-gray-600 transition-all duration-300 group"
                                    >
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                            <span className="mr-2">{getIngredientEmoji(item.ingredient.name.toLowerCase())}</span>
                                            {item.ingredient.name}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => HandleUpdateQuantity(item.ingredient.id, Math.max(0, item.quantity - 1))}
                                                className="p-2 hover:bg-purple-100 dark:hover:bg-gray-600 rounded-full transition-all duration-300"
                                            >
                                                <Minus size={18} className="text-purple-600 dark:text-purple-300" />
                                            </button>

                                            <span className="w-8 text-center font-semibold text-purple-700 dark:text-purple-300">{item.quantity}</span>

                                            <button
                                                onClick={() => HandleUpdateQuantity(item.ingredient.id, item.quantity + 1)}
                                                className="p-2 hover:bg-purple-100 dark:hover:bg-gray-600 rounded-full transition-all duration-300"
                                            >
                                                <Plus size={18} className="text-purple-600 dark:text-purple-300" />
                                            </button>

                                            <button
                                                onClick={() => handleRemoveIngredient(item.ingredient.id)}
                                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 ml-2"
                                            >
                                                <Trash2 size={18} className="text-red-600 dark:text-red-300" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {pantryItems.length === 0 && (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <span className="text-4xl mb-4 block">🏷️</span>
                                        <p className="text-lg mb-2">Your pantry is empty!</p>
                                        <p className="text-sm text-purple-500 dark:text-purple-300">Start by adding some ingredients above ✨</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pantry;