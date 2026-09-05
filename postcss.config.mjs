const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      // Autoplace CSS Grid prefixes so older Safari/Chromium versions that
      // still need -ms- prefixes are covered. Modern browsers ignore them.
      grid: 'autoplace',
      flexbox: 'no-2009',
    },
  },
};

export default config;
