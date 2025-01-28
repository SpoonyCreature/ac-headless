import { getServerWixClient } from "@/src/app/serverWixClient";
import { members } from "@wix/members";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const wixClient = getServerWixClient();

        if (!wixClient.auth.loggedIn()) {
            return NextResponse.json({ member: null });
        }

        const response = await wixClient.members.getCurrentMember({
            fieldsets: [members.Set.FULL]
        });

        return NextResponse.json({ member: response.member });
    } catch (error) {
        console.error('Error fetching member:', error);
        return NextResponse.json({ error: 'Failed to fetch member' }, { status: 500 });
    }
} 