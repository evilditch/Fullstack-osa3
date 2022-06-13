require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('body', (req, res) => {
  return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// let persons = [
//   {
//     name: "Arto Hellas",
//     number: "040-123456",
//     id: 1
//   },
//   {
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//     id: 2
//   },
//   {
//     name: "Dan Abramov",
//     number: "12-43-234345",
//     id: 3
//   },
//   {
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//     id: 4
//   },
//   {
//     name: "Ronja",
//     number: "xxxxxxxxx",
//     id: 5
//   }
// ]

const generateId = () => {
  const id = Math.floor(Math.random()*10000)
  if (persons.find(person => person.id === id)) {
    id = generateId()
  }
  return id
}

app.get('/info', (req, res) => {
  res.send(`<p>Puhelinluettelossa on ${persons.length} henkilön tiedot</p><p>${new Date()}</p>`)
})

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(persons => {
      res.json(persons)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body
  
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'name or number can not be empty'
    })
  } 
  // else if (persons.find(person => person.name === body.name)) {
  //   return res.status(400).json({
  //     error: 'name must be unique'
  //   })
  // }
  
  const person = new Person({
    name: body.name,
    number: body.number,
  })
  
  person.save()
    .then(savedPerson => {
      console.log(`Added ${person.name} to the phonebook`)
      res.json(savedPerson)
    })
    .catch(error => next(error))
  
  // persons = persons.concat(person)
  
})

const unknownEndpoint = (rew, res) => {
  res.status(404).send({ error: 'Unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (err, req, res, next) => {
  console.error(err.message)
  
  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  }
  next(err)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
})

