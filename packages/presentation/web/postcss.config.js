const purgecss = [
  "@fullhuman/postcss-purgecss",
  {
    content: [
      "./pages/**/*.{js,jsx,ts,tsx}",
      "./components/**/*.{js,jsx,ts,tsx}",
    ], // eslint-disable-next-line
    safelist:[
      "bg-gray-800","text-gray-200","container"
    ],
    defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
  },
];
module.exports = {
  plugins: [
    "postcss-import",
    "postcss-nested",
    "tailwindcss",
    ...(process.env.NODE_ENV === "production" ? [purgecss] : []),
  ],
};
