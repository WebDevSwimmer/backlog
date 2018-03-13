import { db } from './../persistence'

import lodashId from 'lodash-id'

const shortid = require('shortid')
const storage = require('electron').remote.require('electron-settings')

db._.mixin(lodashId)

db.defaults({
  activeBoard: 'default',
  boards: [{
    id: 'default',
    label: 'Default board',
    showDone: false,
    prependNewItem: false,
    items: []
  }]
}).write()

export default {
  get () {
    console.log(`${JSON.stringify(db.getState())}`)
  },
  saveNewBoard (boardName, defaults) {
    return db
      .get('boards')
      .insert({
        label: boardName,
        showDone: false,
        prependNewItem: defaults.prependNewItems,
        items: []
      })
      .write()
  },
  saveBoardsArray (boardsArray) {
    return db
      .set('boards', boardsArray)
      .write()
  },
  saveItemsArray (boardId, items) {
    return db
      .get('boards')
      .getById(boardId)
      .set('items', items)
      .write()
  },
  removeBoard (boardId) {
    db.get('boards')
      .remove({id: boardId})
      .write()
  },
  getFirstBoard () {
    return db.get('boards')
      .first()
      .cloneDeep()
      .value()
  },
  setActiveBoard (boardId) {
    db.set('activeBoard', boardId)
      .write()
  },
  getActiveBoard () {
    return db.get('activeBoard')
      .cloneDeep()
      .value()
  },
  getList () {
    return db
      .get('boards')
      .cloneDeep()
      .value()
  },
  addItemToEnd (boardId, text, created, isDone) {
    return db
      .get('boards')
      .find({id: boardId})
      .get('items')
      .insert({
        isDone: isDone || false,
        created: created || new Date(),
        text
      })
      .write()
  },
  addItemToBegin (boardId, text) {
    return db
      .find('boards', {id: boardId})
      .get('items')
      .unshift({
        id: shortid.generate(),
        isDone: false,
        created: new Date(),
        text
      })
      .write()
  },
  getItems (boardId) {
    return db
      .get('boards')
      .getById(boardId)
      .get('items')
      .cloneDeep()
      .value()
  },
  switchShowDone (boardId, value) {
    return db
      .get('boards')
      .updateById(boardId, {showDone: value})
      .write()
  },
  importOldEntries () {
    if (storage.has('boards')) {
      storage.get('boards').forEach((board) => {
        const newBoard = this.saveNewBoard(board.label, {prependNewItem: false})
        storage.get(`board-item-${board.id}`).forEach((boardItem) => {
          this.addItemToEnd(newBoard.id, boardItem.text, boardItem.created, boardItem.isDone)
        })
      })
    }
  }
}
