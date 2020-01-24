<template>

  <div class="q-pa-md">

    <div class="row q-gutter-x-md">
      <div class="col">
        <q-card bordered class="my-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6">Account</div>
              </div>

              <div class="col-auto">
                <q-btn color="grey-7" round flat icon="more_vert">
                  <q-menu cover auto-close>
                    <q-list>
                      <q-item clickable>
                        <q-item-section>Change Password</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </div>
          </q-card-section>

          <q-card-section>
            <q-input value="supakorn.k@admin.com" label="Username" readonly  />
          </q-card-section>
          <q-card-actions>
            <q-btn
              @click="confirm"
              label="Logout"
              color="red"
            />
          </q-card-actions>
        </q-card>
      </div>
      <div class="col">
        <q-card bordered class="my-card">
          <q-card-section>
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6">Profile</div>
              </div>

              <div class="col-auto">
                <q-btn color="grey-7" round flat icon="more_vert">
                  <q-menu cover auto-close>
                    <q-list>
                      <q-item clickable>
                        <q-item-section>View Profile</q-item-section>
                      </q-item>
                      <q-item clickable>
                        <q-item-section>Edit Profile</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </div>
          </q-card-section>

          <q-card-section>
            <q-input value="Supakorn" label="Firstname" readonly  />
            <q-input value="Kimhajan" label="Lastname" readonly  />
          </q-card-section>
        </q-card>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'PageIndex',
  data () {
    return {
      text: 'Supakorn.k@admin.com',
      ph: '',

      dense: false
    }
  },
  methods: {
    logout () {
      this.$q.cookies.remove('uid')
      this.$q.cookies.remove('pwd')
      this.$router.push({ path: '/' })
    },
    confirm () {
      this.$q.dialog({
        title: 'Confirm',
        message: 'Would you like to Logout',
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.logout()
      }).onOk(() => {
        // console.log('>>>> second OK catcher')
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }
  }
}
</script>
<style>
.my-card {
  height:200px;
}
</style>
