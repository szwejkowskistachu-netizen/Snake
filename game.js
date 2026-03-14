const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

let snake=[]
let snakeLength=5
let dir="RIGHT"

let kebabs=[]
let broccolis=[]

let mission="big"
let skin="classic"
let mapType="jungle"

let trees=[]
let cacti=[]

let gameInterval=null

const grid=20

function startGame(){

mission=document.getElementById("missionSelect").value
skin=document.getElementById("skinSelect").value
mapType=document.getElementById("mapSelect").value

document.getElementById("menu").style.display="none"

snake=[{x:200,y:200}]

if(mission==="small"){
snakeLength=15
}else{
snakeLength=5
}

dir="RIGHT"

spawnFood()

if(mapType==="jungle"){
spawnTrees()
}else if(mapType==="desert"){
spawnCacti()
}else{
trees=[]
cacti=[]
}

if(gameInterval) clearInterval(gameInterval)

gameInterval=setInterval(gameLoop,100)

document.getElementById("statusText").innerText="Gra trwa..."

}

function resetGame(){

clearInterval(gameInterval)

document.getElementById("menu").style.display="grid"

document.getElementById("statusText").innerText="Gotowy do gry"

}

function spawnFood(){

kebabs=[]
broccolis=[]

for(let i=0;i<5;i++){

kebabs.push({
x:Math.floor(Math.random()*50)*grid,
y:Math.floor(Math.random()*35)*grid
})

}

for(let i=0;i<5;i++){

broccolis.push({
x:Math.floor(Math.random()*50)*grid,
y:Math.floor(Math.random()*35)*grid
})

}

}

function spawnTrees(){

trees=[]

for(let i=0;i<12;i++){

trees.push({
x:Math.floor(Math.random()*50)*grid,
y:Math.floor(Math.random()*35)*grid
})

}

}

function spawnCacti(){

cacti=[]

for(let i=0;i<12;i++){

cacti.push({
x:Math.floor(Math.random()*50)*grid,
y:Math.floor(Math.random()*35)*grid
})

}

}

document.addEventListener("keydown",e=>{

if(e.key=="ArrowUp" && dir!="DOWN") dir="UP"
if(e.key=="ArrowDown" && dir!="UP") dir="DOWN"
if(e.key=="ArrowLeft" && dir!="RIGHT") dir="LEFT"
if(e.key=="ArrowRight" && dir!="LEFT") dir="RIGHT"

})

function moveSnake(){

let head={...snake[0]}

if(dir=="RIGHT") head.x+=grid
if(dir=="LEFT") head.x-=grid
if(dir=="UP") head.y-=grid
if(dir=="DOWN") head.y+=grid

snake.unshift(head)

while(snake.length>snakeLength){
snake.pop()
}

}

function checkFood(){

let head=snake[0]

kebabs.forEach((food,index)=>{

if(head.x===food.x && head.y===food.y){

snakeLength+=2
kebabs.splice(index,1)

}

})

broccolis.forEach((food,index)=>{

if(head.x===food.x && head.y===food.y){

snakeLength-=2

if(snakeLength<3) snakeLength=3

broccolis.splice(index,1)

}

})

}

function endGame(text){

clearInterval(gameInterval)

document.getElementById("statusText").innerText=text

}

function checkCollision(){

let head=snake[0]

if(mapType==="jungle"){

for(let tree of trees){

if(head.x===tree.x && head.y===tree.y){

endGame("Uderzyłeś w drzewo!")

}

}

}

if(mapType==="desert"){

for(let cactus of cacti){

if(head.x===cactus.x && head.y===cactus.y){

endGame("Uderzyłeś w kaktusa!")

}

}

}

if(head.x<0 || head.y<0 || head.x>980 || head.y>680){

endGame("Wypadłeś poza mapę!")

}

}

function checkMission(){

if(mission==="big" && snakeLength>=40){

endGame("Misja wykonana: największy wąż!")

}

if(mission==="small" && snakeLength<=5){

endGame("Misja wykonana: najmniejszy wąż!")

}

}

function draw(){

if(mapType==="sky"){

let gradient=ctx.createLinearGradient(0,0,0,700)
gradient.addColorStop(0,"#87ceeb")
gradient.addColorStop(1,"#cfefff")

ctx.fillStyle=gradient
ctx.fillRect(0,0,1000,700)

for(let i=0;i<6;i++){

ctx.fillStyle="white"

let x=100+i*150
let y=80+(i%2)*50

ctx.beginPath()
ctx.arc(x,y,30,0,Math.PI*2)
ctx.arc(x+40,y,30,0,Math.PI*2)
ctx.arc(x+20,y-20,30,0,Math.PI*2)
ctx.fill()

}

}else if(mapType==="desert"){

let gradient=ctx.createLinearGradient(0,0,0,700)
gradient.addColorStop(0,"#f4d03f")
gradient.addColorStop(1,"#d4ac0d")

ctx.fillStyle=gradient
ctx.fillRect(0,0,1000,700)

}else{

let gradient=ctx.createLinearGradient(0,0,0,700)
gradient.addColorStop(0,"#1e5f1e")
gradient.addColorStop(1,"#0b3d0b")

ctx.fillStyle=gradient
ctx.fillRect(0,0,1000,700)

}

if(mapType==="jungle"){

for(let tree of trees){

ctx.fillStyle="#3b2a1a"
ctx.fillRect(tree.x+6,tree.y+10,8,10)

ctx.fillStyle="darkgreen"
ctx.beginPath()
ctx.arc(tree.x+10,tree.y+10,10,0,Math.PI*2)
ctx.fill()

}

}

if(mapType==="desert"){

for(let cactus of cacti){

// Pień kaktusa
ctx.fillStyle="#229954"
ctx.fillRect(cactus.x+6,cactus.y+4,8,14)

// Ramiona kaktusa
ctx.fillRect(cactus.x+2,cactus.y+8,4,4)
ctx.fillRect(cactus.x+14,cactus.y+6,4,4)
ctx.fillRect(cactus.x+2,cactus.y+4,2,4)
ctx.fillRect(cactus.x+16,cactus.y+2,2,4)

}

}

kebabs.forEach(food=>{

ctx.fillStyle="#c97a2b"
ctx.fillRect(food.x,food.y,20,20)

})

broccolis.forEach(food=>{

ctx.fillStyle="#2ecc71"
ctx.beginPath()
ctx.arc(food.x+10,food.y+10,10,0,Math.PI*2)
ctx.fill()

})

for(let part of snake){

if(skin==="classic") ctx.fillStyle="lime"
if(skin==="demogorgon") ctx.fillStyle="#cc0000"
if(skin==="dog") ctx.fillStyle="#a0522d"

ctx.fillRect(part.x,part.y,20,20)

}

}

function gameLoop(){

moveSnake()

checkFood()

checkCollision()

checkMission()

draw()

}