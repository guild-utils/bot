const sitemap = require("nextjs-sitemap-generator");
const fs = require("fs");
sitemap({
  baseUrl: "https://guj.tignear.com",
  pagesDirectory: __dirname + "/out",
  ignoredExtensions: ["js", "map", "webp", "svg", "xml", "json"],
  ignoredPaths: ["404"],
  ignoreIndexFiles: true,
  targetDirectory: "out",
});
