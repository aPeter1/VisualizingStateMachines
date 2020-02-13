import { tsExternalModuleReference } from "@babel/types";

import { StateMachine, State, Edge} from './structures.js'
import { LOOPING_EDGE, START_STATE, ACCEPT_STATE} from './structures.js'

// 'use strict'
const PROBABILITY_DFA_ACCEPT_STATE = 5;
const PROBABILITY_DFA_LOOP = 10;
const PROBABILITY_DFA_RANDOM = 5;
const PROBABILITY_DFA_CLOSE = 2;
const PROBABILITY_NFA_EMPTY = 10;

const DEFAULT_STATE_RADIUS = 20;
const DEFAULT_LAYOUT_RADIUS = 200;
const DEFAULT_EDGE_RADIUS = 500;
const PREF_STATE_SEPARATION = 30;

// TODO Make radius of layout, edges and states dynamic.

export class DFAGenerator {
    static generate(numStates, grammar) {
        var constructedMachine = new StateMachine(numStates);

        this.fillStateList(constructedMachine, numStates);
        this.fillStateFunctions(constructedMachine);
        this.fillStateConnections(constructedMachine, grammar);
        this.fillStateDimensions(constructedMachine);
        this.fillStateEdgeDimensions(constructedMachine);
        
        return constructedMachine
    }

    static fillStateList(machine, numStates) {
        console.log(machine)
        for (var i = 0; i < numStates; i++) {
            var state = new State(i)
            machine.setState(i, state)            
        }
    }

    static fillStateFunctions(machine) {
        if (machine.states.length == 0) {
            return;
        }
        machine.states[0].type = START_STATE;
        var accepted = false;
        for (var i = 0; i < machine.states.length; i++) {
            if (getRandomInt(PROBABILITY_DFA_ACCEPT_STATE) === 1) {
                accepted = true;
                machine.states[i].type = ACCEPT_STATE;
            }
        }  
        if (!accepted) {
            machine.states[machine.states.length-1].type = ACCEPT_STATE;
        }      
    }

    static fillStateConnections(machine, grammar) {
        for (var i = 0; i < machine.states.length; i++) {
            for (var j = 0; j < grammar.length; j++) {
                var connectedState = getCloseRandomInt(machine.states.length, i);
                var edges = machine.states[i].edges;
                var found = false;
                for (var k = 0; k < edges.length; k++) {
                    if (edges[k].endState.id === machine.states[connectedState].id) {
                        edges[k].addLetter(grammar[j]);
                        found = true;
                    }
                }
                if (!found) {
                    var edge = new Edge(machine.states[connectedState], machine.states[i], [grammar[j]]);
                    machine.states[i].addEdge(edge);
                }
            }
        }

        // Check to ensure all states are reachable.
        for (var i = 0; i < machine.states.length; i++) {
            var edges = machine.states[i].edges;
            var entered = false;
            if (machine.states[i].type === START_STATE) {
                entered = true;
            } else {
                for (var k = 0; k < machine.states.length; k++) {
                    if (k !== i) {
                        for (var n = 0; n < machine.states[k].edges.length; n++) {
                            if (entered || (machine.states[k].edges[n].endState.id === machine.states[i].id)) {
                                entered = true;
                                break;
                            }
                        }
                    }
                }
            }
            var numTries = 0
            while(!entered) {
                var randState = getRandomInt(machine.states.length);
                if (randState !== machine.states[i].id) {
                    var edges = machine.states[randState].edges
                    for (var j = 0; j < edges.length; j++) {
                        if (edges[j].grammar.length > 1) {
                            var randLetter = getRandomInt(edges[j].grammar.length);
                            var letter = edges[j].grammar[randLetter];
                            edges[j].grammar.splice(randLetter, 1);
                            machine.states[randState].addEdge(new Edge(machine.states[i], machine.states[randState], [letter]))
                            entered = true;
                        }
                    }
                }
                numTries++;
                if (numTries > machine.states.length) {
                    console.log('NO ENTERING THIS STATE')
                    break;
                }
            }
        }
    }

    static fillStateDimensions(machine) {
        var CENTER_X = window.innerWidth / 2;
        var CENTER_Y = window.innerHeight / 2;
        var d_theta = Math.PI * 2 / machine.states.length;
        var radius = this.getStateRadius(machine);

        for (var i = 0; i < machine.states.length; i++) {
            machine.states[i].theta = (i * d_theta) - (Math.PI / 2);
            machine.states[i].x = CENTER_X + (this.getLayoutRadius(machine) * Math.cos((i * d_theta) - (Math.PI / 2)));
            machine.states[i].y = CENTER_Y + (this.getLayoutRadius(machine) * Math.sin((i * d_theta) - (Math.PI / 2)));
            machine.states[i].r = radius;
        }
    }

    static fillStateEdgeDimensions(machine) {
        var LOOPING_ARROW_DIFFERENCE = 5;
        for (var i = 0; i < machine.states.length; i++) {
            var edges = machine.states[i].edges;
            for (var j = 0; j < edges.length; j++) {

                var endState = edges[j].endState;
                var startState = edges[j].startState;
                var arcParameters, angleStart, angleEnd;

                if (startState.x === endState.x && startState.y === endState.y) {
                    arcParameters = this.getLoopingArrowParameters(startState.x, startState.y, startState.r, startState.r - LOOPING_ARROW_DIFFERENCE, 
                        startState.r - LOOPING_ARROW_DIFFERENCE, startState.theta);
                    angleStart = arcParameters[4];
                    angleEnd = arcParameters[3];
                    edges[j].type = LOOPING_EDGE;
                } else {
                    arcParameters = this.getArrowArcCenter(startState.x, endState.x, startState.y, endState.y, DEFAULT_EDGE_RADIUS, true);
                    angleStart = this.getArrowAngles(startState.x, startState.y, arcParameters[0], arcParameters[1], arcParameters[2], true)
                    angleEnd = this.getArrowAngles(endState.x, endState.y, arcParameters[0], arcParameters[1], arcParameters[2], false)
                    angleStart += this.getEdgeAngle(arcParameters[2], startState.r, angleStart, angleEnd, true)
                    angleEnd += this.getEdgeAngle(arcParameters[2], startState.r, angleStart, angleEnd, false)
                }
                edges[j].x = arcParameters[0];
                edges[j].y = arcParameters[1];
                edges[j].r = arcParameters[2];
                edges[j].startAngle = angleStart;
                edges[j].endAngle = angleEnd;
                edges[j].grammarAngle = this.getGrammarAngle(edges[j]);
            }
        }
    }

    static getStateRadius(machine) {
        return DEFAULT_STATE_RADIUS;
    }

    static getLayoutRadius(machine) {
        var dTheta = 2 * Math.PI / machine.states.length;

        return DEFAULT_LAYOUT_RADIUS;
    }

    static getLoopingArrowParameters(x0, y0, r, rl, s, theta) {
        var phi = Math.asin(s/(2*r));
        var phil = Math.asin(s/(2*rl));
        var thetalOne = theta + phil;
        var thetalTwo = theta - phil;

        var l = (rl * Math.cos(phil)) + (r * Math.cos(phi));
        var xl = x0 + (l * Math.cos(theta))
        var yl = y0 + (l * Math.sin(theta))

        return [xl, yl, rl, thetalOne + Math.PI, thetalTwo + Math.PI]
    }

    static getArrowArcCenter(x1, x2, y1, y2, r, first) { 
        if (x1 === x2 && y1 === y2) {
            return [x1, y1 + 20, DEFAULT_STATE_RADIUS]
        }
    
        var xa = 0.5 * (x2 - x1);
        var ya = 0.5 * (y2 - y1);
        var a = Math.sqrt(Math.pow(xa, 2) + Math.pow(ya, 2))
        var b = Math.sqrt(Math.pow(r, 2) - Math.pow(a, 2))
        var x0 = x1 + xa;
        var y0 = y1 + ya;
    
        if (first) {
            return [x0 + (b*ya/a), y0 - (b*xa/a), r];
        } else {
            return [x0 - (b*ya/a), y0 + (b*xa/a), r];
        }
    }

    static getArrowAngles(x1, y1, x, y ,r ,first) {
        if (x1 === x && y === y1 + 20){
            if (first) {
                return 2*Math.PI*5/9;
            }
            return 2*Math.PI*8/9
        }
    
        var angle = Math.acos((x1-x)/r)
        
        if (y1 > y && x1 > x) {
            return angle;
        }
        else if (y1 > y && x1 < x) {
            return angle;
        }
        else if (y1 < y && x1 < x) {
            return (2 * Math.PI) - angle;
        }
        else if (y1 < y && x1 > x){
            return (2 * Math.PI) - angle;
        }
        return 0
    }

    static getEdgeAngle(r, R, angleOne, angleTwo, first) {
        var edgeAngle = Math.atan(R/r);
        if (first) {
            if(angleOne > angleTwo) {
                return -edgeAngle;
            }
            else {
                return -edgeAngle;
            }
        }
        else {
            if (angleOne > angleTwo) {
                return edgeAngle;
            }
            else {
                return edgeAngle;
            }
        }
    }

    static getGrammarAngle(edge) {
        var a1 = edge.endAngle % (2 * Math.PI);
        var a2 = edge.startAngle % (2 * Math.PI);

        if (a1 < 0) {
            a1 += 2 * Math.PI
        }
        if (a2 < 0) {
            a2 += 2 * Math.PI
        }

        var q1 = Math.PI/2
        var q3 = 3 * q1
        var q4 = 4 * q1

        if (edge.type === LOOPING_EDGE || (0 < a1 && a1 < q1 && q3 < a2 && a2 < q4)) {
            return ((a2 - q4) + a1) / 2
        }
        if (0 < a2 && a2 < q1 && q3 < a1 && a1 < q4) {
            return ((a1 - q4) + a2) / 2
        }
        return (a1 + a2) / 2
    }
}

export class NFAGenerator {
    static generate(numStates, grammar) {
        var constructedMachine = new StateMachine(numStates);

        this.fillStateList(constructedMachine, numStates);
        this.fillStateFunctions(constructedMachine);
        this.fillStateConnections(constructedMachine, grammar);
        this.fillStateDimensions(constructedMachine);
        this.fillStateEdgeDimensions(constructedMachine);
        
        return constructedMachine
    }

    static fillStateList(machine, numStates) {
        console.log(machine)
        for (var i = 0; i < numStates; i++) {
            var state = new State(i)
            machine.setState(i, state)            
        }
    }

    static fillStateFunctions(machine) {
        if (machine.states.length == 0) {
            return;
        }
        machine.states[0].type = START_STATE;
        var accepted = false;
        for (var i = 0; i < machine.states.length; i++) {
            if (getRandomInt(PROBABILITY_DFA_ACCEPT_STATE) === 1) {
                accepted = true;
                machine.states[i].type = ACCEPT_STATE;
            }
        }  
        if (!accepted) {
            machine.states[machine.states.length-1].type = ACCEPT_STATE;
        }      
    }

    static fillStateConnections(machine, grammar) {
        for (var i = 0; i < machine.states.length; i++) {
            for (var j = 0; j < grammar.length; j++) {
                for (var n = 0; n < this.getExtraPathNumber(); n++){
                    var connectedState = getCloseRandomInt(machine.states.length, i);
                    var edges = machine.states[i].edges;
                    var found = false;
                    for (var k = 0; k < edges.length; k++) {
                        if (edges[k].endState.id === machine.states[connectedState].id) {
                            edges[k].addLetter(grammar[j]);
                            if (getRandomInt(PROBABILITY_NFA_EMPTY) === 1) {
                                edges[k].addLetter('\u03B5')
                            }
                            found = true;
                        }
                    }
                    if (!found) {
                        var edge = new Edge(machine.states[connectedState], machine.states[i], [grammar[j]]);
                        if (getRandomInt(PROBABILITY_NFA_EMPTY) === 1) {
                            edge.addLetter('\u03B5')
                        }
                        machine.states[i].addEdge(edge);
                    }
                }
            }
        }

        // Check to ensure all states are reachable.
        for (var i = 0; i < machine.states.length; i++) {
            var edges = machine.states[i].edges;
            var entered = false;
            if (machine.states[i].type === START_STATE) {
                entered = true;
            } else {
                for (var k = 0; k < machine.states.length; k++) {
                    if (k !== i) {
                        for (var n = 0; n < machine.states[k].edges.length; n++) {
                            if (entered || (machine.states[k].edges[n].endState.id === machine.states[i].id)) {
                                entered = true;
                                break;
                            }
                        }
                    }
                }
            }
            var numTries = 0
            while(!entered) {
                var randState = getRandomInt(machine.states.length);
                if (randState !== machine.states[i].id) {
                    var edges = machine.states[randState].edges
                    for (var j = 0; j < edges.length; j++) {
                        if (edges[j].grammar.length > 1) {
                            var randLetter = getRandomInt(edges[j].grammar.length);
                            var letter = edges[j].grammar[randLetter];
                            edges[j].grammar.splice(randLetter, 1);
                            machine.states[randState].addEdge(new Edge(machine.states[i], machine.states[randState], [letter]))
                            entered = true;
                        }
                    }
                }
                numTries++;
                if (numTries > machine.states.length) {
                    console.log('NO ENTERING THIS STATE')
                    break;
                }
            }
        }
    }

    static fillStateDimensions(machine) {
        var CENTER_X = window.innerWidth / 2;
        var CENTER_Y = window.innerHeight / 2;
        var d_theta = Math.PI * 2 / machine.states.length;
        var radius = this.getStateRadius(machine);

        for (var i = 0; i < machine.states.length; i++) {
            machine.states[i].theta = (i * d_theta) - (Math.PI / 2);
            machine.states[i].x = CENTER_X + (this.getLayoutRadius(machine) * Math.cos((i * d_theta) - (Math.PI / 2)));
            machine.states[i].y = CENTER_Y + (this.getLayoutRadius(machine) * Math.sin((i * d_theta) - (Math.PI / 2)));
            machine.states[i].r = radius;
        }
    }

    static fillStateEdgeDimensions(machine) {
        var LOOPING_ARROW_DIFFERENCE = 5;
        for (var i = 0; i < machine.states.length; i++) {
            var edges = machine.states[i].edges;
            for (var j = 0; j < edges.length; j++) {

                var endState = edges[j].endState;
                var startState = edges[j].startState;
                var arcParameters, angleStart, angleEnd;

                if (startState.x === endState.x && startState.y === endState.y) {
                    arcParameters = this.getLoopingArrowParameters(startState.x, startState.y, startState.r, startState.r - LOOPING_ARROW_DIFFERENCE, 
                        startState.r - LOOPING_ARROW_DIFFERENCE, startState.theta);
                    angleStart = arcParameters[4];
                    angleEnd = arcParameters[3];
                    edges[j].type = LOOPING_EDGE;
                } else {
                    arcParameters = this.getArrowArcCenter(startState.x, endState.x, startState.y, endState.y, DEFAULT_EDGE_RADIUS, true);
                    angleStart = this.getArrowAngles(startState.x, startState.y, arcParameters[0], arcParameters[1], arcParameters[2], true)
                    angleEnd = this.getArrowAngles(endState.x, endState.y, arcParameters[0], arcParameters[1], arcParameters[2], false)
                    angleStart += this.getEdgeAngle(arcParameters[2], startState.r, angleStart, angleEnd, true)
                    angleEnd += this.getEdgeAngle(arcParameters[2], startState.r, angleStart, angleEnd, false)
                }
                edges[j].x = arcParameters[0];
                edges[j].y = arcParameters[1];
                edges[j].r = arcParameters[2];
                edges[j].startAngle = angleStart;
                edges[j].endAngle = angleEnd;
                edges[j].grammarAngle = this.getGrammarAngle(edges[j]);
            }
        }
    }

    static getStateRadius(machine) {
        return DEFAULT_STATE_RADIUS;
    }

    static getLayoutRadius(machine) {
        var dTheta = 2 * Math.PI / machine.states.length;

        return DEFAULT_LAYOUT_RADIUS;
    }

    static getLoopingArrowParameters(x0, y0, r, rl, s, theta) {
        var phi = Math.asin(s/(2*r));
        var phil = Math.asin(s/(2*rl));
        var thetalOne = theta + phil;
        var thetalTwo = theta - phil;

        var l = (rl * Math.cos(phil)) + (r * Math.cos(phi));
        var xl = x0 + (l * Math.cos(theta))
        var yl = y0 + (l * Math.sin(theta))

        return [xl, yl, rl, thetalOne + Math.PI, thetalTwo + Math.PI]
    }

    static getArrowArcCenter(x1, x2, y1, y2, r, first) { 
        if (x1 === x2 && y1 === y2) {
            return [x1, y1 + 20, DEFAULT_STATE_RADIUS]
        }
    
        var xa = 0.5 * (x2 - x1);
        var ya = 0.5 * (y2 - y1);
        var a = Math.sqrt(Math.pow(xa, 2) + Math.pow(ya, 2))
        var b = Math.sqrt(Math.pow(r, 2) - Math.pow(a, 2))
        var x0 = x1 + xa;
        var y0 = y1 + ya;
    
        if (first) {
            return [x0 + (b*ya/a), y0 - (b*xa/a), r];
        } else {
            return [x0 - (b*ya/a), y0 + (b*xa/a), r];
        }
    }

    static getArrowAngles(x1, y1, x, y ,r ,first) {
        if (x1 === x && y === y1 + 20){
            if (first) {
                return 2*Math.PI*5/9;
            }
            return 2*Math.PI*8/9
        }
    
        var angle = Math.acos((x1-x)/r)
        
        if (y1 > y && x1 > x) {
            return angle;
        }
        else if (y1 > y && x1 < x) {
            return angle;
        }
        else if (y1 < y && x1 < x) {
            return (2 * Math.PI) - angle;
        }
        else if (y1 < y && x1 > x){
            return (2 * Math.PI) - angle;
        }
        return 0
    }

    static getEdgeAngle(r, R, angleOne, angleTwo, first) {
        var edgeAngle = Math.atan(R/r);
        if (first) {
            if(angleOne > angleTwo) {
                return -edgeAngle;
            }
            else {
                return -edgeAngle;
            }
        }
        else {
            if (angleOne > angleTwo) {
                return edgeAngle;
            }
            else {
                return edgeAngle;
            }
        }
    }

    static getGrammarAngle(edge) {
        var a1 = edge.endAngle % (2 * Math.PI);
        var a2 = edge.startAngle % (2 * Math.PI);

        if (a1 < 0) {
            a1 += 2 * Math.PI
        }
        if (a2 < 0) {
            a2 += 2 * Math.PI
        }

        var q1 = Math.PI/2
        var q3 = 3 * q1
        var q4 = 4 * q1

        if (edge.type === LOOPING_EDGE || (0 < a1 && a1 < q1 && q3 < a2 && a2 < q4)) {
            return ((a2 - q4) + a1) / 2
        }
        if (0 < a2 && a2 < q1 && q3 < a1 && a1 < q4) {
            return ((a1 - q4) + a2) / 2
        }
        return (a1 + a2) / 2
    }

    static getExtraPathNumber() {
        var paths = 1;
        if (getRandomInt(2) === 1) {
            paths++;
        }
        if (getRandomInt(20) === 1) {
            paths++;
        }
        if (getRandomInt(40) === 1) {
            paths++;
        }
        if (getRandomInt(80) === 1) {
            paths++
        }
        return paths;
    }
}

export class RegexGenerator {
    static generate() {
        
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max))
}

function getCloseRandomInt(numStates, curState) {
    // 10% chance to loop on same state.
    if (getRandomInt(PROBABILITY_DFA_LOOP) === 1) {
        return curState;
    }

    while (true) {
        var returnInt = getRandomInt(numStates);
        // 100% chance to go to nearby state if it is randomnly selected.
        if (Math.abs(curState - returnInt) < PROBABILITY_DFA_CLOSE && returnInt != curState) {
            return returnInt;
        }
        else {
            // 20% chance to go to random state
            var checkInt = getRandomInt(PROBABILITY_DFA_RANDOM);
            if (checkInt === 1) {
                return returnInt;
            }
        }
    }
}

function test() {
    DFAGenerator.generate(15, [1, 0])
    // console.log(structures.stateMachineOne)
}

console.log('Loaded generator.js')
test()