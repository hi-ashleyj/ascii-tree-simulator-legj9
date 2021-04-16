let SRandom = function(seed) {
    this.seed = (seed) ? seed : Math.floor(Math.random() * Math.pow(2, 16));
    this.seedButBig = Math.pow(this.seed, 2);

    this.smallPrime = 1789;
    this.normalPrime = 6203;
    this.bigPrime = 70423;

    return this;
};

SRandom.prototype.getPos = function(pos) {
    let perfectPos = pos * this.smallPrime % this.normalPrime;
    let value = perfectPos * this.seedButBig;

    let valueOut = (value % this.bigPrime) / this.bigPrime;
    if (valueOut < 0) { valueOut += 1; }

    return valueOut;
};