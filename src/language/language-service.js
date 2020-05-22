const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first()
  },
  getWordHead(db, head) {
    return db
    .from('word')
    .select(
      'id',
      'language_id',
      'original',
      'translation',
      'next',
      'memory_value',
      'correct_count',
      'incorrect_count',
    )
      .where({id: head})
      .first()
  },
  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id })
  },
  
  getUpdatedScore(db, user_id, total_score) {
    return db.from('language').update({total_score}).where({user_id})
  },
  getUpdatedHead(db, language_id, head) {
    return db.from('language').where({id: language_id}).update({head: head.id})
  },
  async saveLinkedList(db, list) {
    let walk = list.head
    while(walk) {
      await db.from('word').where({id: walk.value.id}).update({next: walk.next && walk.next.value.id, memory_value: walk.value.memory_value, correct_count: walk.value.correct_count, incorrect_count: walk.value.incorrect_count})
      walk = walk.next
      console.log(walk)
    }
  }
}

module.exports = LanguageService