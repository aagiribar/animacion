import express from "express";

const app = express();
const port = 1234;

app.use(express.static("assets"));
app.use(express.static("assets/skybox"))
app.use(express.static("src"));
app.use(express.static("libs"));
app.use(express.static("src/modules"));
app.use(express.static("src/modules/classes"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/src/index.html");
});

var listener = app.listen(port, () => {
    console.log('Your app is listening on port ' + listener.address().port);
    console.log('http://localhost:' + listener.address().port);
});