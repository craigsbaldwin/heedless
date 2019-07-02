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
  cartCounter: '[js-cart="counter"]',
};

export default () => {

  /**
   * DOM node selectors.
   */
  const nodeSelectors = {
    checkoutLink: document.querySelector(selectors.checkoutLink),
    cartCounter: [...document.querySelectorAll(selectors.cartCounter)],
  };

  /**
   * Init the cart.
   */
  function init() {
    createCart();
    setCartCounter();
  }

  /**
   * Create cart if it doesn't already exist.
   */
  function createCart() {
    const cart = Cookies.get('cart');

    const defaultCart = {
      totalCount: 0,
      items: [],
    };

    if (!cart) {
      Cookies.set('cart', defaultCart);
    }
  }

  /**
   * Set the cart counter.
   */
  function setCartCounter() {
    const cart = JSON.parse(Cookies.get('cart'));

    if (cart.totalCount) {
      nodeSelectors.cartCounter.forEach((element) => {
        element.innerText = cart.totalCount;
      });
    }
  }

  /**
   * Add to cart.
   * No update checkout so have to store current items and re-set checkout.
   * @param {Object} lineItem line item object to add `{id: [id], quantity: [quantity]}`.
   */
  function addToCart(lineItem) {
    const cart = JSON.parse(Cookies.get('cart'));

    let alreadyInCart = false;

    cart.items.forEach((item) => {
      if (item.id !== lineItem.id) {
        return;
      }

      item.quantity += lineItem.quantity;
      alreadyInCart = true;
    });

    if (!alreadyInCart) {
      cart.items.push(lineItem);
    }

    cart.totalCount += lineItem.quantity;

    Heedless.eventBus.emit('Cart:updated', cart);

    Cookies.set('cart', cart);
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
