var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;

var engine = Engine.create();

var w = window.innerWidth;
var h = window.innerHeight;

var render = Render.create({
    element: document.getElementById("root"),
    engine: engine,
    options: {
        width: w,
        height: h,
        wireframes: false,
    },
});

var host = window.document.location.host.replace(/:.*/, "");

var client = new Colyseus.Client(
    location.protocol.replace("http", "ws") +
        "//" +
        host +
        (location.port ? ":" + location.port : "")
);
let room;

class Player {
    constructor(name) {}
}

var topWall = Bodies.rectangle(600, 50, 1400, 20, { isStatic: true });
var leftWall = Bodies.rectangle(50, 600, 20, 1200, { isStatic: true });
var rightWall = Bodies.rectangle(1200, 600, 20, 1200, { isStatic: true });
var bottomWall = Bodies.rectangle(600, 600, 1400, 20, { isStatic: true });

/* @dev @Jayphire */
// FETCH METADATA
// MAP METADATA TO FORM BODIES DEPENDING ON THEIR ATTRIBUTES
// CREATE NEW PLAYER ARR FROM THE MAP
var players = [];
var player1 = Bodies.rectangle(90, 120, 70, 70);
var mouse = Matter.Mouse.create(render.canvas),
    mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false,
            },
        },
    });
const playoor = Matter.Bodies.rectangle(100, 150, 100, 100, {
    label: `subaru ${Math.random()}`,
});

World.add(engine.world, [playoor]);

Matter.Composite.add(engine.world, mouseConstraint);

client.joinOrCreate("game").then((room) => {
    room.state.players.onAdd = function (player, sessionId) {
        const newPlayer = Matter.Bodies.rectangle(
            player.x,
            player.y,
            100,
            100,
            { label: `subaru ${Math.random()}` }
        );
        // World.add(engine.world, [newPlayer]);
        const obj = {};
        obj[sessionId] = newPlayer;
        players.push(obj);
        player.onChange = function (changes) {
            console.log(changes);
            Matter.Body.setPosition(playoor, {
                x: player.x,
                y: player.y,
            });
            Matter.Body.setAngle(playoor, player.z);
        };

        // setInterval(() => {
        //     room.send("move", {
        //         x: newPlayer.position.x,
        //         y: newPlayer.position.y,
        //         z: newPlayer.angle,
        //     });
        // }, 500);
    };
});
Matter.Events.on(render, "afterRender", () => {
    console.log("here");
    room.send("move", {
        x: playoor.position.x,
        y: playoor.position.y,
        z: playoor.angle,
    });
});
console.log(players);
const playerArr = [player1];
World.add(engine.world, [
    topWall,
    leftWall,
    rightWall,
    bottomWall,
    // ...playerArr,
]);

engine.gravity.x = 0;
engine.gravity.y = 0;

Matter.Runner.run(engine);

Render.run(render);
