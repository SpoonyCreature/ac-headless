interface BibleVerse {
    reference: string;
    text: string;
}

// Map of book names to their API IDs
const bibleBookIdMap = {
    Genesis: "GEN",
    Exodus: "EXO",
    Leviticus: "LEV",
    Numbers: "NUM",
    Deuteronomy: "DEU",
    Joshua: "JOS",
    Judges: "JDG",
    Ruth: "RUT",
    "1 Samuel": "1SA",
    "2 Samuel": "2SA",
    "1 Kings": "1KI",
    "2 Kings": "2KI",
    "1 Chronicles": "1CH",
    "2 Chronicles": "2CH",
    Ezra: "EZR",
    Nehemiah: "NEH",
    Esther: "EST",
    Job: "JOB",
    Psalms: "PSA",
    Proverbs: "PRO",
    Ecclesiastes: "ECC",
    "Song of Solomon": "SNG",
    Isaiah: "ISA",
    Jeremiah: "JER",
    Lamentations: "LAM",
    Ezekiel: "EZK",
    Daniel: "DAN",
    Hosea: "HOS",
    Joel: "JOL",
    Amos: "AMO",
    Obadiah: "OBA",
    Jonah: "JON",
    Micah: "MIC",
    Nahum: "NAM",
    Habakkuk: "HAB",
    Zephaniah: "ZEP",
    Haggai: "HAG",
    Zechariah: "ZEC",
    Malachi: "MAL",
    Matthew: "MAT",
    Mark: "MRK",
    Luke: "LUK",
    John: "JHN",
    Acts: "ACT",
    Romans: "ROM",
    "1 Corinthians": "1CO",
    "2 Corinthians": "2CO",
    Galatians: "GAL",
    Ephesians: "EPH",
    Philippians: "PHP",
    Colossians: "COL",
    "1 Thessalonians": "1TH",
    "2 Thessalonians": "2TH",
    "1 Timothy": "1TI",
    "2 Timothy": "2TI",
    Titus: "TIT",
    Philemon: "PHM",
    Hebrews: "HEB",
    James: "JAS",
    "1 Peter": "1PE",
    "2 Peter": "2PE",
    "1 John": "1JN",
    "2 John": "2JN",
    "3 John": "3JN",
    Jude: "JUD",
    Revelation: "REV",
};

const OLD_TESTAMENT_BOOKS = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
    '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther',
    'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
    'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
    'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
    'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
];

const NEW_TESTAMENT_BOOKS = [
    'Matthew', 'Mark', 'Luke', 'John', 'Acts',
    'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
    'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
    '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
    'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
    'Jude', 'Revelation'
];

// Helper to decode Unicode characters
function decodeUnicode(str: string): string {
    return str.replace(/\\u[\dA-F]{4}/gi, (match) => {
        return String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16));
    });
}

// Get Bible ID based on translation
function getBibleId(translation: string = 'web'): string {
    return translation;
}

// Get specific verses from the Bible API
export async function getSpecificVerses(
    query: string,
    translation: string = 'web'
): Promise<BibleVerse[]> {
    let modifiedQuery = query;
    if (query.toLowerCase().includes('psalm') && !query.toLowerCase().includes('psalms')) {
        modifiedQuery = query.replace(/psalm/gi, 'psalms');
    }

    const encodedQuery = encodeURIComponent(modifiedQuery);
    const url = `https://query.getbible.net/v2/${getBibleId(translation)}/${encodedQuery}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error fetching verses: ${response.statusText}`);
    }

    const data = await response.json();
    const verses: BibleVerse[] = [];

    for (const bookData of Object.values(data)) {
        const bookVerses = (bookData as any).verses.map((verse: any) => ({
            reference: `${(bookData as any).book_name} ${verse.chapter}:${verse.verse}`,
            text: decodeUnicode(verse.text),
        }));
        verses.push(...bookVerses);
    }

    return verses;
}

export function isOldTestament(bookName: string): boolean {
    return OLD_TESTAMENT_BOOKS.includes(bookName);
}

export function isNewTestament(bookName: string): boolean {
    return NEW_TESTAMENT_BOOKS.includes(bookName);
}

// Book order and chapter counts for position calculation
const BIBLE_STRUCTURE = {
    Genesis: { position: 1, chapters: 50 },
    Exodus: { position: 2, chapters: 40 },
    Leviticus: { position: 3, chapters: 27 },
    Numbers: { position: 4, chapters: 36 },
    Deuteronomy: { position: 5, chapters: 34 },
    Joshua: { position: 6, chapters: 24 },
    Judges: { position: 7, chapters: 21 },
    Ruth: { position: 8, chapters: 4 },
    "1 Samuel": { position: 9, chapters: 31 },
    "2 Samuel": { position: 10, chapters: 24 },
    "1 Kings": { position: 11, chapters: 22 },
    "2 Kings": { position: 12, chapters: 25 },
    "1 Chronicles": { position: 13, chapters: 29 },
    "2 Chronicles": { position: 14, chapters: 36 },
    Ezra: { position: 15, chapters: 10 },
    Nehemiah: { position: 16, chapters: 13 },
    Esther: { position: 17, chapters: 10 },
    Job: { position: 18, chapters: 42 },
    Psalms: { position: 19, chapters: 150 },
    Proverbs: { position: 20, chapters: 31 },
    Ecclesiastes: { position: 21, chapters: 12 },
    "Song of Solomon": { position: 22, chapters: 8 },
    Isaiah: { position: 23, chapters: 66 },
    Jeremiah: { position: 24, chapters: 52 },
    Lamentations: { position: 25, chapters: 5 },
    Ezekiel: { position: 26, chapters: 48 },
    Daniel: { position: 27, chapters: 12 },
    Hosea: { position: 28, chapters: 14 },
    Joel: { position: 29, chapters: 3 },
    Amos: { position: 30, chapters: 9 },
    Obadiah: { position: 31, chapters: 1 },
    Jonah: { position: 32, chapters: 4 },
    Micah: { position: 33, chapters: 7 },
    Nahum: { position: 34, chapters: 3 },
    Habakkuk: { position: 35, chapters: 3 },
    Zephaniah: { position: 36, chapters: 3 },
    Haggai: { position: 37, chapters: 2 },
    Zechariah: { position: 38, chapters: 14 },
    Malachi: { position: 39, chapters: 4 },
    Matthew: { position: 40, chapters: 28 },
    Mark: { position: 41, chapters: 16 },
    Luke: { position: 42, chapters: 24 },
    John: { position: 43, chapters: 21 },
    Acts: { position: 44, chapters: 28 },
    Romans: { position: 45, chapters: 16 },
    "1 Corinthians": { position: 46, chapters: 16 },
    "2 Corinthians": { position: 47, chapters: 13 },
    Galatians: { position: 48, chapters: 6 },
    Ephesians: { position: 49, chapters: 6 },
    Philippians: { position: 50, chapters: 4 },
    Colossians: { position: 51, chapters: 4 },
    "1 Thessalonians": { position: 52, chapters: 5 },
    "2 Thessalonians": { position: 53, chapters: 3 },
    "1 Timothy": { position: 54, chapters: 6 },
    "2 Timothy": { position: 55, chapters: 4 },
    Titus: { position: 56, chapters: 3 },
    Philemon: { position: 57, chapters: 1 },
    Hebrews: { position: 58, chapters: 13 },
    James: { position: 59, chapters: 5 },
    "1 Peter": { position: 60, chapters: 5 },
    "2 Peter": { position: 61, chapters: 3 },
    "1 John": { position: 62, chapters: 5 },
    "2 John": { position: 63, chapters: 1 },
    "3 John": { position: 64, chapters: 1 },
    Jude: { position: 65, chapters: 1 },
    Revelation: { position: 66, chapters: 22 }
} as const;

const TOTAL_BOOKS = 66;
const AVG_CHAPTERS_PER_BOOK = 39; // Approximate
const AVG_VERSES_PER_CHAPTER = 30; // Approximate

export function calculateVersePosition(bookName: string, chapter: string | number, verse: string | number): number {
    const book = BIBLE_STRUCTURE[bookName as keyof typeof BIBLE_STRUCTURE];
    if (!book) return 0;

    // Convert chapter and verse to numbers
    const chapterNum = typeof chapter === 'string' ? parseInt(chapter) : chapter;
    const verseNum = typeof verse === 'string' ? parseInt(verse) : verse;

    // Calculate relative position (0 to 1)
    const bookPosition = (book.position - 1) / TOTAL_BOOKS;
    const chapterPosition = (chapterNum - 1) / book.chapters / TOTAL_BOOKS;
    const versePosition = verseNum / (AVG_VERSES_PER_CHAPTER * TOTAL_BOOKS * book.chapters);

    return bookPosition + chapterPosition + versePosition;
}

export function getVerseInfo(reference: string): { bookName: string; chapter: string; verse: string } | null {
    // Handle verse ranges (e.g., "Genesis 1:1-3")
    const cleanRef = reference.split('-')[0];

    // Split into book and chapter:verse
    const match = cleanRef.match(/^((?:\d\s)?[A-Za-z]+)\s+(\d+):(\d+)/);
    if (!match) return null;

    const [, bookName, chapter, verse] = match;
    return { bookName, chapter, verse };
} 