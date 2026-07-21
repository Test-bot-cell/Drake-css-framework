declare module 'virtual:version' {
    const version: string;
    export default version;
}

declare module 'virtual:log' {
    const enabled: boolean;
    export default enabled;
}

declare module 'virtual:name' {
    const name: string;
    export default name;
}

declare module 'component' {
    const component: import('./index').ComponentOptions;
    export default component;
}

interface Window {
    Drake?: import('./index').DrakeStatic;
}
