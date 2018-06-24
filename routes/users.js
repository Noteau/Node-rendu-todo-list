const router = require('express').Router()
const db = require('sqlite')
const bcrypt = require('bcrypt');
/* Users : liste */
router.get('/', function(req, res, next) {

  const wheres = []

  if (req.query.firstname) {
    wheres.push(`firstname LIKE '%${req.query.firstname}%'`)
  }

  if (req.query.lastname) {
    wheres.push(`lastname LIKE '%${req.query.lastname}%'`)
  }

  const limit = `LIMIT ${req.query.limit || 100}`
  const offset = `OFFSET ${ req.query.offset || 0}`
  const where = wheres.length > 0 ? `WHERE ${wheres.join(' AND ')}` : ''
  let order = ''
  let reverse = ''
  if (req.query.order && req.query.reverse) {
    order = `ORDER BY ${req.query.order}`
    if (req.query.reverse == '1') {
      reverse = 'DESC'
    } else if (req.query.reverse == '0') {
      reverse = 'ASC'
    }
  }
  
  query = `SELECT * FROM users ${where} ${order} ${reverse} ${limit} ${offset}`

  db.all(query)
  .then((users) => {
    res.format({
      html: () => { res.render('users/index', { users: users }) },
      json: () => { res.send(users) }
    })
  }).catch(next)
})

  /*data = {
    users: [
      { firstname: 'Jean', lastname: 'Bon' },
      { firstname: 'Emilie', lastname: 'Dubois' }
    ]
  }

  res.format({
    html: () => { res.render('users/index', data) },
    json: () => { res.send(data) }
  })
})*/


router.delete('/:userId', (req, res, next) => {
  db.run('DELETE FROM users WHERE id = ?', req.params.userId)
  .then(() => {
    res.redirect('./')
  }).catch(next)
})

router.put('/:userId', (req, res, next) => {
  db.run("UPDATE users SET pseudo = ?, email = ?, firstname = ?, lastname = ?, updatedAt= ? WHERE id = ?",req.body.pseudo, req.body.email, req.body.firstname, req.body.lastname, new Date(), req.params.userId)
  .then(() => {
    res.redirect('./' + req.params.userId)
  }).catch(next)
})

// GET EDIT USER FORM
router.get('/:userId/edit', (req, res, next) => {
  db.get('SELECT * FROM users WHERE id = ?', req.params.userId)
  .then((user) => {
    res.format({
      html: () => { res.render('./users/edit', {
          title: 'Utilisateur ' + user.pseudo,
          user: user,
          userId: req.params.userId
      }) }, 
      json: () => { res.send(user) }
    })
  }).catch(next)
})

// GET ADD USER FORM
router.get('/add', (req, res, next) => {
  res.render('./users/add', {
    title: 'Ajouter un utilisateur'
  })
})

// POST USER
router.post('/', (req, res, next) => {
  if(!req.body.pseudo || !req.body.email || !req.body.firstname || !req.body.lastname || !req.body.password) {
    return next(new Error('All fields must be given.'))
  }
  bcrypt.hash(req.body.password, 10, function(err, hash) {
    db.run("INSERT INTO users (pseudo,email,firstname,lastname,password,createdAt,updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)", req.body.pseudo, req.body.email, req.body.firstname, req.body.lastname,hash, new Date(), null)
    .then(() => {
      res.redirect('./users')
    })
    .catch(next) 
  })
})

router.get('/:userId', (req, res, next) => {
  db.get('SELECT * FROM users WHERE id = ?', req.params.userId)
  .then((user) => {
    res.format({
      html: () => { res.render('users/show', {
          title: 'Utilisateur ' + user.pseudo,
          user: user,
          userId: req.params.userId
      }) }, 
      json: () => { res.send(user) }
    })
  }).catch(next)
})

module.exports = router
