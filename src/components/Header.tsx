import Link from 'next/link';
import { getServerWixClient } from "../app/serverWixClient";
import { members } from "@wix/members";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { Suspense } from 'react';
import { GoogleLoginButton } from "./GoogleLoginButton";
import Image from 'next/image';
import { Menu } from 'lucide-react';
import MobileMenu from './MobileMenu';
import './header.css';

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
        <header className="sticky top-0 z-50 bg-background border-b border-border">
            <div className="container mx-auto px-4 py-3">
                <nav className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="relative z-10 text-lg xs:text-xl sm:text-2xl font-bold tracking-tighter hover:text-primary transition-all duration-200 ease-in-out max-w-[140px] xs:max-w-none">
                        Apologetics Central
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="nav-link">Home</Link>
                        <Link href="/blog" className="nav-link">Blog</Link>
                        <Link href="/ai" className="nav-link">AI</Link>
                        <Link href="/about" className="nav-link">About</Link>
                    </div>

                    {/* Auth Section */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Suspense fallback={<div className="h-10 w-32 animate-pulse bg-muted rounded-md" />}>
                            {member ? (
                                <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-full bg-muted/50 border border-border hover:bg-muted/70 transition-colors duration-200">
                                    {member.profile?.photo?.url ? (
                                        <Image
                                            src={member.profile.photo.url}
                                            alt="Profile"
                                            width={32}
                                            height={32}
                                            className="rounded-full object-cover ring-2 ring-background"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                                            {(member.profile?.nickname || member.profile?.slug || "M")[0].toUpperCase()}
                                        </div>
                                    )}
                                    <span className="hidden sm:inline text-sm font-medium">
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
                                <GoogleLoginButton
                                    variant="default"
                                    size="sm"
                                    className="flex text-sm sm:text-base"
                                />
                            )}
                        </Suspense>

                        {/* Mobile Menu */}
                        <MobileMenu />
                    </div>
                </nav>
            </div>
        </header>
    );
} 