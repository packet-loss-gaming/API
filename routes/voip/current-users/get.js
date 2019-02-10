const voipdatafetch = require('../../../lib/voip-data-fetch.js')

module.exports = (req, res) => {
  voipdatafetch().then(channelData => {
    res.json(channelData)
  }).catch(() => {
    res.status(500).end()
  })
}
