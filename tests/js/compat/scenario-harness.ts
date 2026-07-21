// Harnais de scénarios C2 (gate G7) : exécute des interactions déterministes dans les
// pages du catalogue et enregistre des assertions comportementales (classes, ARIA, focus,
// destruction sans résidu). Les événements sont synthétiques (dispatchEvent) : le runtime
// écoute via addEventListener sans exiger isTrusted.

export interface Check {
    label: string;
    pass: boolean;
    detail?: string;
}

export interface ScenarioContext {
    $: (selector: string) => Element;
    $$: (selector: string) => Element[];
    click: (target: string | Element) => void;
    key: (key: string, target?: Element | Document) => void;
    focus: (target: string | Element) => void;
    hover: (target: string | Element) => void;
    wait: (milliseconds: number) => Promise<void>;
    waitFor: (label: string, condition: () => boolean, timeout?: number) => Promise<void>;
    expect: (label: string, condition: boolean, detail?: string) => void;
    drake: DrakeGlobal;
}

export interface ScenarioDefinition {
    page: string;
    name: string;
    run: (context: ScenarioContext) => Promise<void>;
}

interface DrakeGlobal {
    [name: string]: (element: Element | string, options?: Record<string, unknown>) => unknown;
}

interface ScenarioResult {
    checks: Check[];
    error?: string;
}

export function registerScenarios(definitions: ScenarioDefinition[]): void {
    const api = {
        list(): { name: string; page: string }[] {
            return definitions.map(({ name, page }) => ({ name, page }));
        },
        async run(name: string): Promise<ScenarioResult> {
            const definition = definitions.find((candidate) => candidate.name === name);
            if (!definition) {
                return { checks: [], error: `scénario inconnu: ${name}` };
            }
            const checks: Check[] = [];
            const context = createContext(checks);
            try {
                await definition.run(context);
                return { checks };
            } catch (error) {
                return { checks, error: String(error) };
            }
        },
    };
    Object.defineProperty(window, '__drakeScenarios', { configurable: true, value: api });
}

function createContext(checks: Check[]): ScenarioContext {
    const resolveElement = (target: string | Element): Element => {
        if (typeof target !== 'string') {
            return target;
        }
        const element = document.querySelector(target);
        if (!element) {
            throw new Error(`élément introuvable: ${target}`);
        }
        return element;
    };

    const pointer = (element: Element, type: string) => {
        element.dispatchEvent(
            new MouseEvent(type, { bubbles: true, cancelable: true, view: window }),
        );
    };

    return {
        $: resolveElement,
        $$: (selector) => [...document.querySelectorAll(selector)],
        click(target) {
            const element = resolveElement(target) as HTMLElement;
            pointer(element, 'pointerdown');
            pointer(element, 'mousedown');
            pointer(element, 'pointerup');
            pointer(element, 'mouseup');
            element.click();
        },
        key(key, target = document) {
            // Le runtime hérité teste e.keyCode : on le définit sur l'événement synthétique.
            const KEY_CODES: Record<string, number> = {
                ArrowDown: 40,
                ArrowLeft: 37,
                ArrowRight: 39,
                ArrowUp: 38,
                End: 35,
                Enter: 13,
                Escape: 27,
                Home: 36,
                Tab: 9,
                ' ': 32,
            };
            const receiver =
                target === document ? (document.activeElement ?? document.body) : target;
            for (const type of ['keydown', 'keyup']) {
                const event = new KeyboardEvent(type, { bubbles: true, cancelable: true, key });
                if (key in KEY_CODES) {
                    Object.defineProperty(event, 'keyCode', { value: KEY_CODES[key] });
                    Object.defineProperty(event, 'which', { value: KEY_CODES[key] });
                }
                receiver.dispatchEvent(event);
            }
        },
        focus(target) {
            (resolveElement(target) as HTMLElement).focus();
        },
        hover(target) {
            const element = resolveElement(target);
            for (const type of ['pointerenter', 'mouseenter', 'pointerover', 'mouseover']) {
                element.dispatchEvent(new MouseEvent(type, { bubbles: type.endsWith('over') }));
            }
        },
        wait: (milliseconds) => new Promise((done) => setTimeout(done, milliseconds)),
        async waitFor(label, condition, timeout = 3000) {
            const start = performance.now();
            while (performance.now() - start < timeout) {
                if (condition()) {
                    checks.push({ label, pass: true });
                    return;
                }
                await new Promise((done) => setTimeout(done, 40));
            }
            checks.push({ detail: `délai ${timeout} ms dépassé`, label, pass: false });
        },
        expect(label, condition, detail) {
            checks.push({ detail: condition ? undefined : detail, label, pass: condition });
        },
        drake: (window as unknown as { Drake: DrakeGlobal }).Drake,
    };
}
