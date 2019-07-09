/**
 * Cart Drawer
 * ------------------------------------------------------------------------------
 * Creates cart drawer and listens for events.
 *
 * @namespace cartDrawer
 *
 */

/**
 * DOM selectors.
 */
const selectors = {
  cartDrawer: '[js-cart="drawer"]',
  overlay: '[js-page="overlay"]',
};

export default () => {

  /**
   * DOM node selectors.
   */
  const nodeSelectors = {
    cartDrawer: document.querySelector(selectors.cartDrawer),
    overlay: document.querySelector(selectors.overlay),
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
    Heedless.eventBus.listen('Cart:updated', () => renderDrawer());
    Heedless.eventBus.listen('Cart:openDrawer', () => openDrawer());
    Heedless.eventBus.listen(['Cart:closeDrawer', 'Overlay:close'], () => closeDrawer());
  }

  /**
   * Open the cart drawer.
   */
  function openDrawer() {
    nodeSelectors.cartDrawer.classList.add('is-active');
    nodeSelectors.overlay.classList.add('is-active');
  }

  /**
   * Close the cart drawer.
   */
  function closeDrawer() {
    nodeSelectors.cartDrawer.classList.remove('is-active');
    nodeSelectors.overlay.classList.remove('is-active');
  }

  /**
   * Render the cart drawer.
   */
  function renderDrawer() {

  }

  return Object.freeze({
    init,
  });
};
