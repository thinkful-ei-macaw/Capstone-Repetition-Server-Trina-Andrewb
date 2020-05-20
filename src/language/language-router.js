const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')

const languageRouter = express.Router()
const jsonBodyParser = express.json()

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/head', async (req, res, next) => {
    try {
      const lang = await LanguageService.getUsersLanguage(
        req.app.get('db'), 
        req.user.id,
      )
      const word = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )
      console.log(lang)
      console.log(word)
      res.json({
        nextWord: word[0].original,
        wordCorrectCount: word[0].correct_count,
        wordIncorrectCount: word[0].incorrect_count,
        totalScore: lang.total_score
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .route('/guess')
  .post(requireAuth, jsonBodyParser, async (req, res, next) => {
    // implement me
    let guess = req.body.guess
    try {
      const word = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id
      )
      if(!guess) {
        return res.status(400).json({ error: "Missing 'guess' in request body" })
      }
    next()
    } catch(error) {
      next(error)
    }
    // res.send('implement me!')
  })

module.exports = languageRouter
