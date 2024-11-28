import React, { useState } from "react";
import tagsData from "../assets/tags.json";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {addUserPreferences, Preferences} from "../api/ForksUpAPI";

export interface DietaryPreferencesState {
  health_conscious: string[];
  allergies_intolerances: string[];
  lifestyle: string[];
  selectedCuisines: string[];
}

const DietaryPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<DietaryPreferencesState>({
    health_conscious: [],
    allergies_intolerances: [],
    lifestyle: [],
    selectedCuisines: []
  });

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string>("");

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
      setTimeout(() => setSuccessMessage(""), 3000); 
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const renderTags = (tags: string[], category: keyof DietaryPreferencesState) => {
    return tags.map((tag) => (
      <div
        key={tag}
        onClick={() => handleTagClick(tag, category)}
        className={`py-2 px-4 my-2 rounded-lg cursor-pointer transition-all ${
          (preferences[category] as string[]).includes(tag)
            ? 'bg-purple-600 text-white'
            : 'bg-purple-100 hover:bg-purple-200 text-purple-800'
        }`}
      >
        {tag.replace(/-/g, ' ')}
      </div>
    ));
  };

  const renderCuisines = () => {
    return Object.entries(tagsData.cuisines).map(([cuisine, dishes]) => (
      <div key={cuisine} className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-purple-800">
          {cuisine.charAt(0).toUpperCase() + cuisine.slice(1).replace(/_/g, ' ')} Cuisine
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {dishes.map((dish) => (
            <div
              key={dish}
              onClick={() => handleTagClick(dish, 'selectedCuisines')}
              className={`py-2 px-4 rounded-lg cursor-pointer transition-all ${
                preferences.selectedCuisines.includes(dish)
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-800'
              }`}
            >
              {dish.replace(/-/g, ' ')}
            </div>
          ))}
        </div>
      </div>
    ));
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex-1 h-2 mx-1 rounded ${
                index <= currentStep ? 'bg-purple-600' : 'bg-purple-200'
              }`}
            />
          ))}
        </div>
        <div className="text-center text-sm text-purple-600">
          Step {currentStep + 1} / {steps.length}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-purple-800 mb-2">
          {currentStepData.title}
        </h2>
        <p className="text-gray-600 mb-6">
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
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
            }`}
          >
            <ChevronLeft size={20} className="mr-2" />
            Back
          </button>
          <button
            onClick={handleNext}
            className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            {currentStep < steps.length - 1 && <ChevronRight size={20} className="ml-2" />}
          </button>
        </div>

        {successMessage && (
          <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg text-center">
            {successMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default DietaryPreferences;