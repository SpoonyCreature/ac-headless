import { OAuthStrategy, createClient } from "@wix/sdk";
import { cookies } from "next/headers";
import { WIX_SESSION_COOKIE_NAME } from "./../constants/constants";
import { members } from "@wix/members";
import { items } from "@wix/data";

export function getServerWixClient() {
    const wixSessionCookie = cookies().get(WIX_SESSION_COOKIE_NAME);
    let visitorCookie;
    console.log("WIX SESSION COOKIE", wixSessionCookie);

    if (!wixSessionCookie) {
        visitorCookie = cookies().get("session");
    }

    return createClient({
        auth: OAuthStrategy({
            clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID!,
            tokens: wixSessionCookie && wixSessionCookie.value
                ? JSON.parse(wixSessionCookie.value)
                : (visitorCookie && visitorCookie.value
                    ? JSON.parse(visitorCookie.value)
                    : undefined),
        }),
        modules: {
            members,
            items,
        },
    });
}