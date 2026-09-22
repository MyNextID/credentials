// This script helps detect missing folders or invalid JSON files in the repository.
// Recommended when adding a new credential type.

const fs = require("fs");

const path = require("path");

const entries = fs
    .readdirSync("./credential-definitions", { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

// Helpers

const profilesWithFormats = {
    "edc": ["w3c-vc"],			
    "open-badge": ["w3c-vc"],
    "eaa": ["w3c-vc", "sd-jwt-vc", "mdoc"],	
    "qeaa": ["w3c-vc", "sd-jwt-vc", "mdoc"],	
    "pub-eaa": ["w3c-vc", "sd-jwt-vc", "mdoc"],	
    "iso-18013-5": ["mdoc"],			
    "eudi.av": ["mdoc"],			
    "eudi.pid": ["sd-jwt-vc","mdoc"],
}

const userConsentGroupsFilePath = "./resources/user-consent/consent-groups.json"
const userConsentGroups = readJson(userConsentGroupsFilePath)

// credentialTypeToDirectory function
function getCredentialTypePath(credentialType) {
    return `credential-definitions/${credentialType}`
}

function getCredentialTypeVersions(credentialType){
    const entries = fs.readdirSync(`./${getCredentialTypePath(credentialType)}`, {withFileTypes: true});
    return entries.filter((e) => {
        // get directories
        return e.isDirectory();
    }).map((dir) => dir.name)
}

function getFiles(path){
    const entries = fs.readdirSync(`./${path}`, {withFileTypes: true});
    return entries.filter((e) => {
        // get files
        return e.isFile();
    }).map((dir) => dir.name)
}

function hasFile(path, fileName) {
    const entries = fs.readdirSync(`./${path}`, { withFileTypes: true });
    return entries.some((e) => e.isFile() && e.name === fileName);
}

function hasDirectory(path, fileName) {
    const entries = fs.readdirSync(`./${path}`, { withFileTypes: true });
    return entries.some((e) => e.isDirectory() && e.name === fileName);
}

function readJson(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
}

function isValidJson(filePath) {
    try {
      return readJson(filePath);
    } catch {
      return false;
    }
}

function crossCheckJsonKeys(json1, json2, json1Path, json2Path, fileName) {
    let errors = []
    let regexPrefixes = []
    Object.keys(json1).forEach((key1) => {
        if(key1.match(/{{N+}}/g)) {
            // regex search for ageOver{{NN}}
            const prefix = key1.split(/{{N+}}/g)[0]
            if (!Object.keys(json2).some((key2) => {
                if(key2.startsWith(prefix)) {
                    return key2.match(/[a-zA-Z]+[0-9]+/g)
                }
                return false;
            })) {
                log("- " + json1Path + ": pattern key " + key1 + " found in " + fileName + " is missing in " + json2Path);
            }
            regexPrefixes.push(prefix)
        } else if(json2[key1] === undefined) {
            log("- " + json1Path + ": key " + key1 + " found in " + fileName + " is missing in " + json2Path);
        }
    })
    Object.keys(json2).forEach((key2) => {
        if(json1[key2] === undefined) {
            if(regexPrefixes.length > 0) {
                // check if this key, that was not found matches with any regex patterns found previously
                if (!regexPrefixes.some((prefix) => {
                    return key2.startsWith(prefix)
                })) {
                    log("- " + json1Path + ": pattern key " + key2 + " found in " + json2Path + " is missing in " + fileName);
                }
            } else {
                log("- " + json1Path + ": key " + key2 + " found in " + json2Path + " is missing in " + fileName);
            }
        }
    })
    return errors
}

// For script log + console.log
const logDirectory = path.join(__dirname, "..", "logs");
const logFilePath = path.join(logDirectory, "script.log");

fs.mkdirSync(logDirectory, { recursive: true });

// Clear the previous run's log
fs.writeFileSync(logFilePath, "");

function log(message) {
  console.log(message);
  fs.appendFileSync(logFilePath, message + "\n");
}

let hasErrors = false;

function validationError(message) {
  hasErrors = true;
  log(message);
}


log("Validating credential-definitions folder structure");

entries.map(type => type.name).forEach(credentialType => {

    log("\n" +credentialType);

    // 1.a) Check if README.md exists.
    if(!hasFile(getCredentialTypePath(credentialType), 'README.md')){
        validationError("- README.md is missing");
    }

    // Get all versions from the credential type folder.
    const versions = getCredentialTypeVersions(credentialType); 

    // 1.b) There must be at least one version folder.
    if(versions.length < 1){
        validationError("- Default version folder is missing (e.g. v1)");
    }

    for (const version of versions){

        const key = credentialType + "/" + version;

        const exampleJsonFilePath = getCredentialTypePath(key) + "/input-fields/example.json"
        let exampleJson = undefined;

        // Get all folders inside the version folder.
        const folders = fs.readdirSync("./"+getCredentialTypePath(key), {withFileTypes: true});

        // 1.c) Check that README.md, input-fields, translations, and user-consent exist inside the version folder.
        if(!hasFile(getCredentialTypePath(key), 'README.md')){
            validationError("- README.md is missing in " + key);
        }


        // TRANSLATIONS
        if(!hasDirectory(getCredentialTypePath(key), "translations")){
            validationError("- Missing translations folder in " + key);

        }else{
            // 1.d) Check that the translations folder contains the default en.json file.
            if(!hasFile(getCredentialTypePath(key)+"/translations", 'en.json')){
                validationError("- Missing default en.json in " + key + "/translations");
            }else{
                // 1.e) Check that all JSON files follow the two-character naming convention.
                const translationFiles = getFiles(getCredentialTypePath(key)+"/translations"); 
                
                for (const fileName of translationFiles){
                    const isValid = /^[a-zA-Z]{2}\.json$/.test(fileName);

                    if (!isValid) {
                        validationError("- Invalid JSON file name: " + key + "/translations/" + fileName);
                    }else{
                        // 2.a) Check that all JSON files are valid.
                        const filePath = getCredentialTypePath(key)+"/translations/"+fileName;
                        if (!isValidJson(filePath)) {
                            validationError("- Invalid JSON in " + key + "/translations/" + fileName);
                        }
                    }
                }
            }
        }

        // INPUT-FIELDS

        // 1.f) Check that the input-fields folder exists.
        if(!hasDirectory(getCredentialTypePath(key), "input-fields")){
            validationError("- Missing input-fields folder in " + key);
        }else{

            const inputFieldsPath = key+ "/input-fields";

            // 1.g) Check that README.md, schema.json, example.json, and translations exist inside the input-fields folder.
            if(!hasFile(getCredentialTypePath(inputFieldsPath), 'README.md')){
                validationError("- Missing README.md in " + inputFieldsPath);
            }

            if(!hasFile(getCredentialTypePath(inputFieldsPath), 'schema.json')){
                validationError("- Missing schema.json in " + inputFieldsPath);
            }else{
                // 2.b) Check that JSON file is valid.
                const jsonConent = isValidJson(getCredentialTypePath(inputFieldsPath)+"/schema.json");
                if (!jsonConent) {
                    validationError("- Invalid JSON in " + inputFieldsPath + "/schema.json");
                }
            }

            if(!hasFile(getCredentialTypePath(inputFieldsPath), 'example.json')){
                validationError("- Missing example.json in " + inputFieldsPath);
            }else{
                // 2.c) Check that JSON file is valid.
                const jsonConent = isValidJson(getCredentialTypePath(inputFieldsPath)+"/example.json");
                if (!jsonConent) {
                    validationError("- Invalid JSON in " + inputFieldsPath + "/example.json");
                }else{
                    exampleJson = jsonConent;
                }
            }

            if(!hasDirectory(getCredentialTypePath(inputFieldsPath), "translations")){
                validationError("- Missing translations folder in " + inputFieldsPath);
    
            }else{
                // 1.h) Check that the translations folder contains the default en.json file.
                if(!hasFile(getCredentialTypePath(inputFieldsPath)+"/translations", 'en.json')){
                    validationError("- Missing default en.json in " + inputFieldsPath + "/translations");
                }else{
                    // 1.i) Check that all JSON files follow the two-character naming convention.
                    const translationFiles = getFiles(getCredentialTypePath(inputFieldsPath)+"/translations"); 
                    
                    for (const fileName of translationFiles){
                        const isValid = /^[a-zA-Z]{2}\.json$/.test(fileName);

                        if (!isValid) {
                            validationError("- Invalid JSON file name: " + inputFieldsPath + "/translations/" + fileName);
                        }else{
                            // 2.d) Check that all JSON files are valid.
                            const filePath = getCredentialTypePath(inputFieldsPath)+"/translations/"+fileName;
                            const jsonContent = isValidJson(filePath);
                            if (!jsonContent) {
                                validationError("- Invalid JSON in " + inputFieldsPath + "/translations/" + fileName);
                            }else{
                                // 3.a) check if example json is valid, then crossmatch example json keys with translation x.json keys
                                if(exampleJson) {
                                    crossCheckJsonKeys(jsonContent, exampleJson, filePath, exampleJsonFilePath, fileName)  
                                }
                            }
                        }
                    }
                }
            }

        }

        // USER-CONSENT

        // 1.j) Check that the user-consent folder exists.
        if(!hasDirectory(getCredentialTypePath(key), "user-consent")){
            validationError("- Missing user-consent folder in " + key);

        }else{
            // 1.k) Check that the user-consent folder contains the user-consent-map.json file.
            if(!hasFile(getCredentialTypePath(key)+"/user-consent", 'user-consent-map.json')){
                validationError("- Missing user-consent-map.json in " + key + "/user-consent");

            }else{
                // 2.e) Check that all JSON files are valid.
                const filePath = getCredentialTypePath(key)+"/user-consent/user-consent-map.json";
                const consentConent = isValidJson(filePath);
                if (!consentConent) {
                    validationError("- Invalid JSON in " + key + "/user-consent/user-consent-map.json");
                }else{
                    // 3.b) Check that the key values correspond to the options defined in consent-groups.json.
                    Object.values(consentConent).forEach((consentGroup) => {
                        if(!userConsentGroups[consentGroup]) {
                            validationError("- " + filePath + ": Consent group '" + consentGroup + "' is invalid. Use a consent group defined in the default groups file: " + userConsentGroupsFilePath);
                        }
                    })

                    // 3.c) check if example json is valid, then crossmatch example json keys with user-consent-map.json keys
                    if(exampleJson) {
                        crossCheckJsonKeys(consentConent, exampleJson, filePath, exampleJsonFilePath, 'user-consent-map.json');
                    }
                }
            }
        }

        // PROFILE folders
        
        // Extract only profile folders
        reqFolders = ["input-fields","translations","user-consent"];
        const profiles = folders.filter(e =>
            e.isDirectory() &&
            !reqFolders.includes(e.name.toLowerCase())
        );

        // 1.l) Check that the version folder contains at least one profile folder.
        if(profiles.length < 1){
            validationError("- Missing profile folder in " +key +"");
        }else{
            for (const profile of profiles){
                // 1.m) Check that profile name is valid.
                const profileName = profile.name;

                const profilePath = key + "/" + profileName;
                if (!Object.hasOwn(profilesWithFormats, profileName)) {
                    validationError("- Invalid profile folder: " + profilePath);
                } else {
                    // 1.n) Check if README.md exists.
                    if(!hasFile(getCredentialTypePath(profilePath), 'README.md')){
                        validationError("- Missing README.md in " + profilePath);
                    }

                    const profileFolders = fs.readdirSync("./"+getCredentialTypePath(profilePath), {withFileTypes: true});
                    const formats = profileFolders.filter(e =>
                        e.isDirectory()
                    );

                    // 1.o) Check that profile folder contains at least one format folder.
                    if(formats.length < 1){
                        validationError("- Missing format folder in " + profilePath);
                    }else{
                        
                        // 1.r) Check that the format name is valid and supported by the selected profile.
                        for (const format of formats){
                            const formatName = format.name;
                            const formatPath = profilePath + "/" + formatName;

                            if(!profilesWithFormats[profileName]?.includes(formatName)){
                                validationError("- Format folder " + formatPath + " is not supported by the " + profileName + " profile");
                            }else{

                                // 1.r) Check that README.md, schema.json, and input-fileds-to-credential-map.json  exist inside the format folder.

                                if(!hasFile(getCredentialTypePath(formatPath), 'README.md')){
                                    validationError("- Missing README.md in " + formatPath);
                                }

                                if(!hasFile(getCredentialTypePath(formatPath), 'schema.json')){
                                    validationError("- Missing schema.json in " + formatPath);
                                }else{
                                    // 2.f) Check that JSON file is valid.
                                    const jsonConent = isValidJson(getCredentialTypePath(formatPath)+"/schema.json");
                                    if (!jsonConent) {
                                        validationError("- Invalid JSON in " + formatPath + "/schema.json");
                                    }
                                }

                                if(!hasFile(getCredentialTypePath(formatPath), 'input-fields-to-credential-map.json')){
                                    validationError("- Missing input-fields-to-credential-map.json in " + formatPath);
                                }else{
                                    // 2.g) Check that JSON file is valid.
                                    const jsonConent = isValidJson(getCredentialTypePath(formatPath)+"/input-fields-to-credential-map.json");
                                    if (!jsonConent) {
                                        validationError("- Invalid JSON in " + formatPath + "/input-fields-to-credential-map.json");
                                    }else{
                                        // 3.c) check if example json is valid, then crossmatch example json keys with input-fields-to-credential-map.json keys
                                        const filePath = getCredentialTypePath(formatPath)+"/input-fields-to-credential-map.json";
                                        if(exampleJson) {
                                            crossCheckJsonKeys(jsonConent, exampleJson, filePath, exampleJsonFilePath, 'input-fields-to-credential-map.json');
                                        }
                                    }
                                }

                                // 1.s) Check for more JSON files and validate them
                                // Extract only JSON files
                                const formatFiles = fs.readdirSync(`./${getCredentialTypePath(formatPath)}`)
                                .filter(file =>
                                    file.endsWith(".json") &&
                                    file !== "schema.json" &&
                                    file !== "input-fields-to-credential-map.json"
                                );

                                for (const file of formatFiles){
                                    const jsonConent = isValidJson(getCredentialTypePath(formatPath) + "/" + file);
                                    if (!jsonConent) {
                                        validationError("- Invalid JSON in " + formatPath + "/" + file);
                                    }
                                }
                               
                            }

                        }
                    }
                }
            }
        }

    }
})

if (hasErrors) {
    log("\nCredential-definitions folder structure validation failed\n");
    process.exitCode = 1;
} else {
    log("\nCredential-definitions folder structure is valid\n");
}