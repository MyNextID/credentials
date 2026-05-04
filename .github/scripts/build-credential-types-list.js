const fs = require("fs");

const path = require("path");

const outputDir = "_autogen";

// Helpers
function getCredentialTypeVersions(credentialType){
    const entries = fs.readdirSync(`./${credentialType}`, {withFileTypes: true});
    return entries.filter((e) => {
        // get directories
        return e.isDirectory();
    }).map((dir) => dir.name)
}

function getCredentialTypeInputfieldsSchemaPath(credentialType) {
    return `${credentialType}/input-fields/schema.json`
}
function getCredentialTypeFormatSchemaPath(credentialType,format) {
    return `${credentialType}/${format}/schema.json`
}
function getCredentialTypeMappingPath(credentialType,format) {
    return `${credentialType}/${format}/input-fields-to-credential-map.json`
}

const entries = fs.readdirSync("./", {withFileTypes: true});
const types = entries.filter((e) => {
    // Get directories, whose name does not begin with _ or .
    return e.isDirectory() && !e.name.startsWith("_") && !e.name.startsWith(".");
})

// Make sure folder exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Check if file path exist and read data from file as json
function readFileOrThrow(filePath){

    // Validate that path folders exist
    if (!fs.existsSync(filePath)) {
        console.error(`Missing folder: ${filePath}`);
        //process.exit(1); // exit with error → GitHub Action fails
        return {};
    }
  
    const data = JSON.parse(
        fs.readFileSync(filePath, "utf8")
    );

    return data;
}

const data = {};

types.map(type => type.name).forEach(credentialType => {

    // a) Get all versions in credential type folder
    const versions = getCredentialTypeVersions(credentialType); 

    data[credentialType] = {};

    for (const version of versions){

        const key = credentialType + "/" + version;

        // b) Link for input fields schema
        const hasInputFieldsSchema = fs.existsSync(getCredentialTypeInputfieldsSchemaPath(key));

        data[credentialType][version] = {
            "schema": hasInputFieldsSchema ? ("/" + getCredentialTypeInputfieldsSchemaPath(key)) : "",
            "profiles":{}
        };

        // c) Get all folders inside version and filter out only profiles. Ignoring all files.
        const folders = fs.readdirSync("./"+key, {withFileTypes: true});

        // Excluded files that are NOT PROFILE
        const excluded = ["input-fields", "translations", "user-consent"];

        const profiles = folders.filter(e =>
            e.isDirectory() &&
            !e.name.startsWith("_") &&
            !e.name.startsWith(".") &&
            !excluded.includes(e.name.toLowerCase())
        );

        for (const profileKey of profiles){
            const profile = profileKey.name;
            data[credentialType][version]["profiles"][profile] = {"formats":{}}

            // d) Get all folders inside version and filter out only formats. Ignoring all files.
            const formatfolders = fs.readdirSync("./"+key+"/"+ profile, {withFileTypes: true});

            // Excluded files that are NOT FORMAT
            const excluded = [""];

            const formats = formatfolders.filter(e =>
                e.isDirectory() &&
                !e.name.startsWith("_") &&
                !e.name.startsWith(".") &&
                !excluded.includes(e.name.toLowerCase())
            );
            for (const formatKey of formats){
                const format = formatKey.name;

                // d) Format schema url
                const hasFormatSchema = fs.existsSync(getCredentialTypeFormatSchemaPath(key+"/"+profile,format));

                // e) Read the input-fields-to-credential-map.json
                const mapping = readFileOrThrow(getCredentialTypeMappingPath(key+"/"+profile, format));

                data[credentialType][version]["profiles"][profile]["formats"][format] = {
                    "schema": hasFormatSchema ? ("/" + getCredentialTypeFormatSchemaPath(key+"/"+profile,format)) : "",
                    "input-fields-map": mapping
                }
            };
        };
    }
})

fs.writeFileSync( path.join(outputDir, "credential-types.json"), JSON.stringify(data, null, 2));