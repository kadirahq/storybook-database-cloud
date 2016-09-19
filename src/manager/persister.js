import graphqlify, {Enum} from 'graphqlify';
import 'whatwg-fetch';

export default class Persister {
  constructor({ url, token, appId, database }) {
    this.url = url;
    this.appId = appId;
    this.database = database;
    this.headers = {
      'content-type': 'application/json',
      'x-storybooks-token': token,
    };
  }

  set(collection, item) {
    const queryObject = {
      setData: {
        params: {
          appId: this.appId,
          database: this.database,
          collection,
          jsonData: JSON.stringify(item),
        }
      }
    };
    const graphqlQuery = 'mutation ' + graphqlify(queryObject);
    const body = JSON.stringify({ query: graphqlQuery });
    const params = {body, method: 'post', headers: this.headers};
    return fetch(`${this.url}`, params)
      .then(res => res.json())
      .then(res => res.data.setData);
  }

  get(collection, query, options) {
    const queryObject = {
      data: {
        params: {
          appId: this.appId,
          database: this.database,
          collection,
        }
      }
    };
    if (options.limit) {
      queryObject.data.params.limit = options.limit;
    }
    if (options.query) {
      queryObject.data.params.query = Object.keys(options.query).map(key => {
        const val = options.query[key];
        switch (typeof val) {
          case 'string':
            return { key, op: Enum('GT'), strVal: val };
          case 'number':
            return { key, op: Enum('GT'), numVal: val };
          default:
            // TODO handle range queries
            throw new Error('unknown sort value')
        }
      });
    }
    if (options.sort) {
      queryObject.data.params.sort = Object.keys(options.sort).map(key => {
        const val = options.sort[key];
        const order = (val < 0) ? Enum('DESCENDING') : Enum('ASCENDING');
        return { key, order }
      });
    }
    const graphqlQuery = graphqlify(queryObject);
    const body = JSON.stringify({ query: graphqlQuery });
    const params = {body, method: 'post', headers: this.headers};
    return fetch(`${this.url}`, params)
      .then(res => res.json())
      .then(res => res.data.data.map(str => JSON.parse(str)));;
  }
}
