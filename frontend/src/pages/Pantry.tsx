import React, { useEffect, useState } from 'react';
import {Search, Plus, Minus, Trash2, X} from 'lucide-react';
import {PantryItem} from "../model/PantryItem";
import {Ingredient} from "../model/Ingredient";
import {addIngredient, getIngredients, getPantryItems, removeIngredient} from "../api/ForksUpAPI";
import { getIngredientEmoji } from '../utils/ingredientEmojis';
import { measurementUnits, MeasurementUnit } from '../utils/MeasurementUnit';
import {AnimatePresence, motion} from 'framer-motion';

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
            <AnimatePresence>
                {searchResults.map(ingredient => (
                    <motion.div
                        key={ingredient.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-sm transition-all duration-200"
                    >
                        <span className="flex items-center text-gray-700 dark:text-gray-200">
                            <span className="mr-2 text-xl">
                                {getIngredientEmoji(ingredient.name.toLowerCase())}
                            </span>
                            {ingredient.name}
                        </span>
                        <button
                            onClick={() => openAddModal(ingredient)}
                            className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-colors"
                        >
                            <Plus size={20} className="text-purple-600 dark:text-purple-400" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>

            {searchQuery && searchResults.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center p-6 text-gray-500 dark:text-gray-400"
                >
                    <div className="inline-block bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3">
                        <Search size={24} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-sm">No ingredients found for "<span className="text-purple-600 dark:text-purple-400">{searchQuery}</span>"</p>
                </motion.div>
            )}
        </div>
    );

    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="text-center mb-8">
                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-pink-400 mb-2"
                >
                    My Pantry 🧺
                </motion.h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">Manage your kitchen inventory with ease</p>
            </div>

            {/* Error Message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-6 flex items-center gap-3"
                >
                    <div className="flex-1">{error}</div>
                    <button onClick={() => setError('')} className="hover:text-red-900 dark:hover:text-red-200">
                        <X size={18} />
                    </button>
                </motion.div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Search Column */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <div className="relative mb-6">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search ingredients..."
                            className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 transition-all"
                        />
                        <Search className="absolute right-4 top-3.5 text-gray-400 dark:text-gray-500" />
                    </div>

                    <div className="h-[calc(100vh-320px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                        {searchLoading ? (
                            <div className="flex flex-col items-center justify-center h-full py-8">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                    className="w-8 h-8 border-4 border-purple-500 dark:border-purple-400 border-t-transparent rounded-full mb-4"
                                />
                                <p className="text-gray-500 dark:text-gray-400">Searching ingredients...</p>
                            </div>
                        ) : (
                            renderSearchResults()
                        )}
                    </div>
                </div>

                {/* Pantry Column */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <span className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg">
                            🗄️
                        </span>
                        Pantry Inventory
                    </h2>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full py-8">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                className="w-8 h-8 border-4 border-purple-500 dark:border-purple-400 border-t-transparent rounded-full mb-4"
                            />
                            <p className="text-gray-500 dark:text-gray-400">Loading pantry items...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <AnimatePresence>
                                {pantryItems.map(item => (
                                    <motion.div
                                        key={item.ingredient.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="group flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-sm transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">
                                                {getIngredientEmoji(item.ingredient.name.toLowerCase())}
                                            </span>
                                            <span className="font-medium text-gray-700 dark:text-gray-200">
                                                {item.ingredient.name}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg border dark:border-gray-700">
                                                <button
                                                    onClick={() => HandleUpdateQuantity(item.ingredient.id, Math.max(0, item.quantity - 1), item.measurementUnit)}
                                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                                >
                                                    <Minus size={16} className="text-purple-600 dark:text-purple-400" />
                                                </button>

                                                <span className="text-sm font-mono text-purple-600 dark:text-purple-400 min-w-[40px] text-center">
                                                    {item.quantity}
                                                </span>

                                                <button
                                                    onClick={() => HandleUpdateQuantity(item.ingredient.id, item.quantity + 1, item.measurementUnit)}
                                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                                >
                                                    <Plus size={16} className="text-purple-600 dark:text-purple-400" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => handleRemoveIngredient(item.ingredient.id)}
                                                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={16} className="text-red-500 dark:text-red-400" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {pantryItems.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center p-8 text-gray-500 dark:text-gray-400"
                                >
                                    <div className="inline-block bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                                        🏷️
                                    </div>
                                    <p className="text-lg mb-2 text-gray-700 dark:text-gray-300">Pantry is empty!</p>
                                    <p className="text-sm">Search above to add your first ingredient</p>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl border dark:border-gray-700"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                Add {selectedIngredient?.name}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                <X size={20} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    value={modalQuantity}
                                    onChange={(e) => setModalQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    min="1"
                                    className="w-full px-4 py-2 bg-gray-50 dark:text-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    Unit
                                </label>
                                <select
                                    value={modalUnit}
                                    onChange={(e) => setModalUnit(e.target.value as MeasurementUnit)}
                                    className="w-full px-4 py-2 bg-gray-50 dark:text-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    {measurementUnits.map(unit => (
                                        <option
                                            key={unit}
                                            value={unit}
                                            className="dark:bg-gray-800"
                                        >
                                            {unit.toLowerCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 justify-end mt-6">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleModalSubmit}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
                                >
                                    Add to Pantry
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Pantry;