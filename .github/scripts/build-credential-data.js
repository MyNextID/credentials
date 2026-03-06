const fs = require("fs");

const path = require("path");

const outputDir = "_generated";

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

const translations = loadTranslations(`_resources/user-consent/translations`);
const claimsGroups = readFileOrThrow(`_resources/user-consent/consent-groups.json`);

data["consent_groups"] = {
    "available_languages": translations,
    "groups":{}
}

Object.keys(claimsGroups).map((group => {

    data["consent_groups"]["groups"][group]= {};


    translations.forEach(lang => {

        const groupTrans = readFileOrThrow(`_resources/user-consent/translations/${lang}.json`);

        validatePropertyExists(`_resources/user-consent/translations/${lang}.json`, groupTrans, [group,"title"]);
        validatePropertyExists(`_resources/user-consent/translations/${lang}.json`, groupTrans, [group,"description"]);

        data["consent_groups"]["groups"][group]["label"] = {[lang]:groupTrans[group].title}
        data["consent_groups"]["groups"][group]["description"] = {[lang]:groupTrans[group].description}

    });

    validatePropertyExists(`_resources/user-consent/consent-groups.json`, claimsGroups, [group,"icon"]);

    data["consent_groups"]["groups"][group]["icon"] = claimsGroups[group].icon
    
}));


// 2. Get all credential types
const credentialTypes = readFileOrThrow("_generated/credential-types.json");

for (const key of credentialTypes){

    // a) Get all translations for credential type
    const translations = loadTranslations(`${key}/translations`);

    data.credential_types[key] = {
        "label": {},
        "available_languages": translations,
        "claims":{}
    };

    // b) Get credential type label for each language 
    translations.forEach(lang => {
        const label = readFileOrThrow(`${key}/translations/${lang}.json`);

        validatePropertyExists(`${key}/translations/${lang}.json`, label, ["credential","title"]);
        data.credential_types[key]["label"][lang] = label.credential.title;
    });
    
    // c). Get claims in human-readable translation
    const claims = readFileOrThrow(`${key}/user-consent/user-consent-map.json`);

    Object.keys(claims).map(claim => {
        data.credential_types[key]["claims"][claim] = {
            "label":{},
            "group":claims[claim]
        }

        translations.forEach(lang => {
            const inputField = readFileOrThrow(`${key}/input-fields/translations/${lang}.json`);
            data.credential_types[key]["claims"][claim]["label"][lang] = inputField[claim];
        });

    });

    //console.log(`✔ Processed ${key}`);
}

fs.writeFileSync( path.join(outputDir, "credentials.json"), JSON.stringify(data, null, 2));