// Boucle C3 (gate G7) : chaque composant du registre public est instancié
// programmatiquement puis détruit ; le montage et l'absence de résidu sont vérifiés.

interface ApiSmokeResult {
    passed: string[];
    failed: { name: string; error: string }[];
    skipped: { name: string; reason: string }[];
}

// Membres statiques de l'API globale : tout le reste est une fabrique de composant.
const STATIC_MEMBERS = new Set([
    'component',
    'container',
    'data',
    'extend',
    'getComponent',
    'getComponents',
    'mixin',
    'update',
    'use',
    'util',
    'version',
]);

// Composants dont l'instanciation exige des options ou un balisage minimal.
const COMPONENT_SETUP: Record<string, { options?: Record<string, unknown>; html?: string; reason?: string }> = {
    countdown: { options: { date: new Date(Date.now() + 86_400_000).toISOString() } },
    filter: { html: '<div drk-ignore><ul></ul></div>' },
    notification: {
        reason: 'composant fonctionnel sans élément hôte : couvert par le scénario dédié',
    },
    slider: { html: '<div class="drk-slider-container"><ul class="drk-slider-items"><li></li><li></li></ul></div>' },
    slideshow: { html: '<ul class="drk-slideshow-items"><li></li><li></li></ul>' },
    switcher: { html: '<ul><li><a href="#"></a></li></ul>' },
    tab: { html: '<ul><li><a href="#"></a></li></ul>' },
    upload: { reason: 'exige un formulaire et des interactions fichier : couvert en scénario' },
};

async function runApiSmoke(): Promise<ApiSmokeResult> {
    const globalApi = (window as unknown as Record<string, unknown>).Drake as Record<
        string,
        unknown
    > & { util: { on: unknown } };
    const result: ApiSmokeResult = { failed: [], passed: [], skipped: [] };
    const names = Object.keys(globalApi)
        .filter((name) => typeof globalApi[name] === 'function' && !STATIC_MEMBERS.has(name))
        .sort();

    const sandbox = document.createElement('div');
    document.body.appendChild(sandbox);

    for (const name of names) {
        const setup = COMPONENT_SETUP[name] ?? {};
        if (setup.reason) {
            result.skipped.push({ name, reason: setup.reason });
            continue;
        }
        const host = document.createElement('div');
        if (setup.html) {
            host.innerHTML = setup.html;
        }
        sandbox.appendChild(host);
        try {
            const factory = globalApi[name] as (
                element: Element,
                options?: Record<string, unknown>,
            ) => { $el?: Element; $destroy: () => void };
            const instance = factory(host, setup.options ?? {});
            if (!instance || typeof instance.$destroy !== 'function') {
                throw new Error('instance sans $destroy');
            }
            const mounted = (instance.$el ?? host) as Element & { __drake__?: unknown };
            if (!mounted.__drake__) {
                throw new Error('expando __drake__ absent après montage');
            }
            instance.$destroy();
            const residual = mounted.__drake__ as Record<string, unknown> | undefined;
            if (residual && residual[name]) {
                throw new Error('expando __drake__ non nettoyé après $destroy');
            }
            result.passed.push(name);
        } catch (error) {
            result.failed.push({ name, error: String(error) });
        } finally {
            host.remove();
        }
        await new Promise((done) => setTimeout(done, 10));
    }

    sandbox.remove();
    return result;
}

Object.defineProperty(window, '__drakeApiSmoke', { value: runApiSmoke });
