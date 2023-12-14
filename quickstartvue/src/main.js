import Vue from 'vue'
import App from './App.vue'
import { registerLicense } from '@syncfusion/ej2-base';

registerLicense('Ngo9BigBOggjHTQxAR8/V1NHaF1cWmhIfEx1RHxQdld5ZFRHallYTnNWUj0eQnxTdEZiW35acHJWT2RfVkN1WA==');

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
