<template>
  <div class="q-pa-md">

    <div class="row">
      <div class="col-2 col-md"></div>
      <div class="col-8 col-md">
        <form @submit.prevent="formSubmit">
          <q-input v-model="username" label="Username" />
          <q-input v-model="password" label="Password" type="password"  />
          <div style="color:red" v-if="errormsg">There is something wrong</div>
          <q-btn
            type="submit"
            :loading="submitting"
            :disable="submitting"
            label="Login"
            class="q-mt-md"
            color="primary"
          >
            <template v-slot:loading>
              <q-spinner-facebook />
            </template>
          </q-btn>
        </form>
      </div>
      <div class="col-2 col-md"></div>
    </div>

  </div>
</template>

<script>
var xmlrpc = require('xmlrpc')
export default {
  data () {
    return {
      submitting: false,
      username: '',
      password: '',
      uid: '',
      errormsg: false,
      db: process.env.DB,
      options: 30
    }
  },
  watch: {
    uid (val) {
      if (val !== '') {
        if (val !== false) {
          this.$q.cookies.set('uid', this.uid, this.options)
          this.$q.cookies.set('pwd', this.password, this.options)
          this.$router.push({ path: '/account' })
        } else {
          this.errormsg = true
        }
      }
    }
  },
  methods: {
    connectOdoo () {
      var client = xmlrpc.createClient(process.env.API + 'xmlrpc/2/common')
      // let uid = ''
      client.methodCall('authenticate', [this.db, this.username, this.password, ''], function (error, value) {
        if (error) {
          console.log('error:', error)
          console.log('req headers:', error.req && error.req._header)
          console.log('res code:', error.res && error.res.statusCode)
          console.log('res body:', error.body)
          this.submitting = false
        } else {
          this.uid = value
          this.submitting = false
        }
      }.bind(this))
    },
    formSubmit () {
      if (this.submitting === false) {
        this.uid = ''
        this.errormsg = false
        this.submitting = true
        this.connectOdoo()
      }
    }
  }
}
</script>

<style lang="sass" scoped>
  .row > div
    padding: 10px 15px
  .row + .row
    margin-top: 1rem
</style>
