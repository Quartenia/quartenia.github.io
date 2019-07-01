---
title: "Captain Starshot"
subtitle: Rogue-Lite Top-Down Shooter
categories: projects school
layout: project
img: CaptainStarshot/capt.png
date: 2018-09-05 17:02:58 +0200
project-date: Semptember 2018
col-width: 10
project-header:
    -
        title: Team
        icon: fa-users
        content: 
        - 2 Producers
        - 5 Programmers
        - 4 Artists
        - 11 Designers
    -
        title: Roles
        icon: fa-user-tag
        content: 
        - Procedural Programmer
        - Tool Programmer
        - Graphics Programmer
        - Tech Lead (Last 8 weeks)
    -
        title: Tasks
        icon: fa-tasks
        content: 
        - PCG Tool 
        - PCG system UE4
        - Custom Toon Shaders
    -
        title: Tools
        icon: fa-toolbox
        content: 
        - UE4
        - QT Creator 4.8
        - Jira
    -
        title: Languages
        icon: fa-code
        content: 
        - C++
        - UE4 Blueprints/Materials
    -
        title: Platforms
        icon: fa-gamepad
        content: 
        - Steam (Windows only)
    -
        title: Time
        icon: fa-calendar-alt
        content: 
        - 32 Weeks
        - Started September 2018
    -
        title: Status
        icon: fa-spinner
        content: 
        - Early Acces on Steam
gallery:
    - 
        caption: test 
        img: CaptainStarshot/OnFoot.jpg
    - 
        caption: anubis 
        img: CaptainStarshot/Space.jpg

description: Captain Starshot is a Rogue-Lite Top-Down Shooter, in a 50s pulp-fiction space, where you control a captain and its crew while exploring space and killing aliens.

---
I worked on this project for the entirety of my third year at BUAS(Breda University of Applied Sciences, formerly NHTV).
During this period I mostly worked on the PCG system, the Tool used for the design of its rules and on Graphics.
Finally, the last part of the project, I worked as tech Lead and learned about project management using Kanban.

<h2 class="section-heading" id="My Contribution">My Contribution</h2>
 <hr class="primary">

<h3>Graphics</h3>

During this project i had the chance to explore and learn more about UE4 shading pipeline. 
One of the main tasks was optimization and by working on this I had the chance to use most of the tools provided by unreal to profile and optimize GPU performance.
Furthermore, I've worked on the shading. It consist in a flat looking toon shader, with procedural brush strokes and outlines. 

<h3>Procedural Generation</h3>

This system and tools started in my second year as part of a custom engine for roguelikes for UWP. 
The system is based on graph grammars.
First, the tool was developed in ImGui in 8 weeks during my second year. This version featured rules creation and a basic implementation of graph grammars.
Secondly, the tool was implemented in Qt during my third year, which was a great learning experiences as tool programmer. It greatly helped improving on ui/ux, editor and added nested graphs system. 
Finally, with the tool i also implemented a tailored system in unreal to convert grammars into levels.

<div align="center">
    <video width="75%" controls>
        <source src="/assets/img/portfolio/CaptainStarshot/Pipeline.mp4" type="video/mp4">
    </video>

    <p></p>

    <iframe src="https://store.steampowered.com/widget/1037410/" frameborder="0" width="646" height="190"></iframe>
</div>
