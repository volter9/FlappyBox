/**
 * Game.js - Main file of game, contains all 
 * 
 * @author volter_9
 * @version 1.0.0.0
 */ 

/**
 * returnAnimationFrame
 * 
 * @param {function} callback
 * @return {void}
 */
var requestAnimationFrame = (function () {
	return window.requestAnimationFrame ||
	       window.webkitRequestAnimationFrame||
	       window.mozRequestAnimationFrame ||
	       window.msRequestAnimationFrame ||
	       window.oRequestAnimationFrame ||
	       function (callback) {
	           setTimeout(callback, 1e3/60);
	       };
})();

var inherit = function (superclass) {
	function foo () {}
	foo.prototype = superclass.prototype;
	return new foo();
};

var Vector = (function () {
	/**
	 * Vector, basic operations with vectors
	 *
	 * @constructor
	 * @this {Vector}
	 * @param {number} x X coordinate of vector
	 * @param {number} y Y coordinate of vector
	 */
	function Vector(x,y) {
		this.x = x || 0;
		this.y = y || 0;
	}
	
	/**
	 * Static method of Vector which will create a new Vector object out of angle that was passed in terms of pies
	 *
	 * @param {number} angle The angle
	 * @return {Vector}
	 */
	Vector.angular = function (angle) {
		var cos = Math.cos(angle),
			sin = Math.sin(angle);
		
		return new Vector(cos,sin);
	}
	
	Vector.prototype.constructor = Vector;
	
	/**
	 * Adds vector or coordinates
	 *
	 * @param {(Vector|number)} x The x coordinate or vector
	 * @param {(number|undefined)} y The y coordinate or nothing
	 */
	Vector.prototype.add = function (x,y) {
		this.x += (!isNaN(x.x) && !y) ? x.x : x;
		this.y += (!isNaN(x.y) && !y) ? x.y : y;
	};
	
	/**
	 * Subtracts vector or coordinates
	 *
	 * @param {(Vector|number)} x The x coordinate or vector
	 * @param {(number|undefined)} y The y coordinate or nothing
	 */
	Vector.prototype.sub = function (x,y) {
		this.x -= (!isNaN(x.x) && !y) ? x.x : x;
		this.y -= (!isNaN(x.y) && !y) ? x.y : y;
	};
	
	/**
	 * Multiply vector, coordinates or scalar
	 *
	 * @param {(Vector|number)} x The x coordinate, scalar or vector
	 * @param {(number|undefined)} y The y coordinate or nothing
	 */
	Vector.prototype.mul = function (x,y) {
		this.x *= (!isNaN(x.x) && !y) ? x.x : (typeof y !== 'number') ? x : x;
		this.y *= (!isNaN(x.y) && !y) ? x.y : (typeof y !== 'number') ? x : y;
	};
	
	/**
	 * Divides vector, coordinates or scalar
	 *
	 * @param {(Vector|number)} x The x coordinate, scalar or vector
	 * @param {(number|undefined)} y The y coordinate or nothing
	 */
	Vector.prototype.div = function (x,y) {
		this.x /= (!isNaN(x.x) && !y) ? x.x : (!y) ? x : x;
		this.y /= (!isNaN(x.y) && !y) ? x.y : (!y) ? x : y;
	};
	
	/**
	 * Clones "this" vector
	 *
	 * @param {void}
	 * @return {Vector} vec Cloned vector
	 */
	Vector.prototype.clone = function () {
		return new Vector(this.x,this.y);
	};
	
	/**
	 * Copy given vector in arguments
	 * 
	 * @param {Vector} v The given vector
	 */
	Vector.prototype.copy = function (v) {
		this.x = v.x || 0;
		this.y = v.y || 0;
	};
	
	/**
	 * Reseting vector, setting both coordinates to 0
	 * 
	 * @param {void}
	 * @return {void}
	 */
	Vector.prototype.reset = function () {
		this.x = 0;
		this.y = 0;
	};
	
	/**
	 * Setting values
	 * 
	 * @param {number} x The x coordinate
	 * @param {number} y The y coordinate
	 * @return {void}
	 */
	Vector.prototype.set = function (x,y) {
		this.x = x || 0;
		this.y = y || 0;
	};
	
	/**
	 * Calculating the angle of two vectors or vector and origin
	 * 
	 * @param {(Vector|undefined)} vec The vector or nothing
	 * @return {number} angle Angle between two vectors or between vector and origin (if argument undefined)
	 */
	Vector.prototype.getAngle = function (vec) {
		var angle,
			delta;
		
		if (!vec) {
			angle = Math.atan2(this.y,this.x);
		}
		else {
			delta = vec.clone();
			delta.sub(this);
			
			angle = Math.atan2(delta.y,delta.y);
		}
		
		return ((angle < 0) ? 2*Math.PI + angle : angle);
	};
	
	/**
	 * Calculating the magnitude of vector in squared terms
	 * 
	 * @param {void}
	 * @return {number} distance The distance between origin 
	 */
	Vector.prototype.getMagnitude = function () {
		return this.x * this.x + this.y * this.y;
	};
	
	/**
	 * Calculating distance between two vectors in squared terms
	 * 
	 * @param {Vector} vec The vector
	 * @return {number} distance The distance between two vectors
	 */
	Vector.prototype.getDistance = function (v) {
		var delta = v.clone();
		delta.sub(this);
		
		return delta.x * delta.x + delta.y * delta.y;
	};
	
	/**
	 * Calculating and returning
	 * 
	 * @param {Vector} vec The vector
	 * @return {number} distance The distance between two vectors
	 */
	Vector.prototype.getUnit = function () {
		var cVec = this.clone();
		var length = Math.sqrt(cVec.getMagnitude());
		
		cVec.mul(1/length);
		
		return cVec;
	};
	
	/**
	 * Return is the x and y of vector equals to 0
	 *
	 * @return {bool}
	 */
	Vector.prototype.isNull = function () {
		return (this.x === 0 && this.y === 0);
	};
	
	return Vector;
})();

var AABBRect = (function () {
	/**
	 * AABB rect, contains utility functions for detection of collisions
	 *
	 * @param {number} x X-coordinate
	 * @param {number} y Y-coordinate
	 * @param {number} w Width of the rect
	 * @param {number} h Height of the rect
	 */
	function AABBRect(x,y,w,h) {
		this.position = new Vector(x,y);
		this.size = new Vector(w,h);
		
		this.min = new Vector(x,y);
		
		this.max = new Vector(x,y);
		this.max.add(this.size)
	}
	
	AABBRect.constructor = AABBRect;
	
	/**
	 * This method allows to detect if the rect collides with this rect
	 *
	 * @param {AABBRect} rect The rect want to check the collision
	 * @return {bool}
	 */
	AABBRect.prototype.isCollide = function (rect) {
		if (this.min.x > rect.max.x ||
			rect.min.x > this.max.x ||
			this.min.y > rect.max.y ||
			rect.min.y > this.max.y) {
			return false;
		}
		
		return true;
	};
	
	/**
	 * Setting up position and min, max properties
	 * 
	 * @param {Vector|number} x The specified vector or x-coordinate
	 * @param {number|undefined} y The specified y-coordinate or undefined
	 */
	AABBRect.prototype.setPosition = function (x,y) {
		if (x instanceof Vector && !y) {
			this.position.copy(x);
		}
		else if (!isNaN(x) && !isNaN(y)) {
			this.position.set(x,y);
		}
		else {
			// Пошел на х..!
			return;
		}
		
		this.min.copy(this.position);
	
		this.max.copy(this.position);
		this.max.add(this.size);
	};
	
	AABBRect.prototype.setSize = function (x,y) {
		if (x instanceof Vector && !y) {
			this.size.copy(x);
		}
		else if (!isNaN(x) && !isNaN(y)) {
			this.size.set(x,y);
		}
		else {
			// Я кому сказал, пошел на х..
			return;
		}
		
		this.setPosition(this.position);
	}
	
	return AABBRect;
})();

var Node = (function () {
	/**
	 * Node "class", they are main objects in game
	 * 
	 * @constructor
	 * @param {void}
	 * @return {Node}
	 */
	function Node() {
		this.isUpdating = true;
		this.isRendering = true;
		
		this.children = [];
		
		this.index = -1;
		this.parent = null;
	}
	
	Node.prototype.constructor = Node;
	
	/**
	 * Add child to children list
	 * 
	 * @param {Node} child The Node 
	 * @return {void}
	 */
	Node.prototype.add = function (child) {
		if (child instanceof Node) {
			child.index = this.children.length;
			child.parent = this;
			child.game = this.game;
			child.id = this.id + '.' + child.index;
			
			this.children.push(child);
			child.onEnter();
		}
	};
	
	/**
	 * Removing child from children list
	 * 
	 * @param {Node} child The Node wished to be removed
	 * @return {void}
	 */
	Node.prototype.remove = function (child) {
		if (child instanceof Node && this.children[child.index]) {
			child.index = -1;
			child.parent = null;
			
			this.children.splice(child.index,1);
			child.onExit();
			
			// Reseting the indexes
			if (this.children.length) {
				for (var i = 0, c = this.children.length; i < c; i++) {
					this.children[i].index = i;
				}
			}
		}
	};
	
	
	Node.prototype.loop = function (context) {
		if (this.children.length) {
			for (var i = 0, c = this.children.length; i < c; i++) {
				var child = this.children[i];
				
				child.loop(context);
			}
		}
		
		// Update
		if (this.isUpdating !== false) {
			this.update();
		}
		
		// Render
		if (this.isRendering !== false) {
			this.render(context);
		}
	};
	
	/**
	 * Render method, should be modified in inherited objects
	 * 
	 * @param {CanvasRenderingContext2D} ctx The canvas' context
	 * @return {void}
	 */
	Node.prototype.render = function (ctx) {
		
	};
	
	/**
	 * Update method, should be modified in inherited objects
	 *
	 * @param {void}
	 * @return {void}
	 */
	Node.prototype.update = function () {
		
	};
	
	/**
	 * Method that would be called when node was added to game
	 *
	 * @return {void}
	 */
	Node.prototype.onEnter = function () {
		
	};
	
	/**
	 * Method that would be called when node was removed from game
	 *
	 * @return {void}
	 */
	Node.prototype.onExit = function () {
		
	};
	
	/**
	 * Keyboard pressing event, should be modified in inherited object and called inner
	 *
	 * @param {string} s The state of pressed key, either "up" or "down"
	 * @param {number} k The key code of pressed key
	 */
	Node.prototype.onKey = function (s,k) {
		
	};
	
	/**
	 * Mouse event, should be modified in inherited object and called inner
	 *
	 * @param {string} s The state of mouse, either "up", "move" or "down"
	 * @param {Vector} v The position of cursor
	 */
	Node.prototype.onMouse = function (s,v) {
		
	};
	
	return Node;
})();

var Game = (function () {
	/* @private */
	var cursor = new Vector(0,0),
		attachedHandlers = {
			'mouse': [],
			'key'  : [],
		};
	
	/**
	 * Rendering background
	 * 
	 * @private
	 * @param {CanvasRenderingContext2D} ctx The context of canvas
	 * @param {string} bg The string in for background color in hexadecimal form
	 * @param {Object} size The object with 'w' and 'h' properties (wIDTH and hEIGHT)
	 */
	var renderBackground = function (ctx,bg,size) {
		ctx.clearRect(0,0,size.w, size.h);
		
		// If not white
		if (bg !== '#fff' || bg !== '#ffffff') {
			ctx.fillStyle = bg;
			ctx.fillRect(0,0,size.w, size.h);
		}
	};
	
	/**
	 * Keyboard pressing event, called on key press up and down
	 *
	 * @param {string} s The state of pressed key, either "up" or "down"
	 * @param {number} k The key code of pressed key
	 */
	var onKey = function (s,k) {
		for (var key in attachedHandlers.key) {
			var value = attachedHandlers.key[key];
		
			if (value instanceof Node) {
				value.onKey(s,k);
			}
		}
	};
	
	/**
	 * Mouse pressing event, called on mouse move, click of left button and release of left button
	 * 
	 * @param {string} s The state of mouse, either "up", "move", or "down"
	 * @param {Vector} v The position of cursor
	 */
	var onMouse = function (s,v) {
		for (var key in attachedHandlers.mouse) {
			var value = attachedHandlers.mouse[key];
			
			if (value instanceof Node) {
				value.onMouse(s,v);
			}
		}
	}
	
	/**
	 * Game "class", main game
	 *
	 * @constructor
	 * @this {Game}
	 * @param {string} id The id of canvas element which would be used
	 * @param {function} init The function which would be called after initialization
	 * @param {string} bgcolor The color of background
	 * @return {Game}
	 */
	function Game(id, init, bgcolor) {
		Node.call(this)
		
		this.game = this;
		this.id = 'game';
		this.isUpdating = false;
		this.isRendering = false;
		
		var _this = this;
		
		this.canvas = document.getElementById(id);
		this.context = this.canvas.getContext('2d');
		this.background = bgcolor || '#ffffff';
		this.position = new Vector(0,0);
		
		this.size = {
			w: this.canvas.width,
			h: this.canvas.height,
		};
		
		this.running = false;
		
		this.init = init || function init() {};
		
		this.init();
		this.start();
		
		// Adding key handlers
		window.addEventListener('keydown', function (e) {
			onKey('down',e.keyCode);
		});
		
		window.addEventListener('keyup', function (e) {
			onKey('up',e.keyCode);
		});
		
		// Adding mouse handlers
		window.addEventListener('mouseup', function (e) {
			cursor.set(e.clientX,e.clientY);
			cursor.sub(_this.canvas.offsetLeft,_this.canvas.offsetTop);
			
			onMouse('up', cursor);
		});
		
		window.addEventListener('mousemove', function (e) {
			cursor.set(e.clientX,e.clientY);
			cursor.sub(_this.canvas.offsetLeft,_this.canvas.offsetTop);
			
			onMouse('move', cursor);
		});
		
		window.addEventListener('mousedown', function (e) {
			cursor.set(e.clientX,e.clientY);
			cursor.sub(_this.canvas.offsetLeft,_this.canvas.offsetTop);
			
			onMouse('down', cursor);
		});
		
		// Pause the timer, don't eat CPU >_<
		window.addEventListener('focus', function () {
			_this.start();
		});
		
		window.addEventListener('blur', function () {
			_this.stop();
		});
	}
	
	Game.prototype = inherit(Node);
	Game.prototype.constructor = Game;
	
	/**
	 * Update and render all children
	 * 
	 * @return {void}
	 */
	Game.prototype.loop = function () {
		if (this.running !== false) {
			requestAnimationFrame(this.loop.bind(this));
		}
		
		// Rendering background
		renderBackground(this.context,this.background,this.size);
		
		this.context.save();
		this.context.translate(this.position.x, this.position.y);
		if (this.children.length) {
			for (var i = 0, c = this.children.length; i < c; i++) {
				var child = this.children[i];
				
				if (child.loop && (child.isUpdating || child.isRendering)) {
					child.loop(this.context);
				}
			}
		}
		this.context.restore();
	};
	
	/**
	 * Method will start looping (updating & rendering) children
	 *
	 * @return {void}
	 */
	Game.prototype.start = function () {
		if (this.running === false) {
			this.running = true;
			this.loop();
		}
	};
	
	/**
	 * Method will stop looping (updating & rendering) children
	 *
	 * @return {void}
	 */
	Game.prototype.stop = function () {
		if (this.running === true) {
			this.running = false;
		}
	};
	
	/**
	 * Attaching keyboard events on node
	 *
	 * @param {Node} node The node that would be attached to keyboard events
	 */
	Game.prototype.attachKeyboard = function (node) {
		if (!attachedHandlers.key[node.id]) {
			attachedHandlers.key[node.id] = node;
		}
	};
	
	/**
	 * Detaching keyboard events from node
	 *
	 * @param {Node} node The node that would be detached from keyboard events
	 */
	Game.prototype.detachKeyboard = function (node) {
		if (attachedHandlers.key[node.id]) {
			attachedHandlers.key[node.id] = null;
		}
	};
	
	/**
	 * Attaching mouse events on node
	 *
	 * @param {Node} node The node that would be attached to mouse events
	 */
	Game.prototype.attachMouse = function (node) {
		if (!attachedHandlers.mouse[node.id]) {
			attachedHandlers.mouse[node.id] = node;
		}
	};
	
	/**
	 * Detaching keyboard events from node
	 *
	 * @param {Node} node The node that would be detached from keyboard events
	 */
	Game.prototype.detachMouse = function (node) {
		if (attachedHandlers.mouse[node.id]) {
			attachedHandlers.mouse[node.id] = null;
		}
	};
	
	return Game;
})();