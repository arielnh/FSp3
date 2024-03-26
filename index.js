const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();


let phonebook = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

morgan("tiny");
app.use(express.json());
app.use(morgan("combined"));
app.use(cors());
app.use(express.static('dist'))

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.get("/", (req, res) => {
  res.send("Phone numbers api");
});
app.get("/info", (req, res) => {
  const total = phonebook.length;
  const date = new Date();
  res.send(`Phonebook has info for ${total}  people <br>${date}`);
});

app.get("/api/persons", (req, res) => {
  res.send(phonebook);
});

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

app.use(unknownEndpoint);


const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
