import { Book, Lock, Globe, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { TransitionLink } from './TransitionLink';
import { cn } from '@/src/lib/utils';
import { SidebarSkeleton } from './Skeletons';

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
    isLoading?: boolean;
}

export function BibleStudySidebar({ studies = [], currentStudyId, currentUserId, isLoading = false }: BibleStudySidebarProps) {
    const [showMore, setShowMore] = useState(false);

    // Filter studies to show only user's studies
    const userStudies = studies.filter(study => study._owner === currentUserId);

    const initialStudies = userStudies.slice(0, 5);
    const remainingStudies = userStudies.slice(5);

    if (isLoading) {
        return (
            <div className="w-80 border-r border-border/50 bg-background/95 backdrop-blur-sm flex flex-col h-full">
                <SidebarSkeleton />
            </div>
        );
    }

    return (
        <div className="w-80 border-r border-border/50 bg-background/95 backdrop-blur-md flex flex-col h-full shadow-[8px_0_32px_-12px_rgba(0,0,0,0.12)] dark:shadow-[8px_0_32px_-12px_rgba(0,0,0,0.3)]">
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin scrollbar-thumb-muted/80 hover:scrollbar-thumb-primary/50 scrollbar-track-transparent">
                {userStudies.length > 0 ? (
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground/90 mb-3 px-3 flex items-center gap-2 select-none">
                            <div className="p-1 rounded-md bg-muted/50">
                                <Book className="w-3.5 h-3.5" />
                            </div>
                            Your Studies
                        </h3>
                        <div className="space-y-1.5">
                            {initialStudies.map((study) => (
                                <TransitionLink
                                    key={study._id}
                                    href={`/study/bible-study/${study._id}`}
                                    className={cn(
                                        'group flex items-start gap-3 px-3.5 py-3 rounded-xl',
                                        'hover:bg-muted/80 active:bg-muted/90 transition-all duration-200',
                                        'hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)]',
                                        study._id === currentStudyId && 'bg-muted/90 shadow-[inset_0_1px_1px_rgba(0,0,0,0.05)]'
                                    )}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center flex-none group-hover:bg-primary/10 transition-colors">
                                        <Book className="w-4 h-4 text-primary/70" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-medium truncate group-hover:text-primary/90 transition-colors">{study.query}</span>
                                            {study.public ? (
                                                <Globe className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary/50 transition-colors shrink-0" />
                                            ) : (
                                                <Lock className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary/50 transition-colors shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground/70 mt-0.5 group-hover:text-muted-foreground transition-colors">
                                            {formatDistanceToNow(new Date(study._createdDate))} ago
                                        </p>
                                    </div>
                                </TransitionLink>
                            ))}
                            {remainingStudies.length > 0 && (
                                <>
                                    {showMore && remainingStudies.map((study) => (
                                        <TransitionLink
                                            key={study._id}
                                            href={`/study/bible-study/${study._id}`}
                                            className={cn(
                                                'group flex items-start gap-3 px-3.5 py-3 rounded-xl',
                                                'hover:bg-muted/80 active:bg-muted/90 transition-all duration-200',
                                                'hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)]',
                                                study._id === currentStudyId && 'bg-muted/90 shadow-[inset_0_1px_1px_rgba(0,0,0,0.05)]'
                                            )}
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center flex-none group-hover:bg-primary/10 transition-colors">
                                                <Book className="w-4 h-4 text-primary/70" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm font-medium truncate group-hover:text-primary/90 transition-colors">{study.query}</span>
                                                    {study.public ? (
                                                        <Globe className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary/50 transition-colors shrink-0" />
                                                    ) : (
                                                        <Lock className="w-3 h-3 text-muted-foreground/50 group-hover:text-primary/50 transition-colors shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground/70 mt-0.5 group-hover:text-muted-foreground transition-colors">
                                                    {formatDistanceToNow(new Date(study._createdDate))} ago
                                                </p>
                                            </div>
                                        </TransitionLink>
                                    ))}
                                    <button
                                        onClick={() => setShowMore(!showMore)}
                                        className="flex items-center gap-2 px-3.5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-full group rounded-lg hover:bg-muted/50"
                                    >
                                        <ChevronDown className={cn(
                                            "w-4 h-4 text-muted-foreground/70 group-hover:text-primary/70 transition-all duration-200",
                                            showMore && "rotate-180"
                                        )} />
                                        <span className="group-hover:text-primary/90 transition-colors font-medium">
                                            {showMore ? 'Show Less' : `Show ${remainingStudies.length} More`}
                                        </span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="px-3 py-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-muted/80 to-muted/40 flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <Book className="w-8 h-8 text-muted-foreground/70" />
                        </div>
                        <p className="text-base font-medium text-muted-foreground/90">No studies yet</p>
                        <p className="text-sm text-muted-foreground mt-1">Create your first study to see it here</p>
                    </div>
                )}
            </div>
        </div>
    );
}