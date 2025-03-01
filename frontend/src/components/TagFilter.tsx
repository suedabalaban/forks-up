import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set([''])
    );
    const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

    useEffect(() => {
        const urlTag = searchParams.get('tag');
        if (urlTag && !selectedTags.has(urlTag)) {
            const newSelectedTags = new Set(selectedTags);
            newSelectedTags.add(urlTag);
            setSelectedTags(newSelectedTags);
            onTagsChange(Array.from(newSelectedTags));
        }
    }, [searchParams, selectedTags]);

    const handleTagClick = (tag: string): void => {
        const newSelectedTags = new Set(selectedTags);
        if (newSelectedTags.has(tag)) {
            newSelectedTags.delete(tag);
            if (searchParams.get('tag') === tag) {
                searchParams.delete('tag');
                setSearchParams(searchParams);
            }
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

    const toggleSubcategory = (subcategory: string): void => {
        const newExpanded = new Set(expandedSubcategories);
        if (newExpanded.has(subcategory)) {
            newExpanded.delete(subcategory);
        } else {
            newExpanded.add(subcategory);
        }
        setExpandedSubcategories(newExpanded);
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
                {t(`tagFilters.tags.${tag}`, tag.replace(/-/g, ' '))}
            </div>
        ));
    };

    const renderSubcategory = (
        name: string,
        tags: string[],
        parentExpanded: boolean = true
    ): React.ReactNode => {
        const isExpanded = expandedSubcategories.has(name);

        return (
            <div key={name} className={`${!parentExpanded ? 'hidden' : ''} mb-4`}>
                <div 
                    onClick={() => toggleSubcategory(name)}
                    className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 py-2 px-2 ml-4 border-b border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                    {isExpanded ? (
                        <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                    ) : (
                        <ChevronRight size={16} className="text-gray-500 dark:text-gray-400" />
                    )}
                    <span>
                        {t(`tagFilters.subcategories.${name}`, name.replace(/_/g, ' '))}
                    </span>
                </div>
                <div className={`mt-2 transition-all duration-300 ${!isExpanded ? 'hidden' : ''}`}>
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
                    <span className="font-semibold text-purple-700 dark:text-gray-200">
                        {t(`tagFilters.categories.${category}`, category.replace(/_/g, ' '))}
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
                <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">
                    {t('tagFilters.title')}
                </h2>
                {selectedTags.size > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-lg">
                        {Array.from(selectedTags).map(tag => (
                            <span
                                key={tag}
                                onClick={() => handleTagClick(tag)}
                                className="inline-flex items-center bg-blue-600 dark:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 shadow-sm"
                            >
                                {t(`tagFilters.tags.${tag}`, tag.replace(/-/g, ' '))}
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