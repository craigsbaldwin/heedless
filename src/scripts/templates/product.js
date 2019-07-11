/**
 * Product page
 * ------------------------------------------------------------------------------
 * Product page template
 *
 * @namespace product
 *
 */

import graphql from '../helpers/graphql';

/**
 * DOM selectors.
 */
const selectors = {
  homepage: '[js-page="homepage"]',
  productPage: '[js-page="productPage"]',
  addToCartButton: '[js-page="addToCart"]',
};

export default () => {

  /**
   * DOM node selectors.
   */
  const nodeSelectors = {
    homepage: document.querySelector(selectors.homepage),
    productPage: document.querySelector(selectors.productPage),
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
    Heedless.eventBus.listen('Cart:updated', () => resetAddToCartButton());
  }

  /**
   * Request the product page.
   * @param {String} handle the product handle to render.
   */
  function openProductPage(handle) {
    if (Heedless.products && Heedless.products[handle].completeData) {
      window.console.log('Cached Product Page');
      renderProduct(handle);
      return;
    }

    graphql().getProductByHandle(handle)
      .then((response) => {
        if (response) {
          Heedless.eventBus.emit('Storage:updated', response);
          renderProduct(handle);
          return;
        }

        throw new Error('Response not found');
      })
      .catch((error) => error);
  }

  /**
   * Render the product page.
   * @param {String} handle the product handle to render.
   */
  function renderProduct(handle) {
    const product = Heedless.products[handle];
    const url = `?product=${product.handle}`;

    Heedless.events.updateHistory(product.title, url);

    nodeSelectors.productPage.innerHTML = productTemplate(product);
    nodeSelectors.homepage.classList.remove('is-active');
    nodeSelectors.productPage.classList.add('is-active');
  }

  /**
   * The product template.
   * @param {Object} product the product to render.
   * @returns {HTML} the product template.
   */
  function productTemplate(product) {
    return `
    <div class="product-page__breadcrumbs breadcrumbs">
      <a
        class="breadcrumbs__breadcrumb breadcrumbs__breadcrumb--link"
        href="javascript:void(0)"
        js-page="closeProduct"
      >
        Home
      </a>

      <span class="breadcrumbs__breadcrumb">
        ${product.title}
      </span>
    </div>

    <div class="product-page__image-container">
      <img
        class="product-page__image"
        alt="${product.images[0].altText}"
        src="${product.images[0].smallImage}"
        srcset="
          ${product.images[0].smallImage} 300w,
          ${product.images[0].mediumImage} 600w",
          ${product.images[0].largeImage} 900w",
        sizes="auto"
      >
    </div>

    <div class="product-page__meta">
      <h1 class="product-page__title">${product.title}</h1>

      <div class="product-page__description">${product.descriptionHtml}</div>

      <strong class="product-page__price">
        ${formatMoney(product.variants[0].price)}
      </strong>

      <button
        class="button button--large"
        data-id="${product.variants[0].id}"
        js-page="addToCart"
      >
        Add To Cart
      </button>
    </div>
  `;
  }

  /**
   * Format money into correct format.
   * @param {String} amount the amount to format.
   */
  function formatMoney(amount) {
    const value = Number(amount).toFixed(2);

    return `£${value}`;
  }

  /**
   * Close the product page.
   */
  function closeProductPage() {
    Heedless.collection.requestCollection('frontpage');
    Heedless.events.updateHistory('Homepage', '/');

    nodeSelectors.productPage.classList.remove('is-active');
    nodeSelectors.homepage.classList.add('is-active');
  }

  /**
   * Resets the add to cart button.
   */
  function resetAddToCartButton() {
    const addToCartButton = nodeSelectors.productPage.querySelector(selectors.addToCartButton);

    addToCartButton.classList.remove('is-disabled');
    addToCartButton.innerText = 'Added to Cart';

    window.setTimeout(() => {
      addToCartButton.innerText = 'Add to Cart';
    }, 2500);
  }

  return Object.freeze({
    init,
  });
};
