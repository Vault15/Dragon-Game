
import React, { useEffect, useRef } from 'react';

interface GameComponentProps {
  onGameOver: (score: number) => void;
  customImage: string | null;
}

const GameComponent: React.FC<GameComponentProps> = ({ onGameOver, customImage }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: any) => {
      let score = 0;
      let missed = 0;
      let playerX = 200;
      const playerWidth = 80;
      const playerHeight = 40;
      let crickets: any[] = [];
      let dragonImg: any = null;
      let bgColors: any[] = [];

      p.preload = () => {
        if (customImage) {
          dragonImg = p.loadImage(customImage);
        }
      };

      p.setup = () => {
        const canvas = p.createCanvas(
          containerRef.current?.offsetWidth || window.innerWidth, 
          containerRef.current?.offsetHeight || window.innerHeight
        );
        canvas.parent(containerRef.current);
        p.frameRate(60);
        playerX = p.width / 2;
        
        for(let i=0; i<3; i++) {
          bgColors.push({
            h: p.random(150, p.height/2),
            c: p.color(p.random(200, 240), p.random(150, 180), p.random(100, 120))
          });
        }
      };

      p.draw = () => {
        p.background(255, 230, 180);
        
        // Sun
        p.fill(255, 200, 0);
        p.noStroke();
        p.circle(p.width * 0.8, 80, 50);

        // Mountains
        bgColors.forEach(layer => {
          p.fill(layer.c);
          p.beginShape();
          p.vertex(0, p.height);
          p.vertex(0, p.height - layer.h);
          p.vertex(p.width / 2, p.height - layer.h - 40);
          p.vertex(p.width, p.height - layer.h + 20);
          p.vertex(p.width, p.height);
          p.endShape(p.CLOSE);
        });

        // Floor
        p.fill(240, 200, 150);
        p.rect(0, p.height - 40, p.width, 40);

        // Stats UI
        p.fill(0, 100);
        p.rect(10, 10, 130, 60, 8);
        p.fill(255);
        p.textSize(16);
        p.textStyle(p.BOLD);
        p.textAlign(p.LEFT);
        p.text(`Crickets: ${score}`, 20, 32);
        p.text(`Missed: ${missed}/3`, 20, 55);

        // Player Movement (supports both mouse and touch)
        playerX = p.constrain(p.mouseX, playerWidth/2, p.width - playerWidth/2);

        // Draw Player
        p.push();
        p.translate(playerX, p.height - 65);
        if (dragonImg) {
          p.imageMode(p.CENTER);
          const aspect = dragonImg.width / dragonImg.height;
          p.image(dragonImg, 0, 0, playerWidth, playerWidth / aspect);
        } else {
          p.noStroke();
          p.fill(160, 120, 60);
          p.ellipse(0, 10, playerWidth, playerHeight);
          p.fill(180, 140, 80);
          p.ellipse(playerWidth * 0.4, -5, 30, 25);
          p.stroke(140, 100, 40);
          for(let i=-20; i<=20; i+=10) {
             p.line(i, 25, i, 30);
             p.line(i, -5, i, -10);
          }
          p.noStroke();
          p.fill(0);
          p.circle(playerWidth * 0.45, -8, 4);
        }
        p.pop();

        // Crickets Spawning
        if (p.frameCount % 60 === 0) {
          const numToSpawn = score >= 100 ? 2 : 1;
          const speedMultiplier = 1 + (Math.floor(score / 10) * 0.05);

          for (let i = 0; i < numToSpawn; i++) {
            crickets.push({
              x: p.random(20, p.width - 20),
              y: -30 - (i * 60),
              speed: p.random(3, 5) * speedMultiplier,
              size: p.random(18, 28)
            });
          }
        }

        for (let i = crickets.length - 1; i >= 0; i--) {
          const c = crickets[i];
          c.y += c.speed;

          p.fill(50, 80, 30);
          p.ellipse(c.x, c.y, c.size, c.size * 0.6);
          p.stroke(30, 60, 10);
          p.line(c.x - c.size/2, c.y, c.x - c.size/2 - 5, c.y - 5);
          p.line(c.x + c.size/2, c.y, c.x + c.size/2 + 5, c.y - 5);
          p.noStroke();

          const distToPlayer = p.dist(c.x, c.y, playerX, p.height - 65);
          if (distToPlayer < 45) {
            score++;
            crickets.splice(i, 1);
            continue;
          }

          if (c.y > p.height) {
            missed++;
            crickets.splice(i, 1);
            if (missed >= 3) {
              p.noLoop();
              onGameOver(score);
            }
          }
        }
      };

      p.windowResized = () => {
        if (containerRef.current) {
          p.resizeCanvas(containerRef.current.offsetWidth, containerRef.current.offsetHeight);
        }
      };
    };

    const p5Instance = new (window as any).p5(sketch);
    return () => p5Instance.remove();
  }, [onGameOver, customImage]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full cursor-none" 
      style={{ touchAction: 'none', WebkitTapHighlightColor: 'transparent' }} 
    />
  );
};

export default GameComponent;
