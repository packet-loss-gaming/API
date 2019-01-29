const axios = require('axios')
const htmlparser = require('fast-html-parser');

let ParseClientLine = (clientLine) => {
  let clientNameNode = clientLine.querySelector('.client-name')
  return clientNameNode.childNodes[0].rawText
}

let ParseChannelLine = (channelLine) => {
  let channelNameNode = channelLine.querySelector('.channel-name')
  return {
    name: channelNameNode.childNodes[0].rawText,
    users: [],
    channels: []
  }
}

let ParseLevel = (levelData) => {
  let levelChannels = []

  let channel = null
  let tryCompleteChannel = () => {
    if (channel) {
      levelChannels.push(channel)
    }
  }

  // Parse nodes in the level
  levelData.childNodes.forEach((child) => {
    // Ignore text elements in the parse (generally whitespace)
    if (!child.classNames) {
      return;
    }

    // Parsing grammer:
    //
    //   channel-list:
    //     channel-line
    //     client-line
    //     channel-list
    //
    if (child.classNames.includes('channel-list')) {
      ParseLevel(child).forEach((childChannel) => {
        channel.channels.push(childChannel)
      })
    } else if (child.classNames.includes('client-line')) {
      channel.users.push(ParseClientLine(child))
    } else if (child.classNames.includes('channel-line')) {
      tryCompleteChannel()

      channel = ParseChannelLine(child)
    }
  })

  // Make sure we didn't miss one
  tryCompleteChannel()

  return levelChannels
}

let ParseNFOResponse = (resp) => {
  let root = htmlparser.parse(resp.data)

  // The first level is special, and contains only one channel
  return ParseLevel(root.querySelector('.channel-list'))[0]
};

const DATA_URL = 'https://www.nfoservers.com/query/mstat.pl?id=pktloss'

module.exports = (req, res) => {
  axios.get(DATA_URL).then(resp => {
    res.json(ParseNFOResponse(resp))
  }).catch(() => {
    res.status(500).end()
  })
}
