'use client';

import { useState } from 'react';
import styles from './SearchBox.module.css';

export function SearchBox() {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        // TODO: Implement client-side search or server-side search based on requirements
    };

    return (
        <div className={styles.searchContainer}>
            <input
                type="text"
                placeholder="Search writings..."
                value={searchQuery}
                onChange={handleSearch}
                className={styles.searchInput}
            />
        </div>
    );
} 