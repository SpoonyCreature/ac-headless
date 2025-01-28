# Wix Headless Example

This is a Next.js project that demonstrates how to build a headless website using Wix as a backend. It includes features like blog posts, authentication with Google OAuth, and various Wix services integration.

## Features

- Next.js 13+ with App Router
- Wix Headless Integration
- Google OAuth Authentication
- Blog System
- TypeScript Support
- Modern React Components
- Responsive Design

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (LTS version recommended)
- Yarn package manager (v3.3.0)
- A Wix account with API access
- A Google Cloud Console project with OAuth 2.0 credentials

## Local Development Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd wix-headless-example
```

2. Install dependencies:
```bash
yarn install
```

3. Create a `.env.local` file in the root directory with the following variables:
```env
# Wix Configuration
WIX_API_KEY=your_wix_api_key
WIX_API_KEY_ADMIN=your_wix_admin_api_key
WIX_SITE_ID=your_wix_site_id

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Wix Client
NEXT_PUBLIC_WIX_CLIENT_ID=your_wix_client_id
```

4. Run the development server:
```bash
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Available Scripts

- `yarn dev` - Runs the development server
- `yarn build` - Builds the application for production
- `yarn start` - Starts the production server
- `yarn lint` - Runs the linter
- `yarn test` - Runs the test suite
- `yarn e2e` - Runs end-to-end tests with Playwright

## Deployment to Vercel

1. Create a new project on [Vercel](https://vercel.com)

2. Connect your repository to Vercel

3. Configure the following environment variables in your Vercel project settings:
   - `WIX_API_KEY`
   - `WIX_API_KEY_ADMIN`
   - `WIX_SITE_ID`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXT_PUBLIC_BASE_URL` (set to your production URL)
   - `NEXT_PUBLIC_WIX_CLIENT_ID`

4. Deploy using the Vercel CLI or GitHub integration:
```bash
vercel
```

Or simply push to your main branch if you've set up automatic deployments.

## Project Structure

- `/src/app` - Next.js 13+ app router pages and API routes
- `/src/components` - React components
- `/src/styles` - Global styles and CSS modules
- `/public` - Static assets
- `/internal` - Internal utilities and configurations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.
