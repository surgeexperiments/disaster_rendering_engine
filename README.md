NOTES (28/10/21): 
- I'm uploading this due to a me having a little talk about it. 
- Real life got in the way in the middle of cleaning up the code (after long time neglect!) and making a nice demo the last two weeks before the talk. 
- Result: The code is a bit of a mess
  : some demos don't compile. 
  : some of the unit tests don't work and/or are incomplete 
  : very inconsistent use of getters and setters
  : lots of the serializations need to be updated 
  : Some bad naming of stuff 
  : 100+ // TODO 
  : Also some of the comments are hard to read.
  : bugs :)
- transparent textures fails on Firefox, but not in Chrome!
- So this isn't a polished gem (it's currently a bit of a disaster), but at least it's an honest reflection of what can happen to hobby projects in real life:)
- This will all be fixed within the next few weeks. 


This project is just me trying to learn a bit about how 3d programming works.
Many tutorials will teach you the basics with small projects but 
not what happens when you have to scale up your program and make it handle multiple things (like lighting, various forms of animation ect) simultaneously. Also
dealing with different objects with various rendering requirements is an interesting challenge that is not often taught in smaller tutorials I've seen 
(rendering transparent and non transparent objects for example: that has to be done carefully. See classes Renderer and RenderList for how this is handled). 

The abstractions I've come up with are relatively similar among many different 3D engines, and its also based on the abstractions used in the GLTF file format.  Clearly the architecture of this program is inspired by other projects and various tutorials, but many of these engine projects share a lot architectural similarities anyway (as the underlying math is the same + the webGL api naturally will influence design). 

Clearly, if you look at the code U realize I'm not a typescript aficionado so don't expect any fancy syntax and language-tricks (but maybe some language-abuse). 
I'm sure ppl with lots of 3D programming skills also see many things that are done in a sub-par fashion. If this is the case I would really appreciate it if I got
some pointers for improvement :)

The main goal here is just to have fun, while hopefully learning something useful. Considerable parts of this program have been written while drinking beer. 


Project:
- setup: npm install 
- TODO: UPDATE : compile with webpack: npm run wp / wpw 
  : you can run the content in /build and get full debugging ability with ts files 
- run in browser: npm run serve 
- run tests: npm run test (all scripts are in package.json)


Matrix names: 
Camera: viewMatrix, projectionMatrix, viewProjectionMatrix
Mesh: worldMatrix (it's position in world space), localMatrix (transformations locally) 
Combination: modelViewProjectionMatrix : Mesh.worldMatrix * Camera.viewProjectionMatrix 


Data classes: why some contain mostly public and some contain mostly private fields 
- Some classes like GLShaders will be created when they are needed and clones passed out to 
  material instances. Shader creation and access are both strictly controlled, so these classes have fields that are "locked down". 
  Only the uniform-values that are pushed to the shader are allowed to be modified freely. 

- Other classes like Texture, GLTexture, GLBuffer and GLMesh will often require fields to change after cloning or loading before initializing with webgl. 
  To keep things simple: the fields in these are kept public unless they need special protection or handling of input. In these cases mostly
  getters and setters are used. 


Real time computed elements: 
- Shaders/GLShader: Shaders are created during scene loading /(LATER: in renderer? Try to avoid that?) by ShaderLoader. ShaderLoader creates all data, sets up the shaders and stores the result in GLShader instances. 
    GLShader will therefore not have an "initialized-flag" as they come installed from the get-go. 

    The reason for real-time computing shaders is that every shader option doubles the number of possible
    shaders. Given n shader options that can be turned on and off independently u got 2^n possible shaders. Storing all of those (in serialized GLShaders) is not practical. This is why ShaderLoader computes them during the program based on the requirements of the objects. 
  

Stored elements that needs to be initialized: 
- Some elements can be serialized and stored. When they are loaded from json they must be initialized again with WebGL. Therefore they have an "initialized flag". 

- GLTexture+Texture: These can be serialized and stored. When they are loaded from their serialized state they only contains settings. Thus they must be 
                     initialized with WebGL. This includes uploading textures and setting the texture parameters. 
- GLBuffer+GLMesh: same as GLTexture and Texture. 

- See ./src/resourcemanager for how this is done 


Serialization: 
- Any base class that is meant to only be inherited from will only contain jsonify() and sometimes setFromJSON(). 

Scene, serialization and the scene graph: 
- When objects that inherits from Node are serialized they will not store the uuid of their parents, their children or 
  include any of their child-objects in their serialization. 
-> Instead the scene-graph itself is stored by the scene when it is serialized (the scene will serialize all objects it contains linearly along with the scene graph). 
: The reason for this is that it was simpler to load items from json without having to deal with recursive creation of different child objects, 
  and then regenerate the scene graph separately. 
  Recursive creation would require stuff like an abstract factory, potential checks for cycles in the scene graph in the creation function (even if it should be a DAG/
  Directed Acyclic Graph someone could fuck it up), and I probably would have to write a lot more tests haha >: And at the current stage of this project I see no gain from adding all of this complexity. 
  Instead we avoid all of this and keep it simple by just serializing and recreating the scene graph itself (based on the uuid's of the serialized objects). 
  We still have checks for cycles in the scene graph, but it's not done recursively on the objects themselves. 


The ResourceLoader and re-usage of loaded elements
  ResourceLoader will cache all loaded Textures and Materials. 
  If a serialized Material refers to the uuid of a texture that has been loaded, it will be given that instance (sharing static textures among materials makes sense)
  If not a new Texture instance will be created and linked with WebGL. 

  The above is true for WorldMeshes and Materials as well. 

  This allows you to decide which Textures and Materials to share so you can avoid duplication of elements where it is not needed. 
  Remember: If two WorldMeshes shares a Material and one sets a uniform in the materials GLShader, the other WorldMesh will also get the same value set. 
            If you don't want this to happen, but still want to share textures, create two different material-instances that shares a textures. 


How uniforms are set: 
Certain stuff in WorldMesh and Material have to be matched against uniform-names (for example when setting texture units during rendering). 
To make things simple: the shader-names are the same as the field-names in certain classes. 
The names in the Shaders are not likely to change, nor are the names in the classes, so this solution is quite stable. 
Also: this avoids adding more glue-code to match things like Sampler2D names to Texture names in Material. 
 

