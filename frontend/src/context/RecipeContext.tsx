import React, { createContext, useContext, useState } from 'react';
import { Recipe } from '../model/Recipe';

interface ChatMessage {
    text: string;
    isUser: boolean;
}

interface RecipeContextType {
    currentRecipe: Recipe | null;
    setCurrentRecipe: (recipe: Recipe | null) => void;
    recipeHistory: Recipe[];
    chatHistory: Record<string, ChatMessage[]>;
    addChatMessage: (recipeId: string, message: ChatMessage) => void;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
    const [recipeHistory, setRecipeHistory] = useState<Recipe[]>([]);
    const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});

    const handleSetCurrentRecipe = (recipe: Recipe | null) => {
        setCurrentRecipe(recipe);
        if (recipe) {
            setRecipeHistory(prev => {
                const newHistory = [recipe, ...prev.filter(r => r.id !== recipe.id)].slice(0, 5);
                return newHistory;
            });
        }
    };

    const addChatMessage = (recipeId: string, message: ChatMessage) => {
        setChatHistory(prev => ({
            ...prev,
            [recipeId]: [...(prev[recipeId] || []), message]
        }));
    };

    return (
        <RecipeContext.Provider value={{
            currentRecipe,
            setCurrentRecipe: handleSetCurrentRecipe,
            recipeHistory,
            chatHistory,
            addChatMessage
        }}>
            {children}
        </RecipeContext.Provider>
    );
};

export const useRecipe = () => {
    const context = useContext(RecipeContext);
    if (context === undefined) {
        throw new Error('useRecipe must be used within a RecipeProvider');
    }
    return context;
};
