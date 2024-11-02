import React, { useState, useEffect, FormEvent } from 'react';
import RecipeCard from '../components/RecipeCard';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import RecipeDetails from "../components/RecipeDetails";

type Recipe = {
    _id: string;
    name: string;
    servings: number;
    serving_size: string;
    ingredients?: string[];
    ingredientsRawStr?: string[];
    steps?: string[];
    description: string;
};

const SearchRecipes: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchRecipes = async () => {
        if (!searchTerm.trim()) return;

        try {
            const response = await
                fetch(`http://localhost:8080/api/recipes/search?keyword=${searchTerm}&page=${page}&size=${pageSize}`);
            if (!response.ok) {
                throw new Error('No recipes found');
            }
            const data = await response.json();
            setRecipes(data);
            // If we received fewer items than pageSize, we've reached the end
            setHasMore(data.length === pageSize);
        } catch (err: any) {
            setRecipes([]);
            setHasMore(false);
        }
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        setPage(0); // Reset page when performing new search
        fetchRecipes();
    };

    const handleNextPage = () => {
        if (hasMore) {
            setPage(prev => prev + 1);
        }
    };

    const handlePreviousPage = () => {
        if (page > 0) {
            setPage(prev => prev - 1);
        }
    };

    // Fetch recipes when page changes
    useEffect(() => {
        if (searchTerm.trim()) {
            fetchRecipes();
        }
    }, [page]);

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

            {recipes.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recipes.map((recipe) => (
                            <RecipeCard
                                key={recipe._id}
                                recipe={recipe}
                                onClick={() => setSelectedRecipe(recipe)}
                            />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    <div className="mt-8 flex justify-center items-center gap-4">
                        <button
                            onClick={handlePreviousPage}
                            disabled={page === 0}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                                page === 0
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <ChevronLeft size={20} />
                            Previous
                        </button>

                        <span className="text-gray-600">
                            Page {page + 1}
                        </span>

                        <button
                            onClick={handleNextPage}
                            disabled={!hasMore}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                                !hasMore
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Next
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </>
            )}

            {selectedRecipe && (
                <RecipeDetails
                    recipe={selectedRecipe}
                    handleClosePopup={handleClosePopup}
                />
            )}
        </div>
    );
};

export default SearchRecipes;