// Scénarios C2 — grappe sticky / sortable / upload (gate G7).
// Chaque scénario s'exécute sur la page historique du catalogue et vérifie le
// comportement contractuel : activation au défilement (classes d'état, événements
// active/inactive), montage des composants (classes de conteneur, styles des poignées),
// classe drk-dragover de la zone d'upload, et destruction sans résidu (__drake__ nettoyé).
import { registerScenarios } from '../scenario-harness';

interface DrakeElement extends Element {
    __drake__?: Record<string, unknown>;
}

// Événement pointeur synthétique avec coordonnées : le runtime lit clientX/clientY via
// getEventPos (util/event.ts) et exige cancelable pour e.preventDefault() (sortable init).
function pointerAt(target: Element | Document, type: string, x: number, y: number): void {
    target.dispatchEvent(
        new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, view: window }),
    );
}

// Événement de drag de fichier synthétique : les handlers dragover/dragleave de
// components/upload.ts ne lisent pas dataTransfer, un Event annulable suffit.
function dragAt(target: Element, type: string): void {
    target.dispatchEvent(new Event(type, { bubbles: true, cancelable: true }));
}

registerScenarios([
    {
        name: 'sticky : le défilement active la carte (drk-active, drk-sticky-fixed), le retour la désactive',
        page: 'sticky.html',
        async run({ $, waitFor, expect }) {
            // Carte « start: 200; end: 500 » : bornes numériques indépendantes du contenu.
            const card = $('[drk-sticky="start: 200; end: 500"]') as HTMLElement;
            // Le mixin Class pose l'identifiant du composant au montage (mixin/class.ts).
            expect('classe drk-sticky posée au montage', card.classList.contains('drk-sticky'));
            expect('pas de drk-active au repos', !card.classList.contains('drk-active'));
            // connected() crée le placeholder ; la première passe write l'insère après
            // l'élément, caché (core/sticky.ts).
            await waitFor('un placeholder caché suit la carte', () => {
                const sibling = card.nextElementSibling;
                return (
                    sibling instanceof HTMLElement &&
                    sibling.classList.contains('drk-sticky-placeholder') &&
                    sibling.hidden
                );
            });

            // setActive déclenche les événements personnalisés active/inactive (trigger).
            let activeFired = false;
            let inactiveFired = false;
            card.addEventListener('active', () => (activeFired = true));
            card.addEventListener('inactive', () => (inactiveFired = true));

            // start = offset documentaire de la carte + 200 (parseProp numérique) : on
            // défile 50 px au-delà, avant end (= offset + 500 environ).
            const documentTop = card.getBoundingClientRect().top + window.scrollY;
            window.scrollTo(0, Math.round(documentTop) + 250);
            await waitFor('drk-active apparaît au défilement', () =>
                card.classList.contains('drk-active'));
            await waitFor('drk-sticky-fixed apparaît', () =>
                card.classList.contains('drk-sticky-fixed'));
            // Bornes numériques ≠ mode sticky natif : update() force position fixed.
            await waitFor('la carte passe en position fixed', () =>
                getComputedStyle(card).position === 'fixed');
            // En mode fixed (non sticky natif), le placeholder reste le frère SUIVANT :
            // la passe write ne le réinsère avant l'élément qu'en mode sticky natif ;
            // show() se contente de le dévoiler (hidden = false).
            await waitFor('le placeholder devient visible', () => {
                const sibling = card.nextElementSibling;
                return (
                    sibling instanceof HTMLElement &&
                    sibling.classList.contains('drk-sticky-placeholder') &&
                    !sibling.hidden
                );
            });
            expect("l'événement active a été émis", activeFired);

            window.scrollTo(0, 0);
            await waitFor('le retour en haut retire drk-active', () =>
                !card.classList.contains('drk-active'));
            await waitFor('drk-sticky-fixed est retirée', () =>
                !card.classList.contains('drk-sticky-fixed'));
            await waitFor('le placeholder est recaché', () => {
                const sibling = card.nextElementSibling;
                return sibling instanceof HTMLElement && sibling.hidden;
            });
            expect("l'événement inactive a été émis", inactiveFired);
        },
    },
    {
        name: 'sticky : destruction sans résidu (expando et placeholder nettoyés)',
        page: 'sticky.html',
        async run({ $, drake, waitFor, expect }) {
            const card = $('[drk-sticky="start: 200; end: 500"]') as DrakeElement;
            await waitFor('le placeholder est inséré avant destruction', () =>
                Boolean(card.nextElementSibling?.classList.contains('drk-sticky-placeholder')));
            const factory = drake.sticky;
            expect('fabrique sticky exposée', typeof factory === 'function');
            // Sans données, la fabrique renvoie l'instance déjà montée (api/component.ts).
            const instance = factory?.(card) as { $destroy: () => void } | undefined;
            expect('instance obtenue', typeof instance?.$destroy === 'function');
            instance?.$destroy();
            expect('expando nettoyé après $destroy', !card.__drake__?.sticky);
            // beforeDisconnect retire le placeholder du DOM (remove(this.placeholder)).
            expect(
                'le placeholder est retiré du DOM',
                !card.nextElementSibling?.classList.contains('drk-sticky-placeholder'),
            );
            // Le mixin Class retire la classe qu'il avait posée (disconnected()).
            expect('la classe drk-sticky est retirée', !card.classList.contains('drk-sticky'));
        },
    },
    {
        name: 'sortable : montage contractuel (instance, classes de conteneur, poignées stylées)',
        page: 'sortable.html',
        async run({ $, $$, drake, waitFor, expect }) {
            const list = $('[drk-sortable="group: test"]') as DrakeElement;
            // Le mixin Class pose la classe de base drk-sortable au montage.
            expect('classe drk-sortable posée au montage', list.classList.contains('drk-sortable'));
            expect('instance présente sur __drake__', Boolean(list.__drake__?.sortable));
            const instance = drake.sortable?.(list) as { $destroy: () => void } | undefined;
            expect('la fabrique renvoie une instance', typeof instance?.$destroy === 'function');
            // Le watcher handles (immediate) applique touch-action/user-select aux items.
            const firstItem = list.firstElementChild as HTMLElement;
            await waitFor('les poignées reçoivent touch-action: none', () =>
                firstItem.style.touchAction === 'none');
            expect('les poignées reçoivent user-select: none', firstItem.style.userSelect === 'none');
            // Le watcher isEmpty (immediate) marque la liste vide de la colonne « Empty ».
            const empty = $$('[drk-sortable="group: test"]').find(
                (candidate) => !candidate.childElementCount,
            );
            expect('une liste vide existe dans le catalogue', Boolean(empty));
            await waitFor('la liste vide reçoit drk-sortable-empty', () =>
                Boolean(empty?.classList.contains('drk-sortable-empty')));
        },
    },
    {
        name: "sortable : l'amorce de drag pose les classes d'état, le relâchement les retire",
        page: 'sortable.html',
        async run({ $, wait, waitFor, expect }) {
            // Limite assumée : on vérifie l'amorce du drag (pointerdown + pointermove
            // au-delà du threshold de 5 px) et le nettoyage au pointerup — pas le
            // réordonnancement complet par glisser-déposer.
            const list = $('[drk-sortable="group: test"]') as HTMLElement;
            list.scrollIntoView({ block: 'center' });
            await wait(100);
            const card = list.querySelector('.drk-card') as HTMLElement;
            const item = card.closest('.drk-margin') as HTMLElement;
            const rect = card.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            let startFired = false;
            let stopFired = false;
            list.addEventListener('start', () => (startFired = true));
            list.addEventListener('stop', () => (stopFired = true));

            // init() écoute pointerdown sur la liste ; move() écoute pointermove sur document.
            pointerAt(card, 'pointerdown', x, y);
            pointerAt(document, 'pointermove', x + 40, y);
            await waitFor('un fantôme drk-sortable-drag est créé', () =>
                Boolean(document.querySelector('.drk-sortable-drag')));
            await waitFor("l'item saisi reçoit drk-sortable-placeholder", () =>
                item.classList.contains('drk-sortable-placeholder'));
            expect(
                'les items reçoivent drk-sortable-item',
                item.classList.contains('drk-sortable-item'),
            );
            expect(
                'la racine html reçoit drk-drag',
                document.documentElement.classList.contains('drk-drag'),
            );
            expect("l'événement start a été émis", startFired);

            pointerAt(document, 'pointerup', x + 40, y);
            await waitFor('le fantôme est retiré au relâchement', () =>
                !document.querySelector('.drk-sortable-drag'));
            await waitFor('drk-sortable-placeholder est retirée', () =>
                !item.classList.contains('drk-sortable-placeholder'));
            await waitFor('drk-drag est retirée de la racine', () =>
                !document.documentElement.classList.contains('drk-drag'));
            expect("l'événement stop a été émis", stopFired);
        },
    },
    {
        name: 'sortable : destruction sans résidu',
        page: 'sortable.html',
        async run({ $, drake, expect }) {
            const list = $('[drk-sortable="group: test"]') as DrakeElement;
            const instance = drake.sortable?.(list) as { $destroy: () => void } | undefined;
            expect('instance obtenue', typeof instance?.$destroy === 'function');
            instance?.$destroy();
            expect('expando nettoyé après $destroy', !list.__drake__?.sortable);
            expect('la classe drk-sortable est retirée', !list.classList.contains('drk-sortable'));
        },
    },
    {
        name: 'upload : la zone montée reçoit drk-dragover au dragover, dragleave la retire',
        page: 'upload.html',
        async run({ $, waitFor, expect }) {
            // La zone de dépôt est montée par la page via drake.upload('.js-upload', …)
            // (tests/js/fixture-actions.ts).
            const zone = $('.js-upload.drk-placeholder') as DrakeElement;
            await waitFor('le composant upload est monté sur la zone', () =>
                Boolean(zone.__drake__?.upload));
            // Comportement constaté dans components/upload.ts : seul dragover pose la
            // classe ; dragenter se contente d'annuler l'événement (pas de classe).
            dragAt(zone, 'dragenter');
            expect(
                'dragenter seul ne pose pas la classe',
                !zone.classList.contains('drk-dragover'),
            );
            dragAt(zone, 'dragover');
            await waitFor('dragover pose drk-dragover', () =>
                zone.classList.contains('drk-dragover'));
            dragAt(zone, 'dragleave');
            await waitFor('dragleave retire drk-dragover', () =>
                !zone.classList.contains('drk-dragover'));
        },
    },
    {
        name: 'upload : destruction sans résidu',
        page: 'upload.html',
        async run({ $, drake, waitFor, expect }) {
            const zone = $('.js-upload.drk-placeholder') as DrakeElement;
            await waitFor('le composant upload est monté sur la zone', () =>
                Boolean(zone.__drake__?.upload));
            // Sans données, la fabrique renvoie l'instance déjà montée par la page.
            const instance = drake.upload?.(zone) as { $destroy: () => void } | undefined;
            expect('instance obtenue', typeof instance?.$destroy === 'function');
            instance?.$destroy();
            expect('expando nettoyé après $destroy', !zone.__drake__?.upload);
            // Une fois détruit, le drag ne pose plus la classe (écouteurs désinscrits).
            dragAt(zone, 'dragover');
            expect(
                'plus de drk-dragover après destruction',
                !zone.classList.contains('drk-dragover'),
            );
        },
    },
]);
