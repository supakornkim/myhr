<template>

  <div class="q-pa-md">
    <q-dialog v-model="layout" @input="change">
      <q-layout view="Lhh lpR fff" container class="bg-white">
        <q-header class="bg-primary">
          <q-toolbar>
            <q-toolbar-title>Take Leave</q-toolbar-title>
            <q-btn flat v-close-popup round dense icon="close" />
          </q-toolbar>
        </q-header>

        <q-page-container>
          <q-page padding>
            <q-card class="my-card">
              <q-card-section>
                <div class="text-h6">Leave Type</div>
              </q-card-section>

              <q-separator />

              <q-card-actions vertical>
                <q-select ref="leavetype" outlined
                v-model="selectLeaveType"
                label="Leave Type"
                :options="options"
                :rules="[ val => !!val || 'Please select leave type']"
                />
              </q-card-actions>
            </q-card>
            <q-card class="my-card">
              <q-card-section>
                <div class="text-h6">Duration</div>
              </q-card-section>

              <q-separator />

              <q-card-actions vertical>

                <div class="q-pa-md">

                  <div class="row">
                    <div class="col">
                      From <span style="color:red" v-if="dateduplicate">You already take leave on this date</span>
                      <q-input ref="inputdatefromref" filled v-model="inputdatefrom"
                      mask="date"
                      :rules="['date']">
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="qDateProxyFrom" transition-show="scale" transition-hide="scale">
                              <q-date label="from" v-model="inputdatefrom" @input="calDuration('close')" />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col">
                      To
                      <q-input ref="inputdatetoref" filled v-model="inputdateto"
                      mask="date"
                      :rules="['date']"
                      v-show="half === false">
                        <template v-slot:append>
                          <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                              <q-date v-model="inputdateto" @input="calDuration('close')" />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                      <q-select outlined v-model="model" :options="halfmoraf" v-show="half === true"/>
                    </div>
                  </div>
                  <div class="q-pa-md">
                    <div class="q-gutter-sm">
                      Duration : {{ this.submitLeaveForm.number_of_days }} Day(s)
                    </div>
                  </div>
                  <div class="q-pa-md">
                    <div class="q-gutter-sm">
                      <q-checkbox v-model="half" @input='calDuration' label="Half Day" />
                    </div>
                  </div>
                </div>

              </q-card-actions>
            </q-card>

            <q-card class="my-card">
              <q-card-section>
                <div class="text-h6">Description</div>
              </q-card-section>

              <q-separator />

              <q-card-actions vertical>
                <q-input
                  v-model="submitLeaveForm.name"
                  filled
                  type="textarea"
                />
              </q-card-actions>
            </q-card>
            <q-btn color="primary" @click="submittest" label="Submit" style="width:100%" />
          </q-page>
        </q-page-container>
      </q-layout>
    </q-dialog>

  <div class="q-pa-md">
    <div class="q-gutter-y-md">
      <q-card>
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="takeleave" label="Take Leave" />
          <q-tab name="history" label="history" />
          <q-tab name="manager" label="manager" v-if="leaveApproveList.length > 0"/>
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="takeleave">
            <div class="row">
              <div class="col-12 col-md-10">
                <q-toolbar>
                  <q-btn stretch flat label="Prev" @click="calendarPrev" />
                  <q-separator vertical />
                  <q-btn stretch flat label="Next" @click="calendarNext" />
                  <q-separator vertical />
                  <span class="q-mr-xl q-toolbar__title nowrap" >{{ month }} {{ year }}</span>
                </q-toolbar>
                <q-separator />
                <q-calendar
                  @click:day="clickCalendar"
                  @click:date="clickCalendar"
                  ref="calendar"
                  v-model="selectedDateFrom"
                  view="month"
                  locale="en-us"
                  animated
                  transition-prev="slide-right"
                  transition-next="slide-left"
                  style="height: 500px; overflow: hidden"
                  :disabled-days="disabledDays"
                  :day-style="modifiedStyle"
                >
                <template #day="{ date }">
                  <template v-for="(event, index) in getEvents(date)">
                    <q-badge
                      :key="index"
                      style="width: 100%; cursor: pointer;"
                      class="ellipsis"
                      :class="badgeClasses(event, 'day')"
                      :style="badgeStyles(event, 'day')"
                    >
                      <q-icon v-if="event.icon" :name="event.icon" class="q-mr-xs"></q-icon><span class="ellipsis">{{ event.title }}</span>
                    </q-badge>
                  </template>
                </template>
                </q-calendar>

              </div>
              <div class="col-12 col-md-2">
                <div class="q-pa-md row items-start q-gutter-md">
                  <!--<q-card flat bordered class="my-card">
                    <q-card-section>
                      <div class="text-h6">Holidays</div>
                    </q-card-section>

                    <q-separator inset />

                    <q-card-section v-for="(holida,index) in holidays" :key="index">
                      {{ holida.date }} {{ holida.display_name }}
                    </q-card-section>
                  </q-card>-->
                  <!--<q-card flat bordered class="my-card">
                    <q-card-section>
                      <div class="text-h6">Leaves</div>
                    </q-card-section>

                    <q-separator inset />

                    <q-card-section v-for="(sevent,index) in events" :key="index">
                      {{ sevent.date }} {{ sevent.details }}
                    </q-card-section>
                  </q-card>-->
                </div>
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="history">
            <q-table
              title="History"
              :data="data"
              :columns="columns"
              row-key="name"
            >
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="creator" :props="props">
                    {{ props.row.creator }}
                  </q-td>
                  <q-td key="leavetype" :props="props">
                    {{ props.row.leavetype }}
                  </q-td>
                  <q-td key="from" :props="props">
                    {{ props.row.from }}
                  </q-td>
                  <q-td key="to" :props="props">
                    {{ props.row.to }}
                  </q-td>
                  <q-td key="count" :props="props">
                    {{ props.row.count }}
                  </q-td>
                  <q-td key="status" :props="props">
                    <span v-if="props.row.status == 'validate'">Validated</span>
                    <span v-if="props.row.status == 'validate1'">Approved</span>
                    <span v-if="props.row.status == 'confirm'">Submitted</span>
                    <span v-if="props.row.status == 'refuse'">Rejected</span>
                  </q-td>
                  <q-td key="action" :props="props">
                    <q-btn
                      v-if="props.row.status === 'confirm'"
                      color="red"
                      label="Cancel"
                      @click="confirmAction('Cancel Leave Request', 'cancel', props.row.id)"
                    />
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-tab-panel>

          <q-tab-panel name="manager">
            <q-table
              title="Leave List"
              :data="leaveApproveList"
              :columns="columns"
              row-key="name"
            >
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="creator" :props="props">
                    {{ props.row.creator }}
                  </q-td>
                  <q-td key="leavetype" :props="props">
                    {{ props.row.leavetype }}
                  </q-td>
                  <q-td key="from" :props="props">
                    {{ props.row.from }}
                  </q-td>
                  <q-td key="to" :props="props">
                    {{ props.row.to }}
                  </q-td>
                  <q-td key="count" :props="props">
                    {{ props.row.count }}
                  </q-td>
                  <q-td key="status" :props="props">
                    <span v-if="props.row.status == 'validate'">Validated</span>
                    <span v-if="props.row.status == 'validate1'">Approved</span>
                    <span v-if="props.row.status == 'confirm'">Submitted</span>
                    <span v-if="props.row.status == 'refuse'">Rejected</span>
                  </q-td>
                  <q-td key="action" :props="props">
                    <q-btn
                      v-if="props.row.status === 'confirm'"
                      color="primary"
                      label="Approve"
                      @click="confirmAction('Approve Leave Request', 'validate1', props.row.id)"
                    />
                    <q-btn
                      style="margin-left:5px;"
                      v-if="props.row.status === 'confirm'"
                      color="red"
                      label="Reject"
                      @click="confirmAction('Reject Leave Request', 'refuse', props.row.id)"
                    />
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </div>

  </div>
</template>

<script>
import { date, colors } from 'quasar'
var xmlrpc = require('xmlrpc')
export default {
  name: 'takeleave',
  data () {
    return {
      tab: 'takeleave',
      month: '',
      year: '',
      inputdatefrom: '',
      inputdateto: '',
      buttonnextprev: '',
      selectedDateFrom: '',
      selectedDateTo: '',
      model: 'Morning',
      disabledDays: [],
      holidays: [],
      options: [],
      halfmoraf: [
        'Morning', 'Afternoon'
      ],
      leaveType: [],
      selectLeaveType: '',
      half: false,
      db: process.env.DB,
      username: 'ttt@ttt.com', // supakorn@gmail.com supakorn.kim@gmail.com admin@gmail.com ttt@ttt.com
      password: this.$q.cookies.get('pwd'),
      layout: false,
      uid: this.$q.cookies.get('uid'),
      resource_calendar_id: '',
      working_time: [],
      working_day: [],
      submitLeaveForm: {
        date_from: '',
        date_to: '',
        holiday_status_id: '',
        request_date_from: '',
        request_date_to: '',
        name: '',
        number_of_days: 1,
        request_date_from_period: 'am'
      },
      params: {
        employee_id: 2
      },

      moreContent: true,
      drawer: false,
      drawerR: false,
      dateduplicate: false,
      leaveApproveList: [],

      lorem: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Natus, ratione eum minus fuga, quasi dicta facilis corporis magnam, suscipit at quo nostrum!',

      events: [],
      columns: [
        { name: 'creator', align: 'left', label: 'Creator', field: 'creator' },
        { name: 'leavetype', align: 'left', label: 'Leave Type', field: 'leavetype' },
        { name: 'from', align: 'center', label: 'From', field: 'from' },
        { name: 'to', align: 'center', label: 'To', field: 'to' },
        { name: 'count', align: 'center', label: 'Duration', field: 'count' },
        { name: 'status', align: 'left', label: 'Status', field: 'status' },
        { name: 'action', align: 'center', label: 'Action', field: 'action' }
      ],
      data: []
    }
  },
  computed: {
    contentSize () {
      return this.moreContent ? 150 : 5
    }
  },
  watch: {
    /* selectedDateFrom (val) {
      console.log('val ' + val)
      console.log('next ' + this.buttonnextprev)
      if (val !== '') {
        if (this.buttonnextprev === '') {
          this.layout = true
          let newDate = new Date(val)
          let adjustedDate = date.formatDate(newDate, 'YYYY/MM/DD')
          this.inputdatefrom = adjustedDate
          this.inputdateto = adjustedDate
          this.calDuration()
        } else {
        }
        this.buttonnextprev = ''
      }
    },
    buttonnextprev (val) {
      console.log(val)
    }, */
    uid (val) {
      if (val !== '') {
        // console.log(val)
        this.publicHolidays()
        this.getLeaveType()
        this.getLeave()
        this.getHrData()
      }
    },
    resource_calendar_id (val) {
      if (val !== '') {
        this.getResource()
        // console.log('value:', this.resource_calendar_id)
      }
    }
  },
  methods: {
    modifiedStyle (scope) {
      if (scope.disabled === true) {
        return {
          backgroundColor: '#ffcb9c!important'
        }
      }
      return {}
    },
    change (val) {
      if (val === false) {
        // this.selectedDateFrom = ''
      }
    },
    calendarNext () {
      this.$refs.calendar.next()
      this.month = date.formatDate(new Date(this.selectedDateFrom), 'MMMM')
      this.year = date.formatDate(new Date(this.selectedDateFrom), 'YYYY')
      this.buttonnextprev = 'click'
    },
    calendarPrev () {
      this.$refs.calendar.prev()
      this.month = date.formatDate(new Date(this.selectedDateFrom), 'MMMM')
      this.year = date.formatDate(new Date(this.selectedDateFrom), 'YYYY')
      this.buttonnextprev = 'click'
    },
    checkVersion () {
      var client = xmlrpc.createClient(process.env.API + 'xmlrpc/2/common')
      client.methodCall('version', [], function (error, value) {
        if (error) {
          console.log('error:', error)
          console.log('req headers:', error.req && error.req._header)
          console.log('res code:', error.res && error.res.statusCode)
          console.log('res body:', error.body)
        } else {
          console.log('value:', value)
        }
      })
    },
    connectOdoo () {
      var client = xmlrpc.createClient(process.env.API + 'xmlrpc/2/common')
      // let uid = ''
      client.methodCall('authenticate', [this.db, this.username, this.password, ''], function (error, value) {
        if (error) {
          console.log('error:', error)
          console.log('req headers:', error.req && error.req._header)
          console.log('res code:', error.res && error.res.statusCode)
          console.log('res body:', error.body)
        } else {
          // console.log('value:', value)
          this.uid = value
        }
      }.bind(this))
    },
    callObject () {
      var client = xmlrpc.createClient(process.env.API + 'xmlrpc/2/object')
      client.methodCall('execute_kw', [this.db, 2, this.password, 'res.partner', 'check_access_rights', ['read']], function (error, value) {
        if (error) {
          console.log('error:', error)
          console.log('req headers:', error.req && error.req._header)
          console.log('res code:', error.res && error.res.statusCode)
          console.log('res body:', error.body)
        } else {
          console.log('value:', value)
        }
      })
    },
    publicHolidays () {
      var client = xmlrpc.createClient(process.env.API + 'xmlrpc/2/object')
      var arr = []
      client.methodCall('execute_kw', [this.db, this.uid, this.password.toString(), 'hr.holidays.public.line', 'search_read', []], function (error, value) {
        if (error) {
          console.log('error:', error)
          console.log('req headers:', error.req && error.req._header)
          console.log('res code:', error.res && error.res.statusCode)
          console.log('res body:', error.body)
        } else {
          // console.log('value:', value)
          this.holidays = value
          value.forEach(function (item) {
            arr.push(item.date)
            // do something
          })
        }
      }.bind(this))
      // console.log(arr)
      this.disabledDays = arr
      // console.log(this.disabledDays)
    },
    getLeaveType () {
      // this.$q.loading.show()
      var client = xmlrpc.createClient(process.env.API + 'xmlrpc/2/object')
      let arr = []
      client.methodCall('execute_kw', [this.db, this.uid, this.password.toString(), 'hr.leave.type', 'search_read', ['']], function (error, value) {
        if (error) {
          console.log('error:', error)
          console.log('req headers:', error.req && error.req._header)
          console.log('res code:', error.res && error.res.statusCode)
          console.log('res body:', error.body)
        } else {
          // console.log('value:', value)
          this.leaveType = value
          value.forEach(function (item) {
            arr.push({ 'label': item.name + ' (' + item.virtual_remaining_leaves + ' remaining out of ' + item.max_leaves + ' days)', 'value': item.id })
          })
        }
        // this.$q.loading.hide()
      }.bind(this))
      this.options = arr
    },
    getLeave () {
      // this.$q.loading.show()
      var client = xmlrpc.createClient(process.env.API + 'xmlrpc/2/object')
      this.events = []
      client.methodCall('execute_kw', [this.db, this.uid, this.password.toString(), 'hr.leave', 'search_read', [[['create_uid', '=', this.uid]]]], function (error, value) {
        if (error) {
          console.log('error:', error)
          console.log('req headers:', error.req && error.req._header)
          console.log('res code:', error.res && error.res.statusCode)
          console.log('res body:', error.body)
        } else {
          // console.log('value:', value)
          let bbgcolor
          value.forEach(function (item) {
            if (item.state === 'validate') {
              bbgcolor = 'green'
            }
            if (item.state === 'validate1') {
              bbgcolor = 'purple'
            }
            if (item.state === 'confirm') {
              bbgcolor = 'grey'
            }
            if (item.state === 'refuse') {
              bbgcolor = 'red'
            }
            this.events.push({ title: item.holiday_status_id[1], days: item.number_of_days, details: item.name, date: item.request_date_from, bgcolor: bbgcolor })
            this.data.push({
              creator: item.create_uid[1],
              leavetype: item.holiday_status_id[1],
              from: item.date_from,
              to: item.date_to,
              count: item.number_of_days,
              status: item.state,
              id: item.id
            })
            bbgcolor = ''
            // console.log('value:', this.data)
          }.bind(this))
        }
        // this.$q.loading.hide()
      }.bind(this))
      // console.log(this.events)
    },
    getLeaveApprove () {
      this.$q.loading.show()
      var client = xmlrpc.createClient(process.env.API + 'xmlrpc/2/object')
      client.methodCall('execute_kw', [this.db, this.uid, this.password.toString(), 'hr.leave', 'search_read', []], function (error, value) {
        if (error) {
          console.log('error:', error)
          console.log('req headers:', error.req && error.req._header)
          console.log('res code:', error.res && error.res.statusCode)
          console.log('res body:', error.body)
        } else {
          // console.log('Approve value:', value)
          value.forEach(function (item) {
            if (item.can_approve === true) {
              this.leaveApproveList.push({
                creator: item.create_uid[1],
                leavetype: item.holiday_status_id[1],
                from: item.date_from,
                to: item.date_to,
                count: item.number_of_days,
                status: item.state,
                id: item.id
              })
            }
          }.bind(this))
        }
        this.$q.loading.hide()
      }.bind(this))
      // console.log(this.events)
    },
    deleteLeave (id) {
      this.data = []
      this.$q.loading.show()
      var client = xmlrpc.createClient(process.env.API + 'xmlrpc/2/object')
      client.methodCall('execute_kw', [this.db, this.uid, this.password.toString(), 'hr.leave', 'unlink', [[id]]], function (error, value) {
        if (error) {
          console.log('error:', error)
          console.log('req headers:', error.req && error.req._header)
          console.log('res code:', error.res && error.res.statusCode)
          console.log('res body:', error.body)
        } else {
          // console.log('done')
          this.getLeave()
          this.getLeaveType()
          this.getLeaveApprove()
        }
        // this.$q.loading.hide()
      }.bind(this))
      // console.log(this.events)
    },
    updateLeave (action, id) {
      this.leaveApproveList = []
      this.$q.loading.show()
      var client = xmlrpc.createClient(process.env.API + 'xmlrpc/2/object')
      client.methodCall('execute_kw', [this.db, this.uid, this.password.toString(), 'hr.leave', 'write', [[id], { state: action }]], function (error, value) {
        if (error) {
          console.log('error:', error)
          console.log('req headers:', error.req && error.req._header)
          console.log('res code:', error.res && error.res.statusCode)
          console.log('res body:', error.body)
        } else {
          // console.log('done')
          this.getLeave()
          this.getLeaveType()
          this.getLeaveApprove()
        }
        // this.$q.loading.hide()
      }.bind(this))
      // console.log(this.events)
    },
    calDuration (text) {
      if (text === 'close') {
        this.$refs.qDateProxyFrom.hide()
        this.$refs.qDateProxy.hide()
      }
      this.dateduplicate = false
      let fromdate2 = new Date(date.formatDate(new Date(this.inputdatefrom), 'YYYY-MM-DD'))
      let todate2 = new Date(date.formatDate(new Date(this.inputdateto), 'YYYY-MM-DD'))
      let difdate = new Date(todate2) - new Date(fromdate2)
      difdate = (difdate / (60 * 60 * 24 * 1000)) + 1
      if (difdate <= 0) {
        this.inputdateto = this.inputdatefrom
        todate2 = new Date(date.formatDate(new Date(this.inputdateto), 'YYYY-MM-DD'))
        difdate = new Date(todate2) - new Date(fromdate2)
        difdate = (difdate / (60 * 60 * 24 * 1000)) + 1
        // this.calDuration()
      }
      // console.log(fromdate2 + ' ' + todate2 + ' ' + difdate)
      let datecal = fromdate2
      let dayfind
      let difdate2 = difdate
      for (let i = 0; i < difdate2; i++) { // find holiday and no work day
        dayfind = date.formatDate(datecal, 'd') - 1
        var filtered = this.working_day.filter(function (el) {
          return el === dayfind
        })
        if (filtered.length === 0) { // no workingday no leave
          difdate = difdate - 1
        }
        if (dayfind === 5) { // saturday leave 0.5
          difdate = difdate - 0.5
        }
        datecal = date.addToDate(datecal, { days: 1 })
      }
      this.holidays.forEach(function (item) {
        if ((fromdate2 <= new Date(item.date)) && (new Date(item.date) <= todate2)) {
          difdate = difdate - 1
        }
      })
      if (difdate < 0) {
        // console.log('ddd')
        this.submitLeaveForm.number_of_days = 'Incorrect'
      } else {
        this.submitLeaveForm.number_of_days = difdate
      }
      if (this.half === true) {
        if (difdate <= 0) {
          this.submitLeaveForm.number_of_days = 0
        } else {
          this.submitLeaveForm.number_of_days = 0.5
        }
      }
    },
    formValidate () {
      let result = true
      this.$refs.leavetype.validate()
      this.$refs.inputdatefromref.validate()
      this.$refs.inputdatetoref.validate()
      if (this.$refs.leavetype.hasError) {
        this.$refs.leavetype.focus()
        result = false
      }
      if (result !== false) {
        if (this.$refs.inputdatefromref.hasError) {
          this.$refs.inputdatefromref.focus()
          result = false
        }
      }
      if (result !== false) {
        if (this.$refs.inputdatetoref.hasError) {
          this.$refs.inputdatetoref.focus()
          result = false
        }
      }

      let dateFrom = this.inputdatefrom
      let dateTo = this.inputdateto
      let newDate = new Date(dateFrom)
      dateFrom = date.formatDate(newDate, 'YYYY/MM/DD')
      newDate = new Date(dateTo)
      dateTo = date.formatDate(newDate, 'YYYY/MM/DD')

      this.data.forEach(function (item) {
        let datadate = date.formatDate(item.from, 'YYYY/MM/DD')
        let datadateto = date.formatDate(item.to, 'YYYY/MM/DD')
        if ((dateFrom === datadate) || (dateTo === datadate)) {
          this.dateduplicate = true
          this.$refs.inputdatefromref.focus()
          result = false
        }
        if ((dateFrom === datadateto) || (dateTo === datadateto)) {
          this.dateduplicate = true
          this.$refs.inputdatefromref.focus()
          result = false
        }
      }.bind(this))
      // console.log(datefound)
      return result
    },
    submittest () {
      if (this.formValidate() === true) {
        this.submitLeaveForm.holiday_status_id = this.selectLeaveType.value
        let dateFrom = this.inputdatefrom
        let dateTo = this.inputdateto
        let newDate = new Date(dateFrom)
        dateFrom = date.formatDate(newDate, 'YYYY-MM-DD')
        newDate = new Date(dateTo)
        dateTo = date.formatDate(newDate, 'YYYY-MM-DD')
        let timeFromMorning = ' 08:00:00'
        let timeToMorning = ' 12:00:00'
        let timeFromAfternoon = ' 13:30:00'
        let timeToAfternoon = ' 17:00:00'
        let datetimeForm = dateFrom + timeFromMorning
        let datetimeAfternoonForm = dateFrom + timeFromAfternoon
        let datetimeTo = dateTo + timeToAfternoon
        let datetimeMorningTo = dateTo + timeToMorning
        if (this.half === false) {
          this.submitLeaveForm.date_from = datetimeForm
          this.submitLeaveForm.date_to = datetimeTo
          this.submitLeaveForm.request_date_from = dateFrom
          this.submitLeaveForm.request_date_to = dateTo
        } else {
          if (this.model === 'Morning') {
            this.submitLeaveForm.date_from = datetimeForm
            this.submitLeaveForm.date_to = datetimeMorningTo
            this.submitLeaveForm.request_date_from = dateFrom
            this.submitLeaveForm.request_date_to = dateTo
          }
          if (this.model === 'Afternoon') {
            this.submitLeaveForm.date_from = datetimeAfternoonForm
            this.submitLeaveForm.date_to = datetimeTo
            this.submitLeaveForm.request_date_from = dateFrom
            this.submitLeaveForm.request_date_to = dateTo
          }
        }
        this.confirm()
      }
    },
    submitLeave () {
      this.$q.loading.show()
      var client = xmlrpc.createClient(process.env.API + 'xmlrpc/2/object')
      client.methodCall('execute_kw', [this.db, this.uid, this.password.toString(), 'hr.leave', 'create', [this.submitLeaveForm]], function (error, value) {
        if (error) {
          console.log('error:', error)
          console.log('req headers:', error.req && error.req._header)
          console.log('res code:', error.res && error.res.statusCode)
          console.log('res body:', error.body)
        } else {
          // console.log('value:', value)
          if (value !== '') {
            // this.getLeave()
            // window.location.href = 'takeleave'
            location.reload()
            // this.layout = false
          }
        }
      })
    },
    getResource () {
      var client = xmlrpc.createClient(process.env.API + 'xmlrpc/2/object')
      client.methodCall('execute_kw', [this.db, this.uid, this.password.toString(), 'resource.calendar.attendance', 'search_read', [[['calendar_id', '=', this.resource_calendar_id]]]], function (error, value) {
        if (error) {
          console.log('error:', error)
          console.log('req headers:', error.req && error.req._header)
          console.log('res code:', error.res && error.res.statusCode)
          console.log('res body:', error.body)
        } else {
          // console.log('value:', value)
          value.forEach(function (item) {
            this.working_time.push(item)
            this.working_day.push(+item.dayofweek)
            // do something
          }.bind(this))
        }
      }.bind(this))
      // console.log(this.working_day)
    },
    getHrData () {
      var client = xmlrpc.createClient(process.env.API + 'xmlrpc/2/object')
      client.methodCall('execute_kw', [this.db, this.uid, this.password.toString(), 'hr.employee', 'search_read', [[['user_id', '=', this.uid]]]], function (error, value) {
        if (error) {
          console.log('error:', error)
          console.log('req headers:', error.req && error.req._header)
          console.log('res code:', error.res && error.res.statusCode)
          console.log('res body:', error.body)
        } else {
          // console.log('value:', value)
          if (value.length > 0) {
            this.resource_calendar_id = value['0'].resource_calendar_id['0']
          }
        }
      }.bind(this))
    },
    isCssColor (color) {
      return !!color && !!color.match(/^(#|(rgb|hsl)a?\()/)
    },

    badgeClasses (event, type) {
      const cssColor = this.isCssColor(event.bgcolor)
      const isHeader = type === 'header'
      return {
        [`text-white bg-${event.bgcolor}`]: !cssColor,
        'full-width': !isHeader && (!event.side || event.side === 'full'),
        'left-side': !isHeader && event.side === 'left',
        'right-side': !isHeader && event.side === 'right'
      }
    },

    badgeStyles (event, type, timeStartPos, timeDurationHeight) {
      const s = {}
      if (this.isCssColor(event.bgcolor)) {
        s['background-color'] = event.bgcolor
        s.color = colors.luminosity(event.bgcolor) > 0.5 ? 'black' : 'white'
      }
      if (timeStartPos) {
        s.top = timeStartPos(event.time) + 'px'
      }
      if (timeDurationHeight) {
        s.height = timeDurationHeight(event.duration) + 'px'
      }
      s['align-items'] = 'flex-start'
      return s
    },

    getEvents (dt) {
      const events = []
      for (let i = 0; i < this.events.length; ++i) {
        let added = false
        if (this.events[i].date === dt) {
          if (this.events[i].time) {
            if (events.length > 0) {
              // check for overlapping times
              const startTime = new Date(this.events[i].date + ' ' + this.events[i].time)
              const endTime = date.addToDate(startTime, { minutes: this.events[i].duration })
              for (let j = 0; j < events.length; ++j) {
                const startTime2 = new Date(events[j].date + ' ' + events[j].time)
                const endTime2 = date.addToDate(startTime2, { minutes: events[j].duration })
                if (date.isBetweenDates(startTime, startTime2, endTime2) || date.isBetweenDates(endTime, startTime2, endTime2)) {
                  events[j].side = 'left'
                  this.events[i].side = 'right'
                  events.push(this.events[i])
                  added = true
                  break
                }
              }
            }
          }
          if (!added) {
            this.events[i].side = void 0
            events.push(this.events[i])
          }
        } else if (this.events[i].days) {
          // check for overlapping dates
          const startDate = new Date(this.events[i].date)
          const endDate = date.addToDate(startDate, { days: this.events[i].days })
          if (date.isBetweenDates(dt, startDate, endDate)) {
            events.push(this.events[i])
            added = true
          }
        }
      }
      return events
    },
    confirm () {
      this.$q.dialog({
        title: 'Please confirm.',
        message: this.selectLeaveType.label + '<br>From : ' + this.submitLeaveForm.date_from + '<br>To : ' + this.submitLeaveForm.date_to + '<br>Duration : ' + this.submitLeaveForm.number_of_days + ' Day(s)',
        cancel: true,
        html: true,
        persistent: true
      }).onOk(() => {
        // console.log(this.submitLeaveForm)
        this.submitLeave()
      }).onOk(() => {
        // console.log('>>>> second OK catcher')
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    },
    confirmAction (messageshow, action, id) {
      this.$q.dialog({
        title: 'Please confirm.',
        message: messageshow,
        cancel: true,
        html: true,
        persistent: true
      }).onOk(() => {
        // console.log(id)
        if (action === 'cancel') {
          this.deleteLeave(id)
        } else {
          this.updateLeave(action, id)
        }
        // this.submitLeave()
      }).onOk(() => {
        // console.log('>>>> second OK catcher')
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    },
    clickCalendar (val) {
      // console.log(val.date)
      let newDate = new Date(val.date)
      let adjustedDate = date.formatDate(newDate, 'YYYY/MM/DD')
      let datefound = false
      this.data.forEach(function (item) {
        let datadate = date.formatDate(item.from, 'YYYY/MM/DD')
        if (adjustedDate === datadate) {
          datefound = true
        }
      })
      // console.log(datefound)
      if (datefound === false) {
        this.layout = true
        this.inputdatefrom = adjustedDate
        this.inputdateto = adjustedDate
        this.calDuration()
      }
    }
  },
  mounted () {
    // this.checkVersion()
    // console.log(this.$q.cookies.get('uid'))
    this.$q.loading.show()
    if (this.uid === '') {
      this.connectOdoo()
    } else {
      this.publicHolidays()
      this.getLeaveType()
      this.getHrData()
      this.getLeave()
      this.getLeaveApprove()
    }
    this.month = date.formatDate(new Date(), 'MMMM')
    this.year = date.formatDate(new Date(), 'YYYY')
    // this.calDuration('2019-12-25', '2019-12-26')
    // this.callObject()
    // this.publicHolidays()
    // this.getLeaveType()
    // this.getLeave()
    // client.methodCall('YOUR_METHOD', [new YourType(yourVariable)], yourCallback)
  }
}

</script>
<style lang="sass" scoped>
</style>
