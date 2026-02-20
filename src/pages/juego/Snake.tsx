import { useEffect, useRef, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import apiClient from '../../api/axios';
import './Snake.css';

interface Position {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export const Snake = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(100);
  
  // Game state refs
  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Direction>('RIGHT');
  const nextDirectionRef = useRef<Direction>('RIGHT');
  const foodRef = useRef<Position>({ x: 15, y: 15 });
  const gameLoopRef = useRef<number | undefined>(undefined);
  const isGameRunningRef = useRef(false);
  
  const gridSize = 30;
  const tileSize = 20;
  const canvasSize = gridSize * tileSize;

  const generateFood = useCallback(() => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      };
    } while (snakeRef.current.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    foodRef.current = newFood;
  }, []);

  const resetGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = 'RIGHT';
    nextDirectionRef.current = 'RIGHT';
    setScore(0);
    setGameOver(false);
    setSpeed(100);
    isGameRunningRef.current = true;
    generateFood();
  }, [generateFood]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw grid
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * tileSize, 0);
      ctx.lineTo(i * tileSize, canvasSize);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * tileSize);
      ctx.lineTo(canvasSize, i * tileSize);
      ctx.stroke();
    }

    // Draw snake
    snakeRef.current.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#2ecc71' : '#27ae60';
      ctx.fillRect(
        segment.x * tileSize + 1,
        segment.y * tileSize + 1,
        tileSize - 2,
        tileSize - 2
      );
      
      // Add eyes to head
      if (index === 0) {
        ctx.fillStyle = '#fff';
        const eyeSize = 4;
        const eyeOffset = 6;
        
        if (directionRef.current === 'RIGHT') {
          ctx.fillRect(segment.x * tileSize + eyeOffset + 6, segment.y * tileSize + 5, eyeSize, eyeSize);
          ctx.fillRect(segment.x * tileSize + eyeOffset + 6, segment.y * tileSize + 11, eyeSize, eyeSize);
        } else if (directionRef.current === 'LEFT') {
          ctx.fillRect(segment.x * tileSize + 4, segment.y * tileSize + 5, eyeSize, eyeSize);
          ctx.fillRect(segment.x * tileSize + 4, segment.y * tileSize + 11, eyeSize, eyeSize);
        } else if (directionRef.current === 'UP') {
          ctx.fillRect(segment.x * tileSize + 5, segment.y * tileSize + 4, eyeSize, eyeSize);
          ctx.fillRect(segment.x * tileSize + 11, segment.y * tileSize + 4, eyeSize, eyeSize);
        } else {
          ctx.fillRect(segment.x * tileSize + 5, segment.y * tileSize + eyeOffset + 6, eyeSize, eyeSize);
          ctx.fillRect(segment.x * tileSize + 11, segment.y * tileSize + eyeOffset + 6, eyeSize, eyeSize);
        }
      }
    });

    // Draw food
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(
      foodRef.current.x * tileSize + tileSize / 2,
      foodRef.current.y * tileSize + tileSize / 2,
      tileSize / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, [canvasSize]);

  const checkCollision = useCallback((head: Position): boolean => {
    // Wall collision
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
      return true;
    }

    // Self collision
    for (let i = 1; i < snakeRef.current.length; i++) {
      if (head.x === snakeRef.current[i].x && head.y === snakeRef.current[i].y) {
        return true;
      }
    }

    return false;
  }, []);

  const moveSnake = useCallback(() => {
    if (!isGameRunningRef.current) return;

    directionRef.current = nextDirectionRef.current;

    const head = { ...snakeRef.current[0] };

    switch (directionRef.current) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }

    // Check collision
    if (checkCollision(head)) {
      isGameRunningRef.current = false;
      setGameOver(true);
      return;
    }

    snakeRef.current.unshift(head);

    // Check if food is eaten
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore(prev => prev + 10);
      generateFood();
    } else {
      snakeRef.current.pop();
    }

    drawGame();
  }, [checkCollision, drawGame, generateFood]);

  const gameLoop = useCallback(() => {
    moveSnake();
    gameLoopRef.current = window.setTimeout(gameLoop, speed);
  }, [moveSnake, speed]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!isGameRunningRef.current) return;

    const key = e.key;

    if (key === 'ArrowUp' && directionRef.current !== 'DOWN') {
      e.preventDefault();
      nextDirectionRef.current = 'UP';
    } else if (key === 'ArrowDown' && directionRef.current !== 'UP') {
      e.preventDefault();
      nextDirectionRef.current = 'DOWN';
    } else if (key === 'ArrowLeft' && directionRef.current !== 'RIGHT') {
      e.preventDefault();
      nextDirectionRef.current = 'LEFT';
    } else if (key === 'ArrowRight' && directionRef.current !== 'LEFT') {
      e.preventDefault();
      nextDirectionRef.current = 'RIGHT';
    }
  }, []);

  const handleDirectionClick = (direction: Direction) => {
    if (!isGameRunningRef.current) return;

    if (direction === 'UP' && directionRef.current !== 'DOWN') {
      nextDirectionRef.current = 'UP';
    } else if (direction === 'DOWN' && directionRef.current !== 'UP') {
      nextDirectionRef.current = 'DOWN';
    } else if (direction === 'LEFT' && directionRef.current !== 'RIGHT') {
      nextDirectionRef.current = 'LEFT';
    } else if (direction === 'RIGHT' && directionRef.current !== 'LEFT') {
      nextDirectionRef.current = 'RIGHT';
    }
  };

  const accelerate = () => {
    setSpeed(prev => Math.max(50, prev - 20));
  };

  const decelerate = () => {
    setSpeed(prev => Math.min(200, prev + 20));
  };

  const handleSaveScore = async () => {
    try {
      const response = await apiClient.post('/game/save-score-snake', {
        puntuacion: score,
      });

      if (response.data.status === 'success') {
        await Swal.fire({
          icon: 'success',
          title: '¡Puntaje guardado!',
          text: response.data.message,
          confirmButtonColor: '#ff6600',
        });
        resetGame();
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al guardar el puntaje',
        confirmButtonColor: '#ff6600',
      });
    }
  };

  const handleViewRanking = () => {
    window.location.href = '/ranking-snake';
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    resetGame();
    gameLoop();

    return () => {
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (gameLoopRef.current) {
      clearTimeout(gameLoopRef.current);
    }
    if (isGameRunningRef.current) {
      gameLoop();
    }
  }, [speed, gameLoop]);

  return (
    <div className="snake-game-container">
      <div className="snake-header">
        <h1>Snake Game - Retro Snaker</h1>
        <p>U Can Control The Direction With The Keyboard!</p>
      </div>

      <div className="snake-game-content">
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="snake-canvas"
        />

        <div className="snake-controls">
          <div className="snake-score">
            <h2>Score</h2>
            <div className="score-value">{score}</div>
          </div>

          <div className="speed-controls">
            <button onClick={accelerate} className="speed-btn accelerate">
              Accelerate++
            </button>
            <button onClick={decelerate} className="speed-btn decelerate">
              Decelerate--
            </button>
          </div>

          <div className="direction-controls">
            <button
              onClick={() => handleDirectionClick('UP')}
              className="direction-btn up"
            >
              ↑
            </button>
            <div className="direction-row">
              <button
                onClick={() => handleDirectionClick('LEFT')}
                className="direction-btn left"
              >
                ←
              </button>
              <button
                onClick={() => handleDirectionClick('RIGHT')}
                className="direction-btn right"
              >
                →
              </button>
            </div>
            <button
              onClick={() => handleDirectionClick('DOWN')}
              className="direction-btn down"
            >
              ↓
            </button>
          </div>

          <button onClick={resetGame} className="reset-btn">
            Reset
          </button>
        </div>
      </div>

      {gameOver && (
        <div className="snake-game-over">
          <div className="game-over-content">
            <h2>Game Over!</h2>
            <p>Tu puntuación: <span>{score}</span></p>
            <div className="game-over-buttons">
              <button onClick={resetGame}>Jugar de nuevo</button>
              <button onClick={handleSaveScore}>Guardar puntaje</button>
              <button onClick={handleViewRanking}>Ver ranking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Snake;
