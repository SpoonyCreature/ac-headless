import { OAuthStrategy, createClient } from "@wix/sdk";
import { cookies } from "next/headers";
import { WIX_SESSION_COOKIE_NAME } from "./../constants/constants";
import { members } from "@wix/members";
import { items } from "@wix/data";
import { comments } from "@wix/comments";

export function getServerWixClient() {
    const wixSessionCookie = cookies().get(WIX_SESSION_COOKIE_NAME);
    let visitorCookie;
    let tokens;

    if (!wixSessionCookie) {
        visitorCookie = cookies().get("session");
    }

    try {
        if (wixSessionCookie && wixSessionCookie.value) {
            tokens = JSON.parse(wixSessionCookie.value);
        } else if (visitorCookie && visitorCookie.value) {
            tokens = JSON.parse(visitorCookie.value);
        }
    } catch (error) {
        console.error('Error parsing session cookie:', error);
        tokens = undefined;
    }

    return createClient({
        auth: OAuthStrategy({
            clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID!,
            tokens,
        }),
        modules: {
            members,
            items,
            comments,
        },
    });
}