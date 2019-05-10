import { Room } from "colyseus";

// TODO add minimal chat example


interface ChatMessage {

    type: string;
    author: string;
    data: { text: string }
}

interface Participant {
    id: string;
    name: string
    imageUrl: string;
}


class ChatState {

    participants: Participant[] = []
    messages: ChatMessage[] = []

    addMessage(message: ChatMessage) {
        if (this.messages.length > 30) this.messages.shift()
        this.messages.push(message)
    }

    addParticipant(participant: Participant) {
        this.participants.push(participant)

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
            data: { text: "Welcome to chat" }
        })
        this.setState(mState);
        this.setPatchRate(300)

    }

    onJoin(client) {

        this.state.addParticipant(
            {
                id: client.sessionId,
                name: client.sessionId,
                imageUrl: 'https://avatars3.githubusercontent.com/u/1915989?s=230&v=4'
            })

        this.broadcast(`${client.sessionId} joined.`);
    }

    onLeave(client) {
        this.broadcast(`${client.sessionId} left.`);
    }

    onMessage(client, data) {
        console.log("ChatRoom received message from", client.sessionId, ":", data);
        let [command, message] = data;

        message = (message as ChatMessage)
        // override author in case the user changes its id manually 
        message.author = client.sessionId

        // TODO we could have chat commands that other users can click
        // like a teleport feature to a players position
        //if ( message.data.text == "@coords") message.data.text="@coords({x:0,y:0,z:0})"


        this.state.addMessage(message)


        if (this.state.participants.length <= 2) {
            if ( message.data.text)
            setTimeout(() => {
                this.state.addMessage({
                    type: 'text',
                    author: 'Bot-Admin',
                    data: { text: "WOW that's amazing. Tell me more about :" + message.data.text.slice(0, 10) }
                })
            }, 500)
        }
        //   this.broadcast(`(${client.sessionId}) ${data.message}`);
    }

    onDispose() {
        console.log("Dispose ChatRoom");
    }

}