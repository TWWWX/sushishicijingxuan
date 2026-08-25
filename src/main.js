import Vue from 'vue';
import App from './App.vue';
import './styles/global.css';
import { ensureUserId } from './utils/export';

// 用户第一次访问网站即生成并写入 LocalStorage（Cookie 作为独立备份标识同时写入），供后续上传作为文件名前缀
ensureUserId();

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App)
}).$mount('#app');
