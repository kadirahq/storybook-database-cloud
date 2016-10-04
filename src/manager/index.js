import addons from '@kadira/storybook-addons';
import { ADDON_ID } from '../shared';
import Persister from './persister';
import Database from './database';

// NOTE Storybooks uses the define plugin therefore environment variable
// will work only when used in the `process.env.STORYBOOK_VALUE` format.
const DEFAULT_OPTIONS = {
  url: process.env.STORYBOOK_CLOUD_URL,
  appId: process.env.STORYBOOK_CLOUD_APPID,
  database: process.env.STORYBOOK_CLOUD_DATABASE,
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
