import React, { useEffect, useState } from 'react';
import { Search, Plus, Minus, Trash2 } from 'lucide-react';
import axios from 'axios';
import {PantryItem} from "../model/PantryItem";
import {Ingredient} from "../model/Ingredient";
import {addIngredient, getIngredients, getPantryItems, removeIngredient} from "../api/ForksUpAPI";

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
        <div className="container mx-auto p-4">
            <h1 className="text-2xl text-center font-bold mb-6">My Pantry</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="flex gap-6">
                {/* Sol Kolon - Arama ve Sonuçları */}
                <div className="w-1/2">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search ingredients..."
                                className="w-full p-2 pl-10 border rounded-lg"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                        </div>

                        <div className="max-h-screen overflow-y-auto mt-4">
                            {searchLoading ? (
                                <div className="text-center py-4">Searching...</div>
                            ) : (
                                <div className="space-y-2">
                                    {searchResults.map(ingredient => (
                                        <div
                                            key={ingredient.id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                        >
                                            <span>{ingredient.name}</span>
                                            <button
                                                onClick={() => HandleAddIngredient(ingredient.id)}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                <Plus size={20} className="text-green-600" />
                                            </button>
                                        </div>
                                    ))}
                                    {searchQuery && searchResults.length === 0 && (
                                        <div className="text-center py-4 text-gray-500">
                                            No ingredients found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sağ Kolon - Pantry İçeriği */}
                <div className="w-1/2">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Current Pantry Items</h2>
                        {loading ? (
                            <div className="text-center py-4">Loading pantry items...</div>
                        ) : (
                            <div className="space-y-3">
                                {pantryItems.length !== 0 && pantryItems.map(item => (
                                    <div
                                        key={item.ingredient.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <span className="font-medium">{item.ingredient.name}</span>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => HandleUpdateQuantity(item.ingredient.id, Math.max(0, item.quantity - 1))}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                <Minus size={18} className="text-gray-600" />
                                            </button>

                                            <span className="w-8 text-center">{item.quantity}</span>

                                            <button
                                                onClick={() => HandleUpdateQuantity(item.ingredient.id, item.quantity + 1)}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                <Plus size={18} className="text-gray-600" />
                                            </button>

                                            <button
                                                onClick={() => handleRemoveIngredient(item.ingredient.id)}
                                                className="p-1 hover:bg-gray-100 rounded ml-2"
                                            >
                                                <Trash2 size={18} className="text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {pantryItems.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        Your pantry is empty. Start by adding some ingredients!
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