import React, { useState, useEffect, FormEvent } from 'react';
import RecipeCard from '../components/RecipeCard';
import { Search } from 'lucide-react';

type Recipe = {
    id: string;
    name: string;
    servings: number;
    serving_size: string;
    ingredients?: string[];
    steps?: string[];
};

const SearchRecipes: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [size] = useState(10); 
    const [totalPages, setTotalPages] = useState(0);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    const fetchRecipes = async () => {
        if (!searchTerm.trim()) return;
        setLoading(true);
        setError(null);
    
        try {
            const response = await fetch(`http://localhost:8080/api/recipes/search-regex?keyword=${searchTerm}&page=${page}&size=${size}`);
            if (!response.ok) {
                throw new Error('No recipes found');
            }
            const data = await response.json();
            setRecipes(data._embedded.recipeList || []); 
            setTotalPages(data.page.totalPages || 0); 
        } catch (err: any) {
            setError(err.message);
            setRecipes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipes();
    }, [page]);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        setPage(0); 
        fetchRecipes();
    };

    const goToNextPage = () => {
        if (page < totalPages - 1) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (page > 0) {
            setPage((prevPage) => prevPage - 1);
        }
    };

    const handleClosePopup = () => {
        setSelectedRecipe(null);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search recipes..."
                            className="w-full px-4 py-2 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-blue-500"
                        >
                            <Search size={20} />
                        </button>
                    </div>
                </form>
            </div>

            {loading && <div className="text-center text-gray-600">Loading recipes...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}

            {recipes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe) => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            onClick={() => setSelectedRecipe(recipe)}
                        />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <button
                        onClick={goToPreviousPage}
                        disabled={page === 0}
                        className="px-4 py-2 mx-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={goToNextPage}
                        disabled={page === totalPages - 1}
                        className="px-4 py-2 mx-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {!loading && !error && recipes.length === 0 && (
                <div className="text-center text-gray-600">Try searching!</div>
            )}

            {selectedRecipe && (
                <div
                    onClick={handleClosePopup}
                    className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center"
                >
                    <div
                        onClick={(e) => e.stopPropagation()} // Popup dışında tıklanınca kapanacak
                        className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto relative"
                    >
                        <button onClick={handleClosePopup} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                            Close
                        </button>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">{selectedRecipe.name}</h3>
                        <p>Servings: {selectedRecipe.servings}</p>
                        <p>Serving Size: {selectedRecipe.serving_size}</p>
                        <div className="mt-2">
                            <h4 className="font-medium text-gray-700">Ingredients</h4>
                            <ul>
                                {selectedRecipe.ingredients?.map((ingredient, index) => (
                                    <li key={index} className="text-gray-600">{ingredient}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-4">
                            <h4 className="font-medium text-gray-700">Steps</h4>
                            <ol>
                                {selectedRecipe.steps?.map((step, index) => (
                                    <li key={index} className="text-gray-600">{step}</li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchRecipes;
