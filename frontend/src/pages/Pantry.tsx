import React, { useEffect, useState } from 'react';
import { Search, Plus, Minus, Trash2 } from 'lucide-react';
import {PantryItem} from "../model/PantryItem";
import {Ingredient} from "../model/Ingredient";
import {addIngredient, getIngredients, getPantryItems, removeIngredient} from "../api/ForksUpAPI";
import { getIngredientEmoji } from '../assets/ingredientEmojis';
import { measurementUnits, MeasurementUnit } from '../assets/MeasurementUnit';

const Pantry = () => {
    const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedUnit, setSelectedUnit] = useState<MeasurementUnit>('PIECE');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
    const [modalQuantity, setModalQuantity] = useState(1);
    const [modalUnit, setModalUnit] = useState<MeasurementUnit>('PIECE');

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
            await addIngredient(ingredientId, 1, selectedUnit);
            await fetchPantryItems();
        } catch (err) {
            setError('An error occurred while adding the ingredient');
        }
    };

    const HandleUpdateQuantity = async (ingredientId: string, quantity: number, unit: string) => {
        try {
            await addIngredient(ingredientId, quantity, unit)
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

    const openAddModal = (ingredient: Ingredient) => {
        setSelectedIngredient(ingredient);
        setModalQuantity(1);
        setModalUnit('PIECE');
        setIsModalOpen(true);
    };

    const handleModalSubmit = async () => {
        if (!selectedIngredient) return;

        try {
            await addIngredient(selectedIngredient.id, modalQuantity, modalUnit);
            await fetchPantryItems();
            setIsModalOpen(false);
        } catch (err) {
            setError('An error occurred while adding/updating the ingredient');
        }
    };

    const renderSearchResults = () => (
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
                        onClick={() => openAddModal(ingredient)}
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
    );

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
                                placeholder="Search ingredients... "
                                className="w-full px-4 py-2 pr-12 rounded-full border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Search size={20}/>
                            </button>
                        </div>

                        <div
                            className="max-h-[calc(100vh-300px)] overflow-y-auto mt-4 scrollbar-thin scrollbar-thumb-purple-500 dark:scrollbar-thumb-purple-400 scrollbar-track-purple-100 dark:scrollbar-track-gray-700">
                            {searchLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin text-purple-600 dark:text-purple-300 text-2xl mb-2">🔄
                                    </div>
                                    <p className="text-purple-600 dark:text-purple-300">Searching for ingredients...</p>
                                </div>
                            ) : (
                                renderSearchResults()
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
                                                onClick={() => HandleUpdateQuantity(item.ingredient.id, Math.max(0, item.quantity - 1), item.measurementUnit)}
                                                className="p-2 hover:bg-purple-100 dark:hover:bg-gray-600 rounded-full transition-all duration-300"
                                            >
                                                <Minus size={18} className="text-purple-600 dark:text-purple-300"/>
                                            </button>

                                            <span
                                                className="w-16 text-center font-semibold text-purple-700 dark:text-purple-300 flex items-center justify-center gap-x-2.5">
                                                <span>{item.quantity}</span>
                                                <span>{item.measurementUnit.toLowerCase()}</span>
                                            </span>

                                            <button
                                                onClick={() => HandleUpdateQuantity(item.ingredient.id, item.quantity + 1, item.measurementUnit)}
                                                className="p-2 hover:bg-purple-100 dark:hover:bg-gray-600 rounded-full transition-all duration-300"
                                            >
                                                <Plus size={18} className="text-purple-600 dark:text-purple-300"/>
                                            </button>

                                            <button
                                                onClick={() => handleRemoveIngredient(item.ingredient.id)}
                                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 ml-2"
                                            >
                                                <Trash2 size={18} className="text-red-600 dark:text-red-300"/>
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

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
                        <h2 className="text-xl font-semibold mb-4 text-purple-800 dark:text-purple-400">
                            Add {selectedIngredient?.name} to Pantry
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    value={modalQuantity}
                                    onChange={(e) => setModalQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    min="1"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Unit
                                </label>
                                <select
                                    value={modalUnit}
                                    onChange={(e) => setModalUnit(e.target.value as MeasurementUnit)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700"
                                >
                                    {measurementUnits.map(unit => (
                                        <option key={unit} value={unit}>{unit.toLowerCase()}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleModalSubmit}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Add to Pantry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pantry;