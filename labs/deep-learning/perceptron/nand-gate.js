const perceptron = (weights) => (inputs, bias) => {
    const sum =
          inputs[0] * weights[0]
        + inputs[1] * weights[1];

    return sum + bias > 0 ? 1 : 0;
};

const trainingData = [
    [[0, 0], 1],
    [[0, 1], 1],
    [[1, 0], 1],
    [[1, 1], 0],
];

const bias = 3;
const testAccuracy = (neuron) => {
    const numberSuccesses = trainingData.reduce((successes, data) => {
        if (neuron(data[0], bias) === data[1]) {
            return successes + 1;
        }

        return successes;
    }, 0);

    return numberSuccesses / trainingData.length;
};

const almostNandGate = perceptron([0, 0]);
console.log(`Almost NAND Gate Accuracy: ${testAccuracy(almostNandGate) * 100}%`);

const nandGate = perceptron([-2, -2]);
console.log(`NAND Gate Accuracy: ${testAccuracy(nandGate) * 100}%`);
