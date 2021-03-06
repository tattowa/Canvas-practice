let canvas = document.querySelector('canvas');

function canvas_resize() {
   let windowInnerWidth = window.innerWidth;
   let windowInnerHeight = window.innerHeight;

   canvas.setAttribute('width', windowInnerWidth);
   canvas.setAttribute('height', windowInnerHeight);
}

window.addEventListener('resize', canvas_resize, false);

canvas_resize();


let c = canvas.getContext("2d");

let scoreNum = document.querySelector("#scoreNum")
score = 0
let restart = document.querySelector("#res")
let pop = document.querySelector("#pop")

let scoreRep = document.querySelector(".scoreRep")

class Player {
   constructor(x, y, radius, color) {
      this.x = x
      this.y = y
      this.radius = radius
      this.color = color
   }

   draw() {
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      c.fillStyle = this.color
      c.fill();
   }
}

class Projectile {
   constructor(x, y, radius, color, velocity) {
      this.x = x
      this.y = y
      this.radius = radius
      this.color = color
      this.velocity = velocity
   }

   draw() {
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      c.fillStyle = this.color
      c.fill();
   }

   updata() {
      this.draw()
      this.x = this.x + this.velocity.x
      this.y = this.y + this.velocity.y
   }
}
class Enemy {
   constructor(x, y, radius, color, velocity) {
      this.x = x
      this.y = y
      this.radius = radius
      this.color = color
      this.velocity = velocity
   }

   draw() {
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      c.fillStyle = this.color
      c.fill();
   }

   updata() {
      this.draw()
      this.x = this.x + this.velocity.x
      this.y = this.y + this.velocity.y
   }
}

let friction = 0.99

class Particle {
   constructor(x, y, radius, color, velocity) {
      this.x = x
      this.y = y
      this.radius = radius
      this.color = color
      this.velocity = velocity
      this.alpha = 1
   }

   draw() {
      c.save()
      c.globalAlpha = this.alpha
      c.beginPath();
      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      c.fillStyle = this.color
      c.fill();
      c.restore()
   }

   updata() {
      this.draw()
      this.velocity.x *= friction
      this.velocity.y *= friction
      this.x = this.x + this.velocity.x
      this.y = this.y + this.velocity.y
      this.alpha -= 0.01
   }
}

let x = canvas.width / 2
let y = canvas.height / 2


let player = new Player(x, y, 15, "white")
let projectiles = []
let enemies = []
let particles = []

function init() {
   player = new Player(x, y, 15, "white")
   projectiles = []
   enemies = []
   particles = []
}


function spawnEnemies() {
   let radius = Math.random() * (30 - 4) + 4;
   let E_x
   let E_y

   if (Math.random() < 0.5) {
      E_x = Math.random() < 0.5 ?
         -30 : 30 + canvas.width;
      E_y = Math.random() * canvas.height
   } else {
      E_x = Math.random() * canvas.width
      E_y = Math.random() < 0.5 ?
         -30 : 30 + canvas.height;
   }
   let color = `hsl(${Math.random() * 360},50%,50%)`


   let angle = Math.atan2(E_y - y, E_x - x)
   enemies.push(new Enemy(E_x, E_y, radius, color, {
      x: -Math.cos(angle),
      y: -Math.sin(angle)
   }))

}

let spawnTime

function startEnemy() {
   spawnTime = setInterval(function () {
      spawnEnemies()
   }, 1000);
}

function stopEnemy() {
   clearInterval(spawnTime)
}

let animationId

function animate() {
   animationId = requestAnimationFrame(animate)
   c.fillStyle = "rgba(0,0,0,0.1)"
   c.fillRect(0, 0, x * 2, y * 2)
   player.draw()

   particles.forEach((particle, index) => {
      particle.updata()
      if (particle.alpha <= 0) {
         particles.splice(index, 1);

      }
   })

   projectiles.forEach((projectile, index) => {
      projectile.updata()

      if (
         projectile.x + projectile.radius < 0 ||
         projectile.x - projectile.radius > canvas.width ||
         projectile.y + projectile.radius < 0 ||
         projectile.y - projectile.radiius > canvas.height
      ) {
         setTimeout(() => {
            projectiles.splice(index, 1);
         })
      }
   })

   enemies.forEach((enemy, index) => {
      enemy.updata()

      let dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
      // gameover
      if (dist - enemy.radius - player.radius < 1) {
         cancelAnimationFrame(animationId)
         stopEnemy()
         pop.style.display = "flex"
         scoreRep.innerHTML = score
      }


      projectiles.forEach((projectile, indexp) => {
         let dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

         if (dist - enemy.radius - projectile.radius < 1) {


            for (let i = 0; i < enemy.radius * 2; i++) {
               particles.push(new Particle(projectile.x, projectile.y, 3 * Math.random(), enemy.color, {
                  x: (Math.random() - 0.5) * (Math.random() * 6),
                  y: (Math.random() - 0.5) * (Math.random() * 6)
               }))

            };

            if (enemy.radius - 6 > 10) {
               score += 100;
               scoreNum.innerHTML = score
               gsap.to(enemy, {
                  radius: enemy.radius - 10
               })
               projectiles.splice(indexp, 1)
            } else {
               score += 150;
               scoreNum.innerHTML = score
               setTimeout(() => {
                  enemies.splice(index, 1);
                  projectiles.splice(indexp, 1)

               }, 0)
            }
         }
      })
   })
}

addEventListener("click", (event) => {
   let angle = Math.atan2(event.clientY - y, event.clientX - x)
   projectiles.push(new Projectile(x, y, 5, "red", {
      x: 5 * Math.cos(angle),
      y: 5 * Math.sin(angle)
   }))
})

restart.addEventListener("click", () => {
   init()
   startEnemy()
   animate()

   pop.style.display = "none"
   score = 0
   scoreNum.innerHTML = 0
})