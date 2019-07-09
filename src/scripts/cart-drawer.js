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
};

export default () => {

  /**
   * DOM node selectors.
   */
  const nodeSelectors = {
    cartDrawer: document.querySelector(selectors.cartDrawer),
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
  }

  /**
   * Open the cart drawer.
   */
  function openDrawer() {
    nodeSelectors.cartDrawer.classList.add('is-active');
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
