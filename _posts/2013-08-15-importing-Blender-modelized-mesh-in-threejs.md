---
layout: post
title: Importing a modelized mesh from Blender to Three.js
---

# {{ page.title }}

We have already seen in a previous post [how to create a rotating cube with Three.js](http://www.jonathan-petitcolas.com/2013/04/02/create-rotating-cube-in-webgl-with-threejs.html). We are going to go further in this article: moving a more complex mesh. Yet, as we are not designer (and a fortiori, not 3D designer), we will focus on a not too complicated mesh: the [Marmelab](http://www.marmelab.com) logo.

## Modelizing Marmelab logo with Blender

We will use [Blender](http://www.blender.org/), which is a free and open-source 3D modelizer. First, let's create the mesh, which is simply the letter M composed of five cubes.

As describing the process by writing would be tricky to write and to read, here is the video tutorial to reproduce the Marmelab logo. As one picture worth a thousand words, how many worth a video?

<iframe width="640" height="480" src="//www.youtube.com/embed/EXo_2sey4LY?rel=0" frameborder="0" allowfullscreen></iframe>

## Export a Blender mesh to Three.js

Now that we got our mesh (you can download it here), let's take a look on how to export it into Three.js. Three.js expects to get a Mesh in JSON format. Fortunately, the community has already provided a [Blender to Three.js exporter](https://github.com/mrdoob/three.js/tree/master/utils/exporters/blender). Currently, Three.js does not support Blender 2.8, yet the 2.66 version still works fine. So, download this version and put it into the *C:\Program Files\Blender Foundation\Blender\2.68\scripts\addons* folder.

Restart Blender, open the *File > User preferences* and go to the *Addons* tab. Search for *Three.js* and enable the found plug-in. Now, you should be able to see a *File > Export > Three.js* option. So, just apply this new feature on our mesh to get a file looking like the following:

``` js
{

    "metadata" :
    {
        "formatVersion" : 3.1,
        "generatedBy"   : "Blender 2.66 Exporter",
        "vertices"      : 28,
        "faces"         : 26,
        "normals"       : 19,
        "colors"        : 0,
        "uvs"           : [],
        "materials"     : 1,
        "morphTargets"  : 0,
        "bones"         : 0
    },

    "scale" : 1.000000,

    "materials" : [ {
        "DbgColor" : 15658734,
        "DbgIndex" : 0,
        "DbgName" : "Material",
        "blending" : "NormalBlending",
        "colorAmbient" : [0.6400000190734865, 0.6400000190734865, 0.6400000190734865],
        "colorDiffuse" : [0.6400000190734865, 0.6400000190734865, 0.6400000190734865],
        "colorSpecular" : [0.5, 0.5, 0.5],
        "depthTest" : true,
        "depthWrite" : true,
        "shading" : "Lambert",
        "specularCoef" : 50,
        "transparency" : 1.0,
        "transparent" : false,
        "vertexColors" : false
    }],

    "vertices" : [ /* ... */ ],

    "morphTargets" : [],

    "normals" : [ /* ... */ ],

    "colors" : [],

    "uvs" : [],

    "faces" : [ /* ... */ ],

    "bones" : [],

    "skinIndices" : [],

    "skinWeights" : [],

    "animation" : {}


}

```

All required data is here. The most important are the vertices, the faces and the normals, which will allow Three.js to correctly rebuild our model.

Now we got our mesh into an understandable format, let's import it in Three.js. Based on the last tutorial code, we just have to replace our `initCube` function by a `initModels` one:

``` js
var logo = null;
function initModels() {
    var loader = new THREE.JSONLoader();
    loader.load('./models/marmelab-without-textures.js', function(geometry) {
        logo = new THREE.Mesh(geometry);
        scene.add(logo);
    });
}
```

We define a another global variable as we will have to change the `rotateCube` function by a `rotateLogo` one:

```js
function rotateLogo() {
    if (!logo) {
        return;
    }

    logo.rotation.x -= SPEED * 2;
    logo.rotation.y -= SPEED;
    logo.rotation.z -= SPEED * 3;
}
```

As you can see, working with a mesh is exactly the same as working with a primitive. We just check that we got a logo here to avoid a warning. Indeed, the loading function is an asynchrounous one. Thus, the rendering loop may start before our model is in memory.

Do not forget to update the `render` function accordingly, and refresh your browser. You should see a wireframed rotating Marmelab logo.

Yet, if you look deeper, you may see a graphical glitch:

<p class="center">
    <img src="/img/posts/marmelab-logo-glitch.png" alt="Marmelab rotation logo's glitch" title="Marmelab rotation logo's glitch" />
</p>

It seems some edges are broken. No mesh has been hurt during this animation, I swear. It is just a concrete example of the `zFar` distance from this previous post schema:

<p class="center">
    <img src="/img/posts/perspective-ecran.png" alt="Perspective camera in WebGL" title="Perspective camera in WebGL" />
</p>

The value provided to the camera is not enough. So, we got two solutions: either increase the camera maximum length vision, or reduce the size of our mesh. Opted for the latter. Modify the `initModels` method adding this line in the callback:

``` js
logo.scale.x = logo.scale.y = logo.scale.z = 0.75;
```

This way, we reduce the size of our rotation logo by quarter. The glitch should have disappered.

## Using an orthographic camera

Comment the line making the logo rotating and let's take a look of the rendering:

<p class="center">
    <img src="/img/posts/marmelab-logo-perspective-camera.png" alt="Marmelab logo with perspective camera" title="Marmelab logo with perspective camera" />
</p>

Look's pretty ugly, isn't it? This is because we use the perspective camera. Now, the Marmelab logo displayed on the official website is seen from an orthographic view. Let's replace our camera initialization to an orthographic one:

``` js

```
