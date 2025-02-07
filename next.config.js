/** @type {import('next').NextConfig} */
console.log('next.config.js is being loaded');
const nextConfig = {
    reactStrictMode: false,
    images: {
        domains: [
            'static.wixstatic.com',
            'i.ytimg.com',
            'lh3.googleusercontent.com',
        ],
    },
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            '@': '.',
        };
        return config;
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb'
        }
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    distDir: '.next',
    transpilePackages: ['@wix/comments', '@wix/comments_categories'],
    async redirects() {
        return [
            {
                source: '/post/:slug',
                destination: '/blog/:slug',
                permanent: true, // This is a 308 redirect - best for SEO
            },
        ];
    },
};

module.exports = nextConfig;
