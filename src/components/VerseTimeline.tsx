import { useMemo, useState } from 'react';
import { calculateVersePosition, getVerseInfo, isOldTestament } from '@/src/lib/bible';
import { CrossReference } from '@/src/types/bible';

interface VerseTimelineProps {
    sourceReference: string;
    crossReferences: CrossReference[];
}

const MIN_CLUSTER_SPACING = 0.02; // 2% of timeline width

// Evenly spaced sequence of books
const TIMELINE_MARKERS = [
    { book: 'Genesis', position: 0 },
    { book: 'Exodus', position: 0.08 },
    { book: 'Joshua', position: 0.16 },
    { book: '1 Samuel', position: 0.24 },
    { book: '2 Kings', position: 0.32 },
    { book: 'Psalms', position: 0.40 },
    { book: 'Isaiah', position: 0.48 },
    { book: 'Daniel', position: 0.56 },
    // Gap between testaments
    { book: 'Matthew', position: 0.65 },
    { book: 'John', position: 0.75 },
    { book: 'Romans', position: 0.85 },
    { book: 'Revelation', position: 1 }
] as const;

interface TimelineCluster {
    position: number;
    references: {
        reference: string;
        position: number;
        isOldTestament: boolean;
        period?: string;
        text?: string;
        connection?: string;
    }[];
}

export function VerseTimeline({ sourceReference, crossReferences }: VerseTimelineProps) {
    const [expandedCluster, setExpandedCluster] = useState<number | null>(null);

    // Calculate normalized positions and create clusters
    const timelineData = useMemo(() => {
        const sourceVerseInfo = getVerseInfo(sourceReference);
        if (!sourceVerseInfo) return null;

        const sourcePosition = calculateVersePosition(
            sourceVerseInfo.bookName,
            sourceVerseInfo.chapter,
            sourceVerseInfo.verse
        );

        // First, create all reference points
        const points = crossReferences
            .map(ref => {
                const verseInfo = getVerseInfo(ref.reference);
                if (!verseInfo) return null;

                const position = calculateVersePosition(
                    verseInfo.bookName,
                    verseInfo.chapter,
                    verseInfo.verse
                );

                return {
                    ...ref,
                    position,
                    isOldTestament: isOldTestament(verseInfo.bookName)
                };
            })
            .filter((ref): ref is NonNullable<typeof ref> => ref !== null)
            .sort((a, b) => a.position - b.position);

        // Group points into clusters
        const clusters: TimelineCluster[] = [];
        let currentCluster: TimelineCluster | null = null;

        points.forEach(point => {
            if (!currentCluster ||
                Math.abs(point.position - currentCluster.position) > MIN_CLUSTER_SPACING) {
                currentCluster = {
                    position: point.position,
                    references: [point]
                };
                clusters.push(currentCluster);
            } else {
                currentCluster.references.push(point);
                // Update cluster position to average of all points
                currentCluster.position = currentCluster.references.reduce(
                    (sum, ref) => sum + ref.position, 0
                ) / currentCluster.references.length;
            }
        });

        return {
            sourcePosition,
            clusters
        };
    }, [sourceReference, crossReferences]);

    if (!timelineData) return null;

    return (
        <div className="w-full space-y-4">
            <div className="space-y-6">
                {/* Timeline Track */}
                <div className="relative p-4">
                    {/* Main Timeline Area */}
                    <div className="relative">
                        {/* Background Track */}
                        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-muted">
                            {/* Testament Divider */}
                            <div className="absolute left-[59.09%] top-1/2 h-3 w-0.5 -translate-y-1/2 bg-muted-foreground/50" />
                        </div>

                        {/* Source Verse Marker */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
                            style={{ left: `${timelineData.sourcePosition * 100}%` }}
                        >
                            <div className="w-3 h-3 bg-primary rounded-full ring-4 ring-primary/20" />
                        </div>

                        {/* Connection Lines */}
                        {timelineData.clusters.map((cluster, index) => (
                            <svg
                                key={`line-${index}`}
                                className="absolute inset-0 w-full h-full pointer-events-none"
                                style={{ overflow: 'visible' }}
                            >
                                <line
                                    x1={`${timelineData.sourcePosition * 100}%`}
                                    y1="50%"
                                    x2={`${cluster.position * 100}%`}
                                    y2="50%"
                                    className={`stroke-muted-foreground/20 transition-all duration-200 ${expandedCluster === index ? 'stroke-primary/40 stroke-[2px]' : ''}`}
                                    strokeWidth="1"
                                    strokeDasharray="2 2"
                                />
                            </svg>
                        ))}

                        {/* Clusters */}
                        {timelineData.clusters.map((cluster, index) => (
                            <div
                                key={index}
                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
                                style={{ left: `${cluster.position * 100}%` }}
                                onClick={() => setExpandedCluster(expandedCluster === index ? null : index)}
                            >
                                <div className={`
                                    w-2.5 h-2.5 rounded-full transition-all duration-200 cursor-pointer
                                    ${cluster.references.length > 1 ? 'ring-2 ring-muted-foreground/20' : ''}
                                    ${expandedCluster === index ? 'scale-150 ring-primary' : 'hover:scale-125'}
                                    ${cluster.references.some(r => r.isOldTestament) ? 'bg-amber-500' : 'bg-blue-500'}
                                `}>
                                    {cluster.references.length > 1 && (
                                        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">
                                            {cluster.references.length}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Details Section */}
                <div className="overflow-y-auto rounded-lg border border-border bg-card/50">
                    {expandedCluster !== null ? (
                        <div className="p-4 space-y-3">
                            {timelineData.clusters[expandedCluster].references.map((ref, i) => (
                                <div key={i} className="space-y-2 pb-3 border-b border-border last:border-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${ref.isOldTestament ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                            <span className="font-medium">{ref.reference}</span>
                                        </div>
                                        {ref.period && (
                                            <span className="text-xs text-muted-foreground">{ref.period}</span>
                                        )}
                                    </div>
                                    {ref.text && (
                                        <p className="text-sm text-muted-foreground pl-3 border-l-2 border-muted italic">
                                            {ref.text}
                                        </p>
                                    )}
                                    {ref.connection && (
                                        <p className="text-sm text-muted-foreground pl-3">
                                            {ref.connection}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                            Select a point to see cross references
                        </div>
                    )}
                </div>
            </div>

            {/* Timeline Legend */}
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Old Testament</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>New Testament</span>
                </div>
            </div>
        </div>
    );
}
