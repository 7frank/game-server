import { Room } from "colyseus";

// TODO add minimal chat example


interface ChatMessage {

    type: string;
    author: string;
    data: { text: string }
}


class ChatState {
    messages: ChatMessage[] = []

    addMessage(message:ChatMessage) {
        if (this.messages.length > 30) this.messages.shift()
        this.messages.push(message)
    }
}

export class ChatRoom extends Room<ChatState> {
    // this room supports only 4 clients connected
    maxClients = 4;

    onInit(options) {
        console.log("ChatRoom created!", options);

        const mState = new ChatState()

        mState.addMessage({
            type: 'text',
            author: 'Bot-Admin',
            data:{ text:"Welcome to chat"}
        })
        this.setState(mState);
        this.setPatchRate(300)

    }

    onJoin(client) {
        this.broadcast(`${client.sessionId} joined.`);
    }

    onLeave(client) {
        this.broadcast(`${client.sessionId} left.`);
    }

    onMessage(client, data) {
        console.log("ChatRoom received message from", client.sessionId, ":", data);
        const [command, message] = data;
        this.state.addMessage(message)
     //   this.broadcast(`(${client.sessionId}) ${data.message}`);
    }

    onDispose() {
        console.log("Dispose ChatRoom");
    }

}