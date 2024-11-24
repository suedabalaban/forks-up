import React, { useState, useEffect, FormEvent } from 'react';
import RecipeCard from '../components/RecipeCard';
import {Search, ChevronLeft, ChevronRight, ChevronsRight, ChevronsLeft} from 'lucide-react';
import RecipeDetails from "../components/RecipeDetails";
import LoadingPage from "./Loading";
import {Recipe} from "../model/Recipe";
import TagFilters from "../components/TagFilter";
import tags from "../assets/tags.json"

const SearchRecipes: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(0);
    const [pageSize] = useState(9);
    const [totalPages, setTotalPages] = useState(0);

    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const fetchRecipes = async (pageNumber = page) => {
        if (!searchTerm.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            // Tags arrayini query string formatında dönüştür
            const tagsQuery = selectedTags
                .map(tag => `tags=${encodeURIComponent(tag)}`)
                .join('&');

            const response = await fetch(
                `http://localhost:8080/api/recipes/searchTags?keyword=${encodeURIComponent(
                    searchTerm
                )}&page=${pageNumber}&size=${pageSize}${tagsQuery ? `&${tagsQuery}` : ''}`
            );

            if (!response.ok) {
                throw new Error(
                    response.status === 404 ? 'No recipes found' : 'Failed to fetch recipes'
                );
            }

            const data = await response.json();

            if (data.content.length > 0) {
                setRecipes(data.content);

            } else {
                setError('No recipes found')
            }

            setTotalPages(data.totalPages);
            setPage(pageNumber);
        } catch (err: any) {
            setRecipes([]);
            setError(err.message || 'An error occurred while fetching recipes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        fetchRecipes(0);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchRecipes(newPage);
        }
    };

    const handleFirstPage = () => handlePageChange(0);
    const handleLastPage = () => handlePageChange(totalPages - 1);
    const handlePreviousPage = () => handlePageChange(page - 1);
    const handleNextPage = () => handlePageChange(page + 1);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const delta = 2; // Number of pages to show on each side of current page
        const range: (number | string)[] = [];
        const rangeWithDots: (number | string)[] = [];

        for (let i = 0; i < totalPages; i++) {
            if (
                i === 0 || // First page
                i === totalPages - 1 || // Last page
                (i >= page - delta && i <= page + delta) // Pages around current page
            ) {
                range.push(i);
            } else if (range[range.length - 1] !== '...') {
                range.push('...');
            }
        }

        return range;
    };

    const handleClosePopup = () => {
        setSelectedRecipe(null);
    };

    return (
        <div className="h-full w-full flex flex-row">
            <div className="h-full w-96 bg-gradient-to-br from-purple-200 bg-blue-200">
                <TagFilters
                    tags={tags} // Your tags object
                    onTagsChange={(newTags: string[]) => {
                        setSelectedTags(newTags);
                        setPage(0);
                        fetchRecipes(0);
                    }}
                />
            </div>
            <div className="container overflow-y-auto max-h-screen mx-auto px-4 py-8">
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
                                disabled={isLoading}
                            >
                                <Search size={20}/>
                            </button>
                        </div>
                    </form>
                </div>

                {isLoading && <LoadingPage />}

                {error && !isLoading && (
                    <div className="text-center text-gray-600 flex items-center justify-center">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600">{error}</p>
                        </div>
                    </div>
                )}
                {recipes.length > 0}
                {!isLoading && !error && recipes.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recipes.map((recipe) => (
                                <RecipeCard
                                    key={recipe.id}
                                    recipe={recipe}
                                    onClick={() => setSelectedRecipe(recipe)}
                                />
                            ))}
                        </div>

                        <div className="mt-8 flex justify-center items-center gap-2">
                            <button
                                onClick={handleFirstPage}
                                disabled={page === 0 || isLoading}
                                className={`flex items-center gap-1 px-3 py-2 rounded-lg border ${
                                    page === 0 || isLoading
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <ChevronsLeft size={18} />
                                First
                            </button>

                            <button
                                onClick={handlePreviousPage}
                                disabled={page === 0 || isLoading}
                                className={`flex items-center gap-1 px-3 py-2 rounded-lg border ${
                                    page === 0 || isLoading
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <ChevronLeft size={18} />
                                Prev
                            </button>

                            <div className="flex items-center gap-1">
                                {getPageNumbers().map((pageNum, index) => (
                                    pageNum === '...' ? (
                                        <span key={index} className="px-3 py-2">...</span>
                                    ) : (
                                        <button
                                            key={index}
                                            onClick={() => handlePageChange(pageNum as number)}
                                            className={`px-3 py-2 rounded-lg border ${
                                                page === pageNum
                                                    ? 'bg-blue-500 text-white border-blue-500'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {(pageNum as number) + 1}
                                        </button>
                                    )
                                ))}
                            </div>

                            <button
                                onClick={handleNextPage}
                                disabled={page >= totalPages - 1 || isLoading}
                                className={`flex items-center gap-1 px-3 py-2 rounded-lg border ${
                                    page >= totalPages - 1 || isLoading
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Next
                                <ChevronRight size={18} />
                            </button>

                            <button
                                onClick={handleLastPage}
                                disabled={page >= totalPages - 1 || isLoading}
                                className={`flex items-center gap-1 px-3 py-2 rounded-lg border ${
                                    page >= totalPages - 1 || isLoading
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Last
                                <ChevronsRight size={18} />
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
        </div>
    );
};



export default SearchRecipes;