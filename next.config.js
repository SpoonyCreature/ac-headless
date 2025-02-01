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
};

module.exports = nextConfig;
