/**
 * Events
 * ------------------------------------------------------------------------------
 * Respond to events.
 *
 * @namespace events
 *
 */
import {on} from './utils';

/**
 * DOM selectors.
 */
const selectors = {
  cartCounter: '[js-cart="counter"]',
  cartDrawer: '[js-cart="drawer"]',
};

export default () => {

  /**
   * DOM node selectors.
   */
  const nodeSelectors = {
    cartCounter: [...document.querySelectorAll(selectors.cartCounter)],
    cartDrawer: document.querySelector(selectors.cartDrawer),
  };

  /**
   * Handle forward/back browser navigation.
   */
  window.onpopstate = function() {
    checkUrl();
  };

  /**
   * Check page's URL to load based on that.
   */
  function checkUrl() {
    if (location.href === `${location.origin}/`) {
      Heedless.templates.requestCollection('frontpage');
      return;
    }

    if (location.search) {
      const handle = location.search.replace('?product=', '');
      Heedless.templates.requestProductPage(handle);
    }
  }

  /**
   * Listen for all client events, filtered by needed.
   */
  function addEventListeners() {
    on('click', document.querySelector('body'), (event) => {
      if (isCorrectButton(event.target, 'addToCart')) {
        handleAddToCartClick(event.target);
        return;
      }

      if (isCorrectButton(event.target, 'viewProduct')) {
        handleViewProductClick(event.target);
        return;
      }

      if (isCorrectButton(event.target, 'closeProduct')) {
        handleCloseProductClick();
      }

      if (isCorrectButton(event.target, 'toggleCartDrawer')) {
        handleToggleCartDrawerClick();
      }
    });
  }

  /**
   * Test for correct button.
   * @param {HTMLElement} target the clicked item.
   * @param {String} attribute the desired attribute.
   * @returns {Boolean} whether it's the correct element.
   */
  function isCorrectButton(target, attribute) {
    return (
      typeof target.attributes['js-page'] !== 'undefined' &&
      target.getAttribute('js-page') === attribute
    );
  }

  /**
   * Update the history state.
   * @param {String} title history title.
   * @param {String} url the history url.
   */
  function updateHistory(title, url) {
    window.history.pushState({
      html: '',
      pageTitle: title,
    }, '', url);
  }

  /**
   * Add product to cart.
   * @param {HTMLElement} target the clicked button (has data attributes).
   */
  function handleAddToCartClick(target) {
    const variantId = target.getAttribute('data-id');
    const lineItem = {
      variantId,
      quantity: 1,
    };

    Heedless.cart.addToCart(lineItem);
  }

  /**
   * View a product page.
   * @param {HTMLElement} target the clicked button (has data attributes).
   */
  function handleViewProductClick(target) {
    const handle = target.getAttribute('data-handle');
    Heedless.templates.requestProductPage(handle);
  }

  /**
   * Handle the close product click.
   */
  function handleCloseProductClick() {
    Heedless.templates.requestCollection('frontpage');

    updateHistory('Homepage', '/');
    document.querySelector('[js-page="productPage"]').classList.remove('is-active');
    document.querySelector('[js-page="overlay"]').classList.remove('is-active');
  }

  /**
   * View a product page.
   */
  function handleToggleCartDrawerClick() {
    nodeSelectors.cartDrawer.classList.add('is-active');
  }

  return Object.freeze({
    checkUrl,
    addEventListeners,
    updateHistory,
  });
};
