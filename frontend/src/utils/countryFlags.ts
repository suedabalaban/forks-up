const countryToFlag: { [key: string]: string } = {
    // Asian
    'chinese': '🇨🇳',
    'japanese': '🇯🇵',
    'korean': '🇰🇷',
    'thai': '🇹🇭',
    'vietnamese': '🇻🇳',
    'indonesian': '🇮🇩',
    'malaysian': '🇲🇾',
    'cambodian': '🇰🇭',
    'laotian': '🇱🇦',
    'mongolian': '🇲🇳',
    'nepalese': '🇳🇵',
    'pakistani': '🇵🇰',
    'filipino': '🇵🇭',
    
    // European
    'french': '🇫🇷',
    'italian': '🇮🇹',
    'german': '🇩🇪',
    'spanish': '🇪🇸',
    'greek': '🇬🇷',
    'portuguese': '🇵🇹',
    'british': '🇬🇧',
    'irish': '🇮🇪',
    'scottish': '🇬🇧',
    'welsh': '🇬🇧',
    'belgian': '🇧🇪',
    'dutch': '🇳🇱',
    'danish': '🇩🇰',
    'finnish': '🇫🇮',
    'norwegian': '🇳🇴',
    'swedish': '🇸🇪',
    'swiss': '🇨🇭',
    'austrian': '🇦🇹',
    'czech': '🇨🇿',
    'hungarian': '🇭🇺',
    'polish': '🇵🇱',
    'russian': '🇷🇺',
    'turkish': '🇹🇷',

    // Middle Eastern
    'lebanese': '🇱🇧',
    'iranian-persian': '🇮🇷',
    'iraqi': '🇮🇶',
    'palestinian': '🇵🇸',
    'saudi-arabian': '🇸🇦',
    'egyptian': '🇪🇬',
    'moroccan': '🇲🇦',

    // American
    'american': '🇺🇸',
    'canadian': '🇨🇦',
    'mexican': '🇲🇽',

    // African
    'ethiopian': '🇪🇹',
    'nigerian': '🇳🇬',
    'south-african': '🇿🇦',
    'sudanese': '🇸🇩',
    'somalian': '🇸🇴',
    'angolan': '🇦🇴',
    'congolese': '🇨🇩',
    'namibian': '🇳🇦',

    // Latin American
    'brazilian': '🇧🇷',
    'argentine': '🇦🇷',
    'chilean': '🇨🇱',
    'peruvian': '🇵🇪',
    'venezuelan': '🇻🇪',
    'colombian': '🇨🇴',
    'ecuadorean': '🇪🇨',
    'honduran': '🇭🇳',
    'guatemalan': '🇬🇹',
    'costa-rican': '🇨🇷',
    'cuban': '🇨🇺',
    'puerto-rican': '🇵🇷'
};

export const getCountryFlagFromTags = (tags: string[]): string => {
    const lowercaseTags = tags.map(tag => tag.toLowerCase());
    
    for (const tag of lowercaseTags) {
        if (countryToFlag[tag]) {
            return countryToFlag[tag];
        }
    }
    
    return '🌍'; // Return world emoji as fallback
};
