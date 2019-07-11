/**
 * Cart Drawer
 * ------------------------------------------------------------------------------
 * Creates cart drawer and listens for events.
 *
 * @namespace cartDrawer
 *
 */

import Cookies from 'js-cookie';

/**
 * DOM selectors.
 */
const selectors = {
  overlay: '[js-page="overlay"]',
  cartDrawer: '[js-cart="drawer"]',
  cartProducts: '[js-cart="products"]',
};

export default () => {

  /**
   * DOM node selectors.
   */
  const nodeSelectors = {
    overlay: document.querySelector(selectors.overlay),
    cartDrawer: document.querySelector(selectors.cartDrawer),
    cartProducts: document.querySelector(selectors.cartProducts),
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
    renderDrawer();

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
    const cart = Cookies.getJSON('cart');

    if (!cart.lineItems) {
      nodeSelectors.cartProducts.innerHTML = '<p>No products</p>';
      return;
    }

    console.log('cart', cart);
    cart.lineItems.forEach((lineItem) => {


      if (Heedless.collections && Heedless.collections.hasOwnProperty()) {
        return;
      }
    });
  }

  /**
   * The HTML template for each line item.
   * @param {Object} lineItem the line item.
   * @returns the HTML template.
   */
  function lineItemTemplate(lineItem) {

  }

  return Object.freeze({
    init,
  });
};
