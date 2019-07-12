/**
 * Cart Drawer
 * ------------------------------------------------------------------------------
 * Creates cart drawer and listens for events.
 *
 * @namespace cartDrawer
 *
 */

import Cookies from 'js-cookie';
import _merge from 'lodash.merge';

import {formatMoney, imageParameters} from '../helpers/utils';

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

    /**
     * Render loading state.
     */
    const html = cart.lineItems.map((lineItem) => {
      return lineItemTemplate(lineItem);
    }).join('');

    nodeSelectors.cartProducts.innerHTML = html;

    /**
     * Render loaded state.
     */
    cart.lineItems.forEach((lineItem) => {
      if (!Heedless.products) {
        requestLineItemData(lineItem);
        return;
      }

      /**
       * Find matching product and variant in storage.
       */
      const matchingProduct = Object.values(Heedless.products).find((product) => {
        return (product.variants && product.variants.some((variant) => variant.id === lineItem.variantId));
      });

      if (!matchingProduct || !matchingProduct.completeData) {
        requestLineItemData(lineItem);
        return;
      }

      const matchingVariant = matchingProduct.variants.find((variant) => {
        return (variant.id === lineItem.variantId);
      });

      /**
       * Create combined line item data.
       */
      const combinedLineItem = _merge(lineItem, matchingProduct);
      combinedLineItem.price = matchingVariant.price;
      combinedLineItem.variantTitle = matchingVariant.title;

      /**
       * Render using this data and replace existing.
       */
      const oldLineItem = nodeSelectors.cartProducts.querySelector(`[data-variant-id="${lineItem.variantId}"]`);
      const newLineItem = document.createElement('div');
      newLineItem.innerHTML = lineItemTemplate(combinedLineItem);
      oldLineItem.parentNode.replaceChild(newLineItem, oldLineItem);
    });
  }

  /**
   * The HTML template for each line item.
   * @param {Object} lineItem the line item.
   * @returns the HTML template.
   */
  function lineItemTemplate(lineItem) {
    let type = 'loading';
    let image = `<div class="loading"></div>`;
    let variantTitle = `<div class="loading"></div>`;
    let price = `<div class="loading"></div>`;

    if (lineItem.completeData) {
      type = 'complete';

      image = `
        <img
          class="line-item__image"
          alt="${lineItem.images[0].altText}"
          src="${imageParameters(lineItem.images[0].originalSrc, {size: '300x'})}"
          srcset="
            ${imageParameters(lineItem.images[0].originalSrc, {size: '300x'})} 300w,
            ${imageParameters(lineItem.images[0].originalSrc, {size: '600x'})} 600w",
            ${imageParameters(lineItem.images[0].originalSrc, {size: '900x'})} 900w",
            ${imageParameters(lineItem.images[0].originalSrc, {size: '1200x'})} 1200w",
          sizes="auto"
        >
      `;

      variantTitle = `– ${lineItem.variantTitle}`;

      price = `<span class="line-item__price">${formatMoney(lineItem.price)}</span>`;
    }

    return `
      <div
        class="cart-drawer__line-item line-item line-item--${type}"
        data-variant-id="${lineItem.variantId}"
      >
        <div class="line-item__image-container">
          ${image}
        </div>

        <div class="line-item__meta">
          <div class="line-item__title">
            ${lineItem.title}

            <span class="line-item__variant-title">
              ${variantTitle}
            </span>
          </div>

          <div class="line-item__price-container">
            ${lineItem.quantity}x ${price}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Request line item data from GraphQL is incomplete data.
   * @param {Object} lineItem the line item to request.
   */
  function requestLineItemData(lineItem) {

  }

  return Object.freeze({
    init,
  });
};
