import uuid from 'uuid';
import graphqlify, {Enum} from 'graphqlify';
import 'whatwg-fetch';

export default class Persister {
  // options => { server, appId, database, origin, branch }
  constructor(options) {
    this.options = options;
    this._uuid = uuid;
    this._info = null;
    this.headers = {
      'content-type': 'application/json',
    };
  }

  set(collection, item) {
    if (!item.id) {
      item.id = this._uuid.v4();
    }
    const queryObject = {
      setData: {
        params: {
          appId: null,
          database: null,
          collection,
          jsonData: JSON.stringify(item),
        }
      }
    };
    return this._getAppInfo()
      .then(info => {
        queryObject.setData.params.appId = info.appId;
        queryObject.setData.params.database = info.database;
        return this._queryAPI('mutation ' + graphqlify(queryObject));
      })
      .then(data => {
        return data.setData;
      });
  }

  get(collection, query, options) {
    const queryObject = {
      data: {
        params: {
          appId: null,
          database: null,
          collection,
        }
      }
    };
    if (query) {
      queryObject.data.params.query = this._makeGraphQLQuery(query);
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
    return this._getAppInfo()
      .then(info => {
        queryObject.data.params.appId = info.appId;
        queryObject.data.params.database = info.database;
        return this._queryAPI(graphqlify(queryObject));
      })
      .then(data => {
        if (!data.data) {
          return [];
        }
        return data.data.map(str => JSON.parse(str));
      });
  }

  del(collection, query) {
    const queryObject = {
      delData: {
        params: {
          appId: null,
          database: null,
          collection,
        }
      }
    };
    if (query) {
      queryObject.delData.params.query = this._makeGraphQLQuery(query);
    }
    return this._getAppInfo()
      .then(info => {
        queryObject.delData.params.appId = info.appId;
        queryObject.delData.params.database = info.database;
        return this._queryAPI('mutation ' + graphqlify(queryObject));
      })
      .then(data => {
        return data.delData;
      });
  }

  _getUser() {
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

  _getAppInfo() {
    if (this._info) {
      return Promise.resolve(this._info);
    }
    if (this.options.appId && this.options.database) {
      const { appId, database } = this.options;
      this._info = { appId, database };
      return Promise.resolve(this._info);
    }
    // TODO parse the url instead of using a regular expression
    // NOTE regex examples: https://regex101.com/r/qv1uuz/1
    const regex = /github\.com(?:\/|\:)(\S+?)\/(\S+?)(?:\.git)?$/i;
    const match = regex.exec(this.options.origin);
    const queryObject = {
      appByRepo: {
        params: {
          repoOrg: match[1],
          repoName: match[2],
        },
        fields: {
          id: {},
          branch: {
            params: {
              name: this.options.branch,
            },
            fields: {
              group: {},
            },
          },
        },
      },
    };
    const graphqlQuery = graphqlify(queryObject);
    return this._queryAPI(graphqlQuery).then(data => {
      this._info = {
        appId: data.appByRepo.id,
        database: data.appByRepo.branch.group,
      };
      return Promise.resolve(this._info);
    });
  }

  _makeGraphQLQuery(query) {
    return Object.keys(query).map(key => {
      const val = query[key];
      switch (typeof val) {
        case 'string':
          return { key, op: Enum('EQ'), strVal: val };
        case 'number':
          return { key, op: Enum('EQ'), numVal: val };
        default:
          // TODO handle range queries
          throw new Error('unknown sort value')
      }
    });
  }

  _queryAPI(graphqlQuery) {
    const params = {
      body: JSON.stringify({ query: graphqlQuery }),
      method: 'post',
      headers: this.headers,
      credentials: 'include'
    };
    return fetch(`${this.options.server}`, params).then(res => {
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
}
