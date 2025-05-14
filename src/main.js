import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// PrimeVue imports
import PrimeVue from 'primevue/config'
// Import icons and custom CSS
import 'primeicons/primeicons.css'       // Icons
import './assets/primevue-custom.css'    // Custom PrimeVue styling

// PrimeVue components
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Chart from 'primevue/chart'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import FileUpload from 'primevue/fileupload'
import Textarea from 'primevue/textarea'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import ProgressSpinner from 'primevue/progressspinner'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Calendar from 'primevue/calendar'

// Import custom styles
import './style.css'

// Create app instance
const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)
app.use(PrimeVue, { ripple: true })
app.use(ToastService)

// Register PrimeVue components
app.component('Button', Button)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('InputText', InputText)
app.component('Dropdown', Dropdown)
app.component('Chart', Chart)
app.component('Card', Card)
app.component('Dialog', Dialog)
app.component('FileUpload', FileUpload)
app.component('Textarea', Textarea)
app.component('Toast', Toast)
app.component('ProgressSpinner', ProgressSpinner)
app.component('TabView', TabView)
app.component('TabPanel', TabPanel)
app.component('Calendar', Calendar)

// Mount the app
app.mount('#app')
