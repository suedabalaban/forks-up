import React, { useState, FormEvent } from 'react';
import RecipeCard from '../components/RecipeCard';
import { Search } from 'lucide-react';

type Recipe = {
    id: string;
    name: string;
    servings: number;
    servingSize: string;
    ingredients?: string[];
    steps?: string[];
};

const SearchRecipes: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:8080/api/recipes/search-regex/${searchTerm}`);
            
            if (!response.ok) {
                throw new Error('No recipes found');
            }

            const data: Recipe[] = await response.json();
            setRecipes(data);
        } catch (err: any) {
            setError(err.message);
            setRecipes([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Search Section */}
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

            {/* Loading State */}
            {loading && (
                <div className="text-center text-gray-600">
                    Loading recipes...
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="text-center text-red-500">
                    {error}
                </div>
            )}

            {/* Results Grid */}
            {recipes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && recipes.length === 0 && (
                <div className="text-center text-gray-600">
                    Try searching!
                </div>
            )}
        </div>
    );
};

export default SearchRecipes;
