import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import { ChevronLeft, ChevronRight, ChevronsRight, ChevronsLeft } from 'lucide-react';
import RecipeDetails from "../components/RecipeDetails";
import LoadingPage from "./Loading";
import { Recipe } from "../model/Recipe";
import TagFilters from "../components/TagFilter";
import tags from "../assets/tags.json"
import { getRecipes } from "../api/ForksUpAPI";

const SearchRecipes: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(0);
    const [pageSize] = useState(9);
    const [totalPages, setTotalPages] = useState(0);

    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const fetchRecipes = async (pageNumber = page) => {
        const searchTerm = searchParams.get('q');
        if (!searchTerm?.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await getRecipes(searchTerm, selectedTags, pageNumber, pageSize);

            if (data.content.length > 0) {
                setRecipes(data.content);
            } else {
                setError('No recipes found');
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

    useEffect(() => {
        fetchRecipes(0);
    }, [searchParams, selectedTags]);

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
        <div className="max-w-[90rem] mx-auto flex flex-row">
            <div className="w-80 min-w-[20rem] bg-gray-50 border-r border-gray-200 min-h-screen">
                <TagFilters
                    tags={tags}
                    onTagsChange={(newTags: string[]) => {
                        setSelectedTags(newTags);
                        setPage(0);
                    }}
                />
            </div>
            <div className="flex-1 px-8 py-6 min-h-[52rem]">
                {isLoading && <LoadingPage />}

                {error && !isLoading && (
                    <div className="text-center text-gray-600 flex items-center justify-center">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600">{error}</p>
                        </div>
                    </div>
                )}

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

                        <div className="mt-8 mb-6 flex justify-center items-center gap-2">
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