// Scénarios C2 — grappe slider / slideshow (gate G7).
// Chaque scénario s'exécute sur la page historique du catalogue et vérifie le
// comportement contractuel : navigation slidenav (souris), clavier délégué à la
// dotnav (slider-nav : LEFT/RIGHT/HOME/END sur les items numériques uniquement,
// pas de gestion globale des flèches sur la racine ni sur document), classes
// d'état (drk-active, drk-transition-active), ARIA (region/carousel, tablist,
// tabs à roving tabindex, tabpanels) et destruction sans résidu.
import { registerScenarios } from '../scenario-harness';

interface DrakeElement extends Element {
    __drake__?: Record<string, unknown>;
}

// Sélection scopée : les pages du catalogue contiennent plusieurs instances du
// même composant, on résout donc toujours à l'intérieur de la racine ciblée.
function q(scope: Element, selector: string): HTMLElement {
    const element = scope.querySelector<HTMLElement>(selector);
    if (!element) {
        throw new Error(`élément introuvable dans la racine: ${selector}`);
    }
    return element;
}

registerScenarios([
    {
        name: 'slider : la flèche next avance la slide active, la dotnav se synchronise',
        page: 'slider.html',
        async run({ $, click, waitFor, expect }) {
            const root = $('div[drk-slider]');
            const dot = (index: number) =>
                root.querySelector(`.drk-slider-nav > li[drk-slider-item="${index}"]`);
            const slides = () => [...root.querySelectorAll('.drk-slider-items > div')];

            // La dotnav vide du catalogue est peuplée par padNavitems : un point par slide.
            await waitFor(
                'la dotnav est générée (12 points pour 12 slides)',
                () =>
                    root.querySelectorAll('.drk-slider-nav > li[drk-slider-item]').length === 12,
            );
            await waitFor(
                'le point 0 est actif au chargement',
                () => dot(0)?.classList.contains('drk-active') === true,
            );
            await waitFor(
                'la slide 0 porte drk-active au chargement',
                () => slides()[0]?.classList.contains('drk-active') === true,
            );

            click(q(root, 'a[drk-slider-item="next"]'));
            await waitFor(
                'le point 1 reçoit drk-active',
                () => dot(1)?.classList.contains('drk-active') === true,
            );
            expect(
                'le point 0 a perdu drk-active',
                dot(0)?.classList.contains('drk-active') === false,
            );
            // Contrat observé (option `active: all` par défaut) : toutes les slides
            // visibles portent drk-active — on n'affirme donc pas la perte de la
            // classe sur la slide 0, encore partiellement visible.
            await waitFor(
                'la slide 1 porte drk-active',
                () => slides()[1]?.classList.contains('drk-active') === true,
            );

            click(q(root, 'a[drk-slider-item="previous"]'));
            await waitFor(
                'previous ramène le point 0',
                () => dot(0)?.classList.contains('drk-active') === true,
            );
        },
    },
    {
        name: 'slider : contrat ARIA du carrousel (region, tablist, tabs, tabpanels)',
        page: 'slider.html',
        async run({ $, waitFor, expect }) {
            const root = $('div[drk-slider]');
            await waitFor(
                'la dotnav est générée',
                () =>
                    root.querySelectorAll('.drk-slider-nav > li[drk-slider-item]').length === 12,
            );

            expect('la racine est role=region', root.getAttribute('role') === 'region');
            expect(
                'la racine est décrite comme carousel',
                root.getAttribute('aria-roledescription') === 'carousel',
            );

            const nav = q(root, '.drk-slider-nav');
            expect('la dotnav est role=tablist', nav.getAttribute('role') === 'tablist');

            const dots = [...nav.children];
            expect(
                'chaque point est role=presentation',
                dots.every((item) => item.getAttribute('role') === 'presentation'),
            );

            const links = dots.map((item) => q(item, 'a'));
            expect(
                'chaque lien de point est role=tab',
                links.every((link) => link.getAttribute('role') === 'tab'),
            );

            const slides = [...root.querySelectorAll('.drk-slider-items > div')];
            expect(
                'les slides sont des tabpanels (nav présente)',
                slides.every((slide) => slide.getAttribute('role') === 'tabpanel'),
            );
            // i18n slideLabel: '%s of %s'.
            expect(
                'la slide 0 est étiquetée "1 of 12"',
                slides[0]?.getAttribute('aria-label') === '1 of 12',
            );
            // aria-controls relie chaque tab à l'id (généré) de sa slide.
            expect(
                'le tab 0 contrôle la slide 0 (aria-controls sur id généré)',
                Boolean(slides[0]?.id) &&
                    links[0]?.getAttribute('aria-controls') === slides[0]?.id,
            );

            await waitFor(
                'le tab actif est aria-selected=true',
                () => links[0]?.getAttribute('aria-selected') === 'true',
            );
            expect(
                'les tabs inactifs sont aria-selected=false',
                links.slice(1).every((link) => link.getAttribute('aria-selected') === 'false'),
            );
            expect(
                'roving tabindex : seul le tab actif est focalisable',
                links[0]?.tabIndex === 0 && links.slice(1).every((link) => link.tabIndex === -1),
            );
        },
    },
    {
        name: 'slider : clavier sur la dotnav (flèches, Home) et roving focus',
        page: 'slider.html',
        async run({ $, focus, key, waitFor }) {
            const root = $('div[drk-slider]');
            const dot = (index: number) =>
                root.querySelector(`.drk-slider-nav > li[drk-slider-item="${index}"]`);
            const link = (index: number) =>
                q(root, `.drk-slider-nav > li[drk-slider-item="${index}"] a`);
            await waitFor(
                'la dotnav est générée',
                () =>
                    root.querySelectorAll('.drk-slider-nav > li[drk-slider-item]').length === 12,
            );

            // Le clavier du runtime (slider-nav) est délégué aux items numériques de
            // la nav : on dispatch donc les touches sur les liens de la dotnav.
            focus(link(0));
            key('ArrowRight', link(0));
            await waitFor(
                'ArrowRight avance au point 1',
                () => dot(1)?.classList.contains('drk-active') === true,
            );
            // updateNav déplace le focus sur le tab actif quand la nav a le focus.
            await waitFor('le focus suit le tab actif', () => document.activeElement === link(1));

            key('ArrowLeft', link(1));
            await waitFor(
                'ArrowLeft revient au point 0',
                () => dot(0)?.classList.contains('drk-active') === true,
            );

            key('ArrowRight', link(0));
            await waitFor(
                'ArrowRight avance à nouveau au point 1',
                () => dot(1)?.classList.contains('drk-active') === true,
            );
            key('Home', link(1));
            await waitFor(
                'Home revient au point 0',
                () => dot(0)?.classList.contains('drk-active') === true,
            );
            // End (→ 'last') est géré aussi, mais le composant slider décompose les
            // sauts multiples en étapes 'next' empilées : la durée croît avec le
            // nombre de slides (12 ici) — non chronométré pour rester déterministe.
        },
    },
    {
        name: 'slider : destruction sans résidu',
        page: 'slider.html',
        async run({ $, drake, waitFor, expect }) {
            const root = $('div[drk-slider]') as DrakeElement;
            // Attendre l'initialisation complète avant de détruire.
            await waitFor(
                'le slider est initialisé (dotnav générée)',
                () =>
                    root.querySelectorAll('.drk-slider-nav > li[drk-slider-item]').length === 12,
            );
            await waitFor(
                'au moins une slide active avant destruction',
                () => root.querySelector('.drk-slider-items > .drk-active') !== null,
            );

            const instance = drake.slider?.(root) as { $destroy: () => void } | undefined;
            expect('instance obtenue', typeof instance?.$destroy === 'function');
            instance?.$destroy();
            expect('expando nettoyé après $destroy', !root.__drake__?.slider);
            // disconnected() (mixin slider) retire drk-active des slides.
            expect(
                'plus aucune slide ne porte drk-active',
                root.querySelectorAll('.drk-slider-items > .drk-active').length === 0,
            );
        },
    },
    {
        name: 'slideshow : slidenav next/previous — une seule slide active',
        page: 'slideshow.html',
        async run({ $, click, waitFor, expect }) {
            // La vitrine « animation: push » n'a pas d'autoplay et des images locales.
            const root = $('div[drk-slideshow="animation: push"]');
            const slides = () => [...root.querySelectorAll('.drk-slideshow-items > div')];

            await waitFor(
                'la slide 0 est active au chargement',
                () => slides()[0]?.classList.contains('drk-active') === true,
            );

            click(q(root, 'a[drk-slideshow-item="next"]'));
            await waitFor(
                'next active la slide 1',
                () => slides()[1]?.classList.contains('drk-active') === true,
            );
            await waitFor(
                'la slide 0 est désactivée (itemhidden)',
                () => slides()[0]?.classList.contains('drk-active') === false,
            );
            // clsActivated du slideshow : drk-transition-active, posé à itemshown.
            await waitFor(
                'la slide 1 reçoit drk-transition-active',
                () => slides()[1]?.classList.contains('drk-transition-active') === true,
            );
            expect(
                'une seule slide active à la fois',
                slides().filter((slide) => slide.classList.contains('drk-active')).length === 1,
            );

            click(q(root, 'a[drk-slideshow-item="previous"]'));
            await waitFor(
                'previous réactive la slide 0',
                () => slides()[0]?.classList.contains('drk-active') === true,
            );
        },
    },
    {
        name: 'slideshow : la dotnav générée pilote la slide ciblée (ARIA synchronisée)',
        page: 'slideshow.html',
        async run({ $, click, waitFor, expect }) {
            const root = $('div[drk-slideshow="animation: push"]');
            const nav = q(root, '.drk-slideshow-nav');
            const slides = () => [...root.querySelectorAll('.drk-slideshow-items > div')];
            const link = (index: number) => q(nav, `li[drk-slideshow-item="${index}"] a`);

            await waitFor(
                'la dotnav est générée (4 points pour 4 slides)',
                () => nav.querySelectorAll('li[drk-slideshow-item]').length === 4,
            );
            expect(
                'la racine slideshow est region/carousel',
                root.getAttribute('role') === 'region' &&
                    root.getAttribute('aria-roledescription') === 'carousel',
            );
            await waitFor(
                'le tab 0 est aria-selected au chargement',
                () => link(0).getAttribute('aria-selected') === 'true',
            );

            // Saut direct 0 → 2 : le slideshow fait une transition unique (pas de
            // décomposition par étapes comme le composant slider).
            click(link(2));
            await waitFor(
                'le clic sur le point 2 active la slide 2',
                () => slides()[2]?.classList.contains('drk-active') === true,
            );
            await waitFor(
                'le tab 2 devient aria-selected',
                () => link(2).getAttribute('aria-selected') === 'true',
            );
            expect(
                "le tab 0 n'est plus sélectionné",
                link(0).getAttribute('aria-selected') === 'false',
            );
            expect(
                'le point 2 porte drk-active',
                nav
                    .querySelector('li[drk-slideshow-item="2"]')
                    ?.classList.contains('drk-active') === true,
            );
        },
    },
    {
        name: 'slideshow : destruction sans résidu',
        page: 'slideshow.html',
        async run({ $, drake, waitFor, expect }) {
            const root = $('div[drk-slideshow="animation: push"]') as DrakeElement;
            await waitFor(
                'la slide 0 est active avant destruction',
                () => root.querySelector('.drk-slideshow-items > .drk-active') !== null,
            );

            const instance = drake.slideshow?.(root) as { $destroy: () => void } | undefined;
            expect('instance obtenue', typeof instance?.$destroy === 'function');
            instance?.$destroy();
            expect('expando nettoyé après $destroy', !root.__drake__?.slideshow);
            // disconnected() (mixin slider) retire drk-active des slides.
            expect(
                'plus aucune slide ne porte drk-active',
                root.querySelectorAll('.drk-slideshow-items > .drk-active').length === 0,
            );
        },
    },
]);
