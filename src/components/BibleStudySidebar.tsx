import { Book, Lock, Globe, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface BibleStudy {
    _id: string;
    query: string;
    translation?: string;
    public: boolean;
    _owner: string;
    _createdDate: string;
}

interface BibleStudySidebarProps {
    studies: BibleStudy[];
    currentStudyId?: string;
    currentUserId?: string;
}

export function BibleStudySidebar({ studies = [], currentStudyId, currentUserId }: BibleStudySidebarProps) {
    const [showMore, setShowMore] = useState(false);

    // Filter studies to show only user's studies
    const userStudies = studies.filter(study => study._owner === currentUserId);

    const initialStudies = userStudies.slice(0, 5);
    const remainingStudies = userStudies.slice(5);

    return (
        <div className="w-80 border-r border-border bg-muted/10 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                {userStudies.length > 0 ? (
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2 px-3">Your Studies</h3>
                        <div className="space-y-1">
                            {initialStudies.map((study) => (
                                <Link
                                    key={study._id}
                                    href={`/ai/bible-study/${study._id}`}
                                    className={`flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors ${study._id === currentStudyId ? 'bg-muted' : ''
                                        }`}
                                >
                                    <Book className="w-4 h-4 shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm truncate">{study.query}</span>
                                            {study.public ? (
                                                <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
                                            ) : (
                                                <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {formatDistanceToNow(new Date(study._createdDate))} ago
                                        </p>
                                    </div>
                                </Link>
                            ))}
                            {remainingStudies.length > 0 && (
                                <>
                                    {showMore && remainingStudies.map((study) => (
                                        <Link
                                            key={study._id}
                                            href={`/ai/bible-study/${study._id}`}
                                            className={`flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors ${study._id === currentStudyId ? 'bg-muted' : ''
                                                }`}
                                        >
                                            <Book className="w-4 h-4 shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm truncate">{study.query}</span>
                                                    {study.public ? (
                                                        <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
                                                    ) : (
                                                        <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {formatDistanceToNow(new Date(study._createdDate))} ago
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                    <button
                                        onClick={() => setShowMore(!showMore)}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
                                    >
                                        <ChevronDown className={`w-4 h-4 transition-transform ${showMore ? 'rotate-180' : ''}`} />
                                        {showMore ? 'Show Less' : `Show ${remainingStudies.length} More`}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="px-3 py-8 text-center text-muted-foreground">
                        <p>No studies yet</p>
                        <p className="text-sm mt-1">Create your first study to see it here</p>
                    </div>
                )}
            </div>
        </div>
    );
}