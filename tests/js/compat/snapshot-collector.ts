// Collecteur de snapshots C0/C1 (gate G7).
// Injecté dans chaque page du catalogue par build/fork/compat-snapshot.js, il sérialise
// une vue STRUCTURELLE du DOM après boot : balises, classes triées, attributs normalisés,
// rôles et états ARIA, texte direct. Aucune mesure en pixels : les valeurs numériques des
// styles en ligne sont neutralisées pour rester stables entre machines.

interface SnapshotOptions {
    volatileText: string[];
}

const SKIPPED_TAGS = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'NOSCRIPT', 'TEMPLATE']);
const GENERATED_ID = /^(?:uk|drk)-\d+$/;
const PREFIX_BEARING = /uk-|drk-|UIkit|Drake|uikit|drake/;

function djb2(value: string): string {
    let hash = 5381;
    for (let index = 0; index < value.length; index++) {
        hash = ((hash << 5) + hash + value.charCodeAt(index)) >>> 0;
    }
    return hash.toString(36);
}

function snapshot(options: SnapshotOptions): string[] {
    const volatileElements = new Set<Element>(
        options.volatileText.length
            ? document.querySelectorAll(options.volatileText.join(', '))
            : [],
    );

    // Les ids générés par le runtime (compteur uk-N/drk-N) dépendent de l'ordre de boot :
    // ils sont remplacés par un jeton séquentiel stable, références ARIA comprises.
    const idMap = new Map<string, string>();
    for (const element of document.querySelectorAll('[id]')) {
        const id = element.getAttribute('id') ?? '';
        if (GENERATED_ID.test(id) && !idMap.has(id)) {
            idMap.set(id, `gen-${idMap.size + 1}`);
        }
    }
    const mapIds = (value: string) =>
        value
            .split(/\s+/)
            .map((token) => idMap.get(token) ?? token)
            .join(' ');

    const lines: string[] = [];
    const walk = (element: Element, depth: number) => {
        if (SKIPPED_TAGS.has(element.tagName)) {
            return;
        }
        const classes = [...element.classList].sort();
        const attributes: string[] = [];
        for (const { name, value } of [...element.attributes].sort((left, right) =>
            left.name < right.name ? -1 : 1,
        )) {
            if (name === 'class') {
                continue;
            }
            // Le style posé par drk-img dépend du chargement asynchrone d'images
            // potentiellement externes : non déterministe hors ligne.
            if (name === 'style' && element.hasAttribute('data-src')) {
                continue;
            }
            let normalized = value;
            // Les horodatages ISO calculés à l'exécution (ex. countdown) sont volatils.
            normalized = normalized.replace(
                /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/g,
                '<volatile-date>',
            );
            // Le compteur d'instances des lecteurs vidéo dépend de l'ordre d'initialisation.
            normalized = normalized.replace(/player_id=\d+/g, 'player_id=<n>');
            if (name === 'style') {
                normalized = normalized
                    .replace(/-?\d+(?:\.\d+)?/g, '#')
                    .replace(/\s+/g, ' ')
                    .trim();
            } else {
                normalized = mapIds(normalized);
            }
            if (normalized.length > 120 && !PREFIX_BEARING.test(normalized)) {
                normalized = `h${djb2(normalized)}:${normalized.length}`;
            }
            attributes.push(`${name}=${normalized}`);
        }

        let text = '';
        if (volatileElements.has(element)) {
            text = '<volatile>';
        } else {
            for (const node of element.childNodes) {
                if (node.nodeType === Node.TEXT_NODE) {
                    text += node.textContent ?? '';
                }
            }
            text = text.replace(/\s+/g, ' ').trim();
            if (text.length > 160 && !PREFIX_BEARING.test(text)) {
                text = `h${djb2(text)}:${text.length}`;
            }
        }

        lines.push(
            JSON.stringify([depth, element.tagName.toLowerCase(), classes, attributes, text]),
        );
        for (const child of element.children) {
            walk(child, depth + 1);
        }
    };
    walk(document.documentElement, 0);
    return lines;
}

// Attente d'un état stable : feuille du framework appliquée, fontes prêtes, layout
// recalculé après un resize forcé (les classes calculées par observation en dépendent).
async function settle(): Promise<boolean> {
    for (let attempt = 0; attempt < 100; attempt++) {
        const family = getComputedStyle(document.body).fontFamily;
        if (family.includes('InterVariable')) {
            break;
        }
        await new Promise((done) => setTimeout(done, 50));
    }
    await document.fonts.ready;
    window.dispatchEvent(new Event('resize'));
    await new Promise((done) => setTimeout(done, 300));
    await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
    return true;
}

Object.defineProperty(window, '__drakeCompat', { value: { settle, snapshot } });
