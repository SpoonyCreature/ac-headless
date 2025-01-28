import Link from 'next/link';
import { getServerWixClient } from "../app/serverWixClient";
import { members } from "@wix/members";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Suspense } from 'react';

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
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold tracking-tighter hover:text-primary transition-colors">
                        Apologetics Central
                    </Link>

                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <Link href="#writings" className="hover:text-primary transition-colors">Writings</Link>
                        <Link href="/about" className="hover:text-primary transition-colors">About</Link>
                    </nav>

                    <Suspense fallback={<div className="h-10 w-32 animate-pulse bg-muted rounded-md" />}>
                        {member ? (
                            <div className="flex items-center gap-3 px-3 py-2 rounded-full bg-muted/50 border border-border">
                                {member.profile?.photo?.url ? (
                                    <img
                                        src={member.profile.photo.url}
                                        alt="Profile"
                                        className="w-8 h-8 rounded-full object-cover ring-2 ring-background"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                                        {(member.profile?.nickname || member.profile?.slug || "M")[0].toUpperCase()}
                                    </div>
                                )}
                                <span className="text-sm font-medium">
                                    {member.profile?.nickname || member.profile?.slug || "Member"}
                                </span>
                                <form action={logout} className="contents">
                                    <button
                                        type="submit"
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        Logout
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <Link
                                href="/api/auth/google/login"
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                                </svg>
                                <span className="text-sm font-medium">Login with Google</span>
                            </Link>
                        )}
                    </Suspense>
                </div>
            </div>
        </header>
    );
} 