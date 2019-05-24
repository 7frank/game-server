import Vue from 'vue/dist/vue.esm';
import HelloScene from './HelloScene.vue';
var parseHTML = require('parsehtml');
export function createScene(): Vue {
  const appEl = parseHTML(`<div></div`);
  let vm = new HelloScene()
    .$mount(appEl);
  document.querySelector("body").append(vm.$el);
  return vm;
}
