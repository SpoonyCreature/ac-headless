# Apologetics Central - Wix Headless Example

This is a Next.js project showcasing a headless website built with Wix as a backend, specifically tailored for **Apologetics Central**, a platform dedicated to Reformed Presuppositional Apologetics.

## Features

- **Next.js 13+ with App Router:**  Leveraging the latest Next.js features for a modern and performant web experience.
- **Wix Headless Integration:** Utilizes Wix as a headless CMS for managing content like blog posts and potentially other data.
- **Google OAuth Authentication:** Implements secure user authentication using Google OAuth for member access and features.
- **Blog System:**  A fully functional blog powered by Wix, allowing for articles, categories, and rich content.
- **AI-Powered Bible Study Tools:** Integrates AI tools for Christian study, including a Bible study assistant and potentially more AI features.
- **TypeScript Support:**  Built with TypeScript for type safety and improved code maintainability.
- **Modern React Components:**  Utilizes reusable React components styled with Tailwind CSS for a consistent and responsive design.
- **Responsive Design:**  Ensures optimal viewing experience across various devices.
- **SEO Optimized:** Includes metadata generation for blog posts and proper redirects for improved search engine visibility.

## Prerequisites

Before you begin, ensure you have the following installed and configured:

- Node.js (LTS version recommended)
- Yarn package manager (v3.3.0 or later)
- A Wix account with API access and a Wix site.
- A Google Cloud Console project with OAuth 2.0 credentials set up for your application.

## Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone [repository-url]
   cd wix-headless-example
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Create a `.env.local` file** in the root directory and configure the following environment variables. You will need to obtain these from your Wix and Google Cloud Console projects.
   ```env
   # Wix Configuration
   WIX_API_KEY=your_wix_api_key
   WIX_API_KEY_ADMIN=your_wix_admin_api_key
   WIX_SITE_ID=your_wix_site_id
   NEXT_PUBLIC_WIX_CLIENT_ID=your_wix_client_id # Client ID from your Wix OAuth app

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NEXT_PUBLIC_BASE_URL=http://localhost:3000 # For local development
   ```
   **Note:** Ensure your Google Cloud Console Authorized redirect URIs include `http://localhost:3000/api/auth/google/callback`.

4. **Run the development server:**
   ```bash
   yarn dev
   ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Available Scripts

- `yarn dev`: Starts the Next.js development server.
- `yarn build`: Builds the application for production deployment.
- `yarn start`: Starts the Next.js production server.
- `yarn lint`: Runs the ESLint linter for code quality checks.
- `yarn test`:  Executes end-to-end tests using Playwright.
- `yarn e2e`:  Alias for `yarn test` - runs end-to-end tests with Playwright.

## Deployment to Vercel

1.  Create a new project on [Vercel](https://vercel.com) and link your repository.
2.  In your Vercel project settings, under "Environment Variables", configure the following variables.  These are crucial for connecting to Wix and Google services in your production environment:

    - `WIX_API_KEY`: Your Wix API Key.
    - `WIX_API_KEY_ADMIN`: Your Wix Admin API Key.
    - `WIX_SITE_ID`: Your Wix Site ID.
    - `NEXT_PUBLIC_WIX_CLIENT_ID`: Your Wix Client ID (OAuth App).
    - `GOOGLE_CLIENT_ID`: Your Google Client ID.
    - `GOOGLE_CLIENT_SECRET`: Your Google Client Secret.
    - `NEXT_PUBLIC_BASE_URL`: **Crucially, set this to your production URL**, e.g., `https://ac-headless.vercel.app`.

    **Important:** Ensure your Google Cloud Console Authorized redirect URIs include your production URL, for example: `https://ac-headless.vercel.app/api/auth/google/callback`.

3.  Deploy your application. Vercel will automatically build and deploy your Next.js app. You can use the Vercel CLI or simply push changes to your connected repository if you have automatic deployments set up.

    ```bash
    vercel
    ```

## Project Structure

- `/src/app`:  Contains Next.js App Router structure, including pages and API routes.
    - `/src/app/api/auth`: API routes for authentication, including Google OAuth login and callback (`startLine: 1`, `endLine: 30` of `src/app/api/auth/google/login/route.ts` and `startLine: 1`, `endLine: 111` of `src/app/api/auth/google/callback/route.ts`).
    - `/src/app/blog`: Blog related pages, including dynamic routes for blog posts (`src/app/blog/[slug]/page.tsx`).
    - `/src/app/ai`: Pages for AI-powered tools (`src/app/ai/page.tsx`, `src/app/ai/bible-study/page.tsx`).
    - `/src/app/privacy`: Privacy policy page (`src/app/privacy/page.tsx`).
    - `/src/app/actions.ts`: Server actions for login functionality (`src/app/actions.ts`).
    - `/src/app/layout.tsx`: Root layout component (`src/app/layout.tsx`).
    - `/src/app/page.tsx`: Home page of the application (`src/app/page.tsx`).
    - `/src/app/serverWixClient.ts`:  Utility for initializing the Wix SDK server-side.
- `/src/components`: React components used throughout the application.
    - `/src/components/BlogCard.tsx`: Component for displaying blog post cards (`src/components/BlogCard.tsx`).
    - `/src/components/BlogPostContent.tsx`: Component for rendering blog post content, including rich text and comments (`src/components/BlogPostContent.tsx`).
    - `/src/components/GoogleLoginButton.tsx`: Google Login button component (`src/components/GoogleLoginButton.tsx`).
    - `/src/components/Header.tsx`: Header component with navigation and login/logout functionality (`src/components/Header.tsx`).
    - `/src/components/Footer.tsx`: Footer component (`src/components/Footer.tsx`).
- `/src/styles`: Global CSS files and potentially CSS modules.
    - `/src/styles/globals.css`: Global styles and Tailwind CSS directives (`src/styles/globals.css`).
- `/public`: Static assets like images.
- `/internal`: Internal utilities and configurations.
    - `/internal/components/ui`: Reusable UI components.
    - `/internal/providers`: Context providers like `ModalProvider` and `ClientProvider`.
    - `/internal/utils`: Utility functions.
- `/constants`:  Constants used in the application (`internal/components/ui/modals/login-modal.js`).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.