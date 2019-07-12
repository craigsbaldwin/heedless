/**
 * Product page
 * ------------------------------------------------------------------------------
 * Product page template
 *
 * @namespace product
 *
 */

import graphql from '../helpers/graphql';
import {on, formatMoney, imageParameters} from '../helpers/utils';

/**
 * DOM selectors.
 */
const selectors = {
  homepage: '[js-page="homepage"]',
  productPage: '[js-page="productPage"]',
  price: '[js-product="price"]',
  variantSelector: '[js-product="variantSelector"]',
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
   * Listen for all event bus events.
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
    if (Heedless.products && Heedless.products[handle]) {
      if (Heedless.products[handle].completeData) {
        window.console.log('Cached Product Page');
        renderProduct(handle);
        return;
      }

      nodeSelectors.productPage.innerHTML = productTemplate(Heedless.products[handle]);
      nodeSelectors.homepage.classList.remove('is-active');
      nodeSelectors.productPage.classList.add('is-active');
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

    setRenderedEventListeners();
  }

  /**
   * The product template.
   * @param {Object} product the product to render.
   * @returns {HTML} the product template.
   */
  function productTemplate(product) {
    let type = 'loading';
    let image = '<div class="loading"></div>';
    let description = '<div class="loading"></div>';
    let price = '<div class="loading"></div>';
    let variants = '<div class="loading"></div>';
    let addToCart = '<div class="loading"></div>';

    if (product.completeData) {
      type = 'complete';

      image = `
        <img
          class="product-page__image"
          alt="${product.images[0].altText}"
          src="${imageParameters(product.images[0].originalSrc, {size: '300x'})}"
          srcset="
            ${imageParameters(product.images[0].originalSrc, {size: '500x'})} 300w,
            ${imageParameters(product.images[0].originalSrc, {size: '800x'})} 600w",
            ${imageParameters(product.images[0].originalSrc, {size: '1200x'})} 900w",
            ${imageParameters(product.images[0].originalSrc, {size: '1500x'})} 1200w",
          sizes="auto"
        >
      `;

      description = product.descriptionHtml;

      price = `<strong class="product-page__price">${formatMoney(product.variants[0].price)}</strong>`;

      variants = `
        <select name="id" js-product="variantSelector">
          ${renderVariants(product.variants)}
        </select>
      `;

      addToCart = `
        <button
          class="button button--large"
          data-id="${product.variants[0].id}"
          js-page="addToCart"
        >
          Add To Cart
        </button>
      `;
    }

    return `
      <div class="product-page__container product-page--${type}">
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
          ${image}
        </div>

        <div class="product-page__meta">
          <h1 class="product-page__title">${product.title}</h1>

          <div class="product-page__description">
            ${description}
          </div>

          <div class="product-page__price-container" js-product="price">
            ${price}
          </div>

          <div class="product-page__variants">
            ${variants}
          </div>

          <div class="product-page__button-container">
            ${addToCart}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render the variant selectors.
   * @param {Object} variants the product's variants.
   */
  function renderVariants(variants) {
    const html = variants.map((variant) => {
      return `
        <option value="${variant.id}" data-price="${variant.price}">
          ${variant.title} - ${formatMoney(variant.price)}
        </option>
      `;
    }).join('');

    return html;
  }

  /**
   * Set event listeners which only work on render.
   */
  function setRenderedEventListeners() {
    on('change', nodeSelectors.productPage.querySelector(selectors.variantSelector), (event) => {
      handleVariantChange(event.target);
    });
  }

  /**
   * Handle variant select change.
   * @param {HTMLObject} target the changed select.
   */
  function handleVariantChange(target) {
    const selectedOption = target.querySelector(`[value="${target.value}"]`);

    const price = formatMoney(selectedOption.getAttribute('data-price'));

    nodeSelectors.productPage.querySelector(selectors.addToCartButton).setAttribute('data-id', selectedOption.value);
    nodeSelectors.productPage.querySelector(selectors.price).innerHTML = `<strong class="product-page__price">${price}</strong>`;
  }

  /**
   * Close the product page.
   */
  function closeProductPage() {
    Heedless.eventBus.emit('Collection:open', 'frontpage');
    Heedless.events.updateHistory('Homepage', '/');

    nodeSelectors.productPage.classList.remove('is-active');
  }

  /**
   * Resets the add to cart button.
   */
  function resetAddToCartButton() {
    const addToCartButton = nodeSelectors.productPage.querySelector(selectors.addToCartButton);

    addToCartButton.classList.remove('is-disabled');
    addToCartButton.innerText = 'Added to Cart';
    Heedless.eventBus.emit('Cart:openDrawer');

    window.setTimeout(() => {
      addToCartButton.innerText = 'Add to Cart';
    }, 2500);
  }

  return Object.freeze({
    init,
  });
};
