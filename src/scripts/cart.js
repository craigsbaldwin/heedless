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
    setEventListeners();
    setCartCounter();
  }

  /**
   * Create cart if it doesn't already exist.
   */
  function createCart() {
    const cart = Cookies.getJSON('cart');

    if (cart) {
      Heedless.eventBus.emit('Cart:exists', cart);
      return;
    }

    graphql().createCheckout()
      .then((response) => {
        if (response) {
          const cartCookie = {
            id: response.id,
            webUrl: response.webUrl,
          };

          Cookies.set('cart', cartCookie);
          Heedless.eventBus.emit('Cart:created', cartCookie);
          return;
        }

        throw new Error('Response not found');
      })
      .catch((error) => error);
  }

  /**
   * Set listeners.
   */
  function setEventListeners() {
    Heedless.eventBus.listen([
      'Cart:created',
      'Cart:exists',
    ], (response) => setCheckoutLink(response.webUrl));
    Heedless.eventBus.listen('Cart:updated', (response) => handleCartUpdate(response));
  }

  /**
   * Add to cart.
   * No update checkout so have to store current items and re-set checkout.
   * @param {Object} lineItem line item object to add `{variantId: [variantId], quantity: [quantity]}`.
   */
  function addToCart(lineItem) {
    graphql().getCart()
      .then((response) => {
        if (response) {
          let alreadyInCart = false;
          let lineItems = [];

          /**
           * Check and increase quantity if already in cart.
           */
          response.forEach((item) => {
            if (item.variantId !== lineItem.variantId) {
              return;
            }

            item.quantity += lineItem.quantity;
            alreadyInCart = true;
          });

          /**
           * If in cart just use updated response.
           * Otherwise concat lineItem in.
           */
          if (alreadyInCart) {
            lineItems = response;
          } else {
            lineItems = response.concat(lineItem);
          }

          return replaceCheckoutLineItems(lineItems);
        }

        throw new Error('Response not found');
      })
      .catch((error) => error);
  }

  /**
   * Replaces the current checkout with new line items.
   * @param {Array} lineItems array of line items.
   */
  function replaceCheckoutLineItems(lineItems) {
    graphql().replaceCart(lineItems)
      .then((response) => {
        if (response) {
          const cart = response.data.checkoutLineItemsReplace.checkout;
          Heedless.eventBus.emit('Cart:updated', cart);
          return;
        }

        throw new Error('Response not found');
      })
      .catch((error) => error);
  }

  /**
   * Set the cart counter.
   */
  function setCartCounter() {
    const cart = Cookies.getJSON('cart');

    if (cart && cart.totalCount) {
      nodeSelectors.cartCounter.forEach((element) => {
        element.innerText = cart.totalCount;
      });
    }
  }

  /**
   * Update cart counter.
   * @param {Object} checkout the checkout response from GraphQL.
   */
  function handleCartUpdate(checkout) {
    let counter = 0;
    let lineItems = [];

    /**
     * Create cart items.
     */
    lineItems = checkout.lineItems.edges.map((lineItem) => {
      counter += lineItem.node.quantity;

      return {
        variantId: lineItem.node.variant.id,
        quantity: lineItem.node.quantity,
        title: lineItem.node.title,
      };
    });

    /**
     * Update cookie.
     */
    const cart = Cookies.getJSON('cart');

    cart.totalCount = counter;
    cart.lineItems = lineItems;

    Cookies.set('cart', cart);

    /**
     * Update counters.
     */
    updateCounter(counter);
  }

  /**
   * Update cart counters.
   * @param {Number} count the count to increase to.
   */
  function updateCounter(count) {
    nodeSelectors.cartCounter.forEach((element) => {
      element.innerText = count;
    });
  }

  /**
   * Update checkout link with response.
   * @param {String} url the checkout URL.
   */
  function setCheckoutLink(url) {
    console.log('url', url);
    nodeSelectors.checkoutLink.setAttribute('href', url);
  }

  return Object.freeze({
    init,
    addToCart,
  });
};
