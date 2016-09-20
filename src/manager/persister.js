import graphqlify, {Enum} from 'graphqlify';
import 'whatwg-fetch';

export default class Persister {
  constructor({ url, appId, database }) {
    this.url = url;
    this.appId = appId;
    this.database = database;
    this.headers = {
      'content-type': 'application/json',
    };
  }

  _queryAPI(graphqlQuery) {
    const params = {
      body: JSON.stringify({ query: graphqlQuery }),
      method: 'post',
      headers: this.headers,
      credentials: 'include'
    };
    return fetch(`${this.url}`, params).then(res => {
      if (res.status === 401) {
        throw new Error('Unauthorized');
      }
      return res.json();
    })
    .then(res => {
      // TODO check errors
      return res.data;
    });
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
    return this._queryAPI(graphqlQuery).then(data => {
      return data.setData;
    });
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
    if (query) {
      queryObject.data.params.query = Object.keys(query).map(key => {
        const val = query[key];
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
    if (options.limit) {
      queryObject.data.params.limit = options.limit;
    }
    if (options.sort) {
      queryObject.data.params.sort = Object.keys(options.sort).map(key => {
        const val = options.sort[key];
        const order = (val < 0) ? Enum('DESCENDING') : Enum('ASCENDING');
        return { key, order }
      });
    }
    const graphqlQuery = graphqlify(queryObject);
    return this._queryAPI(graphqlQuery).then(data => {
      return data.data.map(str => JSON.parse(str));
    });
  }

  getUser() {
    const queryObject = {
      user: {
        fields: {
          id: {},
          name: {},
          avatar: {},
        }
      }
    };
    const graphqlQuery = graphqlify(queryObject);
    return this._queryAPI(graphqlQuery).then(data => {
      return data.user;
    });
  }
}
