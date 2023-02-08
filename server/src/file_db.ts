const fs = require('fs')
const _ = require('lodash')
const { DB_PATH } = require("./config")

class FileDB {
  private path: string
  private db: string

  constructor(path: string = DB_PATH) {
    this.path = path
    this.db = this.load()
  }

  save() {
    fs.writeFileSync(this.path, JSON.stringify(this.db, null, 2))
  }

  load() {
    return JSON.parse(fs.readFileSync(this.path, 'utf-8'))
  }

  get(path: string, defaultValue: any = undefined) {
    return _.get(this.db, path, defaultValue)
  }

  add(path: string, item: any) {
    const obj = _.set(this.db, path, item)
    this.save()
    return obj
  }
  
  update(path: string, item: any) {
    const obj = _.update(this.db, path, (_: any) => item)
    this.save()
    return obj
  }
  
  remove(path: string) {
    const obj =  _.unset(this.db, path)
    this.save()
    return obj
  }
}

export default new FileDB()  //singleton

