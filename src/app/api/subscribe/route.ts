import { ApiKeyStrategy, createClient } from "@wix/sdk";
import { NextResponse } from 'next/server';
import { contacts } from '@wix/crm';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const wixClient = createClient({
            auth: ApiKeyStrategy({
                apiKey: process.env.WIX_API_KEY_ADMIN!,
                siteId: process.env.WIX_SITE_ID!
            }),
            modules: {
                contacts
            }
        });

        const info = {
            emails: {
                items: [
                    {
                        email: email,
                        primary: true,
                        tag: contacts.EmailTag.MAIN
                    }
                ]
            }
            // extendedFields: {
            //     items: [
            //         {
            //             name: "subscription_status",
            //             value: "SUBSCRIBED"
            //         },
            //         {
            //             name: "source",
            //             value: "WEBSITE_NEWSLETTER"
            //         }
            //     ]
            // }
        }

        const options = {
            allowDuplicates: false
        }

        console.log("info", JSON.stringify(info));
        console.log("options", JSON.stringify(options));

        // Create a new contact in Wix
        const response = await wixClient.contacts.createContact(info, options);
        console.log("response", JSON.stringify(response));

        return NextResponse.json({
            message: 'Successfully subscribed to newsletter',
            contact: response
        });
    } catch (error: any) {
        console.error('Newsletter subscription error:', error);

        // Handle duplicate contact case
        if (error.details?.applicationError?.code === 'DUPLICATE_CONTACT_EXISTS' ||
            error.details?.applicationError?.code === 'CONTACT_ID_ALREADY_EXISTS') {
            return NextResponse.json(
                {
                    error: 'This email is already subscribed',
                    details: error.details
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                error: 'Failed to subscribe to newsletter',
                details: error.details
            },
            { status: 500 }
        );
    }
} 
