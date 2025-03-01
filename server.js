import express from "express"
import bodyParser from "body-parser"
import webrtc from "@roamhq/wrtc"

const app = express()

let senderStream

app.use(express.static("public"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.post("/consumer", async ({ body }, res) => {
  const peer = new webrtc.RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun1.l.google.com:19302",
      },
    ],
  })
  const desc = new webrtc.RTCSessionDescription(body.sdp)

  await peer.setRemoteDescription(desc)
  senderStream
    .getTracks()
    .forEach((track) => peer.addTrack(track, senderStream))
  const answer = await peer.createAnswer()
  await peer.setLocalDescription(answer)
  const payload = {
    sdp: peer.localDescription,
  }

  res.json(payload)
})

app.post("/broadcast", async ({ body }, res) => {
  const peer = new webrtc.RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun1.l.google.com:19302",
      },
    ],
  })
  peer.ontrack = (e) => handleTrackEvent(e, peer)
  const desc = new webrtc.RTCSessionDescription(body.sdp)
  await peer.setRemoteDescription(desc)
  const answer = await peer.createAnswer()
  await peer.setLocalDescription(answer)
  const payload = {
    sdp: peer.localDescription,
  }

  res.json(payload)
})

function handleTrackEvent(e, peer) {
  senderStream = e.streams[0]
}

app.listen(3000, () => console.log("server started"))
