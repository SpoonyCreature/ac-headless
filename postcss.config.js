module.exports = {
    plugins: {
        'tailwindcss': {},
        'postcss-flexbugs-fixes': {},
        'autoprefixer': {
            flexbox: 'no-2009',
            // Disable color-adjust warning for Wix Ricos
            ignoreWarnings: [{ rule: 'color-adjust' }]
        },
    },
}
