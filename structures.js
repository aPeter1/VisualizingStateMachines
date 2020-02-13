

export const LOOPING_EDGE = 1;
export const NOT_LOPPING_EDGE = 2;

export const REJECT_STATE = 1;
export const ACCEPT_STATE = 2;
export const START_STATE = 3;



var regexOne;
var regexTwo;

export class StateMachine {
    constructor(numberState) {
        console.log("Constructing")
        this._states = new Array(numberState);
    }

    get states() {
        return this._states;
    }

    set states(states) {
        this._states = states;
    }

    addState(state) {
        this._states.push(state)
    }

    setState(setState, state){
        this._states[setState] = state
    }

    removeState(x, y) {
        for (var i = 0; i < this._states.length; i++) {
            var sx = this._states[i].x
            var sy = this._states[i].y
            var sr = this._states[i].r
            if (x > sx - sr && x < sx + sr && y > sy - sr && y < sy + sr) {
                this._states.splice(i, 1)
                break;
            }
        }
    }
}

export class State {
    constructor(id) {
        this._id = id;
        this._type = REJECT_STATE;
        this._edges = []
        this._x = 0;
        this._y = 0;
        this._r = 0;
        this._percent = 0;
        this._theta = 0;
    }

    get theta() {
        return this._theta;
    }

    set theta(theta) {
        this._theta = theta;
    }

    get id() {
        return this._id;
    }

    set id(id) {
        this._id = id;
    }

    get x() {
        return this._x;
    }

    set x(x) {
        this._x = x;
    }

    get y() {
        return this._y;
    }

    set y(y) {
        this._y = y;
    }

    get r() {
        return this._r;
    }

    set r(r) {
        this._r = r;
    }

    get edges() {
        return this._edges;
    }

    set edges(edges) {
        this._edges = edges;
    }

    get type() {
        return this._type;
    }

    set type(type) {
        this._type = type;
    }

    get percent() {
        return this._percent;
    }

    set percent(percent) {
        this._percent = percent;
    }

    increment() {
        this._percent += 0.01;
    }

    addEdge(edge) {
        this._edges.push(edge);
    }
}

export class Edge {
    constructor(endState, startState, grammar) {
        this._startState = startState;
        this._endState = endState;
        this._grammar = grammar;
        this._type = NOT_LOPPING_EDGE;
        this._percent = 0.01;
        this._grammarAngle = 0;
        this._startAngle = 0;
        this._endAngle = 0;
        this._x = 0;
        this._y = 0;
        this._r = 0;
    }

    get grammarAngle() {
        return this._grammarAngle;
    }

    set grammarAngle(grammarAngle) {
        this._grammarAngle = grammarAngle;
    }

    get type() {
        return this._type;
    }

    set type(type) {
        this._type = type;
    }

    get endAngle() {
        return this._endAngle;
    }

    set endAngle(endAngle) {
        this._endAngle = endAngle;
    }

    get startAngle() {
        return this._startAngle;
    }

    set startAngle(startAngle) {
        this._startAngle = startAngle;
    }

    get startState() {
        return this._startState;
    }

    set startState(startState) {
        this._startState = startState;
    }

    get endState() {
        return this._endState;
    }

    set endState(endState) {
        this._endState = endState;
    }

    get grammar() {
        return this._grammar;
    }

    set grammar(grammar) {
        this._grammar = grammar;
    }

    get x() {
        return this._x;
    }

    set x(x) {
        this._x = x;
    }

    get y() {
        return this._y;
    }

    set y(y) {
        this._y = y;
    }

    get r() {
        return this._r;
    }

    set r(r) {
        this._r = r;
    }

    get percent() {
        return this._percent;
    }

    set percent(percent) {
        this._percent = percent;
    }

    increment() {
        this._percent += 0.01;        
    }

    angleOne() {
        if (this._startAngle > this._endAngle) {
            return this._startAngle + ((this._endAngle - this._startAngle)*this._percent)   
        }
        else {
            return this._startAngle + ((2*Math.PI - this._endAngle + this._startAngle)*-this._percent) 
        }
    }

    angleTwo() {
        return this._startAngle
    }

    addLetter(letter) {
        for (var i = 0; i < this._grammar.length; i++) {
            if (this._grammar[i] === letter) {
                return;
            }
        }
        this._grammar.push(letter);
    }
}

export class RegularExpression {
    constructor() {

    }
}
