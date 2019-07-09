/**
 * Product page
 * ------------------------------------------------------------------------------
 * Product page template
 *
 * @namespace product
 *
 */

import graphql from '../helpers/graphql';
import storage from '../helpers/storage';

/**
 * DOM selectors.
 */
const selectors = {
  overlay: '[js-page="overlay"]',
};

export default () => {

  /**
   * DOM node selectors.
   */
  const nodeSelectors = {
    overlay: document.querySelector(selectors.overlay),
  };

  /**
   * Init the product page.
   */
  function init() {
    setEventListeners();
  }

  /**
   * Listen for all client events, filtered by needed.
   */
  function setEventListeners() {
    Heedless.eventBus.listen('Product:open', (response) => openProductPage(response));
    Heedless.eventBus.listen('Product:close', () => closeProductPage());
  }

  /**
   * Open a product page.
   * @param {HTMLElement} target the clicked button (has data attributes).
   */
  function openProductPage(target) {
    const handle = target.getAttribute('data-handle');
    requestProductPage(handle);
  }

  /**
   * Close the product page.
   */
  function closeProductPage() {
    Heedless.collection.requestCollection('frontpage');
    Heedless.events.updateHistory('Homepage', '/');

    document.querySelector('[js-page="productPage"]').classList.remove('is-active');
    nodeSelectors.overlay.classList.remove('is-active');
  }

  /**
   * Request the product page.
   * @param {String} handle the product handle to render.
   */
  function requestProductPage(handle) {
    if (Heedless.products && Heedless.products.hasOwnProperty(handle)) {
      window.console.log('Cached Product Page');
      renderProduct(Heedless.products[handle]);
      return;
    }

    graphql().getProductByHandle(handle)
      .then((response) => {
        if (response) {
          renderProduct(response);
          storage().storeProducts(response);
          return;
        }

        throw new Error('Response not found');
      })
      .catch((error) => error);
  }

  /**
   * Render the product page.
   * @param {Object} product the product to load.
   */
  function renderProduct(product) {
    const url = `?product=${product.handle}`;

    Heedless.events.updateHistory(product.title, url);

    document.querySelector('[js-page="productPage"]').innerHTML = productTemplate(product);
    document.querySelector('[js-page="productPage"]').classList.add('is-active');
    document.querySelector('[js-page="overlay"]').classList.add('is-active');
  }

  /**
   * The product template.
   * @param {Object} product the product to render.
   * @returns {HTML} the product template.
   */
  function productTemplate(product) {
    return `
    <div class="product-page__image-container">
      <img class="product-page__image"
        alt="${product.images.edges[0].node.altText}"
        src="${product.images.edges[0].node.transformedSrc}"
      >
    </div>

    <div class="product-page__meta">
      <h1 class="product-page__title">${product.title}</h1>

      <div class="product-page__description">${product.descriptionHtml}</div>

      <strong class="product-page__price">
        ${formatMoney(product.variants.edges[0].node.priceV2.amount)}
      </strong>

      <button
        class="button button--large"
        data-id="${product.variants.edges[0].node.id}"
        js-page="addToCart"
      >
        Add To Cart
      </button>

      <button class="button button--large button--alt" js-page="closeProduct">Close</button>
    </div>
  `;
  }

  /**
   * Format money into correct format.
   * @param {String} amount the amount to format.
   */
  function formatMoney(amount) {
    return `£${amount}`;
  }

  return Object.freeze({
    init,
    requestProductPage,
  });
};
