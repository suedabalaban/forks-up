import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

// Type definitions for the tag structure
interface TagStructure {
    dietary_restrictions: {
        health_conscious: string[];
        allergies_intolerances: string[];
        lifestyle: string[];
    };
    cuisines: {
        asian: string[];
        european: string[];
        middle_eastern: string[];
        american: string[];
        african: string[];
        latin_american: string[];
    };
    courses: {
        main_dishes: string[];
        appetizers_sides: string[];
        breakfast_brunch: string[];
        desserts: string[];
        beverages: string[];
    };
    occasions: {
        holidays: string[];
        special_occasions: string[];
    };
    cooking_methods: {
        techniques: string[];
        equipment: string[];
    };
    preparation_time: string[];
}

interface TagFiltersProps {
    onTagsChange: (tags: string[]) => void;
    tags: TagStructure;
}

type CategoryKey = keyof TagStructure;
type SubcategoryKey<T> = T extends object ? keyof T : never;

const TagFilters: React.FC<TagFiltersProps> = ({ onTagsChange, tags }) => {
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set(['dietary_restrictions'])
    );

    const handleTagClick = (tag: string): void => {
        const newSelectedTags = new Set(selectedTags);
        if (newSelectedTags.has(tag)) {
            newSelectedTags.delete(tag);
        } else {
            newSelectedTags.add(tag);
        }
        setSelectedTags(newSelectedTags);
        onTagsChange(Array.from(newSelectedTags));
    };

    const toggleCategory = (category: string): void => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(category)) {
            newExpanded.delete(category);
        } else {
            newExpanded.add(category);
        }
        setExpandedCategories(newExpanded);
    };

    const renderTags = (tags: string[]): React.ReactNode => {
        return tags.map((tag) => (
            <div
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`ml-6 py-1.5 px-3 my-1.5 rounded-lg cursor-pointer text-sm transition-all duration-200 ${
                    selectedTags.has(tag)
                        ? 'bg-blue-600 dark:bg-blue-500 text-white'
                        : 'hover:bg-purple-50 dark:hover:bg-purple-600 text-gray-700 dark:text-gray-300 hover:shadow-sm'
                }`}
            >
                {tag.replace(/-/g, ' ')}
            </div>
        ));
    };

    const renderSubcategory = (
        name: string,
        tags: string[],
        parentExpanded: boolean = true
    ): React.ReactNode => {
        const displayName = name.replace(/_/g, ' ');
        return (
            <div key={name} className={`${!parentExpanded ? 'hidden' : ''} mb-4`}>
                <div className="font-medium text-gray-700 dark:text-gray-300 py-2 px-2 ml-4 border-b border-gray-300 dark:border-gray-600">
                    {displayName.charAt(0).toUpperCase() + displayName.slice(1)}
                </div>
                <div className="mt-2">
                    {renderTags(tags)}
                </div>
            </div>
        );
    };

    const renderMainCategory = (
        category: CategoryKey,
        data: TagStructure[CategoryKey]
    ): React.ReactNode => {
        const isExpanded = expandedCategories.has(category);
        const displayName = category.replace(/_/g, ' ');

        return (
            <div key={category} className="mb-6">
                <div
                    onClick={() => toggleCategory(category)}
                    className="flex items-center gap-2 py-2.5 px-4 bg-purple-100 dark:bg-purple-600 rounded-xl cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-500 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                    {isExpanded ? (
                        <ChevronDown size={20} className="text-purple-700 dark:text-purple-400" />
                    ) : (
                        <ChevronRight size={20} className="text-purple-700 dark:text-purple-400" />
                    )}
                    <span className="font-semibold text-purple-700 dark:text-purple-400">
                        {displayName.charAt(0).toUpperCase() + displayName.slice(1)}
                    </span>
                </div>

                <div className={`mt-3 transition-all duration-300 ${!isExpanded ? 'hidden opacity-0' : 'opacity-100'}`}>
                    {!Array.isArray(data) ? (
                        Object.entries(data as object).map(([subCategory, subTags]) =>
                            renderSubcategory(
                                subCategory,
                                subTags as string[],
                                isExpanded
                            )
                        )
                    ) : (
                        <div className="mt-2">
                            {renderTags(data)}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 overflow-y-auto h-auto max-h-[110vh]">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">Filters</h2>
                {selectedTags.size > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        {Array.from(selectedTags).map(tag => (
                            <span
                                key={tag}
                                onClick={() => handleTagClick(tag)}
                                className="inline-flex items-center bg-blue-600 dark:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 shadow-sm"
                            >
                                {tag.replace(/-/g, ' ')}
                                <span className="ml-2 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500">×</span>
                            </span>
                        ))}
                    </div>
                )}
            </div>
            {Object.entries(tags).map(([category, data]) =>
                renderMainCategory(category as CategoryKey, data)
            )}
        </div>
    );
};

export default TagFilters;