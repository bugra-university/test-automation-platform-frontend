// Function to format save time for display
export const formatSaveTime = (timestamp: Date | null): string => {
    if (!timestamp) return '';

    // Ensure timestamp is a Date object (handle string timestamps from localStorage)
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

    // Check if the date is valid
    if (isNaN(date.getTime())) return '';

    // Always show full date + time
    return date.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
