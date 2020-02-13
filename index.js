import React, { Component } from 'react'
import { render }from 'react-dom'

import { DFAGenerator, NFAGenerator } from './generators.js'
import { Painter } from './animate.js'

var canvas = document.getElementById("MainAnimationArea");
var c = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function test() {
    var painter = new Painter(c);
    var machine = NFAGenerator.generate(7, [1,0])
    console.log(machine)
    console.log(painter)
    painter.drawMachine(machine.states)
}

test()



