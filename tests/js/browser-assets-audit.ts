interface FontEvidence {
    allFacesLoaded: boolean;
    available: boolean;
    family: string;
    loadedFaceCount: number;
    style: string;
    weight: string;
}

interface MaskEvidence {
    classes: string[];
    hasDataMask: boolean;
    maskFingerprint: string;
    maskSize: string;
}

interface BrowserAssetsMeasurement {
    accessibility: {
        decorativeAriaHidden: string | null;
        spinnerAriaLabel: string | null;
        spinnerRole: string | null;
    };
    aliases: {
        appleDiffersFromFruit: boolean;
        appleEqualsBrandApple: boolean;
        brandAppleMaskFingerprint: string;
        fruitAppleMaskFingerprint: string;
        legacyAppleMaskFingerprint: string;
    };
    bindings: {
        arrayEventTargets: boolean;
        nullTypedProp: boolean;
    };
    animation: {
        afterFilterFired: boolean;
        finalStateSettled: boolean;
        hiddenWarmItems: number;
        residualDatasetTransition: string | null;
        residualVisibleInlineStyles: number;
        residualTransitionClasses: string[];
        visibleCoolItems: number;
    };
    direction: {
        ltrNextMaskFingerprint: string;
        ltrPreviousMaskFingerprint: string;
        rtlNextDirection: string;
        rtlNextDiffersFromLtrNext: boolean;
        rtlNextMaskFingerprint: string;
        rtlNextMatchesLtrPrevious: boolean;
    };
    dom: {
        clientWidth: number;
        horizontalOverflow: boolean;
        scrollWidth: number;
        svgCount: number;
    };
    fonts: {
        italic: FontEvidence;
        roman: FontEvidence;
        status: FontFaceSetLoadStatus;
    };
    icons: {
        close: MaskEvidence & {
            height: number;
            width: number;
        };
        runtimeReady: boolean;
        spinner: MaskEvidence;
        tablerCatalogue: MaskEvidence;
    };
    runtimeFailures: {
        message: string;
        type: 'error' | 'unhandledrejection';
    }[];
    viewport: {
        height: number;
        width: number;
    };
}

interface BrowserAssetsAuditBridge {
    ready(): boolean;
    run(): Promise<BrowserAssetsMeasurement>;
}

declare global {
    interface Window {
        __forkAssetsAudit: BrowserAssetsAuditBridge;
    }
}

const runtimeFailures: BrowserAssetsMeasurement['runtimeFailures'] = [];

window.addEventListener('error', ({ message }) => {
    runtimeFailures.push({ message, type: 'error' });
});
window.addEventListener('unhandledrejection', ({ reason }) => {
    runtimeFailures.push({ message: describeReason(reason), type: 'unhandledrejection' });
});

Object.defineProperty(window, '__forkAssetsAudit', {
    value: {
        ready(): boolean {
            return document.readyState === 'complete';
        },

        async run(): Promise<BrowserAssetsMeasurement> {
            await document.fonts.ready;
            const runtimeIconsReady = await waitForRuntimeIcons();

            const romanElement = requireElement<HTMLElement>('[data-testid="inter-roman"]');
            const italicElement = requireElement<HTMLElement>('[data-testid="inter-italic"] em');
            const tablerIcon = requireElement<HTMLElement>('[data-testid="tabler-icon"]');
            const legacyApple = requireElement<HTMLElement>('[data-testid="legacy-apple"]');
            const brandApple = requireElement<HTMLElement>('[data-testid="brand-apple-reference"]');
            const fruitApple = requireElement<HTMLElement>('[data-testid="fruit-apple-reference"]');
            const closeIcon = requireElement<HTMLElement>('[data-testid="close-icon"]');
            const spinnerIcon = requireElement<HTMLElement>('[data-testid="spinner-icon"]');
            const rtlNext = requireElement<HTMLElement>('[data-testid="rtl-next-icon"]');
            const ltrNext = requireElement<HTMLElement>('[data-testid="ltr-next-reference"]');
            const ltrPrevious = requireElement<HTMLElement>(
                '[data-testid="ltr-previous-reference"]',
            );
            const bindings = await exerciseRuntimeBindings();
            const animation = await exerciseDelayedFade();

            const [romanFaces, italicFaces] = await Promise.all([
                document.fonts.load(
                    'normal 400 16px "InterVariable"',
                    romanElement.textContent ?? '',
                ),
                document.fonts.load(
                    'italic 400 16px "InterVariable"',
                    italicElement.textContent ?? '',
                ),
            ]);
            const romanStyle = getComputedStyle(romanElement);
            const italicStyle = getComputedStyle(italicElement);
            const legacyAppleMask = resolvedMask(legacyApple);
            const brandAppleMask = resolvedMask(brandApple);
            const fruitAppleMask = resolvedMask(fruitApple);
            const rtlNextMask = resolvedMask(rtlNext);
            const ltrNextMask = resolvedMask(ltrNext);
            const ltrPreviousMask = resolvedMask(ltrPrevious);
            const closeRect = closeIcon.getBoundingClientRect();
            const root = document.documentElement;

            return {
                accessibility: {
                    decorativeAriaHidden: legacyApple.getAttribute('aria-hidden'),
                    spinnerAriaLabel: spinnerIcon.getAttribute('aria-label'),
                    spinnerRole: spinnerIcon.getAttribute('role'),
                },
                aliases: {
                    appleDiffersFromFruit: legacyAppleMask !== fruitAppleMask,
                    appleEqualsBrandApple: legacyAppleMask === brandAppleMask,
                    brandAppleMaskFingerprint: hashText(brandAppleMask),
                    fruitAppleMaskFingerprint: hashText(fruitAppleMask),
                    legacyAppleMaskFingerprint: hashText(legacyAppleMask),
                },
                animation,
                bindings,
                direction: {
                    ltrNextMaskFingerprint: hashText(ltrNextMask),
                    ltrPreviousMaskFingerprint: hashText(ltrPreviousMask),
                    rtlNextDirection: getComputedStyle(rtlNext).direction,
                    rtlNextDiffersFromLtrNext: rtlNextMask !== ltrNextMask,
                    rtlNextMaskFingerprint: hashText(rtlNextMask),
                    rtlNextMatchesLtrPrevious: rtlNextMask === ltrPreviousMask,
                },
                dom: {
                    clientWidth: root.clientWidth,
                    horizontalOverflow: root.scrollWidth > root.clientWidth,
                    scrollWidth: root.scrollWidth,
                    svgCount: document.querySelectorAll('svg').length,
                },
                fonts: {
                    italic: fontEvidence(
                        italicStyle,
                        italicFaces,
                        document.fonts.check('italic 400 16px "InterVariable"'),
                    ),
                    roman: fontEvidence(
                        romanStyle,
                        romanFaces,
                        document.fonts.check('normal 400 16px "InterVariable"'),
                    ),
                    status: document.fonts.status,
                },
                icons: {
                    close: {
                        ...maskEvidence(closeIcon),
                        height: closeRect.height,
                        width: closeRect.width,
                    },
                    runtimeReady: runtimeIconsReady,
                    spinner: maskEvidence(spinnerIcon),
                    tablerCatalogue: maskEvidence(tablerIcon),
                },
                runtimeFailures: [...runtimeFailures],
                viewport: {
                    height: window.innerHeight,
                    width: window.innerWidth,
                },
            };
        },
    },
});

async function exerciseRuntimeBindings(): Promise<BrowserAssetsMeasurement['bindings']> {
    const toggle = requireElement<HTMLButtonElement>('[data-testid="null-prop-toggle"]');
    const toggleTarget = requireElement<HTMLElement>('[data-testid="null-prop-target"]');
    const switcherTrigger = requireElement<HTMLButtonElement>(
        '[data-testid="array-event-trigger"]',
    );
    const switcherResult = requireElement<HTMLElement>('[data-testid="array-event-result"]');

    toggle.click();
    const nullTypedProp = await waitForCondition(() => !toggleTarget.hidden, 1000);

    switcherTrigger.click();
    const arrayEventTargets = await waitForCondition(
        () => switcherResult.classList.contains('uk-active'),
        1000,
    );

    return { arrayEventTargets, nullTypedProp };
}

async function exerciseDelayedFade(): Promise<BrowserAssetsMeasurement['animation']> {
    const component = requireElement<HTMLElement>('[data-testid="animated-filter"]');
    const trigger = requireElement<HTMLButtonElement>('[data-testid="animated-filter-trigger"]');
    const target = requireElement<HTMLElement>('[data-testid="animated-filter-target"]');
    component.scrollIntoView({ block: 'start' });
    await delay(50);

    const afterFilter = waitForEvent(component, 'afterFilter', 3000);
    trigger.click();
    const afterFilterFired = await afterFilter;
    const finalStateSettled = await waitForCondition(() => isAnimationSettled(target), 3000);
    await delay(50);

    const coolItems = [...target.querySelectorAll<HTMLElement>('[data-tone="cool"]')];
    const warmItems = [...target.querySelectorAll<HTMLElement>('[data-tone="warm"]')];
    const animatedElements = [target, ...target.querySelectorAll<HTMLElement>(':scope > *')];
    const visibleAnimatedElements = animatedElements.filter(
        (element) => getComputedStyle(element).display !== 'none',
    );

    return {
        afterFilterFired,
        finalStateSettled,
        hiddenWarmItems: warmItems.filter((item) => getComputedStyle(item).display === 'none')
            .length,
        residualDatasetTransition: target.dataset.transition ?? null,
        residualVisibleInlineStyles:
            visibleAnimatedElements.filter(hasResidualAnimationStyle).length,
        residualTransitionClasses: animatedElements.flatMap((element, index) =>
            [...element.classList]
                .filter((name) => name === 'uk-transition' || name.startsWith('uk-transition-'))
                .map((name) => `${index}:${name}`),
        ),
        visibleCoolItems: coolItems.filter((item) => getComputedStyle(item).display !== 'none')
            .length,
    };
}

function isAnimationSettled(target: HTMLElement): boolean {
    const coolItems = [...target.querySelectorAll<HTMLElement>('[data-tone="cool"]')];
    const warmItems = [...target.querySelectorAll<HTMLElement>('[data-tone="warm"]')];
    return (
        coolItems.every((item) => getComputedStyle(item).display !== 'none') &&
        warmItems.every((item) => getComputedStyle(item).display === 'none') &&
        !target.classList.contains('uk-transition-enter') &&
        !target.classList.contains('uk-transition-leave') &&
        target.dataset.transition === undefined
    );
}

function hasResidualAnimationStyle(element: HTMLElement): boolean {
    return [
        'align-content',
        'height',
        'opacity',
        'transition-duration',
        'transition-property',
        'transition-timing-function',
    ].some((property) => element.style.getPropertyValue(property) !== '');
}

function waitForEvent(element: Element, name: string, timeout: number): Promise<boolean> {
    return new Promise((resolveEvent) => {
        let completed = false;
        const finish = (value: boolean) => {
            if (!completed) {
                completed = true;
                resolveEvent(value);
            }
        };
        element.addEventListener(name, () => finish(true), { once: true });
        window.setTimeout(() => finish(false), timeout);
    });
}

async function waitForCondition(check: () => boolean, timeout: number): Promise<boolean> {
    const deadline = performance.now() + timeout;
    while (performance.now() < deadline) {
        if (check()) {
            return true;
        }
        await delay(25);
    }
    return check();
}

function describeReason(reason: unknown): string {
    if (reason instanceof Error) {
        return reason.message;
    }
    return typeof reason === 'string' ? reason : String(reason);
}

function fontEvidence(
    style: CSSStyleDeclaration,
    faces: FontFace[],
    available: boolean,
): FontEvidence {
    return {
        allFacesLoaded: faces.length > 0 && faces.every(({ status }) => status === 'loaded'),
        available,
        family: style.fontFamily,
        loadedFaceCount: faces.length,
        style: style.fontStyle,
        weight: style.fontWeight,
    };
}

function maskEvidence(element: HTMLElement): MaskEvidence {
    const style = getComputedStyle(element);
    const mask = resolvedMask(element);
    return {
        classes: [...element.classList],
        hasDataMask: mask.startsWith('url("data:image/svg+xml'),
        maskFingerprint: hashText(mask),
        maskSize:
            style.getPropertyValue('mask-size') || style.getPropertyValue('-webkit-mask-size'),
    };
}

function resolvedMask(element: HTMLElement): string {
    const style = getComputedStyle(element);
    return style.getPropertyValue('mask-image') || style.getPropertyValue('-webkit-mask-image');
}

async function waitForRuntimeIcons(): Promise<boolean> {
    const selectors = [
        '[data-testid="legacy-apple"]',
        '[data-testid="close-icon"]',
        '[data-testid="spinner-icon"]',
        '[data-testid="rtl-next-icon"]',
        '[data-testid="ltr-next-reference"]',
        '[data-testid="ltr-previous-reference"]',
    ];

    for (let attempt = 0; attempt < 100; attempt++) {
        const elements = selectors.map((selector) => document.querySelector<HTMLElement>(selector));
        if (
            elements.every(
                (element) =>
                    element?.classList.contains('uk-ti') &&
                    resolvedMask(element).startsWith('url('),
            )
        ) {
            return true;
        }
        await delay(25);
    }

    return false;
}

function requireElement<ElementType extends Element>(selector: string): ElementType {
    const element = document.querySelector<ElementType>(selector);
    if (!element) {
        throw new Error(`Required audit element not found: ${selector}`);
    }
    return element;
}

function delay(milliseconds: number): Promise<void> {
    return new Promise((resolveDelay) => window.setTimeout(resolveDelay, milliseconds));
}

function hashText(value: string): string {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index++) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
}

export {};
