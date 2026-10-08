// Builds profiles/<profile>/<format>/rulebook.json from the EUDI rulebooks: the docType or vct, and every allowed
// element or claim with its encoding and whether it is mandatory. apply-credential-map.js checks maps against them.
// Run by hand when a rulebook changes:
//
//   node .github/scripts/build-rulebooks.js
//
// The rulebooks are Markdown; their attribute tables are parsed. Sources are pinned to a commit.

const fs = require("fs");
const path = require("path");

const PID = {
    url: "https://raw.githubusercontent.com/eu-digital-identity-wallet/eudi-doc-attestation-rulebooks-catalog/36f8adcf914ac06cac18d685add04e0a8a06d685/rulebooks/pid/pid-rulebook.md",
    source: "https://github.com/eu-digital-identity-wallet/eudi-doc-attestation-rulebooks-catalog/blob/36f8adcf914ac06cac18d685add04e0a8a06d685/rulebooks/pid/pid-rulebook.md",
};
const AV = {
    url: "https://raw.githubusercontent.com/eu-digital-identity-wallet/av-doc-technical-specification/8b9728752bd8d8eede6077ade4be8900949de2d9/docs/annexes/annex-A/annex-A-av-profile.md",
    source: "https://github.com/eu-digital-identity-wallet/av-doc-technical-specification/blob/8b9728752bd8d8eede6077ade4be8900949de2d9/docs/annexes/annex-A/annex-A-av-profile.md",
};

// The text of a section, from its heading (matched by number, e.g. "3.1.2") to the next heading.
function section(md, number) {
    const lines = md.split("\n");
    const start = lines.findIndex((l) => new RegExp(`^#+ ${number.replace(/\./g, "\\.")}[ .]`).test(l));
    if (start < 0) throw new Error(`section ${number} not found`);
    const end = lines.findIndex((l, i) => i > start && /^#+ /.test(l));
    return lines.slice(start + 1, end < 0 ? undefined : end).join("\n");
}

// Rows of every Markdown table in the text, as arrays of cells, without header and separator rows.
function rows(text) {
    return text.split("\n")
        .filter((l) => l.trim().startsWith("|"))
        .map((l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim().replace(/\\_/g, "_")))
        .filter((cells) => !/^\*\*|^:?-+/.test(cells[0]) && cells[0] !== "Identifier");
}

// Encoding of a row: the code spans of its encoding cell joined by "|" ("`tdate` or `full-date`" → "tdate|full-date").
function encoding(cells) {
    const spans = [...cells[2].matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    return spans.length ? spans.join("|") : cells[2];
}

async function get(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    return res.text();
}

function write(dir, data) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "rulebook.json"), JSON.stringify(data, null, 4) + "\n");
    console.log(`${dir}/rulebook.json: ${Object.keys(data.elements || data.claims).length} entries`);
}

(async () => {
    const pid = await get(PID.url);
    // Chapter 2: data identifiers. 2.2 and 2.4 are mandatory, 2.3, 2.5 and 2.6 optional.
    const mandatory = new Set([...rows(section(pid, "2.2")), ...rows(section(pid, "2.4"))].map((c) => c[0]));
    const known = new Set(["2.2", "2.3", "2.4", "2.5", "2.6"].flatMap((s) => rows(section(pid, s)).map((c) => c[0])));
    const docType = section(pid, "3.1.1").match(/"(eu\.europa\.ec\.eudi\.pid\.\d+)"/)[1];
    const vct = section(pid, "4.2").match(/"(urn:eudi:pid:\d+)"/)[1];

    const mdoc = {};
    for (const c of rows(section(pid, "3.1.2"))) {
        if (!known.has(c[0])) throw new Error(`PID mdoc: unknown data identifier ${c[0]}`);
        mdoc[c[1]] = { mandatory: mandatory.has(c[0]), encoding: encoding(c) };
    }
    const sdjwt = {};
    for (const c of rows(section(pid, "4.1.1"))) {
        const text = c.slice(2).join(" ");
        const type = /YYYY-MM-DD/.test(text) ? "full-date" : /data URL/.test(text) ? "jpeg-data-url"
            : /array of strings/.test(text) ? "array of strings" : /JSON structure/.test(text) ? "object"
            : /^number/.test(c[2]) ? "number" : "string";
        sdjwt[c[1]] = { mandatory: mandatory.has(c[0]), encoding: type };
    }
    write("profiles/eudi.pid/mdoc", { source: PID.source, docType, namespace: docType, elements: mdoc });
    write("profiles/eudi.pid/sd-jwt-vc", { source: PID.source, vct, claims: sdjwt });

    const av = await get(AV.url);
    const avDocType = section(av, "A.4.1").match(/`(eu\.europa\.ec\.av\.\d+)`/)[1];
    const avElements = {};
    for (const c of rows(section(av, "A.4.2"))) {
        avElements[c[0]] = { mandatory: c[2] === "Mandatory", encoding: c[4] };
    }
    // "A Proof of Age Attestation SHALL NOT include any other attribute."
    write("profiles/eudi.av/mdoc", { source: AV.source, docType: avDocType, namespace: avDocType, closed: true, elements: avElements });
})().catch((e) => {
    console.error(e.message);
    process.exit(1);
});
