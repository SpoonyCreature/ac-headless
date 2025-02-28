'use client';

import { Search } from 'lucide-react';
import { useState, useCallback, useEffect, useRef } from 'react';
import debounce from 'lodash/debounce';

interface SearchLibraryProps {
    onSearch: (posts: any[]) => void;
}

export function SearchLibrary({ onSearch }: SearchLibraryProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const isInitialMount = useRef(true);

    // Create a stable reference to the search function
    const searchFn = useRef(async (term: string) => {
        if (!term.trim()) {
            onSearch([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
            const data = await response.json();

            if (response.ok) {
                onSearch(data.items);
            } else {
                console.error('Search failed:', data.error);
                onSearch([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            onSearch([]);
        } finally {
            setIsLoading(false);
        }
    });

    // Create a stable debounced version of the search function
    const debouncedSearch = useRef(debounce(searchFn.current, 300));

    // Update the search function when onSearch changes
    useEffect(() => {
        searchFn.current = async (term: string) => {
            if (!term.trim()) {
                onSearch([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
                const data = await response.json();

                if (response.ok) {
                    onSearch(data.items);
                } else {
                    console.error('Search failed:', data.error);
                    onSearch([]);
                }
            } catch (error) {
                console.error('Search error:', error);
                onSearch([]);
            } finally {
                setIsLoading(false);
            }
        };
    }, [onSearch]);

    useEffect(() => {
        // Skip the initial mount
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        debouncedSearch.current(searchTerm);

        return () => {
            debouncedSearch.current.cancel();
        };
    }, [searchTerm]);

    return (
        <div className="relative w-full max-w-xl">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="Search library..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent"></div>
                    </div>
                )}
            </div>
        </div>
    );
} 
