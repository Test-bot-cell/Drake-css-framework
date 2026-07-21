interface ForkMetrics {
    cls: number;
    inpMs: number | null;
    labTbtMs: number;
    lcpMs: number;
}

interface BrowserMeasurement extends ForkMetrics {
    actionTarget: { height: number; width: number } | null;
    content: {
        headings: number;
        hiddenPrimary: number;
        links: number;
        signature: string;
    };
    fonts: {
        bodyFamily: string;
        italic: boolean;
        roman: boolean;
        status: FontFaceSetLoadStatus;
    };
    reflow: {
        clientWidth: number;
        passes: boolean;
        scrollWidth: number;
    };
    table: {
        display: string;
        headerVisible: boolean;
        overflowX: string;
    };
}

interface MeasurementBridge {
    fontsReady(): Promise<void>;
    snapshot(): BrowserMeasurement;
    summaryCenter(): { x: number; y: number } | null;
}

interface LayoutShiftEntry extends PerformanceEntry {
    hadRecentInput: boolean;
    value: number;
}

interface ExtendedPerformanceObserverInit extends PerformanceObserverInit {
    durationThreshold?: number;
}

declare global {
    interface Window {
        __forkMetrics: ForkMetrics;
        __forkMobileSeo: MeasurementBridge;
    }
}

const metrics: ForkMetrics = { cls: 0, inpMs: null, labTbtMs: 0, lcpMs: 0 };

Object.defineProperty(window, '__forkMetrics', { value: metrics });
Object.defineProperty(window, '__forkMobileSeo', {
    value: {
        async fontsReady(): Promise<void> {
            await document.fonts.ready;
        },

        snapshot(): BrowserMeasurement {
            const root = document.documentElement;
            const action = document.querySelector('.fork-action');
            const actionRect = action?.getBoundingClientRect();
            const table = document.querySelector<HTMLElement>('.drk-table-responsive');
            const tableHeader = table?.querySelector('thead');
            const tableStyle = table ? getComputedStyle(table) : null;
            // textContent is deliberately layout-independent: the parity gate compares the
            // semantic HTML payload, while visibility is checked separately below.
            const semanticText = normalizeText(document.body.textContent ?? '');
            const primaryElements = document.querySelectorAll('main h1, main h2, main p, nav a');

            return {
                ...metrics,
                actionTarget: actionRect
                    ? { height: actionRect.height, width: actionRect.width }
                    : null,
                content: {
                    headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
                    hiddenPrimary: [...primaryElements].filter(isHidden).length,
                    links: document.querySelectorAll('a[href]').length,
                    signature: hashText(semanticText),
                },
                fonts: {
                    bodyFamily: getComputedStyle(document.body).fontFamily,
                    italic: document.fonts.check('italic 400 16px "InterVariable"'),
                    roman: document.fonts.check('normal 400 16px "InterVariable"'),
                    status: document.fonts.status,
                },
                reflow: {
                    clientWidth: root.clientWidth,
                    passes: root.scrollWidth <= root.clientWidth,
                    scrollWidth: root.scrollWidth,
                },
                table: {
                    display: tableStyle?.display ?? '',
                    headerVisible: Boolean(tableHeader && !isHidden(tableHeader)),
                    overflowX: tableStyle?.overflowX ?? '',
                },
            };
        },

        summaryCenter(): { x: number; y: number } | null {
            const rect = document.querySelector('summary')?.getBoundingClientRect();
            return rect ? { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 } : null;
        },
    },
});

observe('largest-contentful-paint', (entry) => {
    metrics.lcpMs = entry.startTime;
});
observe('layout-shift', (entry) => {
    if (isLayoutShiftEntry(entry) && !entry.hadRecentInput) {
        metrics.cls += entry.value;
    }
});
observe('longtask', (entry) => {
    metrics.labTbtMs += Math.max(0, entry.duration - 50);
});
observe(
    'event',
    (entry) => {
        metrics.inpMs = Math.max(metrics.inpMs ?? 0, entry.duration);
    },
    16,
);

function observe(
    type: string,
    handle: (entry: PerformanceEntry) => void,
    durationThreshold?: number,
): void {
    if (!PerformanceObserver.supportedEntryTypes.includes(type)) {
        return;
    }

    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            handle(entry);
        }
    });
    const options: ExtendedPerformanceObserverInit = {
        buffered: true,
        type,
    };
    if (durationThreshold !== undefined) {
        options.durationThreshold = durationThreshold;
    }
    observer.observe(options);
}

function isLayoutShiftEntry(entry: PerformanceEntry): entry is LayoutShiftEntry {
    return (
        'hadRecentInput' in entry &&
        typeof entry.hadRecentInput === 'boolean' &&
        'value' in entry &&
        typeof entry.value === 'number'
    );
}

function isHidden(element: Element): boolean {
    const style = getComputedStyle(element);
    return (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        element.getClientRects().length === 0
    );
}

function normalizeText(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
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
