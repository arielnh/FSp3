const express = require('express');

const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const mongoUrl = process.env.MONGODB_URI;

mongoose.connect(mongoUrl)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

const Person = require('./models/phonebook');

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  } if (error.phone === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }
  return next(error);
};

app.use(express.static('dist'));
app.use(cors());
app.use(express.json());

app.get('/info', (req, res) => {
  const total = Person.length;
  const date = new Date();
  res.send(`Phonebook has info for ${total}  people <br>${date}`);
});

app.get('/api/phonebook', (req, res) => {
  Person.find({}).then((p) => {
    res.json(p);
  });
});

app.get('/api/phonebook/:id', (req, res, next) => {
  Person.findById(req.params.id)
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
  Person.findByIdAndDelete(request.params.id)
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

  const person = new Person({
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

app.use(errorHandler);

const { PORT } = process.env;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
