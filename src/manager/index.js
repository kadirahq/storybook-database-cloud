import Database from '@kadira/storybook-database';
import addons from '@kadira/storybook-addons';
import { ADDON_ID } from '../shared';
import Persister from './persister';

export default function createDatabase(options = {}) {
  options.url = options.url || process.env.STORYBOOK_CLOUD_URL;
  options.appId = options.appId || process.env.STORYBOOK_CLOUD_APPID;
  options.database = options.database || process.env.STORYBOOK_CLOUD_DATABASE;
  const persister = new Persister(options);
  return new Database({ persister });
}

export function init() {
  addons.register(ADDON_ID, api => {
    const database = createDatabase();
    addons.setDatabase(database);
  })
}
