import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'wrtxyfej',
    dataset: 'production'
  },
  deployment: {
    appId: 'aewwwid45vu7d267mc1wchtk',
    autoUpdates: true
  }
})