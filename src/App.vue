<template>
  <div>
    <ul>
      <li v-for="(link, index) in links" :key="index">
        <router-link :to="link.to">{{ link.name }}</router-link>
      </li>
    </ul>
    <main>
      <router-view/>
    </main>
  </div>
</template>

<script>
  export default {
    data: () => ({
      links: [
        {
          name: 'Home',
          to: '/'
        },
        {
          name: 'Bad Link',
          to: '/random-bad-url'
        }
      ]
    })
  }
</script>