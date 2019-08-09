/**
 * GraphQL: Products.
 * ------------------------------------------------------------------------------
 * Ways of accessing products and collections from API data.
 *
 * @namespace graphqlProducts
 *
 */
import fetch from 'node-fetch';

import collectionByHandle from './queries/collectionByHandle.graphql';
import productByHandle from './queries/productByHandle.graphql';
import products from './queries/productsSearch.graphql';

/**
 * Global variables.
 */
const shopUrl = 'https://heedless.myshopify.com';
const accessToken = 'ebc823ca217a89fecdc9cce9f063e902';
const method = 'post';
const headers = {
  'Content-Type': 'application/json',
  'X-Shopify-Storefront-Access-Token': accessToken,
};

export default () => {

  /**
   * Get products from a collection by handle.
   * @param {String} handle the collection handle.
   */
  function getCollectionByHandle(handle) {
    return new Promise((resolve) => {
      const query = {
        method,
        headers,
        body: JSON.stringify({
          query: collectionByHandle,
          variables: {
            handle,
          },
        }),
      };

      fetch(`${shopUrl}/api/graphql`, query)
        .then((response) => response.json())
        .then((response) => {
          if (response.errors) {
            throw new Error(response.errors[0].message);
          }

          const collection = response.data.collectionByHandle;
          resolve(convertGetCollectionByHandleResponse(collection));
        })
        .catch((error) => {
          window.console.log('getCollectionByHandle', error);
        });
    });
  }

  /**
   * Convert GraphQL response to something nicer.
   * @param {Object} response the original GraphQL response.
   */
  function convertGetCollectionByHandleResponse(response) {
    const convertedResponse = {};

    response.products.edges.forEach((product) => {
      const collections = [];

      product.node.collections.edges.forEach((collection) => {
        collections.push(collection.node.handle);
      });

      convertedResponse[product.node.handle] = {
        id: product.node.id,
        title: product.node.title,
        handle: product.node.handle,
        images: product.node.images.edges.map((image) => {
          return image.node;
        }),
        collections,
      };
    });

    return convertedResponse;
  }

  /**
   * Get a product by its handle.
   * @param {String} handle the product handle.
   */
  function getProductByHandle(handle) {
    return new Promise((resolve) => {
      const query = {
        method,
        headers,
        body: JSON.stringify({
          query: productByHandle,
          variables: {
            handle,
          },
        }),
      };

      fetch(`${shopUrl}/api/graphql`, query)
        .then((response) => response.json())
        .then((response) => {
          if (response.errors) {
            throw new Error(response.errors[0].message);
          }

          const product = response.data.productByHandle;
          resolve(convertGetProductByHandleResponse(product));
        })
        .catch((error) => {
          window.console.log('getProductByHandle', error);
        });
    });
  }

  /**
   * Convert GraphQL response to something nicer.
   * @param {Object} response the original GraphQL response.
   */
  function convertGetProductByHandleResponse(response) {
    const convertedResponse = {};

    convertedResponse[response.handle] = {
      id: response.id,
      title: response.title,
      handle: response.handle,
      images: response.images.edges.map((image) => {
        return image.node;
      }),
      descriptionHtml: response.descriptionHtml,
      variants: response.variants.edges.map((variant) => {
        return {
          title: variant.node.title,
          id: variant.node.id,
          price: variant.node.priceV2.amount,
        };
      }),
      fullRender: true,
    };

    return convertedResponse;
  }

  /**
   * Get a product by its handle.
   * @param {String} searchString the search query.
   */
  function getProductBySearchString(searchString) {
    return new Promise((resolve) => {
      const query = {
        method,
        headers,
        body: JSON.stringify({
          query: products,
          variables: {
            searchString,
          },
        }),
      };

      fetch(`${shopUrl}/api/graphql`, query)
        .then((response) => response.json())
        .then((response) => {
          if (response.errors) {
            throw new Error(response.errors[0].message);
          }

          const searchResult = response.data.products;
          resolve(convertGetProductBySearchStringResponse(searchResult));
        })
        .catch((error) => {
          window.console.log('getProductBySearchString', error);
        });
    });
  }

  /**
   * Convert GraphQL response to something nicer.
   * @param {Object} response the original GraphQL response.
   */
  function convertGetProductBySearchStringResponse(response) {
    const convertedResponse = response.edges.map((product) => {
      return {
        handle: product.node.handle,
        title: product.node.title,
        images: product.node.images.edges.map((image) => {
          return image.node;
        }),
        price: product.node.priceRange.minVariantPrice.amount,
      };
    });

    return convertedResponse;
  }

  /**
   * Expose public interface.
   */
  return Object.freeze({
    getCollectionByHandle,
    getProductByHandle,
    getProductBySearchString,
  });
};
