interface BibleVerse {
    bookName: string;
    chapter: string;
    verse: string;
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
    const encodedQuery = encodeURIComponent(query);
    const url = `https://query.getbible.net/v2/${getBibleId(translation)}/${encodedQuery}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error fetching verses: ${response.statusText}`);
    }

    const data = await response.json();
    const verses: BibleVerse[] = [];

    for (const bookData of Object.values(data)) {
        const bookVerses = (bookData as any).verses.map((verse: any) => ({
            bookName: (bookData as any).book_name,
            chapter: `${verse.chapter}`,
            verse: `${verse.verse}`,
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