/**
 * Component: Drawers.
 * ------------------------------------------------------------------------------
 * Handles opening and closing of drawers.
 *
 * @namespace drawers
 *
 */
import cssClasses from '../helpers/cssClasses';
import {on} from '../helpers/utils';

/**
 * DOM selectors.
 */
const selectors = {
  overlay: '[js-page="overlay"]',
  container: '[js-drawers="container"]',
  close: '[js-drawers="close"]',
};

export default () => {

  /**
   * DOM node selectors.
   */
  const nodeSelectors = {
    overlay: document.querySelector(selectors.overlay),
    container: document.querySelector(selectors.container),
    close: document.querySelectorAll(selectors.close),
  };

  /**
   * Init the cart.
   */
  function init() {
    setEventListeners();
  }

  /**
   * Set listeners.
   */
  function setEventListeners() {
    Heedless.eventBus.listen('Drawer:open', (drawer) => openDrawer(drawer));
    Heedless.eventBus.listen(['Drawer:close', 'Overlay:close'], (drawer) => closeDrawer(drawer));

    nodeSelectors.close.forEach((element) => {
      on('click', element, (event) => handleCloseEvent(event.target));
    });
  }

  /**
   * Handle close event.
   * @param {HTMLElement} target the clicked button.
   */
  function handleCloseEvent(target) {
    const drawer = target.getAttribute('data-drawer');
    Heedless.eventBus.emit('Drawer:close', drawer);
  }

  /**
   * Open drawer.
   * @param {HTMLElement} drawer the drawer to close.
   */
  function openDrawer(drawer) {
    switch (drawer) {
      case 'cart':
        nodeSelectors.container.classList.add(cssClasses.active);
        nodeSelectors.container.classList.add('cart-open');
        Heedless.eventBus.emit('Cart:render');
        break;

      case 'checkout':
        nodeSelectors.container.classList.add('checkout-open');
        break;
    }

    nodeSelectors.overlay.classList.add(cssClasses.active);
  }

  /**
   * Close drawer.
   * @param {HTMLElement} drawer the drawer to close.
   */
  function closeDrawer(drawer) {
    if (drawer === 'cart') {
      nodeSelectors.container.classList.remove(cssClasses.active);
      nodeSelectors.container.classList.remove('cart-open');
      nodeSelectors.overlay.classList.remove(cssClasses.active);
    }

    nodeSelectors.container.classList.remove('checkout-open');
  }

  /**
   * Expose public interface.,
   */
  return Object.freeze({
    init,
  });
};