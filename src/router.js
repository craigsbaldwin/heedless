import Vue from 'vue';
import Router from 'vue-router';

// Page content
import Home from '@/components/Home';
import PageNotFound from '@/components/PageNotFound';

Vue.use(Router);

import Client from 'shopify-buy';

const client = Client.buildClient({
  domain: 'heedless.myshopify.com',
  storefrontAccessToken: 'ebc823ca217a89fecdc9cce9f063e902'
});

let data = '';

client.product.fetchAll().then((products) => {
  data = products;
});

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      data: data,
    },
    {
      path: '**',
      name: 'PageNotFound',
      component: PageNotFound,
    }
  ]
})