var CANVAS_ONE = document.getElementById("MainAnimationArea");

const DEFAULT_STATE_FONT_SIZE = 15;
const DEFAULE_EDGE_FONT_SIZE = 10;


export class Painter {
    constructor (context) {
        this.c = context;
        this.drawIndex = 1;
        this.continueDrawing = true;
    }

    clearCanvas() {
        this.c.clearRect(0, 0, CANVAS_ONE.width, CANVAS_ONE.height)
    }

    drawCircle(x, y, r, p, sc, sw) {
        var quarter = Math.PI / 2;
        var circle = Math.PI * 2;

        this.c.beginPath();
        this.c.arc(x, y, r, -quarter, (circle * p) - quarter, false);
        this.c.stroke()
    }

    drawState(state) { 
        this.c.font = "" + DEFAULT_STATE_FONT_SIZE + "px Arial";
        this.c.align = "center";
        var id = "" + state.id;

        this.drawCircle(state.x, state.y, state.r, state.percent, null, null);
        this.c.fillText(id, state.x - 5, state.y + 5);
    }

    drawHead(c, x0, y0, x1, y1, x2, y2, style) {
        var context = c;
        if (typeof(x0) == 'string') x0 = parseInt(x0);
        if (typeof(y0) == 'string') y0 = parseInt(y0);
        if (typeof(x1) == 'string') x1 = parseInt(x1);
        if (typeof(y1) == 'string') y1 = parseInt(y1);
        if (typeof(x2) == 'string') x2 = parseInt(x2);
        if (typeof(y2) == 'string') y2 = parseInt(y2);
        var radius = 3;
        var twoPI = 2*Math.PI;
    
        // all cases do this.
        // context.save();
        context.beginPath();
        context.moveTo(x0,y0);
        context.lineTo(x1,y1);
        context.lineTo(x2,y2);
        switch(style){
        case 0:
            // curved filled, add the bottom as an arcTo curve and fill
            var backdist=Math.sqrt(((x2-x0)*(x2-x0))+((y2-y0)*(y2-y0)));
            context.arcTo(x1,y1,x0,y0,.55*backdist);
            context.fill();
            break;
        case 1:
            // straight filled, add the bottom as a line and fill.
            context.beginPath();
            context.moveTo(x0,y0);
            context.lineTo(x1,y1);
            context.lineTo(x2,y2);
            context.lineTo(x0,y0);
            context.fill();
            break;
        case 2:
            // unfilled head, just stroke.
            context.stroke();
            break;
        case 3:
            //filled head, add the bottom as a quadraticCurveTo curve and fill
            var cpx=(x0+x1+x2)/3;
            var cpy=(y0+y1+y2)/3;
            context.quadraticCurveTo(cpx,cpy,x0,y0);
            context.fill();
            break;
        case 4:
            //filled head, add the bottom as a bezierCurveTo curve and fill
            var cp1x, cp1y, cp2x, cp2y,backdist;
            var shiftamt=5;
            if (x2 === x0){
                // Avoid a divide by zero if x2==x0
                backdist=y2-y0;
                cp1x=(x1+x0)/2;
                cp2x=(x1+x0)/2;
                cp1y=y1+backdist/shiftamt;
                cp2y=y1-backdist/shiftamt;
            } else {
                backdist=Math.sqrt(((x2-x0)*(x2-x0))+((y2-y0)*(y2-y0)));
                var xback=(x0+x2)/2;
                var yback=(y0+y2)/2;
                var xmid=(xback+x1)/2;
                var ymid=(yback+y1)/2;
    
                var m=(y2-y0)/(x2-x0);
                var dx=(backdist/(2*Math.sqrt(m*m+1)))/shiftamt;
                var dy=m*dx;
                cp1x=xmid-dx;
                cp1y=ymid-dy;
                cp2x=xmid+dx;
                cp2y=ymid+dy;
            }
    
            context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x0, y0);
            context.fill();
            break;
        }
        // context.restore();
    }

    drawArrow(x1, y1, x2, y2, style, which, angle, d) {
        var context = this.c;
        if (typeof(x1) == 'string') x1 = parseInt(x1,10);
        if (typeof(y1) == 'string') y1 = parseInt(y1,10);
        if (typeof(x2) == 'string') x2 = parseInt(x2,10);
        if (typeof(y2) == 'string') y2 = parseInt(y2,10);
    
        which = typeof(which) != 'undefined' ? which : 1;
        angle = typeof(angle) != 'undefined' ? angle : Math.PI/8;
        d = typeof(d) != 'undefined' ? d : 10;
        style = typeof(style) != 'undefined' ? style : 3;

        var toDrawHead = typeof(style) != 'function' ? this.drawHead : style;
    
        var dist = Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
        var ratio = (dist-d/3)/dist;
        var tox, toy,fromx,fromy;
    
        if (which & 1) {
            tox = Math.round(x1+(x2-x1)*ratio);
            toy = Math.round(y1+(y2-y1)*ratio);
        } else {
            tox=x2;
            toy=y2;
        }
        if (which & 2) {
            fromx = x1+(x2-x1)*(1-ratio);
            fromy = y1+(y2-y1)*(1-ratio);
        } else {
            fromx = x1;
            fromy = y1;
        }
    
        // Draw the shaft of the arrow
        context.beginPath();
        context.moveTo(fromx,fromy);
        context.lineTo(tox,toy);
        context.stroke();
    
        // calculate the angle of the line
        var lineangle = Math.atan2(y2-y1,x2-x1);
        // h is the line length of a side of the arrow head
        var h = Math.abs(d/Math.cos(angle));
    
        if (which & 1){	// handle far end arrow head
            var angle1 = lineangle+Math.PI+angle;
            var topx = x2+Math.cos(angle1)*h;
            var topy = y2+Math.sin(angle1)*h;
            var angle2 = lineangle+Math.PI-angle;
            var botx = x2+Math.cos(angle2)*h;
            var boty = y2+Math.sin(angle2)*h;
            toDrawHead(context, topx, topy, x2, y2, botx, boty, style);
        }
        if(which & 2){ // handle near end arrow head
            var angle1 = lineangle+angle;
            var topx = x1+Math.cos(angle1)*h;
            var topy = y1+Math.sin(angle1)*h;
            var angle2 = lineangle-angle;
            var botx = x1+Math.cos(angle2)*h;
            var boty = y1+Math.sin(angle2)*h;
            toDrawHead(context, topx, topy, x1, y1, botx, boty, style);
        }
    }

    drawArcedArrow(x, y, r, startangle, endangle, anticlockwise, style, which, angle, d) {
        var context = this.c;
        style = typeof(style) != 'undefined' ? style : 3;
        which = typeof(which) != 'undefined' ? which : 1;
        angle = typeof(angle) != 'undefined' ? angle : Math.PI/8;
        d = typeof(d) != 'undefined' ? d : 10;
        
        context.beginPath();
    
        if(startangle > endangle) {
            context.arc(x, y, r, startangle, endangle, true);
        }
        else {
            context.arc(x, y, r, startangle, endangle, false);
        }
        
        context.stroke();
    
        var sx,sy,lineangle,destx,desty;
    
        if (which & 1) {
            sx = Math.cos(startangle) * r + x;
            sy = Math.sin(startangle) * r + y;
            lineangle = Math.atan2(x - sx, sy - y);
    
            if (anticlockwise) {
                destx = sx + 10 * Math.cos(lineangle);
                desty = sy + 10 * Math.sin(lineangle);
            } else {
                destx = sx - 10 * Math.cos(lineangle);
                desty = sy - 10 * Math.sin(lineangle);
            }
    
            this.drawArrow(sx, sy, destx, desty, style, 2, angle, d);
        }
    
        if (which & 2) { 
            sx = Math.cos(endangle) * r + x;
            sy = Math.sin(endangle) * r + y;
            lineangle = Math.atan2(x - sx, sy - y);
    
            if (anticlockwise) {
                destx = sx -10 * Math.cos(lineangle);
                desty = sy -10 * Math.sin(lineangle);
            } else {
                destx = sx + 10 * Math.cos(lineangle);
                desty = sy + 10 * Math.sin(lineangle);
            }
    
            this.drawArrow(sx, sy, destx, desty, style, 2, angle, d);
        }
    }

    drawStateList(stateList) {
        for (var i = 0; i < this.drawIndex && i < stateList.length; i++) {
            this.drawState(stateList[i]);
            this.drawEdgeList(stateList[i])
            if (stateList[i].percent < 1.01) {
                this.continueDrawing = true;
                stateList[i].increment();
            }
        }
        // Increments the number of circles that can begin being drawn (so there is a cascade effect).
        if (this.drawIndex < stateList.length && stateList[this.drawIndex-1].percent > 0.2) {
            this.drawIndex++;
        }
    }

    drawEdgeList(state) {
        var edges = state.edges;
        if (edges !== undefined){
            for(var i = 0; i < edges.length; i++) {
                this.drawArcedArrow(edges[i].x, edges[i].y, edges[i].r , edges[i].angleOne(), edges[i].angleTwo(), false)
    
                if (Math.abs(edges[i].percent) < 1.00) {
                    this.continueDrawing = true;
                    edges[i].increment()
                } else {
                    this.drawGrammar(edges[i])
                }
            }
        }  
    }

    drawGrammar(edge) {
        var grammarAngle = edge.grammarAngle;
        var rotationAngle = Math.PI/2 + grammarAngle;
        var xg = edge.x + ((edge.r) * Math.cos(grammarAngle));
        var yg = edge.y + ((edge.r) * Math.sin(grammarAngle));
    
        this.c.save();
        this.c.translate(Math.abs(xg), Math.abs(yg))
        this.c.rotate(rotationAngle);
        
        this.c.font = "" + DEFAULE_EDGE_FONT_SIZE + "px Arial";
        var id = "" + edge.grammar;
        this.c.textAlign = "center";
        this.c.fillText(id, 0, 0);
        this.c.restore();
    }

    drawStartArrow(state) {
        var r = 50;
        var xs = state.x;
        var yx = state.y - r;
        var startAngle = Math.PI;
        // var endAngle = Math.PI/2 - 
    }

    drawStateTypes(stateList) {
        for (var i = 0; i < this.drawIndex && i < stateList.length; i++) {
    
        }
    
        if (this.continueDrawing) {
            requestAnimationFrame(function () {
                this.drawStateTypes()
            })
        }
    }

    drawMachine (machine) {
        this.continueDrawing = false;
    
        this.clearCanvas();
        this.drawStateList(machine);
        var hell = this;
    
        if (this.continueDrawing) {
            requestAnimationFrame(function () {
                hell.drawMachine(machine)
            });
        }
        else {
            this.continueDrawing = true;
            this.drawIndex = 0;
            // this.drawStartArrow()
            // this.drawStateTypes()
        }
    }
}

