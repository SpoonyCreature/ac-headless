'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

export function SearchBox() {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        // TODO: Implement client-side search or server-side search based on requirements
    };

    return (
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
                type="text"
                placeholder="Search writings..."
                value={searchQuery}
                onChange={handleSearch}
                className="h-10 w-full rounded-full border border-input bg-background py-2 pl-10 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
        </div>
    );
} 