const express = require('express')
const app = express()
const port = 8080

const CurrentUsers = require('./routes/voip/current-users/get.js')
const CurrentUsersSubscribe = require('./routes/voip/current-users/subscribe/post.js')

app.use(require('body-parser').json());

app.get('/', (req, res) => {
  // TODO: Send to API documentation?
  res.redirect('https://packetloss.gg')
})

app.get('/voip/current-users', CurrentUsers)
app.post('/voip/current-users/subscribe', CurrentUsersSubscribe)

app.listen(port, () => console.log(`Server listening on ${port}!`))
