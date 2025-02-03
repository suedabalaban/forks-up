import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPantryItems } from '../api/ForksUpAPI';
import { auth } from '../config/firebaseconfig';

interface PantryContextType {
    pantryIngredients: string[];
    refreshPantry: () => Promise<void>;
    isLoading: boolean;
}

const PantryContext = createContext<PantryContextType | undefined>(undefined);

export const PantryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [pantryIngredients, setPantryIngredients] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshPantry = async () => {
        try {
            setIsLoading(true);
            // Only fetch if user is authenticated
            if (auth.currentUser) {
                const response = await getPantryItems();
                const pantryNames = response.data.map((item: any) => 
                    item.ingredient.name.toLowerCase()
                );
                setPantryIngredients(pantryNames);
            } else {
                setPantryIngredients([]);
            }
        } catch (error) {
            console.error('Error fetching pantry items:', error);
            setPantryIngredients([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                refreshPantry();
            } else {
                setPantryIngredients([]);
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <PantryContext.Provider value={{ pantryIngredients, refreshPantry, isLoading }}>
            {children}
        </PantryContext.Provider>
    );
};

export const usePantry = () => {
    const context = useContext(PantryContext);
    if (context === undefined) {
        throw new Error('usePantry must be used within a PantryProvider');
    }
    return context;
};
