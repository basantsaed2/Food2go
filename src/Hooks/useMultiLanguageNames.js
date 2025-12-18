// src/hooks/useMultiLanguageNames.js
import { useMemo } from 'react';
import { useGet } from './useGet';
import { QUERY_KEYS } from '@/constants/queryKeys';

// Define the default translations for the fallback
const DEFAULT_TRANSLATIONS = [
    { id: 1, name: 'English', translation_id: 1, translation_name: 'en' },
    { id: 2, name: 'Arabic', translation_id: 2, translation_name: 'ar' },
];

/**
 * Fetches translation data and provides a reusable structure for multi-language inputs.
 * @returns {{
 * initialNameStructure: Array<{translation_id: number, translation_name: string, name: string}>,
 * loadingTranslation: boolean
 * }}
 */
export const useMultiLanguageNames = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    // Fetch Translations
    const { data: dataTranslation, isLoading: loadingTranslation } = useGet({
        url: `${apiUrl}/admin/translation`,
        queryKey: [QUERY_KEYS.TRANSLATIONS],
    });

    // Memoize the final structure, applying the fallback logic
    const initialNameStructure = useMemo(() => {
        const translations = dataTranslation?.translation;

        // Check if API data is valid
        if (translations && Array.isArray(translations) && translations.length > 0) {
            // Use API data
            return translations.map(t => ({
                translation_id: t.id,
                translation_name: t.name,
                name: '', // Empty name for initial state
            }));
        }

        // Use DEFAULT_TRANSLATIONS if API failed, returned empty, or is still loading without prior data
        if (!loadingTranslation) {
            console.warn("Translation API failed or returned empty. Using default English/Arabic translations.");
        }

        // Fallback structure
        return DEFAULT_TRANSLATIONS.map(t => ({
            translation_id: t.id,
            translation_name: t.name,
            name: '',
        }));

    }, [dataTranslation, loadingTranslation]);

    return { initialNameStructure, loadingTranslation };
};