const fs = require("fs");

const path = require("path");

const outputDir = "_generated";

// make sure folder exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const entries = fs.readdirSync("./", {withFileTypes: true});
const types = entries.filter((e) => {
    // get directories, whose name does not begin with _ or .
    return e.isDirectory() && !e.name.startsWith("_") && !e.name.startsWith(".");
})


fs.writeFileSync( path.join(outputDir, "credential-types.json"), JSON.stringify(types.map(e => e.name), null, 2));