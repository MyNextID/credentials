const fs = require("fs");

const path = require("path");

const outputDir = "_generated";

// Paths 
const userConsentResourcePath = `_resources/user-consent`
const userConsentTranslationsPath = userConsentResourcePath + "/translations"
function getUserConsentTranslationPath(lang) {
    return userConsentTranslationsPath + `/${lang}.json`
}

const userConsentGroupsPath = userConsentResourcePath + "/consent-groups.json"
const credentialTypesPath = outputDir + "/credential-types.json"
function getCredentialTypeTranslationPath(credentialType, lang) {
    if(lang) {
        return `${credentialType}/translations/${lang}.json`
    }
    return `${credentialType}/translations`
}
function getCredentialTypeUserConsentPath(credentialType) {
    return `${credentialType}/user-consent/user-consent-map.json`
}
function getCredentialTypeInputFieldsTranslationPath(credentialType, lang) {
    return `${credentialType}/input-fields/translations/${lang}.json`
}
function getCredentialTypeChangelogPath(credentialType) {
    return `${credentialType}/changelog.md`
}

function getCredentialTypeVersions(credentialType){
    const entries = fs.readdirSync(`./${credentialType}`, {withFileTypes: true});
    return entries.filter((e) => {
        // get directories
        return e.isDirectory();
    }).map((dir) => dir.name)
}

// make sure folder exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}


// Check if file path exist and read data from file as json
function readFileOrThrow(filePath){

    // Validate that path folders exist
    if (!fs.existsSync(filePath)) {
        console.error(`Missing folder: ${filePath}`);
        process.exit(1); // exit with error → GitHub Action fails
    }
  
    const data = JSON.parse(
        fs.readFileSync(filePath, "utf8")
    );

    return data;
}

// Check if property exist
function validatePropertyExists(filePath, obj, searchProperties){

    if(searchProperties.length === 0){
        return
    }

    if(!obj){
        console.error(`File is corrupted or empty ${filePath}`);
        process.exit(1);
    }
    if (!obj[searchProperties[0]]) {
        console.error(`Missing ${searchProperties[0]} in ${filePath}`);
        process.exit(1);
    }
    const newObj = obj[searchProperties[0]];
    searchProperties.shift();
    validatePropertyExists(filePath,newObj,searchProperties)
}

// get all the languages available
function loadTranslations(path){
    // returns array of file names
    const files = fs.readdirSync(path);
    const jsonFiles = files.filter(f => f.endsWith(".json")).map(f => f.replace(/\.json$/, ""));
    return jsonFiles;
}

const data = {
    "consent_groups":{},
    "credential_types": {}
};

// 1. Get user consent groups

const translations = loadTranslations(userConsentTranslationsPath);
const claimsGroups = readFileOrThrow(userConsentGroupsPath);

data["consent_groups"] = {
    "available_languages": translations,
    "groups":{}
}

Object.keys(claimsGroups).map((group => {

    data["consent_groups"]["groups"][group]= {};


    translations.forEach(lang => {

        const groupTrans = readFileOrThrow(getUserConsentTranslationPath(lang));

        validatePropertyExists(getUserConsentTranslationPath(lang), groupTrans, [group,"title"]);
        validatePropertyExists(getUserConsentTranslationPath(lang), groupTrans, [group,"description"]);

        data["consent_groups"]["groups"][group]["label"] = {[lang]:groupTrans[group].title}
        data["consent_groups"]["groups"][group]["description"] = {[lang]:groupTrans[group].description}

    });

    validatePropertyExists(userConsentGroupsPath, claimsGroups, [group,"icon"]);

    if(claimsGroups[group].icon.startsWith("./")) {
        claimsGroups[group].icon = claimsGroups[group].icon.replace(".", userConsentResourcePath)
    }
    data["consent_groups"]["groups"][group]["icon"] = claimsGroups[group].icon
    
}));


// 2. Get all credential types
const credentialTypes = readFileOrThrow(credentialTypesPath);

Object.keys(credentialTypes).forEach(credentialType => {

    // a) Get all versions in credential type folder
    const versions = getCredentialTypeVersions(credentialType); 

    data.credential_types[credentialType] = {};

    for (const version of versions){

        const key = credentialType + "/" + version;

        // b) Get all translations for credential type
        const translations = loadTranslations(getCredentialTypeTranslationPath(key));

        // c) Get version metadata - changelog link if exists
        const  hasChangelog = fs.existsSync(getCredentialTypeChangelogPath(key));
        const versionMetadata = {
            "changelogs:":  hasChangelog ? ("/"+ getCredentialTypeChangelogPath(key)) : "",
        }

        data.credential_types[credentialType][version] = {
            "label": {},
            "available_languages": translations,
            "version_metadata": versionMetadata,
            "claims":{}
        };

        // d) Get credential type label for each language 
        translations.forEach(lang => {
            const label = readFileOrThrow(getCredentialTypeTranslationPath(key, lang));

            validatePropertyExists(getCredentialTypeTranslationPath(key, lang), label, ["credential","title"]);
            data.credential_types[credentialType][version]["label"][lang] = label.credential.title;
        });

        // e). Get claims in human-readable translation
        const claims = readFileOrThrow(getCredentialTypeUserConsentPath(key));

        Object.keys(claims).map(claim => {
            data.credential_types[credentialType][version]["claims"][claim] = {
                "label":{},
                "group":claims[claim]
            }

            translations.forEach(lang => {
                const inputField = readFileOrThrow(getCredentialTypeInputFieldsTranslationPath(key, lang));
                data.credential_types[credentialType][version]["claims"][claim]["label"][lang] = inputField[claim];
            });

        });

        //console.log(`✔ Processed ${key}`);
    }
})

fs.writeFileSync( path.join(outputDir, "credentials.json"), JSON.stringify(data)); // (data, null, 2)); for pretty JSON