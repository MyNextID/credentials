const fs = require("fs");

// Get all credential types
const credentialTypes = JSON.parse(
    fs.readFileSync("credential-types-list.json", "utf8")
);

const result = [];

// Get label for each credential type
for (const key of credentialTypes){
    const filePath = `${key}/translations/en.json`;

    // Validate that all credential folders exist
    if (!fs.existsSync(filePath)) {
        console.error(`Missing folder: ${filePath}`);
        process.exit(1); // exit with error → GitHub Action fails
    }
  
    try {
        const label = JSON.parse(
            fs.readFileSync(filePath, "utf8")
        );

        // Check if property exist
        if (!label?.credential?.title) {
            console.error(`Missing title in ${filePath}`);
            process.exit(1);
        }

        const credentialTypeObj = {
            [key]:{
                "label": label.credential.title
            }
        };

        result.push(credentialTypeObj);

        console.log(`✔ Processed ${key}`);
        
    } catch (error) {
        console.log(`⚠️ Problem processing ${filePath}`);
        console.log(error.message);
    }
}

fs.writeFileSync( "credentials-data.json", JSON.stringify(result, null, 2));

console.log(result);