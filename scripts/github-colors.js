import { writeFileSync } from "fs";
import { get } from "https";
import { load } from "js-yaml";
import { URL } from "url";

// Helper to fetch a file from a URL
function getFile(url) {
  return new Promise((resolve, reject) => {
    get(url, (res) => {
      let data = "";
      if (res.statusCode !== 200) {
        reject(false);
        return;
      }
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    }).on("error", (e) => reject(e));
  });
}

// Helper to sort object keys case-insensitively
function orderByKeys(obj) {
  return Object.keys(obj)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
}

// Write JSON file
function writeJson(obj, filename = "../data/colors.json") {
  writeFileSync(filename, JSON.stringify(obj, null, 4) + "\n");
}

// Main run function
async function run() {
  console.log("Getting list of languages ...");
  const yml = await getFile(
    "https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml"
  );
  let langsYml = load(yml);
  langsYml = orderByKeys(langsYml);

  const langs = {};
  for (const lang in langsYml) {
    if (
      !("type" in langsYml[lang]) ||
      "color" in langsYml[lang] ||
      langsYml[lang]["type"] === "programming"
    ) {
      console.log(`   Parsing the color for '${lang}' ...`);
      langs[lang] = {};
      langs[lang]["color"] = langsYml[lang]["color"] || "#cccccc";
    }
  }

  console.log("Writing a new JSON file ...");
  writeJson(langs);
  console.log("All done!");
}

// Run the script
run().catch((err) => {
  console.error("Fatal error:", err);
});
