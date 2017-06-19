# Introduction to Neural Networks: the Perceptron

Neural networks (and more generally, deep learning) are definitively a trending topic. [FIND SOME EXAMPLES]... A wide and growing number of fields are affected. Yet, from a majority of developers (including me), this is a very complex area, requiring a solid mathematical knowledge and a bit of intuition before being able to create a first simple application.

I read a lot about deep learning. And we must recognize that a majority of posts and books about artificial intelligence are written by mathematicians for mathematicians. No offense here, but as a developer with a light mathematic background and a more practical mind, we are often lost in so many abstract definitions and exotic formulas. So, I decided to compile all my personal notes into a series of posts about deep learning and neural networks without all the usual PhD gobbledygook.

## What is a Neural Network?

According to [Wikipedia](https://en.wikipedia.org/wiki/Artificial_neural_network):

> Artificial neural networks (ANNs) [...] are computing systems inspired by the biological neural networks that constitute animal brains. Such systems learn (progressively improve performance) to do tasks by considering examples, generally without task-specific programming.

As you probably already know, neural networks are simply mimicking the complexity of our brains (even if they are far away from rivalizing with a human).

Neural networks behave like unit tests. We provide them some inputs and expect some given outputs. Yet, we don't develop the related program. Instead, the neural network learns itself from the data, and try to find the best matching formula to link inputs to outputs. Once trained, it can extrapolate to another set of data, and predict some invisible behavior.

One of the most important thing I learned during my journey in my deep learning training is that nobody really knows how it works under the hood. Given a specific state of the learning process, we are not able to interpret each neuron individually, but only understand the whole process. And improving our network is done by changing some network parameters, mostly randomly. All the challenge consists to quantify the efficiency of a network and to understand the underlying global structure.

But enough of theory, let's play with some code. We are developers, right? ;)

## Perceptron, the Simplest Neuron

The Perceptron is the simplest existing neuron. It is the "Hello world!" of neural network. And, even if it is quite simple, we are going to create a basic calculator using several perceptrons.

### What is a Perceptron?

A Perceptron takes one (or more) inputs and gives a single output. Let's represent it using following schema:

This neuron takes three inputs: `x1`, `x2` and `x3`. Its output `y` is a binary one: it can takes only two values: `0` and `1`. Their related code may be something like:

``` js
const perceptron = (inputs) => {
    const sum = inputs[0] + inputs[1] + inputs[2];

    return sum > 0.5 ? 1 : 0;
}
```

Note that for clarity's sake, I always consider we have three inputs, and use some non functional code to ease understanding.

Notice the `0.5` constant? This is called the `threshold`. As we don't like magical numbers in our code, let's pass it as a parameter too:

``` js
const perceptron = (inputs, threshold) => {
    const sum = inputs[0] + inputs[1] + inputs[2];

    return sum > threshold ? 1 : 0;
}
```

It looks fine. Yet, how can we interact on the output neuron? In current state, our code is not able to learn, ie. adapting its internal parameters to provide expected output from fixed inputs. That's why we add some weights to our inputs:

``` js
const weights = [0, 1, 2];
const perceptron = (inputs, threshold) => {
    const sum =
          inputs[0] * weights[0]
        + inputs[1] * weights[1]
        + inputs[2] * weights[2];

    return sum > threshold ? 1 : 0;
}
```

We declared our `weights` as a constant. Indeed, currently our neuron is not able to learn by itself. It still requires a developer to adapt its weights manually. We'll see in another post how to adapt them automatically using something called "back propagation". For now, we'll just grope around manually.

To simplify notation, and to be compliant with all the available litterature about deep learning, let's move the `threshold` to the other side of the equation:

``` diff
- return sum > threshold ? 1 : 0;
+ return sum - threshold > 0 ? 1 : 0;
```

Now, considering a new entity `bias` equivalent to `-threshold`, we can rewrite our code as:

``` diff
- return sum > threshold ? 1 : 0;
+ return sum + bias > 0 ? 1 : 0;
```
We are now compliant with the deep learning ubiquituous language. Our perceptron now looks like:

``` js
const weights = [0, 1, 2];
const perceptron = (inputs, bias) => {
    const sum =
          inputs[0] * weights[0]
        + inputs[1] * weights[1]
        + inputs[2] * weights[2];

    return sum + bias > 0 ? 1 : 0;
};
```

Consider the `bias` as the facility for the neuron to output a truthy value. The more small it is, the less often the neuron will trigger. And in return, the more big it is, the more often the neuron will trigger.

We got a quite good description of what a Perceptron is. But, how can it learn by itself, without having a developer changing its weights between each iteration?

### Perceptron as a NAND Gate

Let's consider we want a [NAND gate](https://en.wikipedia.org/wiki/NAND_gate) for our Perceptron. It means we want the following inputs/output:

| x1 | x2 | y |
|----|----|---|
|  0 |  0 | 1 |
|  0 |  1 | 1 |
|  1 |  0 | 1 |
|  1 |  1 | 0 |

We got some fixed inputs, and we know what we want as an output. So, we can use some neural networks to achieve it. Yet, how should we choose our weights and bias to get our expected outputs?

This problem may be solved by a single neuron network. There are probably more complex solutions, but let's focus on the simplest one. Bias and weights are closely related. So let's fix the bias to `3`. Let's analyze our neuron accuracy using the following code:

``` js
// Perceptron factory with ability to init weights
const perceptron = (weights) => (inputs, bias) => {
    const sum =
          inputs[0] * weights[0]
        + inputs[1] * weights[1];

    return sum + bias > 0 ? 1 : 0;
};

// our training data based on logical table
const trainingData = [
    [[0, 0], 1],
    [[0, 1], 1],
    [[1, 0], 1],
    [[1, 1], 0],
];

// set bias to a random value
const bias = 3;

const testAccuracy = (neuron) => {
    // test all our training data and count how our neuron do the job
    const numberSuccesses = trainingData.reduce((successes, data) => {
        if (neuron(data[0], bias) === data[1]) {
            return successes + 1;
        }

        return successes;
    }, 0);

    // return accuracy as a percentage
    return numberSuccesses / trainingData.length;
};

const neuron = perceptron([0, 0]);
console.log(`Accuracy: ${testAccuracy(neuron) * 100}%`);
```

If we execute previous code, with `[0, 0]` weights, we'll get:

> Accuracy: 75%

Quite good in huge datasets, but it really sucks for such a predictible and small
data set. But, if we change the weights to `[-2, -2]`, we'll get the holy grail:

> Accuracy: 100%

Hurrah! Our neuron behaves like a NAND gate.

### Use Perceptron as a Calculator
