import React, { useEffect, useState } from 'react';
import { Search, Plus, Minus, Trash2 } from 'lucide-react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import {PantryItem} from "../model/PantryItem";
import {Ingredient} from "../model/Ingredient";

const Pantry = () => {
    const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState('');

    const auth = getAuth();

    // API isteği için yardımcı fonksiyon
    const makeAuthenticatedRequest = async (requestFn: (token: string) => Promise<any>) => {
        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) {
                throw new Error('No authentication token available');
            }
            return await requestFn(token);
        } catch (err) {
            throw err;
        }
    };

    useEffect(() => {
        fetchPantryItems();
    }, []);

    // Ingredient arama
    useEffect(() => {
        const searchIngredients = async () => {
            if (searchQuery.trim() === '') {
                setSearchResults([]);
                return;
            }

            try {
                setSearchLoading(true);
                await makeAuthenticatedRequest(async (token) => {
                    const response = await axios.get(`http://localhost:8080/api/ingredients/search`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        params: { keyword: searchQuery }
                    });
                    setSearchResults(response.data);
                });
            } catch (err) {
                setError('Arama sırasında bir hata oluştu');
            } finally {
                setSearchLoading(false);
            }
        };

        const timeoutId = setTimeout(searchIngredients, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const fetchPantryItems = async () => {
        try {
            setLoading(true);
            await makeAuthenticatedRequest(async (token) => {
                const response = await axios.get('http://localhost:8080/api/user/pantry', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setPantryItems(response.data);
            });
        } catch (err) {
            setError('Pantry yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const addIngredient = async (ingredientId: string) => {
        try {
            await makeAuthenticatedRequest(async (token) => {
                await axios.post('http://localhost:8080/api/user/pantry', null, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        ingredientId,
                        quantity: 1
                    }
                });
            });
            fetchPantryItems();
        } catch (err) {
            setError('Ingredient eklenirken bir hata oluştu');
        }
    };

    const updateQuantity = async (ingredientId: string, quantity: number) => {
        try {
            await makeAuthenticatedRequest(async (token) => {
                await axios.put(`http://localhost:8080/api/user/pantry/${ingredientId}`, null, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: { quantity }
                });
            });
            fetchPantryItems();
        } catch (err) {
            setError('Miktar güncellenirken bir hata oluştu');
        }
    };

    const removeIngredient = async (ingredientId: string) => {
        try {
            await makeAuthenticatedRequest(async (token) => {
                await axios.delete(`http://localhost:8080/api/user/pantry/${ingredientId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            });
            fetchPantryItems();
        } catch (err) {
            setError('Ingredient silinirken bir hata oluştu');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">My Pantry</h1>

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
                                                onClick={() => addIngredient(ingredient.id)}
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
                                                onClick={() => updateQuantity(item.ingredient.id, Math.max(0, item.quantity - 1))}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                <Minus size={18} className="text-gray-600" />
                                            </button>

                                            <span className="w-8 text-center">{item.quantity}</span>

                                            <button
                                                onClick={() => updateQuantity(item.ingredient.id, item.quantity + 1)}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                <Plus size={18} className="text-gray-600" />
                                            </button>

                                            <button
                                                onClick={() => removeIngredient(item.ingredient.id)}
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