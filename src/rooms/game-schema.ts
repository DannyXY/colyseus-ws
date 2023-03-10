import { Room, Client } from "colyseus";
import { type, Schema, MapSchema } from "@colyseus/schema";

class Player extends Schema {
    @type("number")
    x = Math.floor(Math.random() * 400);

    @type("number")
    y = Math.floor(Math.random() * 400);

    @type("number")
    z = Math.floor(Math.PI);
}

class WorldState extends Schema {
    @type({ map: Player })
    players = new MapSchema<Player>();
}
export class State extends Schema {
    @type({ map: Player })
    players = new MapSchema<Player>();

    something = "This attribute won't be sent to the client-side";

    createPlayer(sessionId: string) {
        this.players.set(sessionId, new Player());
    }

    removePlayer(sessionId: string) {
        this.players.delete(sessionId);
    }

    movePlayer(sessionId: string, movement: any) {
        this.players.get(sessionId).x = movement.x;
        this.players.get(sessionId).y = movement.y;
        this.players.get(sessionId).z = movement.z;
    }
}
export class GameRoom extends Room<State> {
    maxClients = 12;

    onCreate(options) {
        console.log("StateHandlerRoom created!", options);
        this.setState(new State());

        this.onMessage("move", (client, data) => {
            this.state.movePlayer(client.sessionId, data);
        });
    }

    onAuth(client, options, req) {
        return true;
    }

    onJoin(client: Client) {
        client.send("hello", "world");
        this.state.createPlayer(client.sessionId);
    }

    onLeave(client) {
        this.state.removePlayer(client.sessionId);
    }

    onDispose() {
        console.log("Dispose StateHandlerRoom");
    }
}
