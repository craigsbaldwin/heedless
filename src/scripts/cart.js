/**
 * Cart
 * ------------------------------------------------------------------------------
 * Creates cart and interacts with cart.
 *
 * @namespace cart
 *
 */
import Cookies from 'js-cookie';

import graphql from './graphql';

/**
 * DOM selectors.
 */
const selectors = {
  checkoutLink: '[js-checkout="link"]',
};

export default () => {

  /**
   * DOM node selectors.
   */
  const nodeSelectors = {
    checkoutLink: document.querySelector(selectors.checkoutLink),
  };

  /**
   * Init the cart.
   */
  function init() {
    graphql().createCheckout()
      .then((response) => {
        if (response) {
          Cookies.set('cart', response.id);
          setCheckoutLink(response.webUrl);
          return;
        }

        throw new Error('Response not found');
      })
      .catch((error) => error);
  }

  /**
   * Add to cart.
   * No update checkout so have to store current items and re-set checkout.
   * @param {Object} lineItem line item object to add `{id: [id], quantity: [quantity]}`.
   */
  function addToCart(lineItem) {
    console.log('lineItem', lineItem);

    graphql().updateCheckout()
      .then((response) => {
        if (response) {
          console.log('response', response);
          return;
        }

        throw new Error('Response not found');
      })
      .catch((error) => error);
  }

  /**
   * Update checkout link with response.
   * @param {String} url the checkout URL.
   */
  function setCheckoutLink(url) {
    nodeSelectors.checkoutLink.setAttribute('href', url);
  }

  return Object.freeze({
    init,
    addToCart,
  });
};
