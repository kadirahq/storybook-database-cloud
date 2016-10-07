import addons from '@kadira/storybook-addons';
import { ADDON_ID } from '../shared';
import Persister from './persister';
import Database from './database';

// NOTE Storybooks uses the define plugin therefore environment variable
// will work only when used in the `process.env.STORYBOOK_VALUE` format.
// NOTE For this databae addon to work, both `STORYBOOK_CLOUD_APPID` and
// `STORYBOOK_CLOUD_DATABASE` environment variables should be available or
// both `STORYBOOK_CLOUD_ORIGIN` and `STORYBOOK_CLOUD_BRANCH` environment
// variables should be available.
const DEFAULT_SERVER_URL = 'https://hub-backend.getstorybook.io/graphql';
const DEFAULT_OPTIONS = {
  server: process.env.STORYBOOK_CLOUD_SERVER || DEFAULT_SERVER_URL,
  appId: process.env.STORYBOOK_CLOUD_APPID,
  database: process.env.STORYBOOK_CLOUD_DATABASE,
  origin: process.env.STORYBOOK_GIT_ORIGIN,
  branch: process.env.STORYBOOK_GIT_BRANCH,
};

export default function createDatabase(customOptions = {}) {
  const options = Object.assign({}, DEFAULT_OPTIONS, customOptions);
  const persister = new Persister(options);
  return new Database({ persister });
}

export function init() {
  addons.register(ADDON_ID, api => {
    const database = createDatabase();
    addons.setDatabase(database);
  })
}
