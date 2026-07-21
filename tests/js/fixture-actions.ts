import { offset } from '../../src/js/util/dimensions';
import { getEventPos } from '../../src/js/util/event';
import { MouseTracker } from '../../src/js/util/mouse';
import { positionAt } from '../../src/js/util/position';

type NotificationPosition =
    'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
type NotificationStatus = 'primary' | 'success' | 'warning' | 'danger';

interface NotificationOptions {
    message: string;
    pos?: NotificationPosition;
    status?: NotificationStatus;
    timeout?: number;
}

interface NotificationApi {
    (options: NotificationOptions): unknown;
    closeAll(): void;
}

interface ModalApi {
    dialog(content: string): unknown;
    alert(message: string): Promise<unknown>;
    confirm(message: string): Promise<unknown>;
    prompt(label: string, value: string): Promise<unknown>;
}

interface LightboxPanel {
    show(): void;
}

interface UploadOptions {
    url: string;
    multiple: boolean;
    beforeSend?(): void;
    beforeAll?(): void;
    load?(): void;
    error?(): void;
    fail?(): void;
    complete?(): void;
    loadStart?(event: ProgressEvent<EventTarget>): void;
    progress?(event: ProgressEvent<EventTarget>): void;
    loadEnd?(event: ProgressEvent<EventTarget>): void;
    completeAll?(): void;
    abort?(): void;
}

interface FixtureUIkit {
    countdown(selector: string, options: { date: string }): unknown;
    lightboxPanel(options: {
        items: ReadonlyArray<{ source: string; caption: string }>;
    }): LightboxPanel;
    modal: ModalApi;
    notification: NotificationApi;
    offcanvas(selector: string): { toggle(): void };
    upload(selector: string, options: UploadOptions): unknown;
}

type AttachDirection = 'top' | 'right' | 'bottom' | 'left' | 'center';
type Placement = 'flip' | 'shift' | undefined;

export function installFixtureActions(): void {
    const fixture = (location.pathname.split('/').pop() ?? '').replace(/\.html$/, '');

    switch (fixture) {
        case 'countdown':
            setupCountdownDates();
            break;
        case 'drop':
            setupDrop();
            break;
        case 'dropbar':
            setupClassSwitcher('#js-size-switcher', '.uk-dropbar');
            break;
        case 'dropdown':
            setupClassSwitcher('#js-size-switcher', '.uk-dropdown');
            break;
        case 'dropnav':
            setupDropnav();
            break;
        case 'filter':
            setupFilter();
            break;
        case 'form':
            setupIndeterminateInputs();
            break;
        case 'grid-masonry':
            setupAttributeSwitcher('#js-masonry-switcher', '.js-grid-masonry', 'masonry');
            break;
        case 'grid-parallax':
            setupGridParallax();
            break;
        case 'index':
        case '':
            setupOverviewCountdown();
            break;
        case 'lightbox':
            setupLightbox();
            break;
        case 'list':
            setupClassSwitcher('#js-color-switcher', '.uk-list');
            break;
        case 'modal':
            setupModal();
            break;
        case 'nav':
            setupClassSwitcher('#js-divider-switcher', '.uk-nav');
            break;
        case 'navbar':
            setupNavbar();
            break;
        case 'notification':
            setupNotifications();
            break;
        case 'offcanvas':
            setupOffcanvas();
            break;
        case 'position':
            setupPosition();
            break;
        case 'progress':
            setupProgress();
            break;
        case 'scroll':
            setupScroll();
            break;
        case 'slider':
            setupSlider();
            break;
        case 'slideshow':
            setupSlideshow();
            break;
        case 'sortable':
            setupSortable();
            break;
        case 'sticky':
            setupClassSwitcher('#js-height-switcher', '.js-overflow-flip');
            break;
        case 'table':
            setupClassSwitcher('#js-size-switcher', '.uk-table');
            break;
        case 'upload':
            setupUpload();
            break;
    }
}

function setupCountdownDates(): void {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    const value = date.toISOString();

    for (const element of document.querySelectorAll('[uk-countdown]')) {
        element.setAttribute('date', value);
    }
}

function setupDrop(): void {
    setupClassSwitcher('#js-style-switcher', '.uk-drop');
    setupClassSwitcher('#js-boundary-overflow-switcher', '.js-boundary-overflow');

    for (const option of [
        'boundary-x',
        'boundary-y',
        'target-x',
        'target-y',
        'inset',
        'stretch',
        'flip',
        'shift',
        'animation',
        'animate-out',
        'duration',
    ]) {
        setupAttributeSwitcher(`#js-${option}-switcher`, '.js-options', option);
    }
}

function setupDropnav(): void {
    setupClassSwitcher('#js-nav-switcher', 'nav > :first-child');
    setupClassSwitcher('#js-dropdown-size-switcher', '.uk-dropdown:not(.uk-dropdown-dropbar)');
    setupClassSwitcher('#js-dropbar-size-switcher', '.uk-dropdown-dropbar');
}

function setupFilter(): void {
    logCustomEvents(document.body, ['beforeFilter', 'afterFilter']);
    setupAttributeSwitcher('#js-animation-switcher', '.js-filter-animation', 'animation');
}

function setupIndeterminateInputs(): void {
    for (const element of queryElements('.js-indeterminate', HTMLInputElement)) {
        element.indeterminate = true;
    }
}

function setupGridParallax(): void {
    for (const option of ['parallax', 'parallax-start', 'parallax-end', 'parallax-justify']) {
        setupAttributeSwitcher(`#js-${option}-switcher`, '.js-grid-parallax', option);
    }
    setupAttributeSwitcher('#js-masonry-switcher', '.js-grid-parallax', 'masonry');
}

function setupOverviewCountdown(): void {
    getUIkit().countdown('[js-countdown]', {
        date: new Date(Date.now() + 86_400_000 * 7).toISOString(),
    });
}

function setupLightbox(): void {
    for (const attribute of [
        'animation',
        'bg-close',
        'delay-controls',
        'counter',
        'video-autoplay',
    ]) {
        setupAttributeSwitcher(`#js-${attribute}-switcher`, '[uk-lightbox]', attribute);
    }

    const trigger = document.querySelector('#js-lightbox');
    trigger?.addEventListener('click', (event) => {
        event.preventDefault();
        getUIkit()
            .lightboxPanel({
                items: [
                    { source: 'images/size1.jpg', caption: '900x600' },
                    { source: 'images/size2.jpg', caption: '700x500' },
                ],
            })
            .show();
    });
}

function setupModal(): void {
    const modal = getUIkit().modal;

    onClick('#js-modal-dialog', (event) => {
        event.preventDefault();
        blurTarget(event);
        modal.dialog('<p class="uk-modal-body">UIkit dialog!</p>');
    });
    onClick('#js-modal-alert', async (event) => {
        event.preventDefault();
        blurTarget(event);
        await modal.alert('UIkit alert!');
        console.log('Alert closed.');
    });
    onClick('#js-modal-confirm', async (event) => {
        event.preventDefault();
        blurTarget(event);
        try {
            await modal.confirm('UIkit confirm!');
            console.log('Confirmed.');
        } catch {
            console.log('Rejected.');
        }
    });
    onClick('#js-modal-prompt', async (event) => {
        event.preventDefault();
        blurTarget(event);
        const name = await modal.prompt('Name:', 'Your name');
        console.log('Prompted:', name);
    });
}

function setupNavbar(): void {
    const tracker = new MouseTracker();
    const hoverArea = document.querySelector('#js-mousetracker');
    const target = document.querySelector('#js-mousetarget');
    if (!hoverArea || !target) {
        return;
    }

    let interval: ReturnType<typeof setInterval> | undefined;
    hoverArea.addEventListener('mouseenter', () => {
        tracker.init();
        interval = setInterval(() => {
            target.textContent = tracker.movesTo(target.parentElement)
                ? 'Moves to'
                : 'Does not move to';
        });
    });
    hoverArea.addEventListener('mouseleave', () => {
        tracker.cancel();
        if (interval !== undefined) {
            clearInterval(interval);
        }
    });

    setupClassSwitcher(
        '#js-dropdown-size-switcher',
        '.uk-navbar-dropdown:not(.uk-navbar-dropdown-dropbar)',
    );
    setupClassSwitcher('#js-dropbar-size-switcher', '.uk-navbar-dropdown-dropbar');
}

function setupNotifications(): void {
    const notification = getUIkit().notification;

    for (const button of queryElements('[data-fixture-notification]', HTMLButtonElement)) {
        button.addEventListener('click', () => {
            const message = button.dataset.message;
            if (!message) {
                return;
            }

            const options: NotificationOptions = { message };
            const position = button.dataset.position;
            const status = button.dataset.status;
            const timeout = button.dataset.timeout;
            if (isNotificationPosition(position)) {
                options.pos = position;
            }
            if (isNotificationStatus(status)) {
                options.status = status;
            }
            if (timeout !== undefined) {
                options.timeout = Number(timeout);
            }
            notification(options);
        });
    }

    for (const button of queryElements(
        '[data-fixture-notification-close-all]',
        HTMLButtonElement,
    )) {
        button.addEventListener('click', () => notification.closeAll());
    }
}

function setupOffcanvas(): void {
    onClick('#js-toggle', (event) => {
        event.preventDefault();
        getUIkit().offcanvas('#js-offcanvas-toggle').toggle();
    });
}

function setupPosition(): void {
    const boundary = document.querySelector('#js-boundary');
    const element = document.querySelector('#js-element');
    const target = document.querySelector('#js-target');
    const elementX = selectControl('#js-element_x');
    const elementY = selectControl('#js-element_y');
    const targetX = selectControl('#js-target_x');
    const targetY = selectControl('#js-target_y');
    const offsetXControl = selectControl('#js-offset_x');
    const offsetYControl = selectControl('#js-offset_y');
    const placementX = selectControl('#js-placement_x');
    const placementY = selectControl('#js-placement_y');
    if (
        !boundary ||
        !element ||
        !target ||
        !elementX ||
        !elementY ||
        !targetX ||
        !targetY ||
        !offsetXControl ||
        !offsetYControl ||
        !placementX ||
        !placementY
    ) {
        return;
    }

    const position = (): void => {
        positionAt(element, target, {
            boundary,
            attach: {
                element: [toAttachDirection(elementX.value), toAttachDirection(elementY.value)],
                target: [toAttachDirection(targetX.value), toAttachDirection(targetY.value)],
            },
            offset: [toNumber(offsetXControl.value), toNumber(offsetYControl.value)],
            placement: [toPlacement(placementX.value), toPlacement(placementY.value)],
        });
    };

    let dragOffsetX: number | undefined;
    let dragOffsetY: number | undefined;
    let lastPosition: { x: number; y: number } | undefined;

    window.addEventListener('dragstart', (event) => {
        if (!(event instanceof DragEvent) || !event.dataTransfer) {
            return;
        }
        event.dataTransfer.setDragImage(new Image(), 0, 0);
        const targetOffset = offset(target);
        dragOffsetX = Math.round(event.pageX - targetOffset.left);
        dragOffsetY = Math.round(event.pageY - targetOffset.top);
    });

    window.addEventListener('dragover', (event) => {
        if (
            !(event instanceof DragEvent) ||
            dragOffsetX === undefined ||
            dragOffsetY === undefined
        ) {
            return;
        }

        const pointer = getEventPos(event);
        if (lastPosition?.x === pointer.x && lastPosition.y === pointer.y) {
            return;
        }
        lastPosition = pointer;
        event.preventDefault();

        const boundaryOffset = offset(boundary);
        positionAt(target, boundary, {
            offset: [
                event.pageX - boundaryOffset.left - dragOffsetX,
                event.pageY - boundaryOffset.top - dragOffsetY,
            ],
        });
        position();
    });

    for (const control of document.querySelectorAll('select,input')) {
        control.addEventListener('change', position);
    }
    window.addEventListener('scroll', position, { passive: true });
    position();
}

function setupProgress(): void {
    const bar = document.querySelector('#js-progressbar');
    if (!(bar instanceof HTMLProgressElement)) {
        return;
    }

    const animate = setInterval(() => {
        bar.value += 10;
        if (bar.value >= bar.max) {
            clearInterval(animate);
        }
    }, 1000);
}

function setupScroll(): void {
    setupAttributeSwitcher('#offset', '[uk-scroll]', 'data-offset');
    document.querySelector('#js-top-callback')?.addEventListener('scrolled', () => {
        alert('Done.');
    });
}

function setupSlider(): void {
    for (const attribute of ['finite', 'center', 'sets', 'active']) {
        setupAttributeSwitcher(`#js-${attribute}-switcher`, '[uk-slider]', attribute);
    }
}

function setupSlideshow(): void {
    setupAttributeSwitcher('#js-animation-switcher', '.js-slideshow-animation', 'animation');
    setupAttributeSwitcher('#js-finite-switcher', '[uk-slideshow]', 'finite');
}

function setupSortable(): void {
    logCustomEvents(document.body, ['start', 'moved', 'added', 'removed', 'stop']);
}

function setupUpload(): void {
    const bar = document.querySelector('#js-progressbar');
    const abortBar = document.querySelector('#js-abort-progressbar');
    if (!(bar instanceof HTMLProgressElement) || !(abortBar instanceof HTMLProgressElement)) {
        return;
    }

    const uikit = getUIkit();
    uikit.upload('.js-upload', {
        url: '',
        multiple: true,
        beforeSend(...args: unknown[]) {
            console.log('beforeSend', args);
        },
        beforeAll(...args: unknown[]) {
            console.log('beforeAll', args);
        },
        load(...args: unknown[]) {
            console.log('load', args);
        },
        error(...args: unknown[]) {
            console.log('error', args);
        },
        fail(...args: unknown[]) {
            console.log('fail', args);
        },
        complete(...args: unknown[]) {
            console.log('complete', args);
        },
        loadStart(event, ...args: unknown[]) {
            console.log('loadStart', [event, ...args]);
            bar.hidden = false;
            bar.max = event.total;
            bar.value = event.loaded;
        },
        progress(event, ...args: unknown[]) {
            console.log('progress', [event, ...args]);
            bar.max = event.total;
            bar.value = event.loaded;
        },
        loadEnd(event, ...args: unknown[]) {
            console.log('loadEnd', [event, ...args]);
            bar.max = event.total;
            bar.value = event.loaded;
        },
        completeAll(...args: unknown[]) {
            console.log('completeAll', args);
            setTimeout(() => {
                bar.hidden = true;
            }, 1000);
            alert('Upload Completed');
        },
    });

    uikit.upload('.js-upload-abort', {
        url: '',
        multiple: true,
        beforeSend(...args: unknown[]) {
            console.log('abort test beforeSend', args);
        },
        loadStart(event, ...args: unknown[]) {
            console.log('abort test loadStart', [event, ...args]);
            abortBar.hidden = false;
            abortBar.max = event.total;
            abortBar.value = event.loaded;
            if (event.target instanceof XMLHttpRequest) {
                event.target.abort();
            }
        },
        progress(event, ...args: unknown[]) {
            console.log('abort test progress', [event, ...args]);
            abortBar.max = event.total;
            abortBar.value = event.loaded;
        },
        loadEnd(event, ...args: unknown[]) {
            console.log('abort test loadEnd', [event, ...args]);
            abortBar.max = event.total;
            abortBar.value = event.loaded;
        },
        abort(...args: unknown[]) {
            console.log('abort test abort', args);
            setTimeout(() => {
                abortBar.hidden = true;
            }, 300);
        },
        error(...args: unknown[]) {
            console.error('abort test error', args);
        },
        complete(...args: unknown[]) {
            console.error('abort test complete', args);
        },
        completeAll(...args: unknown[]) {
            console.error('abort test completeAll', args);
        },
    });
}

function setupClassSwitcher(switcherSelector: string, targetSelector: string): void {
    const switcher = document.querySelector(switcherSelector);
    if (!(switcher instanceof HTMLSelectElement)) {
        return;
    }

    switcher.addEventListener('change', () => {
        const options = [...switcher.options].map((option) => option.value);
        for (const element of document.querySelectorAll(targetSelector)) {
            removeClasses(element, options);
            addClasses(element, switcher.value);
        }
    });
}

function setupAttributeSwitcher(
    switcherSelector: string,
    targetSelector: string,
    attribute: string,
): void {
    const switcher = selectControl(switcherSelector);
    if (!switcher) {
        return;
    }

    switcher.addEventListener('change', () => {
        for (const element of document.querySelectorAll(targetSelector)) {
            element.setAttribute(attribute, switcher.value);
        }
    });
}

function logCustomEvents(target: EventTarget, types: readonly string[]): void {
    for (const type of types) {
        target.addEventListener(type, (event) => {
            if (!(event instanceof CustomEvent)) {
                console.log(event.type);
                return;
            }
            const detail: unknown = event.detail;
            console.log(event.type, ...(Array.isArray(detail) ? detail : [detail]));
        });
    }
}

function onClick(selector: string, listener: (event: MouseEvent) => void): void {
    document.querySelector(selector)?.addEventListener('click', (event) => {
        if (event instanceof MouseEvent) {
            listener(event);
        }
    });
}

function blurTarget(event: Event): void {
    if (event.target instanceof HTMLElement) {
        event.target.blur();
    }
}

function selectControl(selector: string): HTMLInputElement | HTMLSelectElement | null {
    const element = document.querySelector(selector);
    return element instanceof HTMLInputElement || element instanceof HTMLSelectElement
        ? element
        : null;
}

function queryElements<T extends Element>(selector: string, constructor: { new (): T }): T[] {
    const matches: T[] = [];
    for (const element of document.querySelectorAll(selector)) {
        if (element instanceof constructor) {
            matches.push(element);
        }
    }
    return matches;
}

function addClasses(element: Element, value: string): void {
    const classes = classNames([value]);
    if (classes.length) {
        element.classList.add(...classes);
    }
}

function removeClasses(element: Element, values: readonly string[]): void {
    const classes = classNames(values);
    if (classes.length) {
        element.classList.remove(...classes);
    }
}

function classNames(values: readonly string[]): string[] {
    return values.flatMap((value) => value.split(/\s+/).filter(Boolean));
}

function toNumber(value: string): number {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function toAttachDirection(value: string): AttachDirection {
    switch (value) {
        case 'top':
        case 'right':
        case 'bottom':
        case 'left':
        case 'center':
            return value;
        default:
            return 'center';
    }
}

function toPlacement(value: string): Placement {
    return value === 'flip' || value === 'shift' ? value : undefined;
}

function isNotificationPosition(value: string | undefined): value is NotificationPosition {
    return (
        value === 'top-left' ||
        value === 'top-center' ||
        value === 'top-right' ||
        value === 'bottom-left' ||
        value === 'bottom-center' ||
        value === 'bottom-right'
    );
}

function isNotificationStatus(value: string | undefined): value is NotificationStatus {
    return value === 'primary' || value === 'success' || value === 'warning' || value === 'danger';
}

function getUIkit(): FixtureUIkit {
    const candidate: unknown = Reflect.get(window, 'UIkit');
    if (!isFixtureUIkit(candidate)) {
        throw new Error('The UIkit fixture runtime is not available.');
    }
    return candidate;
}

function isFixtureUIkit(value: unknown): value is FixtureUIkit {
    if (!isPropertyContainer(value)) {
        return false;
    }
    const modal = value.modal;
    const notification = value.notification;
    return (
        typeof value.countdown === 'function' &&
        typeof value.lightboxPanel === 'function' &&
        isPropertyContainer(modal) &&
        typeof modal.dialog === 'function' &&
        typeof modal.alert === 'function' &&
        typeof modal.confirm === 'function' &&
        typeof modal.prompt === 'function' &&
        typeof notification === 'function' &&
        typeof Reflect.get(notification, 'closeAll') === 'function' &&
        typeof value.offcanvas === 'function' &&
        typeof value.upload === 'function'
    );
}

function isPropertyContainer(value: unknown): value is Record<string, unknown> {
    return value !== null && (typeof value === 'object' || typeof value === 'function');
}
