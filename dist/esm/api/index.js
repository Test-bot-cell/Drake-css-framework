import App from './app.js';
import globalApi from './global.js';
import instanceApi from './instance.js';

globalApi(App);
instanceApi(App);

export { App as default };
