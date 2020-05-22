const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const LinkedList = require('./linked-list')
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
      const lang = await LanguageService.getUsersLanguage(
        req.app.get('db'), 
        req.user.id,
      )
      const head = await LanguageService.getWordHead(
        req.app.get('db'),
        req.language.head
      )
      
      if(!guess) {
        return res.status(400).json({ error: "Missing 'guess' in request body" })
      }
      
      const newList = new LinkedList();
      newList.insertFirst(head)
      let current = word.find( item => item.id === head.next );
      while(current) {
        newList.insertLast(current)
        current = word.find( item => item.id === current.next );
      }
      newList.displayList();

      let oldHead = newList.head.value;
      let isCorrect;
      let language = req.language

      
      if(guess !== oldHead.translation) {
        oldHead.incorrect_count++;
        oldHead.memory_value = 1;
        isCorrect = false;
      }
      if (guess === oldHead.translation) {
        oldHead.correct_count++;
        oldHead.memory_value *= 2;
        language.total_score++;
        isCorrect = true;
      }

      newList.remove(oldHead)
      newList.insertAt(oldHead.memory_value, oldHead)

      let updatedWord = await LanguageService.saveLinkedList(
        req.app.get('db'),
        newList
      )
      
      newList.head.value.next = newList.next && newList.next.value.id

      let updatedHead = await LanguageService.getUpdatedHead(
        req.app.get('db'),
        req.language.id,
        newList.head.value
      )

      let scoreUpdate = await LanguageService.getUpdatedScore(
        req.app.get('db'),
        req.user.id, 
        language.total_score
      )

      await LanguageService.getWordHead(
        req.app.get('db'),
        newList.head.id
      )
     
      let update = {
        nextWord: updatedWord.original,
        totalScore: language.total_score,
        wordCorrectCount: updatedWord.correct_count,
        wordIncorrectCount: updatedWord.incorrect_count,
        answer: oldHead.translation,
        isCorrect
      }

    res.json(update)
    } catch(error) {
      console.log(error)
      next(error)
    }
    
    
  })

module.exports = languageRouter