const schedule = require('node-schedule')

const pushnotifier = require('./push-notifier.js')
const voipnotifierdb = require('./voip-notifier-db.js')
const voipdatafetch = require('./voip-data-fetch.js')

let previousUsers = []

let collectUsers = function(channels) {
  let users = []

  channels.forEach(channel => {
    channel.users.forEach(user => {
      users.push(user)
    })

    collectUsers(channel.channels).forEach(user => {
      users.push(user)
    })
  })

  return users
}

class VoIPNotifier {
  subscribe(subscription) {
    voipnotifierdb.subscribe(subscription)
  }

  notifyAll(data) {
    voipnotifierdb.streamSubscriptions(subscription => {
      pushnotifier.sendNotification(subscription, JSON.stringify(data)).catch(error => {
        console.error(error)
        voipnotifierdb.deleteSubscription(subscription)
      })
    })
  }

  notifyOfChanges() {
    voipdatafetch().then(resp => {
      let newUsers = collectUsers([resp])

      newUsers.forEach(user => {
        if (!previousUsers.includes(user)) {
          this.notifyAll({
            user: user,
            connected: true
          })
        }
      })

      previousUsers.forEach(user => {
        if (!newUsers.includes(user)) {
          this.notifyAll({
            user: user,
            connected: false
          })
        }
      })

      previousUsers = newUsers
    })
  }
}

const voipNotifierInstance = new VoIPNotifier()

schedule.scheduleJob('* * * * *', () => {
  voipNotifierInstance.notifyOfChanges()
})

module.exports = voipNotifierInstance
