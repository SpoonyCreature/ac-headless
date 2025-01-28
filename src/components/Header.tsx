import Link from 'next/link';
import { getServerWixClient } from "../lib/wixClient";
import { members } from "@wix/members";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function logout() {
    "use server";
    cookies().delete("wixSession");
    revalidatePath("/");
}

export async function Header() {
    const wixClient = getServerWixClient();
    let member = null;

    if (wixClient.auth.loggedIn()) {
        const response = await wixClient.members.getCurrentMember({
            fieldsets: [members.Set.FULL]
        });
        member = response.member;
    }

    return (
        <header className="header" style={{
            padding: '1rem 2rem',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--background)',
        }}>
            <div className="header-content" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
            }}>
                <Link href="/" className="logo" style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                }}>
                    Apologetics Central.
                </Link>

                {member ? (
                    <div className="user-profile" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.5rem',
                        borderRadius: '2rem',
                        backgroundColor: 'var(--background-secondary)',
                        border: '1px solid var(--border)',
                    }}>
                        {member.profile?.picture ? (
                            <img
                                src={member.profile.picture}
                                alt="Profile"
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: '#4285f4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                            }}>
                                {(member.profile?.nickname || member.profile?.slug || "M")[0].toUpperCase()}
                            </div>
                        )}
                        <span style={{ color: 'var(--text-primary)' }}>
                            {member.profile?.nickname || member.profile?.slug || "Member"}
                        </span>
                        <form action={logout}>
                            <button
                                type="submit"
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: 'transparent',
                                    color: 'var(--text-secondary)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    transition: 'color 0.2s',
                                }}
                            >
                                Logout
                            </button>
                        </form>
                    </div>
                ) : (
                    <Link
                        href="/api/auth/google/login"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#4285f4',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            transition: 'background-color 0.2s',
                        }}
                    >
                        <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                        </svg>
                        Login with Google
                    </Link>
                )}
            </div>
        </header>
    );
} 