// Test de consommation des déclarations publiées (critère de sortie de la phase 6).
// Compile sous tsc strict exactement comme un intégrateur TypeScript : import du paquet,
// types publics Drake*, API globale typée et global UMD window.Drake.
import Drake, { type DrakePlugin, type DrakeStatic } from 'drake.css';

const version: string = Drake.version;

const definition = Drake.component('consumerProbe', { props: { probe: Boolean } });
void definition;
void version;

const instance = Drake.getComponent(document.body, 'consumerProbe');
instance?.$destroy();

const everything = Drake.getComponents(document.body);
void Object.keys(everything);

const plugin: DrakePlugin = (app) => {
    app.mixin({}, 'consumerProbe');
};
Drake.use(plugin);
Drake.update(document.body, 'consumer-check');

// L'API globale UMD est déclarée par dist/types/drake-global.d.ts.
const fromWindow: DrakeStatic = window.Drake;
void fromWindow.util;

export {};
