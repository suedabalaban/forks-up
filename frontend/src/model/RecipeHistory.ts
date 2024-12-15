import { Recipe } from './Recipe';

export interface RecipeHistory {
    recipe: Recipe;
    startedAt: string; // ISO date string
} 