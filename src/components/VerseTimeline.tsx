import { useMemo, useState } from 'react';
import { calculateVersePosition, getVerseInfo, isOldTestament } from '@/src/lib/bible';
import { CrossReference } from '@/src/types/bible';

interface VerseTimelineProps {
    sourceReference: string;
    crossReferences: CrossReference[];
}

const MIN_CLUSTER_SPACING = 0.05;

// Book categories with distinctive, professional colors
const BOOK_CATEGORIES = {
    pentateuch: { name: 'Pentateuch', color: '#2563eb' },      // Royal Blue
    historical: { name: 'Historical', color: '#059669' },       // Emerald Green
    poetic: { name: 'Poetic', color: '#9333ea' },              // Purple
    majorProphets: { name: 'Major Prophets', color: '#ea580c' }, // Burnt Orange
    minorProphets: { name: 'Minor Prophets', color: '#ca8a04' }, // Golden Yellow
    gospels: { name: 'Gospels', color: '#dc2626' },            // Bright Red
    history: { name: 'History', color: '#0d9488' },            // Teal
    pauline: { name: 'Pauline Epistles', color: '#7c3aed' },   // Violet
    general: { name: 'General Epistles', color: '#0284c7' },   // Sky Blue
    apocalyptic: { name: 'Apocalyptic', color: '#be123c' },    // Ruby Red
} as const;

// Show all 66 books with their chapter counts and categories
const TIMELINE_MARKERS = [
    // Pentateuch
    { book: 'Genesis', chapters: 50, label: 'Gen', category: 'pentateuch' },
    { book: 'Exodus', chapters: 40, label: 'Ex', category: 'pentateuch' },
    { book: 'Leviticus', chapters: 27, label: 'Lev', category: 'pentateuch' },
    { book: 'Numbers', chapters: 36, label: 'Num', category: 'pentateuch' },
    { book: 'Deuteronomy', chapters: 34, label: 'Deut', category: 'pentateuch' },
    // Historical Books
    { book: 'Joshua', chapters: 24, label: 'Josh', category: 'historical' },
    { book: 'Judges', chapters: 21, label: 'Judg', category: 'historical' },
    { book: 'Ruth', chapters: 4, label: 'Ruth', category: 'historical' },
    { book: '1 Samuel', chapters: 31, label: '1 Sam', category: 'historical' },
    { book: '2 Samuel', chapters: 24, label: '2 Sam', category: 'historical' },
    { book: '1 Kings', chapters: 22, label: '1 Kgs', category: 'historical' },
    { book: '2 Kings', chapters: 25, label: '2 Kgs', category: 'historical' },
    { book: '1 Chronicles', chapters: 29, label: '1 Chr', category: 'historical' },
    { book: '2 Chronicles', chapters: 36, label: '2 Chr', category: 'historical' },
    { book: 'Ezra', chapters: 10, label: 'Ezra', category: 'historical' },
    { book: 'Nehemiah', chapters: 13, label: 'Neh', category: 'historical' },
    { book: 'Esther', chapters: 10, label: 'Est', category: 'historical' },
    // Poetic Books
    { book: 'Job', chapters: 42, label: 'Job', category: 'poetic' },
    { book: 'Psalm', chapters: 150, label: 'Ps', category: 'poetic' },
    { book: 'Proverbs', chapters: 31, label: 'Prov', category: 'poetic' },
    { book: 'Ecclesiastes', chapters: 12, label: 'Eccl', category: 'poetic' },
    { book: 'Song of Solomon', chapters: 8, label: 'Song', category: 'poetic' },
    // Major Prophets
    { book: 'Isaiah', chapters: 66, label: 'Isa', category: 'majorProphets' },
    { book: 'Jeremiah', chapters: 52, label: 'Jer', category: 'majorProphets' },
    { book: 'Lamentations', chapters: 5, label: 'Lam', category: 'majorProphets' },
    { book: 'Ezekiel', chapters: 48, label: 'Ezek', category: 'majorProphets' },
    { book: 'Daniel', chapters: 12, label: 'Dan', category: 'majorProphets' },
    // Minor Prophets
    { book: 'Hosea', chapters: 14, label: 'Hos', category: 'minorProphets' },
    { book: 'Joel', chapters: 3, label: 'Joel', category: 'minorProphets' },
    { book: 'Amos', chapters: 9, label: 'Amos', category: 'minorProphets' },
    { book: 'Obadiah', chapters: 1, label: 'Obad', category: 'minorProphets' },
    { book: 'Jonah', chapters: 4, label: 'Jonah', category: 'minorProphets' },
    { book: 'Micah', chapters: 7, label: 'Mic', category: 'minorProphets' },
    { book: 'Nahum', chapters: 3, label: 'Nah', category: 'minorProphets' },
    { book: 'Habakkuk', chapters: 3, label: 'Hab', category: 'minorProphets' },
    { book: 'Zephaniah', chapters: 3, label: 'Zeph', category: 'minorProphets' },
    { book: 'Haggai', chapters: 2, label: 'Hag', category: 'minorProphets' },
    { book: 'Zechariah', chapters: 14, label: 'Zech', category: 'minorProphets' },
    { book: 'Malachi', chapters: 4, label: 'Mal', category: 'minorProphets' },
    // Gospels
    { book: 'Matthew', chapters: 28, label: 'Matt', category: 'gospels' },
    { book: 'Mark', chapters: 16, label: 'Mark', category: 'gospels' },
    { book: 'Luke', chapters: 24, label: 'Luke', category: 'gospels' },
    { book: 'John', chapters: 21, label: 'John', category: 'gospels' },
    // History
    { book: 'Acts', chapters: 28, label: 'Acts', category: 'history' },
    // Pauline Epistles
    { book: 'Romans', chapters: 16, label: 'Rom', category: 'pauline' },
    { book: '1 Corinthians', chapters: 16, label: '1 Cor', category: 'pauline' },
    { book: '2 Corinthians', chapters: 13, label: '2 Cor', category: 'pauline' },
    { book: 'Galatians', chapters: 6, label: 'Gal', category: 'pauline' },
    { book: 'Ephesians', chapters: 6, label: 'Eph', category: 'pauline' },
    { book: 'Philippians', chapters: 4, label: 'Phil', category: 'pauline' },
    { book: 'Colossians', chapters: 4, label: 'Col', category: 'pauline' },
    { book: '1 Thessalonians', chapters: 5, label: '1 Thes', category: 'pauline' },
    { book: '2 Thessalonians', chapters: 3, label: '2 Thes', category: 'pauline' },
    { book: '1 Timothy', chapters: 6, label: '1 Tim', category: 'pauline' },
    { book: '2 Timothy', chapters: 4, label: '2 Tim', category: 'pauline' },
    { book: 'Titus', chapters: 3, label: 'Titus', category: 'pauline' },
    { book: 'Philemon', chapters: 1, label: 'Phlm', category: 'pauline' },
    // General Epistles
    { book: 'Hebrews', chapters: 13, label: 'Heb', category: 'general' },
    { book: 'James', chapters: 5, label: 'Jas', category: 'general' },
    { book: '1 Peter', chapters: 5, label: '1 Pet', category: 'general' },
    { book: '2 Peter', chapters: 3, label: '2 Pet', category: 'general' },
    { book: '1 John', chapters: 5, label: '1 John', category: 'general' },
    { book: '2 John', chapters: 1, label: '2 John', category: 'general' },
    { book: '3 John', chapters: 1, label: '3 John', category: 'general' },
    { book: 'Jude', chapters: 1, label: 'Jude', category: 'general' },
    // Apocalyptic
    { book: 'Revelation', chapters: 22, label: 'Rev', category: 'apocalyptic' }
] as const;

// Calculate total chapters and positions
const TOTAL_CHAPTERS = TIMELINE_MARKERS.reduce((sum, book) => sum + book.chapters, 0);
const TIMELINE_MARKERS_WITH_POSITIONS = TIMELINE_MARKERS.map((book, index) => {
    const prevChapters = TIMELINE_MARKERS.slice(0, index).reduce((sum, b) => sum + b.chapters, 0);
    const position = prevChapters / TOTAL_CHAPTERS;
    return { ...book, position };
});

interface TimelineCluster {
    position: number;
    references: {
        reference: string;
        position: number;
        isOldTestament: boolean;
        bookName: string;
        text?: string;
        connection?: string;
    }[];
}

// Helper function to convert position to coordinates on the circle
function getPointOnCircle(position: number, radius: number, centerX: number, centerY: number) {
    const angle = position * Math.PI * 2 - Math.PI / 2; // Start from top (subtract PI/2)
    return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
    };
}

// Helper function to create SVG arc path
function createArcPath(startPosition: number, endPosition: number, radius: number, centerX: number, centerY: number) {
    const start = getPointOnCircle(startPosition, radius, centerX, centerY);
    const end = getPointOnCircle(endPosition, radius, centerX, centerY);

    // Calculate the arc sweep
    const largeArcFlag = Math.abs(endPosition - startPosition) > 0.5 ? 1 : 0;

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

// Helper function to get book position from TIMELINE_MARKERS
function getBookPosition(bookName: string): number {
    const marker = TIMELINE_MARKERS_WITH_POSITIONS.find(m => m.book === bookName);
    return marker ? marker.position : 0;
}

export function VerseTimeline({ sourceReference, crossReferences }: VerseTimelineProps) {
    const [expandedCluster, setExpandedCluster] = useState<number | null>(null);

    // Calculate normalized positions and create clusters
    const timelineData = useMemo(() => {
        const sourceVerseInfo = getVerseInfo(sourceReference);
        if (!sourceVerseInfo) return null;

        // Use book position instead of verse position for source
        const sourcePosition = getBookPosition(sourceVerseInfo.bookName);

        // First, create all reference points using book positions
        const points = crossReferences
            .map(ref => {
                const verseInfo = getVerseInfo(ref.reference);
                if (!verseInfo) return null;

                // Use book position instead of verse position
                const position = getBookPosition(verseInfo.bookName);

                return {
                    ...ref,
                    position,
                    bookName: verseInfo.bookName,
                    isOldTestament: isOldTestament(verseInfo.bookName)
                };
            })
            .filter((ref): ref is NonNullable<typeof ref> => ref !== null)
            .sort((a, b) => a.position - b.position);

        // Group points into clusters by book
        const clusters: TimelineCluster[] = [];
        let currentCluster: TimelineCluster | null = null;

        points.forEach(point => {
            // Only cluster points from the same book
            if (!currentCluster || point.bookName !== currentCluster.references[0].bookName) {
                currentCluster = {
                    position: point.position,
                    references: [point]
                };
                clusters.push(currentCluster);
            } else {
                currentCluster.references.push(point);
            }
        });

        return {
            sourcePosition,
            sourceVerseInfo,
            clusters
        };
    }, [sourceReference, crossReferences]);

    if (!timelineData) return null;

    // SVG dimensions and center point
    const width = 800;
    const height = 800; // Make it square for better circular layout
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35; // Slightly smaller radius for better text spacing

    // Calculate outer radius for text labels
    const textRadius = radius * 1.15;

    return (
        <div className="w-full space-y-4 sm:space-y-6">
            {/* Circular Timeline */}
            <div className="relative w-full aspect-square px-4 sm:px-8"> {/* Make container square */}
                <svg
                    width={width}
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-full"
                >
                    {/* Gradient Definitions */}
                    <defs>
                        <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={BOOK_CATEGORIES.pentateuch.color} stopOpacity="0.2" />
                            <stop offset="20%" stopColor={BOOK_CATEGORIES.historical.color} stopOpacity="0.2" />
                            <stop offset="40%" stopColor={BOOK_CATEGORIES.poetic.color} stopOpacity="0.2" />
                            <stop offset="60%" stopColor={BOOK_CATEGORIES.gospels.color} stopOpacity="0.2" />
                            <stop offset="80%" stopColor={BOOK_CATEGORIES.pauline.color} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={BOOK_CATEGORIES.apocalyptic.color} stopOpacity="0.2" />
                        </linearGradient>
                        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={BOOK_CATEGORIES.pentateuch.color} stopOpacity="0.4" />
                            <stop offset="100%" stopColor={BOOK_CATEGORIES.apocalyptic.color} stopOpacity="0.4" />
                        </linearGradient>
                        {/* Add animation definitions */}
                        <animate
                            xlinkHref="#connectionGradient"
                            attributeName="x1"
                            values="0%;100%;0%"
                            dur="3s"
                            repeatCount="indefinite"
                        />
                        {/* Add flowing animation */}
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Main Circle */}
                    <circle
                        cx={centerX}
                        cy={centerY}
                        r={radius}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="1.5"
                        className="opacity-100"
                    />

                    {/* Background Circle Segments */}
                    {Object.entries(BOOK_CATEGORIES).map(([key, category]) => {
                        const books = TIMELINE_MARKERS_WITH_POSITIONS.filter(b => b.category === key);
                        if (books.length === 0) return null;

                        const startPos = books[0].position;
                        const endPos = books[books.length - 1].position;

                        return (
                            <path
                                key={key}
                                d={createArcPath(startPos, endPos, radius, centerX, centerY)}
                                fill="none"
                                stroke={category.color}
                                strokeWidth="3"
                                className="opacity-20"
                            />
                        );
                    })}

                    {/* Testament Boundary Indicators */}
                    <g>
                        {/* Testament Divider */}
                        {(() => {
                            const position = 0.59;
                            const point = getPointOnCircle(position, radius - 10, centerX, centerY);
                            const outerPoint = getPointOnCircle(position, radius + 25, centerX, centerY);

                            return (
                                <g>
                                    <line
                                        x1={point.x}
                                        y1={point.y}
                                        x2={outerPoint.x}
                                        y2={outerPoint.y}
                                        stroke="#94a3b8"
                                        strokeWidth="1"
                                        strokeDasharray="4 4"
                                        className="opacity-40"
                                    />
                                </g>
                            );
                        })()}

                    </g>

                    {/* Legend */}
                    <g transform={`translate(${width - 120}, 20)`}>
                        {Object.entries(BOOK_CATEGORIES).map(([key, category], index) => (
                            <g key={key} transform={`translate(0, ${index * 20})`}>
                                <rect
                                    x="0"
                                    y="0"
                                    width="12"
                                    height="12"
                                    fill={category.color}
                                    className="opacity-80"
                                />
                                <text
                                    x="20"
                                    y="9"
                                    className="text-[10px] fill-current opacity-70"
                                >
                                    {category.name}
                                </text>
                            </g>
                        ))}
                    </g>

                    {/* Book Markers */}
                    {TIMELINE_MARKERS_WITH_POSITIONS.map((marker) => {
                        const point = getPointOnCircle(marker.position, radius, centerX, centerY);
                        const textPoint = getPointOnCircle(marker.position, textRadius, centerX, centerY);
                        const angle = (marker.position * 360) - 90;
                        const rotate = angle > 90 && angle < 270 ? angle + 180 : angle;
                        const color = BOOK_CATEGORIES[marker.category].color;

                        return (
                            <g key={marker.book}>
                                <line
                                    x1={point.x}
                                    y1={point.y}
                                    x2={textPoint.x}
                                    y2={textPoint.y}
                                    stroke={color}
                                    strokeWidth="1"
                                    className="opacity-20"
                                />
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="2"
                                    fill={color}
                                    className="opacity-80"
                                />
                                <text
                                    x={textPoint.x}
                                    y={textPoint.y}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill={color}
                                    className="text-[9px] opacity-90 font-medium"
                                    transform={`rotate(${rotate}, ${textPoint.x}, ${textPoint.y})`}
                                >
                                    {marker.label}
                                </text>
                            </g>
                        );
                    })}

                    {/* Connection Lines */}
                    {timelineData.clusters.map((cluster, index) => {
                        const sourcePoint = getPointOnCircle(timelineData.sourcePosition, radius, centerX, centerY);
                        const targetPoint = getPointOnCircle(cluster.position, radius, centerX, centerY);
                        const sourceBook = TIMELINE_MARKERS_WITH_POSITIONS.find(m => m.position === timelineData.sourcePosition);
                        const targetBook = TIMELINE_MARKERS_WITH_POSITIONS.find(m => m.position === cluster.position);

                        const sourceColor = sourceBook ? BOOK_CATEGORIES[sourceBook.category].color : '#94a3b8';
                        const targetColor = targetBook ? BOOK_CATEGORIES[targetBook.category].color : '#94a3b8';

                        // Calculate control points for the curved line
                        const midX = (sourcePoint.x + targetPoint.x) / 2;
                        const midY = (sourcePoint.y + targetPoint.y) / 2;
                        const curveFactor = 0.2; // Reduced curve intensity

                        const controlPoint = {
                            x: midX + (centerX - midX) * curveFactor,
                            y: midY + (centerY - midY) * curveFactor
                        };

                        // Calculate line thickness based on reference count
                        const baseThickness = 1.5;
                        const maxThickness = 4;
                        const refCount = cluster.references.length;
                        const thickness = Math.min(baseThickness + (refCount * 0.3), maxThickness);

                        return (
                            <g key={`connection-${index}`}>
                                <path
                                    d={`M ${sourcePoint.x} ${sourcePoint.y} Q ${controlPoint.x} ${controlPoint.y} ${targetPoint.x} ${targetPoint.y}`}
                                    fill="none"
                                    stroke={targetColor}
                                    strokeWidth={thickness}
                                    strokeLinecap="round"
                                    className={`
                                        transition-all duration-300
                                        ${expandedCluster === index ? 'opacity-70' : 'opacity-30'}
                                        hover:opacity-100
                                    `}
                                />
                            </g>
                        );
                    })}

                    {/* Source Verse Marker */}
                    {(() => {
                        const point = getPointOnCircle(timelineData.sourcePosition, radius, centerX, centerY);
                        const sourceBook = TIMELINE_MARKERS_WITH_POSITIONS.find(m => m.position === timelineData.sourcePosition);
                        const color = sourceBook ? BOOK_CATEGORIES[sourceBook.category].color : '#94a3b8';

                        return (
                            <g>
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="6"
                                    fill={color}
                                    className="opacity-90"
                                />
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r="10"
                                    fill={color}
                                    className="opacity-20"
                                />
                            </g>
                        );
                    })()}

                    {/* Cluster Points */}
                    {timelineData.clusters.map((cluster, index) => {
                        const point = getPointOnCircle(cluster.position, radius, centerX, centerY);
                        const targetBook = TIMELINE_MARKERS_WITH_POSITIONS.find(m => m.position === cluster.position);
                        const color = targetBook ? BOOK_CATEGORIES[targetBook.category].color : '#94a3b8';

                        return (
                            <g
                                key={`cluster-${index}`}
                                onClick={() => setExpandedCluster(expandedCluster === index ? null : index)}
                                className="cursor-pointer"
                            >
                                <circle
                                    cx={point.x}
                                    cy={point.y}
                                    r={cluster.references.length > 1 ? "6" : "4"}
                                    fill={color}
                                    className={`
                                        transition-all duration-200
                                        ${expandedCluster === index ? 'opacity-100' : 'opacity-80'}
                                    `}
                                />
                                {cluster.references.length > 1 && (
                                    <text
                                        x={point.x}
                                        y={point.y}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill="white"
                                        className="text-[9px] font-medium"
                                    >
                                        {cluster.references.length}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>
                {/* Add animation keyframes */}
                <style jsx>{`
                    @keyframes pulse {
                        0% { opacity: var(--tw-opacity); }
                        50% { opacity: calc(var(--tw-opacity) * 1.5); }
                        100% { opacity: var(--tw-opacity); }
                    }
                    @keyframes flow {
                        0% { stroke-dashoffset: 1000; }
                        100% { stroke-dashoffset: 0; }
                    }
                `}</style>
            </div>

            {/* Details Section */}
            <div className="overflow-hidden rounded-lg border border-border bg-card/50 mx-4 sm:mx-8">
                {expandedCluster !== null ? (
                    <div className="p-3 sm:p-4 space-y-3">
                        {timelineData.clusters[expandedCluster].references.map((ref, i) => (
                            <div key={i} className="space-y-2 pb-3 border-b border-border last:border-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${ref.isOldTestament ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                        <span className="font-medium text-xs sm:text-sm">{ref.reference}</span>
                                    </div>
                                </div>
                                {ref.text && (
                                    <p className="text-xs sm:text-sm text-muted-foreground pl-3 border-l border-muted italic">
                                        {ref.text}
                                    </p>
                                )}
                                {ref.connection && (
                                    <p className="text-xs sm:text-sm text-muted-foreground pl-3">
                                        {ref.connection}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 sm:p-8 flex items-center justify-center">
                        <p className="text-xs sm:text-sm text-muted-foreground">Select a point on the timeline to see cross references</p>
                    </div>
                )}
            </div>
        </div>
    );
}
