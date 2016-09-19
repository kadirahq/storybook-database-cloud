import React from 'react'
import addons from '@kadira/storybook-addons'
import '../manager'

addons.register('local/testdb', api => {
  addons.addPanel('local/testdb/panel', {
    title: 'Test Database',
    render() {
      const getTS = () => {
        return addons.getDatabase()
          .getCollection('time')
          .get({ id: 'test' })
          .then(res => console.log('get:', res))
          .catch(err => console.error(err))
      }
      const setTS = () => {
        return addons.getDatabase()
          .getCollection('time')
          .set({ id: 'test', ts: Date.now() })
          .then(res => console.log('set:', res))
          .catch(err => console.error(err))
      }
      const style = {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }
      return (
        <div style={style}>
          <button onClick={getTS}>Get TS</button>
          <button onClick={setTS}>Set TS</button>
        </div>
      )
    }
  })
})
