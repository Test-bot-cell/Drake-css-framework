// Scénarios C2 — grappe drop / dropdown / dropnav (gate G7).
// Chaque scénario s'exécute sur la page historique du catalogue et vérifie le
// comportement contractuel : ouverture souris/clavier, classes d'état (drk-open),
// ARIA (aria-expanded), fermeture (Échap, clic extérieur), destruction sans résidu.
import { registerScenarios } from '../scenario-harness';

interface DrakeElement extends Element {
    __drake__?: Record<string, unknown>;
}

registerScenarios([
    {
        name: 'drop : clic sur le toggle ouvre (drk-open, aria-expanded), re-clic referme',
        page: 'drop.html',
        async run({ $, click, waitFor, expect }) {
            // Instance « Click only » du catalogue : le toggle est l'élément précédent (toggle: '- *').
            const drop = $('[drk-drop="mode: click"]');
            const toggle = drop.previousElementSibling as HTMLElement;
            expect('le toggle précède le drop', toggle instanceof HTMLButtonElement);
            // À l'initialisation le runtime pose drk-drop sur l'élément et aria-expanded=false
            // sur le toggle (connected() de core/drop.ts).
            expect('le drop reçoit la classe drk-drop', drop.classList.contains('drk-drop'));
            expect(
                'aria-expanded=false au repos',
                toggle.getAttribute('aria-expanded') === 'false',
            );
            click(toggle);
            await waitFor('le drop reçoit drk-open', () => drop.classList.contains('drk-open'));
            await waitFor(
                'aria-expanded=true une fois ouvert',
                () => toggle.getAttribute('aria-expanded') === 'true',
            );
            click(toggle);
            await waitFor('re-clic retire drk-open', () => !drop.classList.contains('drk-open'));
            await waitFor(
                'aria-expanded=false une fois refermé',
                () => toggle.getAttribute('aria-expanded') === 'false',
            );
        },
    },
    {
        name: 'drop : Échap referme le drop ouvert',
        page: 'drop.html',
        async run({ $, click, key, waitFor }) {
            const drop = $('[drk-drop="mode: click"]');
            click(drop.previousElementSibling as HTMLElement);
            await waitFor('ouverture au clic', () => drop.classList.contains('drk-open'));
            // listenForEscClose (core/drop.ts) écoute keydown sur document et teste keyCode 27.
            key('Escape');
            await waitFor('Échap referme le drop', () => !drop.classList.contains('drk-open'));
        },
    },
    {
        name: 'drop : un clic extérieur referme le drop',
        page: 'drop.html',
        async run({ $, click, waitFor }) {
            const drop = $('[drk-drop="mode: click"]');
            const toggle = drop.previousElementSibling as HTMLElement;
            click(toggle);
            await waitFor('ouverture au clic', () => drop.classList.contains('drk-open'));
            // listenForBackgroundClose exige un pointerdown puis un pointerup sur la même
            // cible hors du drop et hors du toggle : la séquence de click() du harnais suffit.
            click(document.body);
            await waitFor(
                'le clic extérieur referme le drop',
                () => !drop.classList.contains('drk-open'),
            );
            await waitFor(
                'aria-expanded=false après fermeture',
                () => toggle.getAttribute('aria-expanded') === 'false',
            );
        },
    },
    {
        name: 'drop : le survol ouvre le drop en mode hover, Échap referme',
        page: 'drop.html',
        async run({ $, hover, key, waitFor }) {
            // Instance « Hover only » : le toggle réagit à pointerenter (mixin toggle, mode hover).
            const drop = $('[drk-drop="mode: hover"]');
            const toggle = drop.previousElementSibling as HTMLElement;
            hover(toggle);
            await waitFor('le survol ouvre le drop', () => drop.classList.contains('drk-open'));
            await waitFor(
                'aria-expanded=true après le survol',
                () => toggle.getAttribute('aria-expanded') === 'true',
            );
            // La fermeture au pointerleave passe par delay-hide (800 ms par défaut) : on
            // vérifie ici la fermeture immédiate contractuelle à Échap (hide(false)).
            key('Escape');
            await waitFor('Échap referme le drop', () => !drop.classList.contains('drk-open'));
        },
    },
    {
        name: 'dropdown : clic sur le toggle ouvre, clic extérieur referme',
        page: 'dropdown.html',
        async run({ $, click, waitFor }) {
            // Premier dropdown positionné (« Bottom Left ») ; on exclut le drop scrollable
            // qui partage le même attribut nu drk-drop.
            const dropdown = $('.drk-dropdown[drk-drop=""]:not(.drk-overflow-auto)');
            const toggle = dropdown.previousElementSibling as HTMLElement;
            click(toggle);
            await waitFor(
                'le dropdown reçoit drk-open',
                () => dropdown.classList.contains('drk-open'),
            );
            await waitFor(
                'aria-expanded=true sur le toggle',
                () => toggle.getAttribute('aria-expanded') === 'true',
            );
            click(document.body);
            await waitFor(
                'le clic extérieur referme le dropdown',
                () => !dropdown.classList.contains('drk-open'),
            );
        },
    },
    {
        name: 'dropnav : clic sur un item ouvre le sous-menu, Échap referme et refocalise',
        page: 'dropnav.html',
        async run({ $, click, key, focus, waitFor, expect }) {
            // Deuxième nav du catalogue, en mode click (la première est en mode hover et
            // protégée par preventInitialPointerEnter).
            const nav = $('[drk-dropnav="mode: click; align: center"]');
            const toggle = nav.querySelector('.drk-subnav > li > a') as HTMLElement;
            const submenu = toggle.nextElementSibling as HTMLElement;
            expect(
                'le sous-menu est un drk-dropdown',
                submenu.classList.contains('drk-dropdown'),
            );
            click(toggle);
            await waitFor(
                'le sous-menu reçoit drk-open',
                () => submenu.classList.contains('drk-open'),
            );
            await waitFor(
                'aria-expanded=true sur le lien du nav',
                () => toggle.getAttribute('aria-expanded') === 'true',
            );
            // Échap depuis l'intérieur du sous-menu : le handler keydown de core/dropnav.ts
            // refocalise le toggle (active.targetEl.focus()) avant que l'écouteur document
            // du drop ne referme (hide(false)).
            focus(submenu.querySelector('a') as HTMLElement);
            key('Escape');
            await waitFor(
                'Échap referme le sous-menu',
                () => !submenu.classList.contains('drk-open'),
            );
            await waitFor('le focus revient au toggle', () => document.activeElement === toggle);
        },
    },
    {
        name: 'drop : destruction sans résidu',
        page: 'drop.html',
        async run({ $, drake, expect }) {
            const drop = $('[drk-drop="mode: click"]') as DrakeElement;
            const instance = drake.drop?.(drop) as { $destroy: () => void } | undefined;
            expect('instance obtenue', typeof instance?.$destroy === 'function');
            instance?.$destroy();
            expect('expando nettoyé après $destroy', !drop.__drake__?.drop);
        },
    },
]);
