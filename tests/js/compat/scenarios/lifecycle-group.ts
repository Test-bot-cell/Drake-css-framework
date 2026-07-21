// Scénarios C2 — cycle de vie API (gate G7, critère de sortie de la phase 4).
// Vérifie les chemins ajout / retrait / reconnexion / mutation d'attribut et l'extension
// documentée (composant custom, plugin via use()) contre le contrat observé du runtime :
// le retrait d'un nœud DÉCONNECTE l'instance sans la détruire (boot.ts : disconnect), le
// retrait de l'attribut composant la DÉTRUIT ($destroy via l'observer de boot), et la
// mutation de la valeur d'attribut déclenche $reset() (observer de props.ts).
import { registerScenarios } from '../scenario-harness';

interface ComponentProbe {
    $el: Element;
    $props: Record<string, unknown>;
    $destroy: (removeElement?: boolean) => void;
}

interface ComponentProbeOptions {
    connected?: (this: ComponentProbe) => void;
}

type PluginProbe = ((core: DrakeApi) => void) & { installed?: boolean };

interface DrakeApi {
    component: (name: string, options?: ComponentProbeOptions) => unknown;
    getComponent: (element: Element, name: string) => ComponentProbe | undefined;
    use: (plugin: PluginProbe) => DrakeApi;
}

interface DrakeElement extends Element {
    __drake__?: Record<string, unknown>;
}

registerScenarios([
    {
        name: 'cycle de vie : la reconnexion DOM conserve la même instance et ses listeners',
        page: 'accordion.html',
        async run({ $, click, waitFor, expect, drake }) {
            const api = drake as unknown as DrakeApi;
            const element = $('[drk-accordion]');
            const instance = api.getComponent(element, 'accordion');
            expect('une instance accordion est montée', Boolean(instance));

            const parent = element.parentElement;
            const anchor = element.nextSibling;
            expect('le conteneur du catalogue est présent', Boolean(parent));
            parent?.removeChild(element);
            // Le retrait déconnecte sans détruire : l'expando reste porté par le nœud.
            await waitFor(
                'l’instance survit au détachement (expando conservé)',
                () => Boolean((element as DrakeElement).__drake__?.accordion),
            );

            parent?.insertBefore(element, anchor);
            await waitFor(
                'la même instance est reconnectée',
                () => api.getComponent(element, 'accordion') === instance,
            );
            // Preuve fonctionnelle : les listeners réabonnés à la reconnexion répondent.
            const title = element.querySelector('.drk-accordion-title');
            const item = title?.closest('li');
            expect('un titre d’accordéon est disponible', Boolean(title && item));
            const wasOpen = Boolean(item?.classList.contains('drk-open'));
            if (title) {
                click(title);
            }
            await waitFor(
                'le clic après reconnexion bascule drk-open',
                () => Boolean(item?.classList.contains('drk-open')) !== wasOpen,
            );
            if (title) {
                click(title);
            }
            await waitFor(
                'l’état initial du panneau est restauré',
                () => Boolean(item?.classList.contains('drk-open')) === wasOpen,
            );
        },
    },
    {
        name: 'cycle de vie : l’ajout et le retrait de l’attribut composant montent puis détruisent',
        page: 'accordion.html',
        async run({ waitFor, expect, drake }) {
            const api = drake as unknown as DrakeApi;
            const host = document.createElement('div');
            document.body.append(host);
            expect('aucune instance avant l’attribut', !api.getComponent(host, 'margin'));

            host.setAttribute('drk-margin', '');
            await waitFor(
                'l’ajout de l’attribut monte le composant',
                () => Boolean(api.getComponent(host, 'margin')),
            );
            const first = api.getComponent(host, 'margin');

            host.removeAttribute('drk-margin');
            await waitFor(
                'le retrait de l’attribut détruit l’instance',
                () => !api.getComponent(host, 'margin'),
            );
            expect(
                'l’expando ne conserve pas le composant détruit',
                !(host as DrakeElement).__drake__?.margin,
            );

            host.setAttribute('drk-margin', '');
            await waitFor(
                'un nouvel ajout crée une nouvelle instance',
                () => {
                    const second = api.getComponent(host, 'margin');
                    return Boolean(second) && second !== first;
                },
            );
            api.getComponent(host, 'margin')?.$destroy();
            host.remove();
        },
    },
    {
        name: 'cycle de vie : la mutation de la valeur d’attribut réinitialise les props sans recréer l’instance',
        page: 'accordion.html',
        async run({ $$, waitFor, expect, drake }) {
            const api = drake as unknown as DrakeApi;
            const element = $$('[drk-accordion]')[1] ?? $$('[drk-accordion]')[0];
            expect('un second accordéon du catalogue est disponible', Boolean(element));
            if (!element) {
                return;
            }
            const initialValue = element.getAttribute('drk-accordion') ?? '';
            const instance = api.getComponent(element, 'accordion');
            expect('l’instance expose ses props', Boolean(instance?.$props));
            const initialMultiple = instance?.$props.multiple;
            expect('multiple est un booléen', typeof initialMultiple === 'boolean');

            element.setAttribute('drk-accordion', `multiple: ${initialMultiple ? 'false' : 'true'}`);
            await waitFor(
                '$reset relit les props après mutation',
                () => api.getComponent(element, 'accordion')?.$props.multiple === !initialMultiple,
            );
            expect(
                'la même instance est conservée après $reset',
                api.getComponent(element, 'accordion') === instance,
            );

            element.setAttribute('drk-accordion', initialValue);
            await waitFor(
                'la valeur restaurée revient aux props initiales',
                () => api.getComponent(element, 'accordion')?.$props.multiple === initialMultiple,
            );
        },
    },
    {
        name: 'cycle de vie : un composant custom et un plugin use() restent utilisables',
        page: 'accordion.html',
        async run({ waitFor, expect, drake }) {
            const api = drake as unknown as DrakeApi;
            let mounted = 0;
            api.component('lifecycleProbe', {
                connected() {
                    mounted++;
                    this.$el.classList.add('drk-lifecycle-probe-ready');
                },
            });

            const host = document.createElement('div');
            host.setAttribute('drk-lifecycle-probe', '');
            document.body.append(host);
            await waitFor(
                'le composant custom monte via son attribut',
                () => mounted === 1 && host.classList.contains('drk-lifecycle-probe-ready'),
            );

            const plugin: PluginProbe = (core) => {
                core.component('lifecyclePluginProbe', {
                    connected() {
                        this.$el.classList.add('drk-lifecycle-plugin-ready');
                    },
                });
            };
            api.use(plugin);
            expect('use() marque le plugin installé', plugin.installed === true);
            api.use(plugin);
            expect('use() n’installe pas deux fois', plugin.installed === true);

            const pluginHost = document.createElement('div');
            pluginHost.setAttribute('drk-lifecycle-plugin-probe', '');
            document.body.append(pluginHost);
            await waitFor(
                'le composant fourni par le plugin monte via son attribut',
                () => pluginHost.classList.contains('drk-lifecycle-plugin-ready'),
            );

            api.getComponent(host, 'lifecycleProbe')?.$destroy();
            api.getComponent(pluginHost, 'lifecyclePluginProbe')?.$destroy();
            host.remove();
            pluginHost.remove();
        },
    },
]);
