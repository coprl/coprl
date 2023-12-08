import {uninitDateTime} from './datetime';
import {uninitMenus} from './menus';
import {uninitPlugins} from './plugins';

export function uninitialize(root) {
    console.debug('Uninitializing components');

    uninitMenus(root);
    uninitDateTime(root);
    uninitPlugins(root);
}
