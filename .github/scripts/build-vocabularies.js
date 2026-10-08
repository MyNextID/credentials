// Builds resources/vocabularies/*.json: controlled-vocabulary lookup tables for CEL maps (vocab.<name>[label]).
// See specifications/cel-mapping.md. Run by hand when a vocabulary changes:
//
//   node .github/scripts/build-vocabularies.js
//
// Sources: the ELM controlled-vocabulary XSDs at a pinned commit, plus the EU Vocabularies SPARQL endpoint
// for schemes the XSDs do not ship.

const fs = require("fs");
const path = require("path");

const ELM_COMMIT = "9d7c5d22002237c3afeb1750b7038e6fe2cdd371";
const ELM_CV = `https://raw.githubusercontent.com/european-commission-empl/European-Learning-Model/${ELM_COMMIT}/xsd/loq/cv`;
const SPARQL = "https://publications.europa.eu/webapi/rdf/sparql";
const OUT = "resources/vocabularies";

// EU official languages, keyed by the ISO 639-1 code used in LangString maps.
const EU_LANGUAGES = {
    bg: "BUL", cs: "CES", da: "DAN", de: "DEU", el: "ELL", en: "ENG", es: "SPA", et: "EST",
    fi: "FIN", fr: "FRA", ga: "GLE", hr: "HRV", hu: "HUN", it: "ITA", lt: "LIT", lv: "LAV",
    mt: "MLT", nl: "NLD", pl: "POL", pt: "POR", ro: "RON", sk: "SLK", sl: "SLV", sv: "SWE",
};

const VOCABULARIES = {
    country: { xsd: "country" },
    language: { xsd: "language" },
    fileType: { xsd: "file-type" },
    encoding: { xsd: "europass-content-encoding-types" },
    credentialProfile: { xsd: "europass-credential-types" },
    learningMode: { xsd: "europass-modes" },
    assessmentType: { xsd: "europass-learning-assessment-types" },
    creditSystem: { xsd: "credit-points" },
    eqf: { xsd: "eqf" },
    supervision: { scheme: "http://data.europa.eu/snb/supervision-verification/25831c2" },
};

const concept = (scheme, id, label) => ({
    id,
    type: "Concept",
    inScheme: { id: scheme, type: "ConceptScheme" },
    prefLabel: { en: label },
});

async function fromXsd(name) {
    const res = await fetch(`${ELM_CV}/${name}.xsd`);
    if (!res.ok) throw new Error(`${name}.xsd: HTTP ${res.status}`);
    const xsd = await res.text();
    const scheme = xsd.match(/targetNamespace="([^"]+)"/)[1];
    const re = /<xs:enumeration value="([^"]+)">\s*<xs:annotation>\s*<xs:documentation>([^<]+)<\/xs:documentation>/g;
    return [...xsd.matchAll(re)].map(([, id, label]) => concept(scheme, id, label.replace(/\s+/g, " ").trim()));
}

async function fromSparql(scheme) {
    const query = `PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        SELECT DISTINCT ?c ?l WHERE { ?c skos:inScheme <${scheme}> ; skos:prefLabel ?l . FILTER(lang(?l) = "en") }`;
    const res = await fetch(`${SPARQL}?query=${encodeURIComponent(query)}`, { headers: { Accept: "application/sparql-results+json" } });
    if (!res.ok) throw new Error(`${scheme}: HTTP ${res.status}`);
    return (await res.json()).results.bindings.map((b) => concept(scheme, b.c.value, b.l.value));
}

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    for (const [name, source] of Object.entries(VOCABULARIES)) {
        const concepts = source.xsd ? await fromXsd(source.xsd) : await fromSparql(source.scheme);
        const table = {};
        if (name === "language") {
            for (const [code, iso3] of Object.entries(EU_LANGUAGES)) {
                table[code] = concepts.find((c) => c.id.endsWith(`/${iso3}`));
            }
        } else {
            for (const c of concepts.sort((a, b) => a.prefLabel.en.localeCompare(b.prefLabel.en))) {
                if (table[c.prefLabel.en]) throw new Error(`${name}: duplicate label "${c.prefLabel.en}"`);
                table[c.prefLabel.en] = c;
            }
        }
        fs.writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify(table, null, 4) + "\n");
        console.log(`${name}: ${Object.keys(table).length} concepts`);
    }
})().catch((e) => {
    console.error(e.message);
    process.exit(1);
});
