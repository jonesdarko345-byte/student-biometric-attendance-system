const fs = require("fs");
const content = fs.readFileSync("/tmp/manus_bundle.js", "utf8");
const imgMatches = content.match(/\/manus-storage\/[^"'`)\s]+/g) || [];
console.log("Images found in bundle:", Array.from(new Set(imgMatches)));
