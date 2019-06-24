/**
 * Storage
 * ------------------------------------------------------------------------------
 * Stores data in localStorage.
 *
 * @namespace storage
 *
 */
export default() => {

  /**
   * Init the storage variables.
   */
  function init() {
    Heedless.collections = JSON.parse(localStorage.getItem('collections')) || {};
    Heedless.products = JSON.parse(localStorage.getItem('products')) || {};
  }

  /**
   * Add new single product to local storage.
   * @param {Object} product the content to add.
   */
  function storeProducts(product) {
    const productHandle = product.handle;
    const content = JSON.parse(localStorage.getItem('products'));

    if (content) {
      Heedless.products[productHandle] = product;
      localStorage.setItem('products', JSON.stringify(Heedless.products));
      return;
    }

    Heedless.products[productHandle] = product;
    localStorage.setItem('products', JSON.stringify(Heedless.products));
  }

  /**
   * Add new collection of products to local storage.
   * @param {Object} collection the collection of products to add.
   */
  function storeCollections(collection) {
    const collectionHandle = collection.handle;
    const content = JSON.parse(localStorage.getItem('collections'));

    if (content) {
      Heedless.collections[collectionHandle] = collection;
      localStorage.setItem('collections', JSON.stringify(Heedless.collections));
      return;
    }

    Heedless.collections[collectionHandle] = collection;
    localStorage.setItem('collections', JSON.stringify(Heedless.collections));
  }

  return Object.freeze({
    storeProducts,
    storeCollections,
    init,
  });
}
