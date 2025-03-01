import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import tagsData from "../assets/tags.json";
import { ChevronLeft, ChevronRight, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import {addUserPreferences, getUserPreferences} from "../api/UserAPI";

export interface DietaryPreferencesState {
  health_conscious: string[];
  allergies_intolerances: string[];
  lifestyle: string[];
  selectedCuisines: string[];
}

interface RegionState {
  [key: string]: boolean;
}

const DietaryPreferences: React.FC = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<DietaryPreferencesState>({
    health_conscious: [],
    allergies_intolerances: [],
    lifestyle: [],
    selectedCuisines: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasExistingPreferences, setHasExistingPreferences] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const [expandedRegions, setExpandedRegions] = useState<RegionState>({});

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const userPreferences = await getUserPreferences();
        if (userPreferences) {
          setPreferences({
            health_conscious: userPreferences.dietary_restrictions.health_conscious || [],
            allergies_intolerances: userPreferences.dietary_restrictions.allergies_intolerances || [],
            lifestyle: userPreferences.dietary_restrictions.lifestyle || [],
            selectedCuisines: userPreferences.cuisines || []
          });
          setHasExistingPreferences(true);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const steps = [
    {
      title: "Health Consciousness",
      description: "Check the options that suit your health goals",
      tags: tagsData.dietary_restrictions.health_conscious,
      key: "health_conscious" as const
    },
    {
      title: "Allergies and Intolerances",
      description: "Select your allergies or intolerances if any",
      tags: tagsData.dietary_restrictions.allergies_intolerances,
      key: "allergies_intolerances" as const
    },
    {
      title: "Life style\n",
      description: "Select the options that suit your lifestyle",
      tags: tagsData.dietary_restrictions.lifestyle,
      key: "lifestyle" as const
    },
    {
      title: "Kitchen Preferences",
      description: "Choose your favorite cuisines",
      key: "selectedCuisines" as const
    }
  ];

  const handleTagClick = (tag: string, category: keyof DietaryPreferencesState) => {
    setPreferences(prev => ({
      ...prev,
      [category]: prev[category].includes(tag)
        ? (prev[category] as string[]).filter(item => item !== tag)
        : [...(prev[category] as string[]), tag]
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const userPreferences = {
        dietary_restrictions: {
          health_conscious: preferences.health_conscious,
          allergies_intolerances: preferences.allergies_intolerances,
          lifestyle: preferences.lifestyle
        },
        cuisines: preferences.selectedCuisines,
        preparation_time: ""
      };
      
      await addUserPreferences(userPreferences);
      setSuccessMessage("Preferences saved successfully");
      setHasExistingPreferences(true);
      setIsEditMode(false);
      
      // Navigate to user profile page after a short delay
      setTimeout(() => {
        navigate('/user');
      }, 1500);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const toggleRegion = (region: string) => {
    setExpandedRegions(prev => ({
      ...prev,
      [region]: !prev[region]
    }));
  };

  const renderTags = (tags: string[], category: keyof DietaryPreferencesState) => {
    return tags.map((tag) => (
      <div
        key={tag}
        onClick={() => handleTagClick(tag, category)}
        className={`py-2 px-4 my-2 rounded-lg cursor-pointer transition-all ${
          (preferences[category] as string[]).includes(tag)
            ? 'bg-purple-600 text-white dark:bg-purple-500 dark:text-white'
            : 'bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-200'
        }`}
      >
        {tag.replace(/-/g, ' ')}
      </div>
    ));
  };

  const renderCuisines = () => {
    // Since tagsData.cuisines is an object with region keys
    const cuisinesByRegion = tagsData.cuisines as {
      [key: string]: string[]
    };

    return (
      <div className="space-y-4">
        {Object.entries(cuisinesByRegion).map(([region, cuisines]) => (
          <div key={region} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
            <button
              onClick={() => toggleRegion(region)}
              className="w-full flex justify-between items-center text-left font-medium text-gray-900 dark:text-white"
            >
              <span>{region.charAt(0).toUpperCase() + region.slice(1).replace(/_/g, ' ')}</span>
              {expandedRegions[region] ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            
            {expandedRegions[region] && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                {cuisines.map((cuisine: string) => (
                  <div
                    key={cuisine}
                    onClick={() => handleTagClick(cuisine, 'selectedCuisines')}
                    className={`py-2 px-4 rounded-lg cursor-pointer transition-all ${
                      preferences.selectedCuisines.includes(cuisine)
                        ? 'bg-purple-600 text-white dark:bg-purple-500 dark:text-white'
                        : 'bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-200'
                    }`}
                  >
                    {cuisine.replace(/-/g, ' ')}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const currentStepData = steps[currentStep];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (hasExistingPreferences && !isEditMode) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Dietary Preferences</h2>
            <button
              onClick={() => setIsEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Edit size={18} />
              Edit Preferences
            </button>
          </div>
          
          <div className="space-y-6">
            {preferences.health_conscious.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 dark:text-gray-300">Health Consciousness</h3>
                <div className="flex flex-wrap gap-2">
                  {preferences.health_conscious.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {preferences.allergies_intolerances.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 dark:text-gray-300">Allergies and Intolerances</h3>
                <div className="flex flex-wrap gap-2">
                  {preferences.allergies_intolerances.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {preferences.lifestyle.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 dark:text-gray-300">Lifestyle</h3>
                <div className="flex flex-wrap gap-2">
                  {preferences.lifestyle.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {preferences.selectedCuisines.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 dark:text-gray-300">Preferred Cuisines</h3>
                <div className="flex flex-wrap gap-2">
                  {preferences.selectedCuisines.map(cuisine => (
                    <span key={cuisine} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                      {cuisine}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex-1 h-2 mx-1 rounded ${
                index <= currentStep ? 'bg-purple-600 dark:bg-purple-500' : 'bg-purple-200 dark:bg-purple-900/20'
              }`}
            />
          ))}
        </div>
        <div className="text-center text-sm text-purple-600 dark:text-purple-200">
          Step {currentStep + 1} / {steps.length}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-2">
          {currentStepData.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {currentStepData.description}
        </p>

        <div className="space-y-4">
          {currentStepData.key === 'selectedCuisines'
            ? renderCuisines()
            : renderTags(currentStepData.tags, currentStepData.key)}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center px-6 py-2 rounded-lg ${
              currentStep === 0
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-900/30'
            }`}
          >
            <ChevronLeft size={20} className="mr-2" />
            Back
          </button>
          <button
            onClick={handleNext}
            className="flex items-center px-6 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600"
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            {currentStep < steps.length - 1 && <ChevronRight size={20} className="ml-2" />}
          </button>
        </div>

        {successMessage && (
          <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-center">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default DietaryPreferences;