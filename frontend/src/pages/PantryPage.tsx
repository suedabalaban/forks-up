import React, { useState } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import { Dialog, DialogTitle, DialogActions, DialogContent, Button, TextField } from '@mui/material';
import {Ingredient} from "../model/Ingredient";
import {auth} from "../config/firebaseconfig";

interface PantryItem {
    ingredientId: string;
    quantity: number;
}

const PantryPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
    const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [openDialog, setOpenDialog] = useState<boolean>(false);

    // Handle ingredient search
    const handleSearch = async () => {
        try {
            auth.currentUser?.getIdToken().then((token: any) => {
                axios.get(`http://localhost:8080/api/ingredients/search?keyword=${searchQuery}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }).then((data) => {
                    setSearchResults(data.data)
                })
            })
        } catch (error) {
            console.error('Error fetching ingredients:', error);
        }
    };

    // Open dialog to add ingredient to pantry
    const handleAddToPantry = (ingredient: Ingredient) => {
        setSelectedIngredient(ingredient);
        setOpenDialog(true);
    };

    // Confirm add to pantry
    const confirmAddToPantry = async () => {
        auth.currentUser?.getIdToken().then((token: any) => {
            axios.post('http://localhost:8080/api/user/pantry', null,
                {
                    params: {
                        ingredientId: selectedIngredient?.id,
                        quantity
                    },
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }
            ).then((response) => {
                setOpenDialog(false);
                setQuantity(1);
                alert('Ingredient added to pantry successfully!');
            }).catch((err) => {

            }).finally(() => {

            });
        })
    };

    return (
        <div className="max-w-2xl mx-auto p-5">
            <h1 className="text-2xl font-semibold mb-4">Search Ingredients</h1>
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search for ingredients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded-full px-4 py-2 w-full"
                />
                <button onClick={handleSearch} className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <Search className="text-gray-600 w-5 h-5" />
                </button>
            </div>
            <div className="mt-4">
                {searchResults.length > 0 ? (
                    <ul className="space-y-2">
                        {searchResults.map((ingredient) => (
                            <li
                                key={ingredient.id}
                                className="p-3 border rounded-lg flex justify-between items-center hover:bg-gray-100"
                            >
                                <span>{ingredient.name}</span>
                                <button
                                    onClick={() => handleAddToPantry(ingredient)}
                                    className="bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600"
                                >
                                    Add
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 mt-4">No ingredients found.</p>
                )}
            </div>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Add to Pantry</DialogTitle>
                <DialogContent>
                    <p>How many units of {selectedIngredient?.name} would you like to add?</p>
                    <TextField
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        inputProps={{ min: 1 }}
                        className="mt-2 w-full"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={confirmAddToPantry} color="primary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

        </div>
    );
};

export default PantryPage;