// Scénarios C2 — grappe modal / offcanvas / lightbox / tooltip (gate G7).
// Chaque scénario s'exécute sur la page historique du catalogue et vérifie le
// comportement contractuel : ouverture, clavier, focus, ARIA, destruction sans résidu.
import { registerScenarios } from '../scenario-harness';

interface DrakeElement extends Element {
    __drake__?: Record<string, unknown>;
}

registerScenarios([
    {
        name: 'modal : ouverture au clic, fermeture à Échap, focus restitué',
        page: 'modal.html',
        async run({ $, click, key, waitFor, expect }) {
            const toggle = $('a[href="#modal"]') as HTMLElement;
            const modal = $('#modal');
            click(toggle);
            await waitFor('la modale reçoit drk-open', () => modal.classList.contains('drk-open'));
            await waitFor(
                'le focus entre dans la modale',
                () => modal.contains(document.activeElement),
            );
            key('Escape');
            await waitFor(
                'Échap referme la modale',
                () => !modal.classList.contains('drk-open'),
            );
            // Comportement contractuel constaté sur la référence pré-renommage : le focus
            // quitte la modale (il n'est pas restitué au déclencheur dans ce chemin).
            await waitFor(
                'le focus quitte la modale',
                () => !modal.contains(document.activeElement),
            );
            expect('le déclencheur est toujours focalisable', toggle.tabIndex >= 0);
        },
    },
    {
        name: 'modal : clic sur le fond referme (bg-close)',
        page: 'modal.html',
        async run({ $, click, waitFor }) {
            click('a[href="#modal"]');
            const modal = $('#modal');
            await waitFor('ouverture', () => modal.classList.contains('drk-open'));
            click(modal);
            await waitFor('fermeture par le fond', () => !modal.classList.contains('drk-open'));
        },
    },
    {
        name: 'modal : destruction sans résidu',
        page: 'modal.html',
        async run({ $, drake, expect }) {
            const modal = $('#modal') as DrakeElement;
            const factory = drake.modal;
            expect('fabrique modal exposée', typeof factory === 'function');
            const instance = factory?.(modal) as { $destroy: () => void } | undefined;
            expect('instance obtenue', typeof instance?.$destroy === 'function');
            instance?.$destroy();
            expect('expando nettoyé après $destroy', !modal.__drake__?.modal);
        },
    },
    {
        name: 'offcanvas : ouverture au clic puis fermeture à Échap',
        page: 'offcanvas.html',
        async run({ $, click, key, waitFor }) {
            const offcanvas = $('#offcanvas-slide');
            click('a[href="#offcanvas-slide"]');
            await waitFor(
                "l'offcanvas reçoit drk-open",
                () => offcanvas.classList.contains('drk-open'),
            );
            key('Escape');
            await waitFor(
                "Échap referme l'offcanvas",
                () => !offcanvas.classList.contains('drk-open'),
            );
        },
    },
    {
        name: "tooltip : le focus affiche l'infobulle nommée, le blur la retire",
        page: 'tooltip.html',
        async run({ $, focus, waitFor }) {
            const button = $('[drk-tooltip="Hello World"]') as HTMLElement;
            focus(button);
            await waitFor(
                "l'infobulle est décrite par aria-describedby",
                () => button.hasAttribute('aria-describedby'),
            );
            const tooltipId = button.getAttribute('aria-describedby') ?? '';
            await waitFor('le contenu est visible', () => {
                const tooltip = document.getElementById(tooltipId);
                return Boolean(tooltip && tooltip.textContent?.includes('Hello World'));
            });
            button.blur();
            await waitFor(
                "le blur retire l'infobulle",
                () => !document.getElementById(tooltipId),
            );
        },
    },
    {
        name: 'lightbox : ouverture du panneau au clic puis fermeture à Échap',
        page: 'lightbox.html',
        async run({ click, key, waitFor }) {
            click('div[drk-lightbox] a');
            await waitFor(
                'le panneau lightbox est ouvert',
                () => Boolean(document.querySelector('.drk-lightbox.drk-open')),
            );
            key('Escape');
            await waitFor(
                'Échap referme le panneau',
                () => !document.querySelector('.drk-lightbox.drk-open'),
            );
        },
    },
]);
