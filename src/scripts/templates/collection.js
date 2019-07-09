/**
 * Collection
 * ------------------------------------------------------------------------------
 * Rendering of a collection.
 *
 * @namespace collection
 *
 */
import graphql from '../helpers/graphql';
import storage from '../helpers/storage';

export default () => {

  /**
   * Request a collection.
   * @param {String} handle the collection handle.
   */
  function requestCollection(handle) {
    if (Heedless.collections && Heedless.collections.hasOwnProperty(handle)) {
      window.console.log('Cached Collection');
      renderProducts(Heedless.collections[handle]);
      return;
    }

    graphql().getCollectionByHandle('frontpage', 5)
      .then((response) => {
        if (response) {
          renderProducts(response);
          storage().storeCollections(response);
          return;
        }

        throw new Error('Response not found');
      })
      .catch((error) => error);
  }

  /**
   * Render collection of products.
   * @param {Object} collection collection of products to render.
   */
  function renderProducts(collection) {
    const products = collection.products.edges;

    const html = products.map((productNode) => {
      const product = productNode.node;

      return `
      <div class="product-card" js-page="productCard">
        <div class="product-card__image">
          <img
            class="product-page__image"
            alt="${product.images.edges[0].node.altText}"
            src="${product.images.edges[0].node.smallImage}"
            srcset="
              ${product.images.edges[0].node.smallImage} 300w,
              ${product.images.edges[0].node.mediumImage} 600w"
            sizes="auto"
          >
        </div>

        <div
          class="product-card__footer"


        >
          <h2>${product.title}</h2>

          <button
            class="button"
            data-id="${product.variants.edges[0].node.id}"
            js-page="addToCart"
          >
            Add To Cart
          </button>

          <button
            class="button button--alt"
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
  }

  return Object.freeze({
    requestCollection,
  });
};
