import Vue from 'vue/dist/vue.esm';
import Chat from 'vue-beautiful-chat'
Vue.use(Chat)
var parseHTML = require('parsehtml');






Vue.component('chat-window', {
    template: `<template>
    <div>
      <beautiful-chat
        :participants="participants"
        :titleImageUrl="titleImageUrl"
        :onMessageWasSent="onMessageWasSent"
        :messageList="messageList"
        :newMessagesCount="newMessagesCount"
        :isOpen="isChatOpen"
        :close="closeChat"
        :open="openChat"
        :showEmoji="true"
        :showFile="true"
        :showTypingIndicator="showTypingIndicator"
        :colors="colors"
        :alwaysScrollToBottom="alwaysScrollToBottom"
        :messageStyling="messageStyling"
        @onType="handleOnType" />
    </div>
  </template>`,
 
  
    name: 'chat-window',
    data() {
      return {
        participants: [
          {
            id: 'user1',
            name: 'Matteo',
            imageUrl: 'https://avatars3.githubusercontent.com/u/1915989?s=230&v=4'
          },
          {
            id: 'user2',
            name: 'Support',
            imageUrl: 'https://avatars3.githubusercontent.com/u/37018832?s=200&v=4'
          }
        ], // the list of all the participant of the conversation. `name` is the user name, `id` is used to establish the author of a message, `imageUrl` is supposed to be the user avatar.
        titleImageUrl: 'https://a.slack-edge.com/66f9/img/avatars-teams/ava_0001-34.png',
        messageList: [
            { type: 'text', author: `me`, data: { text: `Say yes!` } },
            { type: 'text', author: `user1`, data: { text: `No.` } }
        ], // the list of the messages to show, can be paginated and adjusted dynamically
        newMessagesCount: 0,
        isChatOpen: false, // to determine whether the chat window should be open or closed
        showTypingIndicator: '', // when set to a value matching the participant.id it shows the typing indicator for the specific user
        colors: {
          header: {
            bg: '#4e8cff',
            text: '#ffffff'
          },
          launcher: {
            bg: '#4e8cff'
          },
          messageList: {
            bg: '#ffffff'
          },
          sentMessage: {
            bg: '#4e8cff',
            text: '#ffffff'
          },
          receivedMessage: {
            bg: '#eaeaea',
            text: '#222222'
          },
          userInput: {
            bg: '#f4f7f9',
            text: '#565867'
          }
        }, // specifies the color scheme for the component
        alwaysScrollToBottom: false, // when set to true always scrolls the chat to the bottom when new events are in (new message, user starts typing...)
        messageStyling: true // enables *bold* /emph/ _underline_ and such (more info at github.com/mattezza/msgdown)
      }
    },
    methods: {
      sendMessage (text) {
        if (text.length > 0) {
          this.newMessagesCount = this.isChatOpen ? this.newMessagesCount : this.newMessagesCount + 1
          this.onMessageWasSent({ author: 'support', type: 'text', data: { text } })
        }
      },
      onMessageWasSent (message) {
        // called when the user sends a message
        this.messageList = [ ...this.messageList, message ]
      },
      openChat () {
        // called when the user clicks on the fab button to open the chat
        this.isChatOpen = true
        this.newMessagesCount = 0
      },
      closeChat () {
        // called when the user clicks on the botton to close the chat
        this.isChatOpen = false
      },
      handleScrollToTop () {
        // called when the user scrolls message list to top
        // leverage pagination for loading another page of messages
        },
      handleOnType () {
        console.log('Emit typing event')
      }
  }



  });



export
    function createViews() {
    const el = parseHTML(`
<div id="app">
    {{ message }}
  </div>
`)
    document.querySelector('body').append(el)


    const vueApp = new Vue({
        //el: '#app',
        data: {
            message: 'Hello Vue.js!'
        }
    }).$mount(el)


}
