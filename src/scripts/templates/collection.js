/**
 * Collection
 * ------------------------------------------------------------------------------
 * Rendering of a collection.
 *
 * @namespace collection
 *
 */
import graphql from '../helpers/graphql';
import {imageParameters} from '../helpers/utils';

/**
 * DOM selectors.
 */
const selectors = {
  homepage: '[js-page="homepage"]',
};

export default () => {

  /**
   * DOM node selectors.
   */
  const nodeSelectors = {
    homepage: document.querySelector(selectors.homepage),
  };

  /**
   * Init the collection page.
   */
  function init() {
    setEventListeners();
  }

  /**
   * Listen for all event bus events.
   */
  function setEventListeners() {
    Heedless.eventBus.listen('Collection:open', (response) => openCollectionPage(response));
  }

  /**
   * Request a collection.
   * @param {String} handle the collection handle.
   */
  function openCollectionPage(handle) {
    if (Heedless.collections && Heedless.collections.includes(handle)) {
      window.console.log('Cached Collection');
      renderProducts(handle);
      return;
    }

    renderLoadingTemplate();

    graphql().getCollectionByHandle(handle, 5)
      .then((response) => {
        if (response) {
          Heedless.eventBus.emit('Storage:update', response);
          Heedless.eventBus.emit('Storage:newCollection', handle);
          renderProducts(handle);
          return;
        }

        throw new Error('Response not found');
      })
      .catch((error) => error);
  }

  /**
   * Render the loading state template.
   */
  function renderLoadingTemplate() {
    let html = '';
    let width = 75;

    for (let step = 0; step < 4; step++) {
      width = ((Math.random() * 100) + 50);
      width = (width > 100) ? 90 : width;

      html += `
        <div class="product-card">
          <div class="product-card__image-container">
            <div class="loading"></div>
          </div>

          <div class="product-card__footer">
            <div class="product-card__title h2" style="width: ${width}%">
              <div class="loading"></div>
            </div>
          </div>
        </div>
      `;
    }

    nodeSelectors.homepage.innerHTML = html;
    nodeSelectors.homepage.classList.add('is-active');
  }

  /**
   * Render collection of products.
   * @param {String} handle the handle of the collection render.
   */
  function renderProducts(handle) {
    const collectionProducts = Object.values(Heedless.products).filter((product) => {
      return (product.collections.includes(handle));
    });

    const html = collectionProducts.map((product) => {
      return `
        <div class="product-card" js-page="productCard">
          <div class="product-card__image-container">
            <img
              class="product-card__image"
              alt="${product.images[0].altText}"
              src="${imageParameters(product.images[0].originalSrc, {size: '300x'})}"
              srcset="
                ${imageParameters(product.images[0].originalSrc, {size: '300x'})} 300w,
                ${imageParameters(product.images[0].originalSrc, {size: '600x'})} 600w",
                ${imageParameters(product.images[0].originalSrc, {size: '900x'})} 900w",
                ${imageParameters(product.images[0].originalSrc, {size: '1200x'})} 1200w",
              sizes="auto"
            >
          </div>

          <div class="product-card__footer">
            <h2 class="product-card__title">${product.title}</h2>

            <button
              class="button button--alt button--outline"
              data-handle="${product.handle}"
              js-page="viewProduct"
            >
              View Product
            </button>
          </div>
        </div>
      `;
    }).join('');

    nodeSelectors.homepage.innerHTML = html;
    nodeSelectors.homepage.classList.add('is-active');
  }

  return Object.freeze({
    init,
  });
};
