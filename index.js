const express = require("express");
const app = express();
require("dotenv").config();

const Phonebook = require("./models/phonebook");

app.use(express.static("dist"));

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(requestLogger);

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

/*
app.get("/", (req, res) => {
  res.send("Phone numbers api");
});

app.get("/info", (req, res) => {
  const total = phonebook.length;
  const date = new Date();
  res.send(`Phonebook has info for ${total}  people <br>${date}`);
});
*/

app.get("/api/phonebook", (req, res) => {
  Phonebook.find({}).then((p) => {
    res.json(p);
  });
});
/*
app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = phonebook.find((p) => p.id === id);

  person ? res.json(person) : res.status(404).end();
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  phonebook = phonebook.filter((p) => p.id !== id);
  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.name || !body.phone) {
    return res.status(400).json({
      error: "content missing",
    });
  }

  const nameExist = phonebook.some((p) => p.name === body.name);

  if (nameExist)
    return res.status(400).json({
      error: "name must be unique",
    });

  const person = {
    name: body.name,
    phone: body.phone,
    id: Math.floor(Math.random(100, 10000) * 1000),
  };

  phonebook = phonebook.concat(person);
  res.json(person);
});
*/
app.use(unknownEndpoint);
app.use(errorHandler)

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
