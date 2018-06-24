const router = require('express').Router()
const db = require('sqlite')

/* Todos : liste */
router.get('/', function(req, res, next) {
  db.get("SELECT userId FROM sessions WHERE accessToken = ?",req.session.accessToken)
  .then((id) => {
    db.all("SELECT message FROM todos WHERE userId = ?",id["userId"])
    .then((todos) => {
    	res.format({
		      html: () => { res.render('todos/index', {id: id["userId"], todos: todos}) },
		      json: () => { res.send(todos) }
    	})
    }).catch((next) => {
        console.log(next) 
      })   
  }).catch(next)
})

router.delete('/:userId', (req, res, next) => {
  db.run('DELETE FROM todos WHERE userId = ?', req.params.userId)
  .then(() => {
    res.format({
		      html: () => { res.render('todos/index', {}) },
		      json: () => { res.send(todos) }
    	})
  }).catch(next)
})

router.put('/:userId', (req, res, next) => {
  db.run("UPDATE todos SET message = ? WHERE userId = ?",req.body.message,req.body.UserId)
  .then(() => {
    res.redirect('./')
  }).catch(next)
})

// GET EDIT TODO FORM
router.get('/:userId/edit', (req, res, next) => {
	console.log(req.params.userId)
  db.get('SELECT * FROM todos WHERE userId = ?', req.params.userId)
  .then((todos) => {
    res.format({
      html: () => { res.render('./todos/edit', {
          title: 'Utilisateur ',
          todos: todos,
          userId: req.params.userId
      }) }, 
      json: () => { res.send(todos) }
    })
  }).catch(next)
})

// GET ADD TODO FORM
router.get('/add', (req, res, next) => {
  res.render('./todos/add', {
    title: 'Ajouter un todo'
  })
})

// POST TODO
router.post('/', (req, res, next) => {
  if(!req.body.message) {
    return next(new Error('All fields must be given.'))
  }
 	db.run("INSERT INTO todos (userId,message,createdAt,updatedAt,completedAt) VALUES (?, ?, ?, ?, ?)", req.body.UserId,req.body.message,new Date(),new Date(),null)
    .then(() => {
    	console.log("")
    	res.redirect('./sessions')
    })
    .catch(next) 
  })

module.exports = router
