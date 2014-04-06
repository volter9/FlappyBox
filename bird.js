/**
 * Flappy bird game file.
 * New methods are commented with
 * jsDoc blocks, old ones are not commented at all.
 *
 * @author volter_9
 * @version 1.0
 */

(function () {
	/**
	 * Clamping function, limits the area
	 *
	 * @param {Number} a Number that needs to be clamped
	 * @param {Number} min Minimum value allowed
	 * @param {Number} max Maximum value allowed
	 */
	function clamp(a,min,max) {
		if (a > max) {
			a = max;
		} 
		else if (a < min) {
			a = min;
		}
		return a;
	}
	
	/**
	 * Pipes, nothing much to say.
	 */
	var Pipes = (function () {
		function Pipes () {
			Node.call(this);
			
			// Parameters
			this.height        = 420;
			this.width         = 40;
			this.maxJump       = 100;
			this.limit         = 50;
			this.amount        = 5;
			this.running       = false;
			
			this.initializePipes();
			
			this.color       = '#000';
			this.isUpdating  = false;
			this.isRendering = false;
		}
		
		Pipes.prototype = inherit(Node);
		Pipes.prototype.constructor = Pipes;
		
		/**
		 * Generates random offset for pipes
		 *
		 * @return {Number}
		 */
		Pipes.prototype.random = function () {
			return Math.floor(this.limit + (this.height - 2 * this.limit - this.maxJump) * Math.random());
		};
		
		Pipes.prototype.setup = function () {
			this.params = {
				distance: this.distanceApart - this.width
			};
			
			this.params.respawn = this.amount * this.params.distance + (this.amount - 1) * this.width;
			console.log(this.params);
		};
		
		/**
		 * Initializes pipes,
		 * the array and put randomized pipes
		 *
		 * @param {void}
		 */
		Pipes.prototype.initializePipes = function () {
			this.distanceApart = 200;
			this.setup();
			
			this.number = this.amount;
			this.pipes  = [];
			
			for (var i = 0; i < this.amount; i++) {
				var position = new Vector(480 + i * this.distanceApart,0);
				
				var pipe = {
					position: position,
					offset: this.random(),
					number: i + 1,
				};
				
				pipe.rects = [
					new AABBRect(position.x, 0, 
								 this.width, pipe.offset),
					new AABBRect(position.x, pipe.offset + this.maxJump, 
								 this.width, this.height - this.maxJump - pipe.offset)
				];
				
				this.pipes.push(pipe);
			}
		};
		
		Pipes.prototype.loop = function (context) {
			Node.prototype.loop.call(this,context);
			
			if (this.pipes.length) {
				for (var i = 0, c = this.pipes.length; i < c; i++) {
					var pipe = this.pipes[i];
					
					if (this.running) {
						this.update(pipe);
					}
					this.render(pipe,context);
				}
			}
		};
		
		Pipes.prototype.update = function (pipe) {
			if (pipe.position.x < -this.width) {
				pipe.position.x = this.params.respawn;
				pipe.offset     = this.random();
				pipe.number     = ++this.number;
				
				pipe.rects[0].setSize(this.width, pipe.offset);
				pipe.rects[1].setSize(this.width, this.height - this.maxJump - pipe.offset);
				
				pipe.rects[1].setPosition(pipe.position.x, pipe.offset + this.maxJump);
			}
			
			pipe.position.x -= 2;
			pipe.rects[0].setPosition(pipe.position);
			pipe.rects[1].setPosition(pipe.position.x,
									  pipe.offset + this.maxJump);
		};
		
		Pipes.prototype.render = function (pipe,ctx) {
			ctx.fillStyle = this.color;
			ctx.fillRect(pipe.position.x + 4,0,
						 this.width - 8, pipe.offset);
			ctx.fillRect(pipe.position.x,pipe.offset - 15,
						 this.width, 15);
			ctx.fillRect(pipe.position.x + 4,pipe.offset + this.maxJump,
						 this.width - 8, this.height - this.maxJump - pipe.offset);
			ctx.fillRect(pipe.position.x,pipe.offset + this.maxJump,
						 this.width, 15);
		};
		
		Pipes.prototype.reset = function () {
			this.initializePipes();
		};
		
		return Pipes;
	})();
	
	var Particles = (function () {
		function Particles() {
			Node.call(this);
			
			this.isUpdating  = false;
			this.isRendering = false;
			this.running = true;
			
			this.p = [];
		}
		
		Particles.prototype = inherit(Node);
		Particles.prototype.constructor = Particles;
		
		Particles.prototype.add = function (x,y,n,t) {
			for (var i = 0; i < n; i++) {
				var rAngle = Math.random() * (Math.PI/2) + Math.PI/4;
				
				var p = {
					position: new Vector(x,y),
					index   : this.p.length,
					time    : t,
					velocity: Vector.angular(rAngle),
				};
				
				p.position.add(p.velocity.x * 10, p.velocity.y * 10);
				p.velocity.x -= 2;
				
				this.p.push(p);
			}
		};
		
		Particles.prototype.remove = function (i) {
			this.p.splice(i,1);
			
			if (this.p.length) {
				for (var j = 0, c = this.p.length; j < c; j++) {
					this.p[j].index = j;
				}
			}
		};
		
		Particles.prototype.loop = function (context) {
			Node.prototype.loop.call(this,context);
			
			if (this.p.length) {
				for (var i = 0, c = this.p.length; i < c; i++) {
					var p = this.p[i];
					
					if (this.running) {
						this.update(p);
					}
					this.render(context,p);
				}
			}
		}
		
		Particles.prototype.render = function (ctx,p) {
			ctx.fillStyle = '#000';
			ctx.fillRect(p.position.x, p.position.y,
						 2,2);
		};
		
		Particles.prototype.update = function (p) {
			p.position.add(p.velocity);
			p.t -= 1/20;
			
			if (p.t < 0) {
				this.remove(p.index);
			}
		};
		
		Particles.prototype.reset = function () {
			this.p = [];
		};
		
		return Particles;
	})();
	
	/**
	 * Bird class
	 */
	var Bird = (function () {
		/**
		 * Bird constructor
		 *
		 * @param {Vector} position Specified vector.
		 */
		function Bird (position) {
			Node.call(this);
			
			this.angle = 0;
			this.color = '#000';
			this.dying = false;
			this.started = false;
			this.position = position || new Vector(0,0);
			this.power = 5;
			this.scale = 1;
			this.score = 0;
			this.size = new Vector(30,30);
			this.vecNull = new Vector(0,0);
			this.velocity = new Vector(0,0);
			
			this.rect = new AABBRect(position.x-this.size.x/2,position.y-this.size.y/2,this.size.x,this.size.y);
		}
		
		Bird.prototype = inherit(Node);
		Bird.prototype.constructor = Bird;
		
		Bird.prototype.onEnter = function () {
			this.game.attachKeyboard(this);
		};
		
		Bird.prototype.onExit = function () {
			this.game.detachKeyboard(this);
		};
		
		Bird.prototype.onKey = function (s,k) {
			// Space
			if (k === 32 && s === 'down') {
				this.velocity.y = -this.power;
				this.particles.add(this.position.x, this.position.y,
							       4,1);
				
				if (!this.started) {
					this.pipes.running = true;
					this.started = true;
					this.startText.fadeOut();
				}
			}
		};
		
		/**
		 * Kills the Bird (actually it's box :D)
		 */
		Bird.prototype.die = function () {
			this.dying = true;
			this.pipes.running = false;
			this.button.hidden = false;
		};
		
		/**
		 * Computes angle
		 */
		Bird.prototype.computeAngle = function () {
			var angle = this.velocity.getAngle();
			
			angle = (angle > Math.PI) ? -(2 * Math.PI - angle) : angle;
			angle = ((angle - this.angle) % (2 * Math.PI)) / 10;
	
			this.angle += angle;
			this.angle = clamp(this.angle, -Math.PI/6, Math.PI/2);
		};
		
		Bird.prototype.update = function () {
			if (!this.dying && this.started) {
				if (!this.velocity.isNull()) {
					this.position.add(this.velocity);
					this.rect.setPosition(this.position.x - this.size.x / 2,
										  this.position.y - this.size.y / 2);
				
					this.velocity.x = 1;
					
					this.computeAngle();
					
					this.velocity.x = 0;
				
					if (this.position.y > 510) {
						this.position.y = -30;
					}
				
					if (this.rect.isCollide(this.ground.rect)) {
						this.die();
					}
				}
				this.velocity.y += 0.25;
				
				if (this.position.y <= 40 && this.velocity.y < 0) {
					this.velocity.y = 0;
				}
				
				for (var i = 0, c = this.pipes.pipes.length; i < c; i++) {
					var pipe = this.pipes.pipes[i];
				
					if (pipe.rects[0].isCollide(this.rect) || 
					    pipe.rects[1].isCollide(this.rect) && 
					    !this.dying) {
						this.die();
					}
				
					if (this.score < pipe.number && pipe.position.x + this.pipes.width / 2 < this.position.x) {
						this.score = pipe.number;
					}
				}
			}
			else if (this.dying) {
				if (this.scale > 0) {
					this.scale -= (2-this.scale) / 10;
				}
				else {
					this.scale = 0;
				}
			}
		};
		
		Bird.prototype.render = function (ctx) {
			ctx.save();
			
			ctx.translate(this.position.x,this.position.y);
			ctx.rotate(this.angle);
			ctx.scale(this.scale,this.scale);
			
			ctx.fillStyle = this.color;
			ctx.fillRect(-this.size.x/2, -this.size.y/2,
						 this.size.x, this.size.y);
			
			ctx.restore();
						
			ctx.font        = '30px Verdana';
			ctx.lineJoin    = 'round';
			ctx.lineWidth   = 4;
			ctx.strokeStyle = '#fff';
			ctx.textAlign   = 'center';
			
			ctx.strokeText(this.score, this.game.size.w / 2, 70);
			ctx.fillText(this.score, this.game.size.w / 2, 70);
		};
		
		/**
		 * Reseting values
		 */
		Bird.prototype.reset = function () {
			this.angle   = 0;
			this.dying   = false;
			this.scale   = 1;
			this.score   = 0;
			this.started = false;
			
			this.position.set(160,240);
			this.velocity.set(0,0);
		};
		
		return Bird;
	})();
	
	var Slider = (function () {
		function Slider (action) {
			Node.call(this);
			
			this.action = action;
			this.active = false;
			this.alpha = 0;
			this.fadeIn = true;
		}
		
		Slider.prototype = inherit(Node);
		Slider.prototype.constructor = Slider;
		
		Slider.prototype.run = function () {
			this.active = true;
		};
		
		Slider.prototype.update = function () {
			if (this.active) {
				if (this.fadeIn && this.alpha < 1) {
					this.alpha += 0.025;
					
					if (this.alpha >= 1) {
						this.action();
						
						this.alpha  = 1;
						this.fadeIn = false;
					}
				}
				else {
					this.alpha -= 0.025;
					
					if (this.alpha <= 0) {
						this.active = false;
						this.alpha  = 0;
						this.fadeIn = true;
					}
				}
			}
		};
		
		Slider.prototype.render = function (ctx) {
			if (this.active) {
				ctx.globalAlpha = this.alpha;
				ctx.fillStyle = '#000';
				ctx.fillRect(0,0,
							 this.game.size.w, this.game.size.h);
				
				ctx.globalAlpha = 1;
			}
		}
		
		return Slider;
	})();
	
	/**
	 * Ground, doing nothing except rendering.
	 */
	var Ground = (function () {
		function Ground () {
			Node.call(this);
			
			this.isUpdating = false;
			this.rect       = new AABBRect(0,420,320,60);
		}
		
		Ground.prototype = inherit(Node);
		Ground.prototype.constructor = Ground;
		
		Ground.prototype.render = function (ctx) {
			ctx.fillStyle = '#000';
			ctx.fillRect(this.rect.position.x, this.rect.position.y, 
						 this.rect.size.x, this.rect.size.y);
		};
		
		return Ground;
	})();
	
	/**
	 * Text class
	 */
	var Text = (function () {
		/**
		 * Text class, creates basically text label
		 *
		 * @param {String} text The specified text
		 * @param {String} font The CSS font
		 * @param {Number} size Desired size of font
		 * @param {Vector} position Desired 
		 */
		function Text(text,font,size,position) {
			Node.call(this);
			
			this.text     = text;
			this.position = position;
			this.font     = size + 'px ' + font;
			this.alpha    = 1;
			this.fade     = false;
		}
		
		Text.prototype = inherit(Node);
		Text.prototype.constructor = Text;
		
		Text.prototype.update = function () {
			if (this.fade) {
				if (this.alpha > 0) {
					this.alpha -= 0.06;
					
					if (this.alpha < 0) {
						this.alpha = 0;
					}
				}
			}
		};
		
		Text.prototype.render = function (ctx) {
			ctx.globalAlpha = this.alpha;
			ctx.fillStyle   = '#000';
			ctx.font        = this.font;
			ctx.lineJoin    = 'round';
			ctx.textAlign   = 'center';
			
			ctx.fillText(this.text,this.position.x,this.position.y);
			ctx.globalAlpha = 1;
		};
		
		Text.prototype.fadeOut = function () {
			this.fade = true;
		};
		
		Text.prototype.reset = function () {
			this.fade = false;
			this.alpha = 1;
		};
		
		return Text;
	})();
	
	/**
	 * Button class,
	 * button.
	 */
	var Button = (function () {
		function Button (text,position,w,h,action) {
			Node.call(this);
			
			this.action   = action;
			this.position = position;
			this.size     = new Vector(w,h);
			this.text     = text;
			this.hidden   = false;
		}
		
		Button.prototype = inherit(Node);
		Button.prototype.constructor = Button;
		
		Button.prototype.onEnter = function () {
			this.game.attachMouse(this);
		};
		
		Button.prototype.onExit = function () {
			this.game.detachMouse(this);
		};
		
		Button.prototype.render = function (ctx) {
			if (!this.hidden) {
				ctx.strokeStyle = '#000';
				ctx.fillStyle = '#fff';
				ctx.lineWidth = 2;
				
				ctx.fillRect(this.position.x, this.position.y,
				             this.size.x, this.size.y);
				
				ctx.strokeRect(this.position.x, this.position.y,
							   this.size.x, this.size.y);
				
				ctx.fillStyle = '#000';
				ctx.font = '20px Verdana';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText(this.text,this.position.x + this.size.x/2, this.position.y + this.size.y/2);
			}
		};
		
		Button.prototype.onMouse = function (s,v) {
			if (s === 'down' && 
				v.x > this.position.x && 
				v.y > this.position.y && 
				v.x < this.position.x + this.size.x &&
				v.y < this.position.y + this.size.y &&
				!this.hidden) {
				this.action();
			}
		};
		
		
		return Button;
	})();
	
	/**
	 * Game scene class,
	 * some kind of grouping object,
	 * do nothing.
	 */
	var GameScene = (function () {
		function GameScene() {
			Node.call(this);
		}
		
		GameScene.prototype = inherit(Node);
		GameScene.prototype.constructor = GameScene;
		
		GameScene.prototype.onEnter = function () {			
			var bird = new Bird(new Vector(this.parent.size.w/2,this.parent.size.h/2)),
				ground = new Ground(),
				pipes = new Pipes(),
				start = new Text('Press \'Space\' to start...','Verdana',18,new Vector(this.game.size.w/2, 400)),
				particles = new Particles(),
				slider = new Slider();
			
			bird.ground = ground;
			bird.pipes = pipes;
			bird.startText = start;
			bird.particles = particles;
			
			var button = new Button('Restart', new Vector(85,200),150,40,function () {
				slider.run();
			});
			
			slider.action = function () {
				bird.reset();
				pipes.reset();
				start.reset();
				particles.reset();
				
				button.hidden = true;
			};
			
			button.hidden = true;
			bird.button = button;
			
			this.add(ground);
			this.add(pipes);
			this.add(bird);
			this.add(start);
			this.add(particles);
			this.add(button);
			this.add(slider);
		};
		
		return GameScene;
	})();
	
	var game = new Game('canvas', function () {
		var gameScene = new GameScene();
		
		this.add(gameScene);
	});
})();