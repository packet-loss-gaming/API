const express = require('express')
const app = express()
const port = 3000

const CurrentUsers = require('./controllers/voip/CurrentUsers.js')

app.get('/', (req, res) => {
  // TODO: Send to API documentation?
  res.redirect('https://packetloss.gg')
})

app.get('/voip/current-users', CurrentUsers)

app.listen(port, () => console.log(`Server listening on ${port}!`))
