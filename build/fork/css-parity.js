// Gate G15 (bootstrap) : compare deux feuilles CSS par diff normalisé.
// Usage : node .cache/panda-lab/parity.mjs <référence.css> <candidate.css>
import { readFile } from 'node:fs/promises';
import postcss from 'postcss';

function conflicts(a, b) {
    if (a === b) return true;
    if (a.startsWith('--') || b.startsWith('--')) return false;
    const [s, l] = a.length < b.length ? [a, b] : [b, a];
    return l.startsWith(`${s}-`);
}

const normWs = (s) => s.replace(/\s+/g, ' ').trim();
const normValue = (s) => normWs(s).replace(/'/g, '"');

// Tri canonique : une déclaration peut remonter devant ses voisines non conflictuelles.
function canonicalSort(decls) {
    const out = [];
    for (const d of decls) {
        let i = out.length;
        while (i > 0 && !conflicts(out[i - 1][0], d[0]) && out[i - 1][0] > d[0]) i--;
        out.splice(i, 0, d);
    }
    return out;
}

function flatten(css) {
    const root = postcss.parse(css);
    const entries = [];
    const properties = [];
    walk(root, '');
    return { entries: canonicalizeRuns(entries), properties: properties.sort() };

    function walk(container, context) {
        container.each((node) => {
            if (node.type === 'comment') return;
            if (node.type === 'rule') {
                const sel = node.selectors.map(normWs).join(', ');
                node.each((d) => {
                    if (d.type === 'decl') {
                        entries.push({
                            key: `${context}|${sel}`,
                            prop: d.prop,
                            value: normValue(d.value) + (d.important ? ' !important' : ''),
                        });
                    }
                });
                return;
            }
            if (node.type === 'atrule') {
                const key = `@${node.name} ${normWs(node.params)}`.trim();
                if (node.name === 'property') {
                    properties.push(
                        `${key}{${node.nodes
                            .filter((n) => n.type === 'decl')
                            .map((d) => `${d.prop}:${normValue(d.value)}`)
                            .sort()
                            .join(';')}}`,
                    );
                    return;
                }
                if (!node.nodes) return;
                if (node.nodes.every((n) => n.type === 'decl' || n.type === 'comment')) {
                    node.each((d) => {
                        if (d.type === 'decl') {
                            entries.push({
                                key: `${context}|${key}`,
                                prop: d.prop,
                                value: normValue(d.value),
                            });
                        }
                    });
                    return;
                }
                walk(node, context ? `${context} ${key}` : key);
            }
        });
    }
}

// Regroupe les runs consécutifs de même (contexte|sélecteur) puis applique le tri canonique.
function canonicalizeRuns(entries) {
    const out = [];
    let i = 0;
    while (i < entries.length) {
        let j = i;
        while (j < entries.length && entries[j].key === entries[i].key) j++;
        const run = entries.slice(i, j).map((e) => [e.prop, e.value]);
        for (const [prop, value] of canonicalSort(run)) {
            out.push(`${entries[i].key}|${prop}: ${value}`);
        }
        i = j;
    }
    return out;
}

const [refFile, candFile] = process.argv.slice(2);
const ref = flatten(await readFile(refFile, 'utf8'));
const cand = flatten(await readFile(candFile, 'utf8'));

let status = 0;
if (ref.properties.join('\n') !== cand.properties.join('\n')) {
    status = 1;
    console.log('@property différents :');
    console.log('  ref :', ref.properties.join(' | '));
    console.log('  cand:', cand.properties.join(' | '));
}

const max = Math.max(ref.entries.length, cand.entries.length);
let shown = 0;
for (let i = 0; i < max && shown < 25; i++) {
    if (ref.entries[i] !== cand.entries[i]) {
        status = 1;
        shown++;
        console.log(`#${i}`);
        console.log(`  ref : ${ref.entries[i] ?? '∅'}`);
        console.log(`  cand: ${cand.entries[i] ?? '∅'}`);
    }
}
console.log(
    `${refFile} (${ref.entries.length}) vs ${candFile} (${cand.entries.length}) → ${status === 0 ? 'PARITÉ' : 'DIFFÉRENCES'}`,
);
process.exit(status);
