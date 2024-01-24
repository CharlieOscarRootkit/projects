const http = require("http")
const app = require("./app.js")

const server = http.createServer(app)

app.set('port',8080)

server.listen(8080, () => {
    console.log("listening on port 8080")
})