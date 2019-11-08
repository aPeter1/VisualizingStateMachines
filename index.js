import React, { Component } from 'react'
import { render }from 'react-dom'

var REJECT_STATE = 'R';
var ACCEPT_STATE = 'A';
var START_STATE = 'S';
var EMPTY_STRING = 'empty';

var canvas = document.getElementById("MainAnimationArea");
var c = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var stateList = [[12, 12, 4, 0], [13, 43, 12, 0], [231, 123, 24, 0]];
var edgeList = [];
var continueDrawing = [];
var drawIndex = 1;

function drawCircle(context, x, y, radius, percent) {
    console.log("Drawing arc.")
    var quarter = Math.PI / 2;
    var circle = Math.PI * 2;

    context.beginPath();
    context.arc(x, y, radius, -quarter, (circle * percent) - quarter, false);
    context.stroke();
}

function drawState() {
    // Calls draw circle and draws state ID as well. Called by drawStateList
}

function clearCanvas(context) {
    context.clearRect(0, 0, canvas.width, canvas.height)
}

function drawStateList(context) {
    for (var i = 0; i < drawIndex && i < stateList.length; i++) {
        drawCircle(context, stateList[i][0], stateList[i][1], stateList[i][2], stateList[i][3]);
        if (stateList[i][3] < 1.01) {
            continueDrawing = true;
            stateList[i][3] += 0.01;
        }
    }

    // Increments the number of circles that can begin being drawn (so there is a cascade effect).
    if (drawIndex < stateList.length && stateList[drawIndex-1][3] > 0.2) {
        drawIndex++;
    }
}

function drawEdgeList(context) {
}

function drawMachine (context) {
    continueDrawing = false;

    clearCanvas(context);
    drawStateList(context);
    drawEdgeList(context);

    if (continueDrawing) {
        requestAnimationFrame(function () {
            drawMachine(context)
        });
    }
}

function generateDFA (numStates, grammar) {
    // Clear current displayed machine.
    clearCanvas(c);

    // Initialize an array of states. State at index 0 will always be the start state.
    createEmptyStateList(numStates);

    // Initialize an array of edges.
    createEmptyEdgeList();

    // Assign accept, reject and start states
    assignStateFunctions();

    // Create array edges for each character in the grammar, preferential to closer states?
    connectStates(numStates, grammar);

    // Set the x and y coords as well as the radius for the states.
    layoutStates();

    // Set the x and y coords as well as the radius for the edges.
    layoutEdges();
}

function assignStateFunctions() {
    stateList[0][6] = START_STATE;
    stateList[stateList.length-1][6] = ACCEPT_STATE;

    for (var i = 1; i < stateList.length; i++) {
        if (getRandomInt(5) === 1) {
            stateList[i][6] = ACCEPT_STATE;
        }
    }
}

function createEmptyStateList(numStates) {
    stateList = [];
    for (var i = 0; i < numStates; i++) {
        // x, y, radius, percent, id, transitions, type
        stateList.push([0, 0, 0, 0, i, [], REJECT_STATE]);
    }
}

function getCloseRandomInt(numStates, curState) {
    if (getRandomInt(4) === 1) {
        return curState;
    }

    while (true) {
        var returnInt = getRandomInt(numStates);
        if (Math.abs(curState - returnInt) < 2) {
            return returnInt;
        }
        else {
            var checkInt = getRandomInt(numStates);
            if (checkInt === 1) {
                return returnInt;
            }
        }
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max))
}

function connectStates(numStates, grammar) {
    for (var i = 0; i < stateList.length; i++) {
        for (var j = 0; j < grammar.length; j++) {
            var connectedState = getCloseRandomInt(numStates, i);
            stateList[i][5].push([grammar[j], connectedState]);
            edgeList.push([0, 0, 0, 0, i, connectStates, grammar[j]])
        }
    }
}

function layoutEdges() {

}

function layoutStates() {
    // fixme you can figure out best radius by seeing proportion of layout radius inside state circles.
    var STATE_RADIUS = 20;
    var LAYOUT_RADIUS = 180;
    var CENTER_X = window.innerWidth / 2;
    var CENTER_Y = window.innerHeight / 2;
    var d_theta = Math.PI * 2 / stateList.length;

    for (var i = 0; i < stateList.length; i++) {
        stateList[i][0] = CENTER_X + (LAYOUT_RADIUS * Math.cos((i * d_theta) - (Math.PI / 2)));
        stateList[i][1] = CENTER_Y + (LAYOUT_RADIUS * Math.sin((i * d_theta) - (Math.PI / 2)));
        stateList[i][2] = STATE_RADIUS;
    }
}

function createEmptyEdgeList() {
    edgeList = [];
}

function test() {
    generateDFA(7, ['a', 'b', 'c', 'd']);
    console.log(stateList)
    drawMachine(c);
}

test()



