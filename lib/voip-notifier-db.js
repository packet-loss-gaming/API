const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./db/subscribed-users.db', (err) => {
  if (err) {
    console.error(err.message)
  }
  console.log('Connected to the subscribed users database.')
})

db.run(`CREATE TABLE IF NOT EXISTS subscriptions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          endpoint TEXT UNIQUE,
          auth TEXT,
          p256dh TEXT
        );`)

let rowToSubscription = (row) => {
  return {
    endpoint: row.endpoint,
    keys: {
      auth: row.auth,
      p256dh: row.p256dh
    }
  }
}

class VoIPNotifierDB {
  insertSubscription(subscription) {
    let endpoint = subscription.endpoint
    let keys = subscription.keys
    let auth = keys.auth
    let p256dh = keys.p256dh

    console.log(`Adding subscription at: ${endpoint}.`)

    const sql = `INSERT INTO subscriptions(endpoint, auth, p256dh)
                 VALUES (?, ?, ?)`
    db.run(sql, [endpoint, auth, p256dh], (err) => {
      if (err) {
        throw err
      }

      console.log(`Added subscription at: ${endpoint}.`)
    })
  }

  findSubscription(subscription) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM subscriptions
                   WHERE endpoint = ?`

      db.get(sql, [subscription.endpoint], (err, row) => {
        if (err) {
          reject(err)
          return
        }

        if (row) {
          let subscription = rowToSubscription(row)
          resolve(subscription)
        } else {
          resolve(null)
        }
      })
    })
  }

  deleteSubscription(subscription) {
    let endpoint = subscription.endpoint

    console.log(`Deleting subscription at: ${endpoint}.`)

    const sql = `DELETE FROM subscriptions
                 WHERE endpoint = ?`
    db.run(sql, endpoint, (err) => {
      if (err) {
        throw err
      }

      console.log(`Deleted subscription at: ${endpoint}.`)
    })
  }

  async subscribe(subscription) {
    let foundSubscription = await this.findSubscription(subscription)
    if (!foundSubscription) {
      this.insertSubscription(subscription)
    }
  }

  streamSubscriptions(subscriptionCallback) {
    const sql = `SELECT * FROM subscriptions`

    db.each(sql, [], (err, row) => {
      if (err) {
        throw err
      }

      let subscription = rowToSubscription(row)
      subscriptionCallback(subscription)
    })
  }
}

module.exports = new VoIPNotifierDB()
