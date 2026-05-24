---
layout: post
title: "Fibonacci sequence generator in Go"
excerpt: "Is it possible to develop generators in Golang? Sure! Here is an elegant way based on Fibonacci sequence."
illustration: "/img/posts/fibonacci/fibonacci.jpg"
illustration_thumbnail: "/img/posts/fibonacci/fibonacci-thumbnail.jpg"
illustration_title: "Aloe polyphylla Schönland ex Pillans, by brewbooks"
illustration_link: "https://www.flickr.com/photos/brewbooks/184343329/in/photolist-hhNRg-anWEym-jy4a28-8uZ1sH-EGkdv-8uZ1ei-8uZ14Z-7SgN3K-aoVdEv-anUSGr-dxvd-bv8MnG-9vRVmS-4ikigj-9DbKwK-5KeLV6-9RTaVL-bmdTD4-76e6Qi-hhNZc-9bVtin-dxZk3Q-bPBLWR-4EyoZu-8xqiUp-6otXyz-oKrwBx-4hMW59-zy5W1-7vwzri-6osmzH-4DTHGZ-nwQzjA-9To3zv-5Pimso-hhA7Fs-b4NbR2-o8z6-5SQHTF-oHpG4L-7y3Du-aYR4jP-4tL7of-FV8eV-8qTcFy-aYR4f4-dKeAhD-aYR3Lp-aYR4Vn-aYR3Sc"
---

When completing one of the mathematical challenge of [Project Euler](https://projecteuler.net/), I had to compute some
Fibonacci numbers. I found, with the help of [François Zaninotto](http://redotheweb.com/), a very elegant way to get the
terms of this famous sequence, based on a [StackOverflow answer](http://codereview.stackexchange.com/a/28445).

As a reminder, the Fibonacci sequence is defined as:

<img src="/img/posts/fibonacci.gif" alt="Fibonacci sequence definition" title="Fibonacci sequence definition" />

A very naive and simple way to implement it would be the following:

``` go
func GetFibonacci(first int, second int, rank int) int {
    if rank == 1 {
        return first
    }

    if rank == 2 {
        return second
    }

    return GetFibonacci(first, second, rank - 1) + GetFibonacci(first, second, rank - 2)
}
```

This is just a retranscription of previous formulas. But using Go in this case does not bring anything special. So, here
is a more elegant and Go-friendly way, including a generator:

``` go
func FibonacciGenerator(first int, second int) chan int {
    c := make(chan int)

    go func() {
        for i, j := first, second ; ; j, i = i + j, j {
            c <- i
        }
    }()

    return c
}
```
As the initial conditions may vary, we parametrize the first and second Fibonacci terms. Then, we create a new channel
containing only integers with the `make` function. Consider a channel like a FIFO stack: you can insert some values in
it with the `->` (move towards) operator or consume them with `<-` (take from). This is the most awesome and damn simple
feature of Go language. With channels, you can prevent your code from becoming a callback hell all Node.js developers
already experienced.

Then, we declare an anonymous go-routine. A Go routine is simply executed in a separate thread. Just think about it as
an asynchronous function. All the Fibonacci logical is located in the `for` clause, using the possibility to assign
several variables with a single `=` operator. The following line is the key one: we write `i` value into the channel.
Yet, writing into a channel blocks current thread until the value is read. In this case, it simply yield the returned
Fibonacci term.

To write a list of 10 first Fibonacci numbers, you can simply use the following code:

``` go
import "fmt"

// Generator code

func main() {
    generator := FibonacciGenerator(1, 1)
    for i := 0 ; i < 10 ; i++ {
        fmt.Println(<- generator)
    }
}
```
So short but elegant code... The more in Go I develop, the more addicted I become! :)
