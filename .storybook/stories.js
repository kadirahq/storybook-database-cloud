import React from 'react'
import { storiesOf } from '@kadira/storybook'

storiesOf('Debug', module).add('Environment', () => (
  <pre>
    {'Environment Variables:\n'}
    {'\nSTORYBOOK_CLOUD_SERVER:\n' + process.env.STORYBOOK_CLOUD_SERVER + '\n'}
    {'\nSTORYBOOK_CLOUD_APPID:\n' + process.env.STORYBOOK_CLOUD_APPID + '\n'}
    {'\nSTORYBOOK_CLOUD_DATABASE:\n' + process.env.STORYBOOK_CLOUD_DATABASE + '\n'}
    {'\nSTORYBOOK_GIT_ORIGIN:\n' + process.env.STORYBOOK_GIT_ORIGIN + '\n'}
    {'\nSTORYBOOK_GIT_BRANCH:\n' + process.env.STORYBOOK_GIT_BRANCH + '\n'}
  </pre>
))
