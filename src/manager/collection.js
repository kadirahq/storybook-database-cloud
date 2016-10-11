export default class Collection {
  constructor(persister, name) {
    this.name = name;
    this.persister = persister;
  }

  set(item) {
    return this.persister.set(this.name, item);
  }

  get(query, options = {}) {
    return this.persister.get(this.name, query, options);
  }

  del(query) {
    return this.persister.del(this.name, query);
  }
}
