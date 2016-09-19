import React from 'react'
import { storiesOf } from '@kadira/storybook'

storiesOf('Hello', module)
  .add('World', () => (
    <pre>Hello World</pre>
  ))
  .add('Earth', () => (
    <pre>Hello Earth</pre>
  ))
