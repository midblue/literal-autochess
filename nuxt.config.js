require('dotenv').config()

export default {
  mode: 'spa',
  env: {
    FIREBASE_APIKEY: process.env.FIREBASE_APIKEY,
    FIREBASE_AUTHDOMAIN: process.env.FIREBASE_AUTHDOMAIN,
    FIREBASE_PROJECTID: process.env.FIREBASE_PROJECTID,
  },
  head: {
    title: 'Literal Auto Chess',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
      },
    ],
    // link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    script: [],
  },

  loading: { color: '#fff' },

  css: [],
  plugins: [],
  buildModules: [],
  modules: [],
  router: {
    base: '/autochess/',
  },
  build: {
    extend(config, ctx) {},
  },
}
