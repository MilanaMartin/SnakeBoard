class ScoreDisplay{
    score=0;
    outScoreItem;
    
    constructor(outItemName){
        this.outScoreItem=document.getElementById(String(outItemName))
        this.outScoreItem.textContent=`Счет: ${this.score}`;
    }

    getScore(){
        return this.score;
    }
    setScore(score){
        this.score=score;
        this.outScoreItem.textContent=this.score;
    }
    up(){
        this.score++;
        this.outScoreItem.textContent=`Счет: ${this.score}`;
    }
    endGame(){
        this.outScoreItem.textContent=`|Игра закончена| Счет: ${this.score}`;
    }
}

class Food{
    x=0;
    y=0;
    images=[];
    image={};
    constructor(boxSize, boardSize){
        this.images = [
            "img/food0.png",
            "img/food1.png",
            "img/food2.png",
            "img/food3.png",
            "img/food4.png",
            "img/food5.png",
            "img/food6.png",
            "img/food7.png"
        ];
        //Генерируем случайное положение еды
        this.x = Math.floor(Math.random()*boardSize+1) * boxSize;
        this.y = Math.floor(Math.random()*boardSize+1) * boxSize;

        //Выбираем случайную картинку еды
        let randImage = Math.floor(Math.random()*this.images.length);
        this.image=new Image(boxSize, boxSize);
        this.image.src=this.images[randImage];
    }
    draw(board={}){
        board.drawImage(this.image, this.x, this.y);
    }
}

class Snake{
    dead=false;
    boxSize=0;
    tail=[];
    step={x:0,y:0};
    
    eaten=false;

    get lengthTail(){
        return this.tail.length;
    }

    get head(){
        return this.tail[0];
    }

    constructor(sizeBox,sizeBord){
        this.boxSize=sizeBox;
        let start = sizeBord/2*sizeBox + sizeBox;
        this.tail[0]={
            x:start+Math.pow(Math.floor(Math.random()*1),0)*(sizeBox*Math.floor(Math.random()*3)),
            y:start+Math.pow(Math.floor(Math.random()*1),0)*(sizeBox*Math.floor(Math.random()*3)),
        };
    }

    collision(newHead){
        for(let i = 0; i < this.tail.length; i++){
            if(newHead.x == this.tail[i].x && newHead.y == this.tail[i].y){
                return true;
            }
        }
        return false;
    }

    eatFood(food={}){
        this.eaten = (this.head.x === food.x && this.head.y === food.y);
        return this.eaten;
    }

    moveTo(step={}){
        this.step=step;
    }

    move(boardSize){
        if(this.step.x===0 && this.step.y===0){
            return true;
        }
        let newHead = {
            x:this.tail[0].x + this.step.x*this.boxSize,
            y:this.tail[0].y + this.step.y*this.boxSize
        };
        
        let isOk=true;

        if(this.collision(newHead) || 
            newHead.x < 0 || 
            newHead.x > this.boxSize*(boardSize+1) || 
            newHead.y < 0 || 
            newHead.y > this.boxSize*(boardSize+1) 
        ){
            isOk=false;
        }

        this.tail.unshift(newHead);
        if(!this.eaten){
            this.tail.pop();
        }
        return isOk;
    }

    draw(obj={}){
        for( let i = 0; i < this.tail.length ; i++){
            obj.fillStyle = ( i == 0 )? this.dead? "red":"yellow" : "green";
            obj.fillRect(this.tail[i].x, this.tail[i].y, this.boxSize, this.boxSize);
            
            obj.strokeStyle = "red";
            obj.strokeRect(this.tail[i].x, this.tail[i].y, this.boxSize, this.boxSize);
        }
    }
    //Отрисовываем врезание в объект
    kick(obj={}){
        this.dead=true;
        this.draw(obj);
    }
}

class Display{
    tick=1000;
    boxSize = 37;
    boardSize = 10;
    d="";
    snake={};
    food={};
    boardCvs={};

    get bContext(){
        return this.boardCvs.getContext("2d");
    }

    get boardImage(){
        let image=new Image();
        image.src="img/board.png"
        return image;
    }

    constructor(){
        this.score=new ScoreDisplay("score");
        
        this.snake = new Snake(this.boxSize, this.boardSize);
        this.food=new Food(this.boxSize, this.boardSize);
        this.boardCvs = document.getElementById("board");
        this.playGame = setInterval(()=>this.draw(), this.getTick());
    }

    //Обрабатываем изменения движения
    directionMovement(event){
        let key = event.keyCode;
        if( key == 37 && this.d != "RIGHT"){
            this.d = "LEFT";
        }else if(key == 38 && this.d != "DOWN"){
            this.d = "UP";            
        }else if(key == 39 && this.d != "LEFT"){
            this.d = "RIGHT";
        }else if(key == 40 && this.d != "UP"){
            this.d = "DOWN";
        }
    }

    //Рисуем доску и объекты на ней
    draw(){
        this.bContext.drawImage(this.boardImage,0,0);

        this.snake.draw(this.bContext);

        this.food.draw(this.bContext)

        // Куда поползет змейка
        let step = {
            x: 0,
            y: 0
        };
        if (this.d == "LEFT")    step={x:-1,y:0};
        if (this.d == "UP")      step={x:0,y:-1};
        if (this.d == "RIGHT")   step={x:1,y:0};
        if (this.d == "DOWN")    step={x:0,y:1};

        this.snake.moveTo(step);

        if (this.snake.eatFood(this.food)) {
            this.score.up();
            this.food = new Food(this.boxSize, this.boardSize);
            clearInterval(this.playGame);
            this.playGame = setInterval(()=>this.draw(), this.getTick());
        }

        if( !this.snake.move(this.boardSize)){
            this.gameOver();
        }
    }

    //Ускоряем движение змея
    getTick(){
        if (this.score.getScore() % 3 && this.tick > 100)
        {
            this.tick-=100;
        }
        return this.tick;
    }

    //Завершаем игру при ударение и если врезаемся сами в себя
    gameOver() {
        clearInterval(this.playGame);
        this.snake.kick(this.bContext);
        this.score.endGame();        
    }
}

let displayGame = new Display();
document.addEventListener("keydown",(event)=>{displayGame.directionMovement(event)});