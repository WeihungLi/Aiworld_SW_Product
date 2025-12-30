import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#2563EB', // 對應原本的 blue-600
          secondary: '#475569', // 對應 slate-600
          background: '#F8FAFC', // 對應 slate-50
          surface: '#FFFFFF',
        },
      },
    },
  },
})