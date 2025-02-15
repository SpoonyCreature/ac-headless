import Link from 'next/link';
import { getServerWixClient } from "../app/serverWixClient";
import { members } from "@wix/members";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { GoogleLoginButton } from "./GoogleLoginButton";
import { LogoutButton } from "./LogoutButton";
import Image from 'next/image';
import './header.css';
import { HeaderClient } from './HeaderClient';

async function logout() {
    "use server";
    // Add a small delay to make the loading state more noticeable
    await new Promise(resolve => setTimeout(resolve, 500));
    cookies().delete("wixSession");
    revalidatePath("/");
    redirect("/");
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
                    <Link href="/" className="relative z-10 text-lg xs:text-xl sm:text-2xl font-bold tracking-tighter text-primary transition-all duration-200 ease-in-out whitespace-nowrap">
                        Apologetics Central
                    </Link>

                    {/* Auth Section and Menu Button */}
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
                                    <LogoutButton action={logout} />
                                </div>
                            ) : (
                                <GoogleLoginButton
                                    variant="default"
                                    size="sm"
                                    className="flex text-sm sm:text-base"
                                />
                            )}
                        </Suspense>

                        {/* Menu Button */}
                        <HeaderClient />
                    </div>
                </nav>
            </div>
        </header>
    );
} 