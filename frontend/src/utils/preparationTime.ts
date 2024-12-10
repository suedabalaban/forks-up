export const getPreparationTimeFromTags = (tags: string[]): string => {
    const timeMap: { [key: string]: string } = {
        '15-minutes-or-less': '15m',
        '30-minutes-or-less': '30m',
        '60-minutes-or-less': '1h',
        '4-hours-or-less': '4h',
        '1-day-or-more': '24h+'
    };

    const timeTag = tags.find(tag => 
        tag === '15-minutes-or-less' || 
        tag === '30-minutes-or-less' || 
        tag === '60-minutes-or-less' || 
        tag === '4-hours-or-less' || 
        tag === '1-day-or-more'
    );

    return timeTag ? timeMap[timeTag] : '';
};
