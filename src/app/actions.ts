'use server';

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { WIX_SESSION_COOKIE_NAME } from "@/src/constants/constants";

export async function logout() {
    cookies().delete(WIX_SESSION_COOKIE_NAME);
    revalidatePath("/");
} 