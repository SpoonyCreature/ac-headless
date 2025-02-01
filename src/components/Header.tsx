import Link from 'next/link';
import { getServerWixClient } from "../app/serverWixClient";
import { members } from "@wix/members";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Suspense } from 'react';
import { GoogleLoginButton } from "./GoogleLoginButton";
import Image from 'next/image';

async function logout() {
    "use server";
    cookies().delete("wixSession");
    revalidatePath("/");
}

export async function Header() {
    const wixClient = getServerWixClient();
    let member: members.Member | undefined;

    if (wixClient.auth.loggedIn()) {
        const response = await wixClient.members.getCurrentMember({
            fieldsets: [members.Set.FULL]
        });
        member = response.member;
    }

    return (
        <header className="sticky top-0 z-50 backdrop-blur-sm bg-background/80 border-b border-border">
            <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-lg sm:text-2xl font-bold tracking-tighter hover:text-primary transition-colors truncate">
                        Apologetics Central
                    </Link>

                    <Suspense fallback={<div className="h-8 sm:h-10 w-24 sm:w-32 animate-pulse bg-muted rounded-md" />}>
                        {member ? (
                            <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full bg-muted/50 border border-border">
                                {member.profile?.photo?.url ? (
                                    <Image
                                        src={member.profile.photo.url}
                                        alt="Profile"
                                        width={28}
                                        height={28}
                                        className="rounded-full object-cover ring-2 ring-background"
                                    />
                                ) : (
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                                        {(member.profile?.nickname || member.profile?.slug || "M")[0].toUpperCase()}
                                    </div>
                                )}
                                <span className="hidden sm:inline text-sm font-medium">
                                    {member.profile?.nickname || member.profile?.slug || "Member"}
                                </span>
                                <form action={logout} className="contents">
                                    <button
                                        type="submit"
                                        className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        Logout
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <>
                                <GoogleLoginButton
                                    variant="default"
                                    size="sm"
                                    className="sm:hidden"
                                />
                                <GoogleLoginButton
                                    variant="default"
                                    size="md"
                                    className="hidden sm:flex"
                                />
                            </>
                        )}
                    </Suspense>
                </div>
            </div>
        </header>
    );
} 