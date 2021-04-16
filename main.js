Game.create({ width: 1920, height: 1080 });

let baseLayer = new Layer("base", { level: 0 });
let treesLayer = new Layer("trees", { level: 1 });
let detailsLayer = new Layer("details", {level: 2});
let background = new GameObject({ asset: new Asset.Primitive({ type: "rectangle", fill: "#000000" }), x: 0, y: 0, w: Game.width, h: Game.height });
baseLayer.assign(background);

let sRandom = new SRandom();

let Terrain = {};
Terrain.Stash = [];
Terrain.position = 0;
Terrain.numLines = 10;
Terrain.lineGap = 10;

new Asset.Font("Inconsolata", "ttf/Inconsolata.ttf");

Terrain.lineHeight = Math.floor((Game.height - (Terrain.lineGap * (Terrain.numLines - 1))) / Terrain.numLines);
Terrain.textStyle = Terrain.lineHeight + "px Inconsolata";
Terrain.lineWidth = 1;

baseLayer.ctx.font = Terrain.textStyle;

while (baseLayer.ctx.measureText("/".repeat(Terrain.lineWidth)).width < Game.width) {
    Terrain.lineWidth ++;
}

Terrain.populate = function() {
    Terrain.Stash = new Array(Terrain.lineWidth);
    for (let i = 0; i < Terrain.lineWidth; i++) {
        Terrain.Stash[i] = sRandom.getPos(i);
    }
};

Terrain.shift = function(x) {
    if (x < 0) {
        let nextPos = Terrain.position - 1;
        let nextValue = sRandom.getPos(nextPos);
        Terrain.Stash.unshift(nextValue);
        Terrain.Stash.pop();
    } else if (x > 0) {
        let nextPos = Terrain.position + Terrain.lineWidth;
        let nextValue = sRandom.getPos(nextPos);
        Terrain.Stash.push(nextValue);
        Terrain.Stash.shift();
    }

    Terrain.position += x;
};

let replaceStrI = function(str, index, replacement) {
    return str.substr(0, index) + replacement + str.substr(index + replacement.length);
}

let clamp = function(number, min, max) {
    return Math.max(min, Math.min(number, max));
}

Terrain.draw = function(layer) {
    let line = " ".repeat(Terrain.lineWidth)
    let render = (new Array(Terrain.numLines)).fill(line);

    for (let i = 0; i < Terrain.lineWidth; i ++) {
        let value = Terrain.Stash[i]
        let treeSize = Math.floor(value * 5) + 3;
        let trunkSize = (Math.floor(value * 10) % 2);
        let treeValue = ((value * 10) % 1);

        let isTree = treeValue < 0.2;

        if (isTree) {
            render[0] = replaceStrI(render[0], i, "|");
            if (trunkSize > 0 && i + 1 < Terrain.lineWidth) {
                render[0] = replaceStrI(render[0], i + 1, "|");
            }

            for (let j = 1; j <= treeSize; j++) {
                // Do Trunk
                render[j] = replaceStrI(render[j], i, "|");
                if (trunkSize > 0 && i + 1 < Terrain.lineWidth) {
                    render[j] = replaceStrI(render[j], i + 1, "|");
                }

                let leafSize = Math.ceil((treeSize - j + 1) / 2);
                // Do Left Leaves
                for (let k = i - 1; k > clamp(i - 1 - leafSize, 0, Terrain.lineWidth); k --) {
                    render[j] = replaceStrI(render[j], k, "/");
                }

                // Do Right Leaves
                for (let k = i + trunkSize + 1; k < clamp(i + 1 + trunkSize + leafSize, 0, Terrain.lineWidth); k ++) {
                    render[j] = replaceStrI(render[j], k, "\\");
                }
            }

            // Do top on double width trees
            if (trunkSize > 0) {
                render[treeSize + 1] = replaceStrI(render[treeSize + 1], clamp(i, 0, Terrain.lineWidth), "/");
                render[treeSize + 1] = replaceStrI(render[treeSize + 1], clamp(i + 1, 0, Terrain.lineWidth), "\\");
            }

        } else if (render[0][i] == " ") {
            render[0] = replaceStrI(render[0], i, "_");
        }
    }

    let yPos = Game.height;

    for (let i in render) {
        Terrain.textNodes[i].text = render[i];
        Terrain.textNodes[i].draw(layer, Game.width / 2, yPos, 10, 10);
        yPos -= Terrain.lineHeight;
        yPos -= Terrain.lineGap;
    }
};

Terrain.setup = function() {
    Terrain.populate();

    Terrain.textNodes = [];

    for (let i = 0; i < Terrain.numLines; i++) {
        Terrain.textNodes.push(
            new Text({ text: "Groovy", size: Terrain.lineHeight, font: "Inconsolata", fill: "#00ff00", alignH: "center", alignV: "bottom" })
        );
    }
};

Terrain.setup();

baseLayer.assign(Terrain);

// Show details

let seedText = new Text({ text: "SEED: " + sRandom.seed, size: 30, font: "Inconsolata", fill: "#ffffff", stroke: "#000000", alignV: "top", alignH: "left"})
let positionText = new Text({ text: "POSITION: " + Terrain.position.x, size: 30, font: "Inconsolata", fill: "#ffffff", stroke: "#000000", alignV: "top", alignH: "right" })

detailsLayer.assign(
    new GameObject({ asset: seedText, x: 20, y: 20, w: 20, h: 20}),
    new GameObject({ asset: positionText, x: Game.width - 20, y: 20, w: 20, h: 20})
);

let stepLoop = 0;

Game.on("loop", ({ stamp, delta }) => {
    let movement = 0;

    if (Controller.isPressed("key_a")) {
        movement += -1;
    }
    if (Controller.isPressed("key_d")) {
        movement += 1;
    }
    if (Controller.isPressed("key_arrowleft")) {
        movement += -1;
    }
    if (Controller.isPressed("key_arrowright")) {
        movement += 1;
    }

    stepLoop += delta;
    if (stepLoop > 90) {
        Terrain.shift(movement);
        stepLoop %= 100;
    }

    positionText.text = "POSITION: " + Terrain.position;
});

Game.start();