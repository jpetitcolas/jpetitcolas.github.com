---
layout: post
title: "Introduction to Unity: creating a Pong clone"
---

I often hear about [Unity](https://unity3d.com/) as a development framework for
video games. And I often see its logo in a wide range of games I play, from big
games as *Ori and the Blind Forest* to small indie games as *MouseCraft*. So, I
took advantage of my holidays to put a look on it, and more generally on video
games development.

As an *Hello World* project, we are going to create a Pong clone game. For the
most hurried, You can play with the resulting game in the [demo](#) or just
browse its [GitHub repository](#).

## Installing Unity

First big discovery: Unity is not just a game framework embedding some helper
methods, but a full-featured game development platform, with an important
WYSIWYG part. Of course, to fine-tuned your game-play, we'll have to write some
code, but Unity already supports a lot of features out of the box, such as gravity
or collision detector. Really powerful, as we're going to see it.

Unity is natively available on both Windows and Mac, and as an [experimental build
on Linux]. However, this version is **really** experimental, as I wasn't able to
get any font visible in the editor. You can also try using Wine, helped by the
[official Wiki](http://wiki.unity3d.com/index.php/Running_Unity_on_Linux_through_Wine).
Yet, with this method, I had an issue with the license server.

This is the reason why we are going to use the Windows version in this post: waiting
for a more stable Linux version.

### License

There are two versions of Unity: the personal edition and the professional one.
The difference is the latter includes better reporting and support. We don't
really care for the moment.

> Unity 5 Personal Edition is a free and fully functional game engine. You can download it and use it, provided that you or the commercial, educational or government entity you represent did not earn or receive funding of more than USD$100,000 in gross revenue during the most recently completed fiscal year as stated in the Unity Software License Agreement. If your entity’s revenue later exceeds USD$100,000 after you activate your license, you will need to purchase Unity Pro or cease using Unity Personal.

You can even sell your games with the Personal Edition, assuming that your incomes
don't exceed $100.000 during the last year. See the [Unity EULA](http://unity3d.com/legal/eula)
for more details. That's really fair, and I guess a lot of indie developers would
be very happy to have to pay a professional license (from $75 per month).

## Creating a Pong clone with Unity

Launching Unity editor opens a wizard pop-up, asking us for details about our
project. Give it a name, and specify if it is a 2D or 3D game. In our case, *Pong*
is a *2D* game. You can also choose some external packages to embed into your project.
This is especially useful if you need some extra features such as particles one.

[XXX SCREEN WIZARD ###]

The main editor screen should appear. It is splitted into four main sections:

* Scene view: this is where we will position our game objects,
* Inspector (click on the scene camera to make it appear): a set of properties
  to configure our objects,
* Hierarchy: logical ordered list of game objects,
* Project: file tree of your project.

[XXX SCREEN UNITY MAIN SCREEN XXX]

There is also a `Game` tab which renders the game when launched thanks to the
play button at the top.

### Position game objects: paddles and ball

First step is to position all our game objects. We can either design them on our
own, or use some online resources. For games, a good resource is the
[OpenGameArt repository](http://opengameart.org). On this website, you can find
a lot of fonts, sprites or sounds freely available for your developments.

Thus, here are the sprites we are going to use:

[XXX PADDLE RED XXX]
[XXX PADDLE BLUE XXX]
[XXX BALL XXX]

To import it in your project, we simply drag and drop them into the `Assets`
folder of our `Project` view. We can also create a `Sprites` folder to better
organize our files.

#### Adding sprites to our 2D game

Let's add a paddle to our game by dragging the imported sprite on the `Scene`
panel. Clicking on it enables the `Inspector` of our game object. There are
several sections (called *Components*). We are going to focus on the first one:
`Transform`.

The `Transform` component deals with the position, rotation and scale of your
object (all the spatial transformations, hence the name). You can reset it all
these properties to 0 clicking on the hog at the top right corner, and then
selecting `Reset`.

For our paddle, we need to rotate it at 90° along Z axis (the one orthogonal to
your screen), and then translate it of (let's say) -6 game units along the X axis.
Our paddle is now well positionned.

Finally, let's rename it to `LeftPaddle` to ease its identification later.

Repeat the same process for both the ball and the other paddle, and you should
get the following result:

[XXX SCREEN WITH PADDLES AND BALL XXX]

#### Playing with 2D camera

#### Adding 3D objects to our 2D game: walls

We are almost done with graphics: we just need some extra top and bottom walls
to prevent our ball from leaving the game area. We can either use some sprites,
or include a 3D object.

Indeed, Unity doesn't restrict developers to use only 2D in 2D games. And in this
case, this is especially useful as we won't need any extra textures nor line
renderer.



So, let's create a wall using a 3D cube. To import such a mesh, simply XXXXXX.
Then, select it and move it to 6 units along Y axis. It will be our `TopWall`
object. Change the scale of this mesh to `X: 12, Y: 0.1` to have a thin line.
Our wall is then finished.

We duplicate `TopWall` element selecting it and pressing `SHIFT + D`. Rename
it to `BottomWall` and just change its position to `Y: -6`.

Fine: we now have all our game objects displayed. Clicking on the `Play` button
should render the following static scene:

[XXX SCREEN WITH ALL ELEMENTS XXX]



## Deploy our Unity game to Web and Android
