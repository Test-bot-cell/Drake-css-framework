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
// Classe posée au runtime par le scrollspy quand un élément franchit le viewport : le jeu
// exact dépend de l'IntersectionObserver aux frontières de pixel (non déterministe run à
// run), et n'appartient pas au contrat structurel C0/C1. Neutralisée comme les ids générés.
const VOLATILE_RUNTIME_CLASSES = new Set(['drk-scrollspy-inview']);
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
        const classes = [...element.classList]
            .filter((token) => !VOLATILE_RUNTIME_CLASSES.has(token))
            .sort();
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
                    // L'opacité en ligne est l'état de révélation du scrollspy (opacity:0
                    // sur les éléments hors viewport) : présentationnel, piloté au runtime
                    // selon la frontière viewport, jamais structurel — retiré des deux côtés.
                    .replace(/opacity\s*:\s*[^;]+;?/g, '')
                    .replace(/-?\d+(?:\.\d+)?/g, '#')
                    .replace(/\s+/g, ' ')
                    .replace(/^\s*;\s*|\s*;\s*$/g, '')
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
    // Les composants pilotés par le défilement (scrollspy) révèlent leurs éléments —
    // classes d'animation et « inview » — au fur et à mesure qu'ils franchissent le
    // viewport, via IntersectionObserver. Capturé à une position donnée, l'ensemble
    // révélé dépend du défilement et des frontières de pixel : non déterministe. On
    // balaie la page jusqu'en bas pour tout révéler une fois (repeat=false → l'état
    // reste acquis), puis on revient en tête : l'état capturé est « tout révélé »,
    // identique à chaque exécution.
    const sweepHeight = document.documentElement.scrollHeight;
    for (let y = 0; y <= sweepHeight; y += 300) {
        window.scrollTo(0, y);
        await new Promise((done) => requestAnimationFrame(() => done(undefined)));
    }
    window.scrollTo(0, 0);
    window.dispatchEvent(new Event('resize'));
    await new Promise((done) => setTimeout(done, 300));
    // Les démos parallax « stroke » posent stroke-dasharray sur un cycle d'update
    // déclenché par resize/scroll, et seulement quand l'hôte est visible (le composant
    // écoute les deux événements). Un seul déclencheur en amont peut manquer la fenêtre
    // sur un environnement chargé (balayage complet), d'où une divergence intermittente
    // sur la seule présence du style (la valeur est déjà normalisée en trace). On
    // re-déclenche à chaque itération jusqu'à la pose, sans masquer : au-delà du délai la
    // capture continue et la divergence reste visible.
    const strokeHosts = [...document.querySelectorAll('[drk-parallax*="stroke:"]')];
    const strokePosed = () =>
        strokeHosts.every((host) =>
            (host.getAttribute('style') ?? '').includes('stroke-dasharray'),
        );
    for (let attempt = 0; attempt < 100 && !strokePosed(); attempt++) {
        window.dispatchEvent(new Event('scroll'));
        window.dispatchEvent(new Event('resize'));
        await new Promise((done) => setTimeout(done, 50));
    }
    // Convergence générale avant capture : d'autres composants basculent des classes ou
    // des styles de façon asynchrone après la mise en page, sur des délais qu'aucun
    // événement ne force (scrollspy « inview » via IntersectionObserver puis chaîne de
    // promesses). On observe les mutations d'attributs et on ne capture qu'après une
    // fenêtre sans mutation (le DOM est stable). Le plafond borne l'attente pour ne
    // jamais bloquer : il reste très inférieur à l'intervalle d'autoplay des démos
    // (7 s), donc l'état capturé demeure l'état initial déterministe.
    await waitForQuietDom(250, 3000);
    await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
    return true;
}

// Résout après `quietMs` sans mutation de class/style, ou au plus tard après `maxMs`.
async function waitForQuietDom(quietMs: number, maxMs: number): Promise<void> {
    await new Promise<void>((resolve) => {
        let quietTimer = 0;
        const finish = () => {
            clearTimeout(quietTimer);
            clearTimeout(hardCap);
            observer.disconnect();
            resolve();
        };
        const observer = new MutationObserver(() => {
            clearTimeout(quietTimer);
            quietTimer = window.setTimeout(finish, quietMs);
        });
        const hardCap = window.setTimeout(finish, maxMs);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class', 'style'],
            subtree: true,
        });
        quietTimer = window.setTimeout(finish, quietMs);
    });
}

Object.defineProperty(window, '__drakeCompat', { value: { settle, snapshot } });
