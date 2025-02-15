import { useMemo, useState } from 'react';
import { calculateVersePosition, getVerseInfo, isOldTestament } from '@/src/lib/bible';
import { CrossReference } from '@/src/types/bible';

interface VerseTimelineProps {
    sourceReference: string;
    crossReferences: CrossReference[];
}

const MIN_CLUSTER_SPACING = 0.05;

// Adjust marker positions to account for padding
const TIMELINE_MARKERS = [
    { book: 'Genesis', position: 0.08, label: 'Gen' },
    { book: 'Exodus', position: 0.17, label: 'Ex' },
    { book: 'Joshua', position: 0.27, label: 'Josh' },
    { book: '1 Samuel', position: 0.37, label: '1 Sam' },
    { book: 'Isaiah', position: 0.47, label: 'Isa' },
    { book: 'Daniel', position: 0.57, label: 'Dan' },
    { book: 'Matthew', position: 0.7, label: 'Mt' },
    { book: 'Acts', position: 0.8, label: 'Acts' },
    { book: 'Revelation', position: 0.92, label: 'Rev' }
] as const;

interface TimelineCluster {
    position: number;
    references: {
        reference: string;
        position: number;
        isOldTestament: boolean;
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

        // Group points into clusters with improved spacing
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
            sourceVerseInfo,
            clusters
        };
    }, [sourceReference, crossReferences]);

    if (!timelineData) return null;

    return (
        <div className="w-full space-y-4 sm:space-y-6">
            {/* Current Verse & Legend */}
            <div className="flex flex-col gap-2 px-4 sm:px-8">
                {/* Current Verse */}
                <div className="flex items-center gap-2">
                    <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-primary ring-4 ring-primary/20" />
                    <span className="text-sm sm:text-base">
                        {timelineData.sourceVerseInfo.bookName} {timelineData.sourceVerseInfo.chapter}:{timelineData.sourceVerseInfo.verse}
                    </span>
                </div>

                {/* Legend */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-sm text-muted-foreground">Old Testament</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm text-muted-foreground">New Testament</span>
                    </div>
                </div>
            </div>

            {/* Timeline Container */}
            <div className="relative pt-8 px-4 sm:px-8">
                {/* Background Sections */}
                <div className="absolute inset-x-0 h-24">
                    <div className="absolute h-full left-0 right-[35%] bg-gradient-to-r from-amber-50/40 to-amber-50/20" />
                    <div className="absolute h-full left-[65%] right-0 bg-gradient-to-r from-blue-50/20 to-blue-50/40" />
                </div>

                {/* Book Markers */}
                <div className="absolute inset-x-0 top-0">
                    {TIMELINE_MARKERS.map((marker) => (
                        <div
                            key={marker.book}
                            className="absolute transform -translate-x-1/2"
                            style={{ left: `${marker.position * 100}%` }}
                        >
                            <div className="h-2 sm:h-3 w-px bg-muted-foreground/20" />
                            <div className="mt-1 text-[10px] sm:text-xs text-muted-foreground/60 font-medium">
                                {marker.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Timeline Track */}
                <div className="relative h-12 sm:h-16 mt-6 sm:mt-8">
                    {/* Background Track */}
                    <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-muted-foreground/20">
                        {/* Testament Divider */}
                        <div className="absolute left-[62%] top-1/2 h-3 sm:h-4 w-px -translate-y-1/2 bg-muted-foreground/20" />
                    </div>

                    {/* Source Verse Marker */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
                        style={{ left: `${timelineData.sourcePosition * 100}%` }}
                    >
                        <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-primary rounded-full ring-2 ring-primary/20">
                            <span className="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] sm:text-xs text-muted-foreground/60 px-1.5 sm:px-2 py-0.5 bg-background/80 rounded-full border border-border/40">
                                Current Verse
                            </span>
                        </div>
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
                                className={`
                                    transition-all duration-200
                                    ${expandedCluster === index ? 'stroke-primary/40' : 'stroke-muted-foreground/20'}
                                `}
                                strokeWidth="1"
                                strokeDasharray="3 3"
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
                                w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full transition-all duration-200 cursor-pointer
                                ${cluster.references.length > 1 ? 'ring-1 ring-muted-foreground/20' : ''}
                                ${expandedCluster === index ? 'scale-150 ring-primary/40' : 'hover:scale-125 hover:ring-primary/40'}
                                ${cluster.references.some(r => r.isOldTestament) ? 'bg-amber-500' : 'bg-blue-500'}
                            `}>
                                {cluster.references.length > 1 && (
                                    <span className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 text-[8px] sm:text-[10px] text-muted-foreground/60">
                                        {cluster.references.length}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
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
