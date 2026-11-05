---
title: "All I had was the trailer: how AI brought back a game of mine lost 12 years ago"
date: 2026-11-04
tags:
  - posts-en
  - games
  - technology
  - ai
translationKey: insonia-remake
---

![Three moments from the 2014 trailer next to the remake running in the browser: the cell, the hospital flashback and the bear's room](/blog/img/insonia/trailer-x-remake.jpg)

In 2014 I made a horror game in RPG Maker VX Ace called **Insônia** (Portuguese for "insomnia"). A man wakes up in a cell with no memory, finds a letter that says *"Born of fire. Welcome to your new home"*, and has to get out of a place that feels like a nightmare.

The project was lost. No game file was left, no maps, no scripts. What was left was a **17-minute gameplay trailer** on YouTube, with no audio, at 474×360 pixels and 15 frames per second. And 19 screenshots I had put on my website back then.

I asked an AI agent (Claude Code) to rebuild the game from that video, "as identical as possible". Today Insônia runs again, in the browser and on the phone, from start to finish. The link to play it is at the end of this post.

This post is about how that was done: the techniques, the mistakes, and the parts that surprised me the most.

## The starting point

There wasn't much to go on:

- **The trailer:** 17:22 of someone (me, in 2014) playing the game from start to finish, in low resolution, with very dark scenes and no sound at all.
- **The 2014 screenshots:** 19 images at 800×600, with more detail than the video.
- **My memory:** I remembered downloading a graphics pack called **Mack**, and that its characters were tall, two tiles high.

That's it. Not a single line of the original code.

## 1. Finding the original graphics

The first step was finding the same graphics I had used. The agent found the Mack pack: tiles and characters by a Japanese author, shared on the REFMAP blog for RPG Maker users. The protagonist in the trailer is sheet キャラ03, character 2.

The rest came from two places:

- **The RPG Maker VX Ace RTP**, the program's default graphics pack. The agent extracted the images straight from the installer file, in Python.
- **A game of mine from 2011**, *Brian's Mansion*, which lives in the same repository. The 2014 screenshots showed a lantern, a teddy bear and a door that existed neither in Mack nor in the RTP. They were in Brian's Mansion's graphics sheets. I had reused them and forgotten.

Everything was converted to grayscale, like the original game.

## 2. An RPG Maker engine inside the browser

RPG Maker doesn't run in the browser, so the engine was rewritten in JavaScript, imitating how VX Ace behaves:

- a 544×416 screen with 32-pixel tiles;
- *autotiles*, the RPG Maker system that assembles floors and walls with the right corners;
- lighting: each room has a tone, an ambient light, lamps with halos, and a lantern around the hero;
- a message window with letter-by-letter text, choices, number input and RPG Maker's name-entry keyboard;
- an inventory with "Usar", "Analizar" and "Descartar" (misspelled with a Z, exactly as in the game);
- autosave and touch controls for the phone.

There are 20 maps and a script with 175 lines of dialogue.

## 3. Measuring the rooms from the video

The trailer video is the game screen scaled down from 544×416 to 474×360. Knowing that, every frame can be mapped back onto the tile grid: every wall, every bed and every stain on the floor lands on a 32×32 square.

Small rooms fit on one screen. The big ones (the main corridor, the hall, the pillar corridor and the final corridor) scroll as the hero walks. For those, the agent built **panoramas**: it stitched consecutive frames of the video together, matching each to the previous one by how far the image moved, until it had the whole room. Since the hero is in every frame, he shows up repeated along his path.

![Panorama of the hall stitched from trailer frames, with the tile grid on top; the hero shows up several times along the path he walked](/blog/img/insonia/panorama-salao.jpg)

The final corridor took more work. In the trailer the light goes out every few steps and the screen turns black, so it looked like several different maps. The panorama showed it is a single corridor, 56 tiles tall. The lights going out became a game mechanic.

## 4. The dialogue, read from the video

The text of every line was taken from the trailer with OCR: text recognition every half second of video, 2,085 readings in total. Identical consecutive readings were grouped into 214 text blocks and checked.

The original spelling stayed as it was, typos included. It's the game I made when I was 20, and the remake doesn't correct its author.

## 5. The 2014 screenshots as an answer key

The screenshots from my website have much more resolution than the video (800×600 versus 474×360). With them, the agent compared room by room, on the same tile grid, and fixed what the video couldn't show:

- the bathroom dividers, which were brick walls and not thin lines;
- the animated lantern and the rounded door, from Brian's Mansion;
- the shape of the bear's room;
- two pieces of the shape puzzle board, which were heptagons and not pentagons.

![On the left, the remake; on the right, the 2014 screenshots, aligned on the same tile grid](/blog/img/insonia/remake-x-capturas-2014.jpg)

One of the screenshots shows the shape puzzle **already solved**, and it confirmed the solution that had been deduced earlier.

## 6. What the trailer doesn't show

A video shows what happened, not the rules. Some things had to be deduced:

- **The staircase code (1264):** it comes from the numbers scratched in the four bathroom stalls, which appear in the trailer.
- **The password box:** the trailer shows the word "Perdido" ("Lost") and the code 0011 being typed, but not where the player got them. The remake gained two clues in the room: torn papers with the word and a jar with the number.
- **The rotating room:** the trailer shows the "Left / Right" choice three times before the bottom exit opens.

And some things only showed up when I played. The first time I played the remake, I got stuck in the air duct. The way out was a floor grate that wasn't visible. It is drawn now, and the hero gives a hint when he reaches the ends of the tunnel.

## 7. Testing by actually playing

To know whether the game could be finished, the agent wrote an **automated player**. It opens the game in a windowless Chromium and plays with the keyboard only: arrow keys, Enter and "I", like a person. To walk, it computes the path to the next goal; for everything else, it presses keys.

That player finished the game from the title screen to the last scene, with all 175 lines and no errors. Along the way it found bugs I wouldn't have seen so soon:

- walking into a door while holding the arrow key didn't open it;
- closing the game in the middle of the flashback left "Continue" stuck in a room with no exit;
- no exit of any map could lead somewhere with no way back, and that was tested exit by exit, in both directions.

## 8. Sound for a game that had none in the video

The trailer is silent, so the sound was built from scratch, in two layers.

The **ambience** is synthesized by code, in the spirit of *Amnesia: The Dark Descent*:

- **Continuous layers:** basement air, a low hum of dread, wind in the corridors, rain in the flashback.
- **Distant events:** every now and then, a drip, a creaking beam, a thud, a chain.
- **The heart:** it starts beating when the monster is near.
- **The space:** each room has the reverb of its size.

The **sound effects** started synthesized too, from physical models (friction for the door hinge, vibration modes for metal). I listened and found them fake: they sounded like "metal cylinders". I swapped them for **real public-domain (CC0) recordings**, from packs like Kenney's and OpenGameArt's: footsteps on wood, stone and carpet, the handle of a locked door, a lock opening, falling metal, screams.

The agent can't hear. So the audio was checked by **measuring**: the game renders its sound offline, and a script measures loudness, spectrum, peaks and clicks. That caught problems no ear would catch on first listen:

- the ambience was 12 dB too loud and buried the footsteps;
- up to 85% of the energy sat below 120 Hz, where phone speakers play nothing;
- the reverb piled up low end and turned a door into a boom;
- the latch of the recorded doors was so sharp that the review tool flagged it as a digital click. Each recording went through a limiter tuned until the peak stayed under the threshold.

## 9. The video that imitates the trailer, scene by scene

With the game done, I asked for a gameplay video **identical to the trailer**: same scenes, same rhythm, but with the new game running. This was the most impressive part.

First, the agent **tracked the entire trailer**. For every half second of video, it worked out:

- **which room the hero is in:** by comparing the frame with the full image of each map, exported from the game itself, with the lighting normalized so the darkness wouldn't get in the way;
- **which tile the hero is on:** by searching the frame for the protagonist's 12 drawings (4 directions, 3 steps).

The result is the hero's path in the trailer, tile by tile, across all 17 minutes. There were traps:

- **Scenes too dark:** some were thrown out as a black screen. The fix was to stretch each frame's brightness before comparing.
- **Corridors with identical pillars and pipes:** the algorithm mistook one pillar for another and saw the hero "teleport". Only physically possible movement counted, at 3.75 tiles per second.
- **A real cut:** at 2:46 the hero jumps from one end of the corridor to the other. Whoever edited the trailer cut out a walk. The new video cuts there too.

Then the game's text (187 entries, counting choices and notices) was aligned with the trailer's 214 text blocks. It's the same kind of sequence alignment used to compare DNA.

Finally, the game got a **recording mode**: the clock stops and only advances when the recorder says so, one frame at a time. An automated "director" plays the game:

- it follows the trailer's path;
- it presses Enter at the exact second each text box disappears in the original video;
- it opens the inventory, uses the key, turns the room, always at the same second as the trailer.

Sound is logged with the frame it happens on and rendered afterwards.

The result: **178 of the 187 lines land on the trailer's timing, with an average difference of half a second**. The accelerated version, all 17 minutes in 2:

<video controls playsinline preload="none" poster="/blog/img/insonia/gameplay-capa.jpg" style="display:block; width:100%; max-width:360px; margin:1.5em auto;">
  <source src="/blog/img/insonia/gameplay-acelerado.mp4" type="video/mp4">
</video>

## 10. The trailer fixed the game

The tracking was useful for more than the video. It showed things I had rebuilt wrong:

- **The starting position:** the hero wakes up at (9,7), not (9,6).
- **The final key:** it sits right before the last door, because that's where the hero picks it up in the trailer.
- **The pacing of the scenes:** the steps and pauses in the cell and the flashback now follow the original. The darkness in which the monster searches for the hero lasts 44 seconds, as in the trailer, not 13.

And the **trap room**. The traps are invisible, and I had deduced where they were. The tracking showed that the hero in the trailer steps on several tiles that were traps in my version and never falls. He walks in a zigzag, like someone who knows the way.

![The trap room: in green, the path the trailer's player took; the red X's are the tiles he avoided, which became the traps](/blog/img/insonia/sala-das-armadilhas.jpg)

Now the traps are the tiles he avoided. And something showed up that I didn't remember: **every scribble on the floor sits on top of a trap**. It seems they had been marking the path since 2014.

## The hard parts

Not everything went smoothly. Some stumbles along the way:

- **A video that's bad on purpose:** it's a horror game, so half the scenes are nearly black, in low resolution and compressed.
- **Deducing without inventing:** everything the trailer doesn't show became a decision. The project's README separates what was rebuilt, what was deduced, and what was added to make it playable.
- **The automated player:** it failed in funny ways. It held the arrow key one frame too long and opened a door by accident. It overshot corners and walked back. A key got stuck and the same locked door appeared every 4.5 seconds, forever. Each of these mistakes became a rule: release the arrow before the corner, know which room each action happens in, never step on an exit before it's time.
- **The machine:** a windowless browser recording thousands of frames eats memory, and more than once the system killed the process halfway through.

## Why this impresses me

Insônia didn't exist anymore. I had a video, a few images and a half-remembered name. What came back isn't an AI-generated video or a look-alike. It's **the game**: you can play it, make mistakes, fall into a trap, give up and continue later.

The agent's work feels more like archaeology than programming. It read every room on the tile grid, found the original graphics, transcribed the dialogue and timed every scene. In the end, it used the trailer itself to find out where I had hidden the traps 12 years ago.

My role was the usual one in these projects: remember, look, play, and say what was wrong. I've written before about [creating at the speed of my ideas](/blog/en/posts/creating-at-the-speed-of-thought/) and about [making videos with nothing but code](/blog/en/posts/making-of-my-videos/). This was something else: getting back something I thought was lost.

## Play it

Insônia is online and playable in the browser, on a computer or a phone (the game's text is in Portuguese):

**[Play Insônia](https://andredarcie.github.io/insonia/)**

On a computer:

- arrow keys (or WASD) to walk;
- Enter, Space or Z to act;
- Esc or X to cancel;
- I for the inventory.

On a phone, controls appear on the screen. The game saves itself in every room. A spoiler-free tip: when the game seems to have no way out, look carefully at the floor.
