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
                className={`ml-6 py-1 px-2 my-1 rounded-md cursor-pointer text-m ${
                    selectedTags.has(tag)
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-purple-100 text-gray-700'
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
            <div key={name} className={`${!parentExpanded ? 'hidden' : ''}`}>
                <div className="font-medium text-gray-700 py-1 px-2 ml-4">
                    {displayName.charAt(0).toUpperCase() + displayName.slice(1)}
                </div>
                {renderTags(tags)}
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
            <div key={category} className="mb-4">
                <div
                    onClick={() => toggleCategory(category)}
                    className="flex items-center gap-2 py-2 px-3 bg-purple-200 rounded-lg cursor-pointer hover:bg-purple-100"
                >
                    {isExpanded ? (
                        <ChevronDown size={20} className="text-purple-600" />
                    ) : (
                        <ChevronRight size={20} className="text-purple-600" />
                    )}
                    <span className="font-semibold text-purple-600">
            {displayName.charAt(0).toUpperCase() + displayName.slice(1)}
          </span>
                </div>

                {!Array.isArray(data) ? (
                    Object.entries(data as object).map(([subCategory, subTags]) =>
                        renderSubcategory(
                            subCategory,
                            subTags as string[],
                            isExpanded
                        )
                    )
                ) : (
                    <div className={!isExpanded ? 'hidden' : ''}>
                        {renderTags(data)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-4 overflow-y-auto max-h-screen">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-purple-600 mb-2">Filters</h2>
                {selectedTags.size > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {Array.from(selectedTags).map(tag => (
                            <span
                                key={tag}
                                onClick={() => handleTagClick(tag)}
                                className="inline-flex items-center bg-blue-200 text-blue-700 px-2 py-1 rounded-md text-sm cursor-pointer hover:bg-blue-200"
                            >
                {tag.replace(/-/g, ' ')}
                                <span className="ml-1">×</span>
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