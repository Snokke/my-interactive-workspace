# My interactive workspace

<p align="center">
  <img src="https://github.com/Snokke/my-interactive-workspace/assets/36459180/3ef10ed6-2d94-4834-8ca4-d81df48f5fc1" />
</p>

**Live: [andriibabintsev.com](https://www.andriibabintsev.com/)**

This is my workspace in 3D with many interactive objects. You can move chair, open window, turn on air conditioner, open book, play music, play «Transfer it» game, and so on. I like these projects with rooms or some interesting scenes, but usually I miss ineractions with objects. I like when objects are interactive, and you can click on every object and something happend. So I made my workspace with many interactive objects, you can click on many objects and see what happens.

## Interactive objects

<p align="center">
  <img src="https://github.com/Snokke/my-interactive-workspace/assets/36459180/c99ea9c2-b08c-4dd5-85fe-73697d675965" />
</p>

There are 14 active objects. To highlight all active objects use button «Highlight active objects» in control panel.
I tried to add for every object some interesting interaction. For example: 
- window can be opened in two ways: starndard and ventilation
- keyboard has 9 different highlights type. Each key can be pressed (and from real keyaboard too). Some keys has functiality, for example: F8 - «play/pause song», F10 - «mute», F12 - «volume up», etc.
- speed and size of particles from air conditioner depends on temperature on air conditioner remote
- in locker you can find photo of my real workspace
  
Also there are some interaction between objects, for example if you turn on air conditioner than coffee steam will blow away.

## Control panel

## Some technical details and links
- 3D engine: [Three.js](https://threejs.org/)
- 2D engine: [Blacksmith 2D](https://blacksmith2d.io/)
- Physics for «Transfer it» game: [Cannon-es](https://pmndrs.github.io/cannon-es/)
- Intro camera movement: [Theatre.js](https://www.theatrejs.com/)
- Reading pdf: [PDF.js](https://mozilla.github.io/pdf.js/)
- Control panel: [Tweakpane](https://cocopon.github.io/tweakpane/)
- All models are done with [Blender](https://www.blender.org/)
- Inspired by [«My room in 3D» by Bruno Simon](https://my-room-in-3d.vercel.app/)

## Setup
Download [Node.js](https://nodejs.org/en/download). Run this followed commands:

```
# Install dependencies
npm install

# Run the local server at localhost:5173
npm start

# Build for production in the dist/ directory
npm run build
```
