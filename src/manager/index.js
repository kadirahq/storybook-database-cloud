import Database from '@kadira/storybook-database';
import addons from '@kadira/storybook-addons';
import cookies from 'cookies-js';
import qs from 'qs';
import { ADDON_ID } from '../shared';
import Persister from './persister';

const TOKEN_PARAM = 'sbAuth';
const TOKEN_COOKIE = 'sbauth';

export function tokenFromQuery() {
  const queryString = location.search.slice(1);
  const queryObject = qs.parse(queryString);
  const token = queryObject[TOKEN_PARAM];
  if (!token) {
    return null;
  }
  cookies.set(TOKEN_COOKIE, token);
  return token;
}

export function tokenFromCookie() {
  return cookies.get(TOKEN_COOKIE);
}

export default function createDatabase(options = {}) {
  options.url = options.url || process.env.STORYBOOK_CLOUD_URL;
  options.appId = options.appId || process.env.STORYBOOK_CLOUD_APPID;
  options.database = options.database || process.env.STORYBOOK_CLOUD_DATABASE;
  options.token = options.token || tokenFromQuery() || tokenFromCookie();
  const persister = new Persister(options);
  return new Database({ persister });
}

export function init() {
  addons.register(ADDON_ID, api => {
    const database = createDatabase();
    addons.setDatabase(database);
  })
}
