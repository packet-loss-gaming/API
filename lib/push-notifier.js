const webpush = require('web-push')

const publicVapidKey = process.env.PUBLIC_VAPID_KEY
const privateVapidKey = process.env.PRIVATE_VAPID_KEY

webpush.setVapidDetails('mailto:support@packetloss.gg', publicVapidKey, privateVapidKey)

module.exports = webpush
