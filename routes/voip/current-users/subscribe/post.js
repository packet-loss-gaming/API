const voipnotifier = require('../../../../lib/voip-notifier.js')

module.exports = (req, res) => {
  const subscription = req.body
  voipnotifier.subscribe(subscription)

  res.status(201).end()
}
