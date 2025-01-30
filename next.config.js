/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        domains: ['static.wixstatic.com', 'i.ytimg.com'],
    },
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            '@': '.',
        };
        return config;
    },
    experimental: {
        appDir: true,
        serverActions: true,
    },
    transpilePackages: ['@wix/comments', '@wix/comments_categories'],
    distDir: '.next',
    // Set the source directory to src
    dir: 'src',
};

module.exports = nextConfig;
