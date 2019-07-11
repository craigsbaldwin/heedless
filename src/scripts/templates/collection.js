/**
 * Collection
 * ------------------------------------------------------------------------------
 * Rendering of a collection.
 *
 * @namespace collection
 *
 */
import graphql from '../helpers/graphql';

export default () => {

  /**
   * Request a collection.
   * @param {String} handle the collection handle.
   */
  function requestCollection(handle) {
    if (Heedless.collections && Heedless.collections.includes(handle)) {
      window.console.log('Cached Collection');
      renderProducts(handle);
      return;
    }

    graphql().getCollectionByHandle(handle, 5)
      .then((response) => {
        if (response) {
          Heedless.eventBus.emit('Storage:updated', response);
          Heedless.eventBus.emit('Storage:newCollection', handle);
          renderProducts(handle);
          return;
        }

        throw new Error('Response not found');
      })
      .catch((error) => error);
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
          <div class="product-card__image">
            <img
              class="product-page__image"
              alt="${product.images[0].altText}"
              src="${product.images[0].smallImage}"
              srcset="
                ${product.images[0].smallImage} 300w,
                ${product.images[0].mediumImage} 600w"
              sizes="auto"
            >
          </div>

          <div class="product-card__footer">
            <h2>${product.title}</h2>

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

    document.querySelector('[js-page="homepage"]').innerHTML = html;
    document.querySelector('[js-page="homepage"]').classList.add('is-active');
  }

  return Object.freeze({
    requestCollection,
  });
};
