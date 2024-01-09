import {MDCMenu, Corner} from '@material/menu';
import {hookupComponents, unhookupComponents, VBaseComponent} from "./base-component";
import {eventHandlerMixin} from "./mixins/event-handler";
import {initEvents, removeEvents} from "./events"

function createMenuHandler(menu, element) {
    return function (event) {
        let offset = parseInt(element.dataset.rightOffset);
        let placement = element.dataset.placement === 'contextual' ? Corner.TOP_LEFT : Corner.BOTTOM_LEFT;
        menu.setAbsolutePosition(event.clientX, event.clientY);
        menu.setAnchorMargin({left: offset});
        menu.setAnchorCorner(placement);
        menu.open = !menu.open;
        event.stopPropagation();

        // close all *other* open menus:
        for (const e of document.querySelectorAll('.v-menu')) {
            if (e == element) {
                continue;
            }

            e.vComponent?.close();
        }
    };
}

function closeAllMenus() {
    for (const element of document.querySelectorAll('.v-menu')) {
        element.vComponent?.close();
    }
}

export function uninitMenus(root) {
    console.debug('\tUninit Menus');
    unhookupComponents(root, '.v-menu');
}

export function initMenus(root) {
    console.debug('\tMenus');
    document.addEventListener('V:eventsFinished', closeAllMenus);
    hookupComponents(root, '.v-menu', VMenu, null);
}

export class VMenu extends eventHandlerMixin(VBaseComponent) {
    constructor(element) {
        super(element);
        this.hoistedMenuElement = element.querySelector('.mdc-menu');
        this.mdcComponent = new MDCMenu(this.hoistedMenuElement);

        initEvents(this.hoistedMenuElement);

        // Ensure that the menu surface closes when an item is clicked
        this.hoistedMenuElement.addEventListener('click', closeAllMenus, { capture: true });

        const link = this.menulink();

        if (link) {
            this.menuHandler = createMenuHandler(this.mdcComponent, element);
            link.addEventListener('click', this.menuHandler);
        }

        if (this.hoistedMenuElement.getAttribute('data-hoist') != 'false') {
            this.hoistedMenuElement.originalAnchor = this.element;
            this.mdcComponent.hoistMenuToBody();
        }
    }

    open() {
        // seems redundant, but avoids MDC touching the DOM unnecessarily.
        if (this.mdcComponent.open) {
            return;
        }

        this.mdcComponent.open = true;
    }

    close() {
        // seems redundant, but avoids MDC touching the DOM unnecessarily.
        if (!this.mdcComponent.open) {
            return;
        }

        this.mdcComponent.open = false;
    }

    destroy() {
        super.destroy();
        removeEvents(this.hoistedMenuElement);

        var link = this.menulink();
        if (link) {
            link.removeEventListener('click', this.menuHandler);
        }

        this.hoistedMenuElement.removeEventListener('click', closeAllMenus);
        this.hoistedMenuElement.remove();
    }

    menulink() {
        var anchor = this.element.closest('.mdc-menu-anchor');
        var link = null;
        if (anchor) {
            link = anchor.querySelector('.v-menu-click');
        }
        return link;
    }
}
