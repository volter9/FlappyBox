/**
 * Flappy bird game file
 * 
 * @author volter_9
 * @version 1.0
 */

(function () {
	/**
	 * Clamping function, limits the area
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
	 * Pipes
	 */
	var Pipes = (function () {
		function Pipes () {
			Node.call(this);
			
			this.height = 420;
			this.width = 40;
			this.maxJump = 52.5 * 2;
			this.limit = 50;
			this.number = 3;
			this.running = false;
			
			this.pipes = [];
			for (var i = 0; i < 3; i++) {
				var position = new Vector(400 + i * 200,0);
				
				var pipe = {
					position: position,
					offset: Math.floor(this.limit + (this.height - 2 * this.limit - this.maxJump) * Math.random()),
					number: i + 1,
				};
				
				pipe.rects = [
					new AABBRect(position.x, 0, this.width, pipe.offset),
					new AABBRect(position.x, pipe.offset + this.maxJump, this.width, this.height - this.maxJump - pipe.offset)
				];
				
				this.pipes.push(pipe);
			}
			
			this.color = '#000';
			this.isUpdating = false;
			this.isRendering = false;
		}
		
		Pipes.prototype = inherit(Node);
		Pipes.prototype.constructor = Pipes;
		
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
				pipe.position.x = 480 + this.width;
				pipe.offset = Math.floor(this.limit + (this.height - 2 * this.limit - this.maxJump) * Math.random());
				pipe.number = ++this.number;
				
				pipe.rects[0].setSize(this.width,pipe.offset);
				pipe.rects[1].setSize(this.width,this.height - pipe.offset - this.maxJump);
				pipe.rects[1].setPosition(pipe.position.x,pipe.offset + this.maxJump);
			}
			
			pipe.position.x -= 2;
			pipe.rects[0].setPosition(pipe.position);
			pipe.rects[1].setPosition(pipe.position.x,pipe.offset + this.maxJump);
		};
		
		Pipes.prototype.render = function (pipe,ctx) {
			ctx.fillStyle = this.color;
			ctx.fillRect(pipe.position.x + 4,0,this.width - 8, pipe.offset);
			ctx.fillRect(pipe.position.x,pipe.offset - 15,this.width, 15);
			ctx.fillRect(pipe.position.x + 4,pipe.offset + this.maxJump,this.width - 8, this.height - this.maxJump - pipe.offset);
			ctx.fillRect(pipe.position.x,pipe.offset + this.maxJump,this.width, 15);
		};
		
		Pipes.prototype.reset = function () {
			this.pipes = [];
			this.number = 3;
			
			for (var i = 0; i < 3; i++) {
				var position = new Vector(400 + i * 200,0);
				
				var pipe = {
					position: position,
					offset: Math.floor(this.limit + (this.height - 2 * this.limit - this.maxJump) * Math.random()),
					number: i + 1,
				};
				
				pipe.rects = [
					new AABBRect(position.x, 0, this.width, pipe.offset),
					new AABBRect(position.x, pipe.offset + this.maxJump, this.width, this.height - this.maxJump - pipe.offset)
				];
				
				this.pipes.push(pipe);
			}
		};
		
		return Pipes;
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
				
				if (!this.started) {
					this.started = true;
					this.pipes.running = true;
					this.startText.fadeOut();
				}
			}
		};
		
		Bird.prototype.update = function () {
			if (!this.dying && this.started) {
				if (!this.velocity.isNull()) {
					this.position.add(this.velocity);
					this.rect.setPosition(this.position.x-this.size.x/2,this.position.y-this.size.y/2);
				
					this.velocity.x = 1;
					var angle = this.velocity.getAngle();
					angle = (angle > Math.PI) ? -(2 * Math.PI - angle) : angle;
					angle = ((angle - this.angle) % (2 * Math.PI)) / 10;
			
					this.angle += angle;
					this.angle = clamp(this.angle, -Math.PI/6, Math.PI/2);
					this.velocity.x = 0;
				
					if (this.position.y > 510) {
						this.position.y = -30;
					}
				
					if (this.rect.isCollide(this.ground.rect)) {
						this.dying = true;
						this.pipes.running = false;
						this.button.hidden = false;
					}
				}
				this.velocity.y += 0.25;
			
				for (var i = 0, c = this.pipes.pipes.length; i < c; i++) {
					var pipe = this.pipes.pipes[i];
				
					if (pipe.rects[0].isCollide(this.rect) || pipe.rects[1].isCollide(this.rect) && !this.dying) {
						this.dying = true;
						this.pipes.running = false;
						this.button.hidden = false;
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
			ctx.fillRect(-this.size.x/2,-this.size.y/2,this.size.x,this.size.y);
			
			ctx.restore();
			
			ctx.strokeStyle = '#fff';
			ctx.lineJoin = 'round';
			ctx.lineWidth = 4;
			ctx.textAlign = 'center';
			ctx.font = '30px Verdana';
			ctx.strokeText(this.score, this.game.size.w / 2, 70);
			ctx.fillText(this.score, this.game.size.w / 2, 70);
		};
		
		Bird.prototype.reset = function () {
			this.position.set(160,240);
			this.scale = 1;
			this.dying = false;
			this.score = 0;
			this.velocity.set(0,0);
			this.started = false;
			this.angle = 0;
		};
		
		return Bird;
	})();
	
	/**
	 * Ground, doing nothing except rendering.
	 */
	var Ground = (function () {
		function Ground () {
			Node.call(this);
			
			this.isUpdating = false;
			this.rect = new AABBRect(0,420,320,60);
		}
		
		Ground.prototype = inherit(Node);
		Ground.prototype.constructor = Ground;
		
		Ground.prototype.render = function (ctx) {
			ctx.fillStyle = '#000';
			ctx.fillRect(this.rect.position.x, this.rect.position.y, this.rect.size.x, this.rect.size.y);
		};
		
		return Ground;
	})();
	
	/**
	 * Text class
	 * 
	 */
	var Text = (function () {
		function Text(text,font,size,position) {
			Node.call(this);
			
			this.text = text;
			this.position = position;
			this.font = size + 'px ' + font;
			this.alpha = 1;
			this.fade = false;
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
			ctx.font = this.font;
			ctx.textAlign = 'center';
			ctx.lineJoin = 'round';
			ctx.fillStyle = '#000';
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
			
			this.action = action;
			this.position = position;
			this.size = new Vector(w,h);
			this.text = text;
			this.hidden = false;
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
				
				ctx.fillRect(this.position.x,this.position.y,this.size.x,this.size.y);
				ctx.strokeRect(this.position.x,this.position.y,this.size.x,this.size.y);
				
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
			Node.apply(this,arguments);
		}
		
		GameScene.prototype = inherit(Node);
		GameScene.prototype.constructor = GameScene;
		
		GameScene.prototype.onEnter = function () {			
			var bird = new Bird(new Vector(this.parent.size.w/2,this.parent.size.h/2)),
				ground = new Ground(),
				pipes = new Pipes(),
				start = new Text('Press \'Space\' to start...','Verdana',18,new Vector(this.game.size.w/2, 400));
			
			bird.ground = ground;
			bird.pipes = pipes;
			bird.startText = start;
			
			var button = new Button('Restart', new Vector(60,200),200,60,function () {
				bird.reset();
				pipes.reset();
				start.reset();
				
				this.hidden = true;
			});
			button.hidden = true;
			bird.button = button;
			
			this.add(ground);
			this.add(pipes);
			this.add(bird);
			this.add(start);
			this.add(button);
		};
		
		return GameScene;
	})();
	
	var game = new Game('canvas', function () {
		var gameScene = new GameScene();
		
		this.add(gameScene);
	});
})();