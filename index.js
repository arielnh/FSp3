const express = require('express');

const app = express();
require('dotenv').config();
const cors = require('cors');
const Phonebook = require('./models/phonebook');

app.use(express.static('dist'));

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  } if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }
  return next(error);
};

app.use(cors());
app.use(express.json());
app.use(requestLogger);

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.get('/info', (req, res) => {
  const total = Phonebook.length;
  const date = new Date();
  res.send(`Phonebook has info for ${total}  people <br>${date}`);
});

app.get('/api/phonebook', (req, res) => {
  Phonebook.find({}).then((p) => {
    res.json(p);
  });
});

app.get('/api/phonebook/:id', (req, res, next) => {
  Phonebook.findById(req.params.id)
    .then((p) => {
      if (p) {
        res.json(p);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete('/api/phonebook/:id', (request, response, next) => {
  Phonebook.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post('/api/phonebook', (req, res, next) => {
  const { body } = req;

  if (!body.name || !body.phone) {
    return res.status(400).json({
      error: 'content missing',
    });
  }

  const nameExist = Phonebook.some((p) => p.name === body.name);

  if (nameExist) {
    return res.status(400).json({
      error: 'name must be unique',
    });
  }

  const person = new Phonebook({
    name: body.name,
    phone: body.phone,
  });

  person
    .save()
    .then((savedPerson) => {
      res.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.use(unknownEndpoint);
app.use(errorHandler);

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
