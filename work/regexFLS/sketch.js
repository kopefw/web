const regexp = /\(((?:\.+|\s+)*)\)((?:\d+\s*)+)?/g;
let seq = [];

function setup()
{
    let textArea = document.getElementById("code");
    let btn = document.getElementById("sub");
    btn.addEventListener("click",function(){
        seudoParser(textArea.value);
    })
  
    createCanvas(windowWidth, windowHeight);
    rectMode(CENTER);
}

function draw()
{
    background(255,0,0);
    translate(400,height/2);

    for(let i = 0; i < seq.length; i++)
    {
        seq[i].update();
        seq[i].drawLine();
        seq[i].draw();
        if(seq[i].metaUpdate())
        {
            seq.splice(i,1);
        }
    }
}

class Seq
{
    constructor(dataString,metaTime = 20,moveSpeed = 1,deathTime = 15)
    {
        this.count =  dataString.length;
        this.offset = 0;
        this.prevSumSpace = 0;
        this.parts = [];
        this.moveSpeed = moveSpeed;

        this.metaTime =  metaTime;
        this.deathTime = deathTime;
        this.startTime = millis();
        this.meta = null;
        this.deadTimer = null;

        for(let i = 0; i < this.count; i++)
        {
            let show = false;

            if(dataString[i] == ".")
            {
                show = true; 
            }
                                   //x,y,size,offset,index,speed,show
            this.parts.push(new Part(i, 0, 50,-50, i , this.moveSpeed, show)); 

        }
    }
    
    update()
    { 
        for(let i = 0; i < this.parts.length; i++)
        {
            if(i == 0)
            {
                let dir = createVector(1,0);
                this.parts[i].update(dir,"dir");
            }else{
                this.parts[i].update(this.parts[i - 1],"pos");
            }
        }  
    }

    draw()
    {
        for(let i = 0; i < this.parts.length; i++)
        {
            this.parts[i].draw();
        }
    }

    drawLine()
    {
        for(let i = 0; i < this.parts.length; i++)
        {
            if(i < this.parts.length - 1)
            {
                line( this.parts[i].pos.x,
                      this.parts[i].pos.y,
                      this.parts[i + 1].pos.x,
                      this.parts[i + 1].pos.y,
                    )
            }
        }
    }

    metaUpdate()
    {
        if((millis() - this.startTime) / 1000 > this.metaTime)
        {
            if(this.meta == null)
            {
                this.meta = new Meta(this.parts,50,this.moveSpeed,this.parts[0].rot);
            }
            else
            {
                this.meta.draw();

                let isEnded =  false;
                if(this.meta.eat())
                {
                    // tiempo y morir
                    if(this.deadTimer == null)
                    {
                        this.deadTimer = new Timer(this.deathTime);
                    }
                    else
                    {
                        isEnded = this.deadTimer.count();
                    }
                }
                return isEnded;
            }
        }
    }

}

class Meta
{
    constructor(parts,size,speed,rot)
    {
        this.pos = createVector(parts[0].pos.x,parts[0].pos.y);
        this.rot = rot;
        this.size = size;
        this.speed = speed;
        this.parts = parts;
        this.currentEat = 0;
        this.currentProgress = 0;

        parts[0].show = false;
    }

    eat()
    {
        if(this.currentEat < this.parts.length - 1)
        {
            let p2  = this.parts[this.currentEat + 1];

            let _pos = p5.Vector.sub(p2.pos,this.pos);
            _pos.normalize();
            _pos.mult(this.speed);
            this.pos.add(_pos);

            this.rot = p2.rot;

            if(this.pos.dist(p2.pos) < 10)
            {
                p2.show = false;
                this.currentEat++;
            }
            return false;
        }
        else
        {
            this.pos = this.parts[this.parts.length -1].pos;
            return true;
        }
    }
    draw()
    {
        push();
        translate(this.pos.x,this.pos.y);

        rotate(radians(this.rot));
        fill(0);
        rect(0,0,this.size/ 6, this.size * 1.25);
        pop();
    }
}

class Part
{
    constructor(x,y,size,offset,index,speed,show)
    {
        this.offset = offset;
        this.index = index;
        this.pos = createVector(x * this.offset,y);
        this.rot = 0;
        this.forward = createVector(1,0);
        this.speed = speed;
        this.size = size;
        this.show = show;
        this.xoff = random(0,1);
        noiseSeed(new Date().getTime());
    }

    update(data, type)
    {
        switch(type)
        {
            case "dir":
                this.xoff += 0.01;
                this.rot += ((noise(this.xoff) * 2) - 1) * this.speed;
                this.forward.setHeading(radians(this.rot));

                this.forward.normalize();
                this.forward.mult(this.speed);
                
                this.pos.add(this.forward);
            break;
            case "pos":
                if(this.pos.dist(data.pos) > this.offset * Math.abs(data.index - this.index))
                {
                    let newDir = p5.Vector.sub(data.pos,this.pos);
                    newDir.normalize();
                    newDir.mult(this.speed);
                    this.pos.add(newDir);
    
                    this.rot = lerp(this.rot,data.rot,0.1);
                }
            break;
        }   
    }

    draw()
    {
        if(this.show)
        {
            push();

            translate(this.pos.x, this.pos.y);
            rotate(radians(this.rot));
            noStroke();
            rect(0,0,this.size/ 4, this.size);
            
            pop();
        }
    }
}

class Timer
{
    constructor(waitTime)
    {
        this.startTime = millis();
        this.waitTime = waitTime;
    }
    count()
    {
        return (millis() - this.startTime) / 1000 > this.waitTime; 
    }
}

function seudoParser(data)
{
    let lines = data.split('\n');

    if(lines.length > 0)
    {
        for(let i = 0; i < lines.length; i++)
        {
            codeProcess(lines[i]);
        }
    }
    else
    {
        codeProcess(data);
    }    
}

function codeProcess(data)
{
    let line = [...data.matchAll(regexp)];
    
    if(line.length > 0)
    {
        // match de seq
        if(line[0].length > 0)
        {
            let currentSeq = line[0][1];

            // match de parametros
            let params = [];
            if(line[0][2] != undefined)
            {
                // luego los parametros
                let currentParams = [...line[0][2].matchAll(/\d+\s?/g)];
                
                for(let i = 0; i < currentParams.length; i++)
                {
                    params.push(parseInt(currentParams[i][0]));
                }
            }

            seq.push(new Seq(
                currentSeq, 
                params[1], 
                params[0], 
                params[2]
                ));
        }
    }
}



