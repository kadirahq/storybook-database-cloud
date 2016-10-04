import Collection from './collection';

export default class Database {
  constructor({ persister }) {
    this.persister = persister;
  }

  getCollection(name) {
    return new Collection(this.persister, name);
  }
}
