const router = require('express').Router()
const db = require('sqlite')
const hat = require('hat')
const bcrypt = require('bcrypt')


/* Page d'accueil */
router.get('/', function(req, res, next) {
  res.render('./sessions/connect', { title: 'Connexion' })
})

router.post('/',function(req, response, next) {
  if  (!req.body.pseudo || !req.body.password) {
    return next(new Error('All fields must be given.'))
  } 
  db.get("SELECT password FROM users WHERE pseudo =  '"+req.body.pseudo+"'" )
    .then((hash) => {
      bcrypt.compare(req.body.password, hash["password"], function(err, res){
        if (res == true){
          var date = new Date()
          date_int = date.getTime()
          expire_date_int = date_int + 300000
          expire_date = expire_date_int
          const accessToken = hat()
          db.get("SELECT id FROM users WHERE pseudo= '"+req.body.pseudo+"'")
            .then((id) => {
               db.run("INSERT INTO sessions (userId, accessToken, createdAt, expiresAt)  VALUES (?, ?, ?, ?)",id["id"] ,accessToken ,date ,expire_date)
                .then(() => {
                  response.format({
                    html: () => {
                      req.session.accessToken = accessToken
                      response.redirect('sessions/auth')
                    }, 
                    json: () => {
                      response.json({
                        "accesToken":accessToken
                      })
                    }
                  })
                })
                .catch((err) => { // Si on a eu des erreurs
                   response.redirect('/')
                })
          })
          .catch((err) => { // Si on a eu des erreurs
             response.redirect('/')
          })
       
      }
      else {
        response.redirect('/')
      }
    })
  }) 
  .catch((err) => { // Si on a eu des erreurs
      console.error('ERR> ', err)
    })
})

router.delete('/:sessionId', (req, res, next) => {
  db.run('DELETE FROM sessions WHERE userId = ?', req.params.sessionId)
  .then(() => {
    res.redirect('./')
  }).catch(next)
})

router.get('/auth', (req,res, next) => {
  res.format({
    html: () => {
      if (req.session.accessToken) {
        db.get("SELECT expiresAt from sessions WHERE accessToken = ?", req.session.accessToken)
        .then((expires) => {
          if (expires["expiresAt"] > new Date().getTime()) {
            res.redirect('/todos')
          }
          else {
            res.render("./")
          }
        }).catch((next) => {

          console.log(next)
        })        
      }
      else {
        res.render("./")
      }
    }, 
    json: () => {
    
    }
  })
})

module.exports = router