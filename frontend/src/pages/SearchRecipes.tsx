import React, {useState, useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import {ChevronLeft, ChevronRight, ChevronsRight, ChevronsLeft} from 'lucide-react';
import RecipeDetails from "../components/RecipeDetails";
import LoadingPage from "./Loading";
import {Recipe} from "../model/Recipe";
import TagFilters from "../components/TagFilter";
import tags from "../assets/tags.json"
import {getRecipes} from "../api/ForksUpAPI";

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

    const popularCategories = [
        {name: 'Quick & Easy', icon: '⚡', description: 'Ready in 30 minutes or less'},
        {name: 'Healthy', icon: '🥗', description: 'Nutritious and balanced meals'},
        {name: 'Comfort Food', icon: '🍲', description: 'Hearty and satisfying dishes'},
        {name: 'Desserts', icon: '🍰', description: 'Sweet treats and baked goods'},
        {name: 'Vegetarian', icon: '🥬', description: 'Meat-free delicious options'},
        {name: 'International', icon: '🌎', description: 'Cuisines from around the world'}
    ];

    const mealTypes = [
        'Breakfast & Brunch 🍳',
        'Lunch Ideas 🥪',
        'Quick Dinners 🍝',
        'Healthy Snacks 🥕',
        'Weekend Baking 🥖',
        'Party Food 🎉'
    ];

    const fetchRecipes = async (pageNumber = page) => {
        const searchTerm = searchParams.get('q');
        const searchTag = searchParams.get('tag');
        
        // Combine URL tag parameter with selected tags from the component state
        const allTags = [...selectedTags];
        if (searchTag && !selectedTags.includes(searchTag)) {
            allTags.push(searchTag);
        }

        if (!searchTerm?.trim() && allTags.length === 0) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await getRecipes(
                searchTerm || undefined,
                allTags.length > 0 ? allTags : undefined,
                undefined, // pantryItems parameter
                pageNumber
            );

            if (data.content.length > 0) {
                setRecipes(data.content);
            } else {
                setError('No recipes found');
            }

            setTotalPages(data.totalPages);
            setPage(pageNumber);
            setPage(pageNumber);
        } catch (err) {
            setRecipes([]);
            setError(err instanceof Error ? err.message : 'An error occurred while fetching recipes');
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

    const handleTagsChange = (newTags: string[]) => {
        setSelectedTags(newTags);
        // Reset to first page when tags change
        setPage(0);
    };

    return (
        <div className="max-w-[90rem] mx-auto flex flex-row dark:bg-gray-900">
            <div className="w-80 min-w-[20rem] border-r border-gray-200 dark:border-gray-700 min-h-screen">
                <TagFilters
                    tags={tags}
                    onTagsChange={handleTagsChange}
                />
            </div>
            <div className="flex-1 px-8 py-6 min-h-[52rem] dark:text-gray-100">
                {isLoading && <LoadingPage/>}

                {error && !isLoading && (
                    <div className="text-center text-gray-600 dark:text-gray-400 flex items-center justify-center">
                        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
                            <p className="text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    </div>
                )}

                {!isLoading && !error && (
                    <>
                        {(!searchParams.get('q')?.trim() && !searchParams.get('tag')?.trim() && selectedTags.length === 0) ? (
                            // Discover Recipes Section
                            <div className="max-w-4xl mx-auto">
                                <div className="text-center mb-12">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                        Discover Amazing Recipes
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                                        Search for recipes or explore our popular categories below
                                    </p>
                                </div>

                                <div className="mb-12">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                                        Popular Categories
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {popularCategories.map((category) => (
                                            <div
                                                key={category.name}
                                                className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-400 transition-all duration-200 cursor-pointer group"
                                                onClick={() => {
                                                    setSearchParams({q: category.name});
                                                }}
                                            >
                                                <div className="flex items-start space-x-4">
                                                    <span className="text-3xl group-hover:scale-110 transition-transform">
                                                        {category.icon}
                                                    </span>
                                                    <div>
                                                        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                                                            {category.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            {category.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                                        Browse by Meal Type
                                    </h2>
                                    <div className="flex flex-wrap gap-3">
                                        {mealTypes.map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => {
                                                    setSearchParams({q: type.split(' ')[0]});
                                                }}
                                                className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-400 transition-colors duration-200"
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Recipe List Section
                            <>
                                {recipes.length > 0 && (
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

                                        {totalPages > 1 && (
                                            <div className="flex justify-center items-center space-x-2 mt-8">
                                                <button
                                                    onClick={handleFirstPage}
                                                    disabled={page === 0}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronsLeft className="w-5 h-5"/>
                                                </button>
                                                <button
                                                    onClick={handlePreviousPage}
                                                    disabled={page === 0}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="w-5 h-5"/>
                                                </button>

                                                {getPageNumbers().map((pageNum, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() =>
                                                            typeof pageNum === 'number' ? handlePageChange(pageNum) : null
                                                        }
                                                        disabled={pageNum === '...'}
                                                        className={`w-10 h-10 rounded-lg ${
                                                            pageNum === page
                                                                ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                                                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        } ${pageNum === '...' ? 'cursor-default' : ''}`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                ))}

                                                <button
                                                    onClick={handleNextPage}
                                                    disabled={page === totalPages - 1}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight className="w-5 h-5"/>
                                                </button>
                                                <button
                                                    onClick={handleLastPage}
                                                    disabled={page === totalPages - 1}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronsRight className="w-5 h-5"/>
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}

                {selectedRecipe && (
                    <RecipeDetails recipe={selectedRecipe} onClose={handleClosePopup}/>
                )}
            </div>
        </div>
    );
};

export default SearchRecipes;