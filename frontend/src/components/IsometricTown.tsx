import React, { useEffect, useRef } from 'react';
import { useTradeStore } from '../store/tradeStore';
import './IsometricTown.css';

export const IsometricTown: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trades = useTradeStore(state => state.trades);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let time = 0;

    const tileWidth = 60;
    const tileHeight = 30;
    const gridSize = 8; // Fixed grid for simplicity, or dynamic if needed

    const drawIsoTile = (x: number, y: number, cx: number, cy: number, color: string, stroke: string) => {
      const screenX = cx + (x - y) * (tileWidth / 2);
      const screenY = cy + (x + y) * (tileHeight / 2);

      ctx.beginPath();
      ctx.moveTo(screenX, screenY);
      ctx.lineTo(screenX + tileWidth / 2, screenY + tileHeight / 2);
      ctx.lineTo(screenX, screenY + tileHeight);
      ctx.lineTo(screenX - tileWidth / 2, screenY + tileHeight / 2);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.stroke();
      return { screenX, screenY };
    };

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const style = getComputedStyle(document.documentElement);
      const gridColor1 = style.getPropertyValue('--bg-card').trim() || '#f5f5f5';
      const gridColor2 = style.getPropertyValue('--bg-white').trim() || '#ffffff';
      const strokeColor = style.getPropertyValue('--border').trim() || '#d1d4d7';
      const buyColor = style.getPropertyValue('--success').trim() || '#0ecb81';
      const sellColor = style.getPropertyValue('--danger').trim() || '#f6465d';

      const cx = canvas.width / 2;
      const cy = canvas.height / 6;

      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          const color = (x + y) % 2 === 0 ? gridColor1 : gridColor2;
          const { screenX, screenY } = drawIsoTile(x, y, cx, cy, color, strokeColor);

          // Determine if we should draw a building
          const tradeIndex = x * gridSize + y;
          if (tradeIndex < trades.length) {
            const trade = trades[tradeIndex];
            const pnl = Number(trade.pnl) || 0;
            let buildingHeight = 15 + Math.abs(pnl) / 1000;
            if (buildingHeight > 80) buildingHeight = 80;

            const waveOffset = Math.sin(time + x * 0.5 + y * 0.5) * 3;
            const by = screenY + waveOffset - 2;

            const colorTop = trade.type === 'buy' ? buyColor : (pnl > 0 ? buyColor : sellColor);
            const colorLeft = trade.type === 'buy' ? buyColor + 'CC' : (pnl > 0 ? buyColor + 'CC' : sellColor + 'CC');
            const colorRight = trade.type === 'buy' ? buyColor + '99' : (pnl > 0 ? buyColor + '99' : sellColor + '99');

            // Left Face
            ctx.beginPath();
            ctx.moveTo(screenX - tileWidth / 2, by + tileHeight / 2);
            ctx.lineTo(screenX, by + tileHeight);
            ctx.lineTo(screenX, by + tileHeight - buildingHeight);
            ctx.lineTo(screenX - tileWidth / 2, by + tileHeight / 2 - buildingHeight);
            ctx.closePath();
            ctx.fillStyle = colorLeft;
            ctx.fill();

            // Right Face
            ctx.beginPath();
            ctx.moveTo(screenX, by + tileHeight);
            ctx.lineTo(screenX + tileWidth / 2, by + tileHeight / 2);
            ctx.lineTo(screenX + tileWidth / 2, by + tileHeight / 2 - buildingHeight);
            ctx.lineTo(screenX, by + tileHeight - buildingHeight);
            ctx.closePath();
            ctx.fillStyle = colorRight;
            ctx.fill();

            // Top Face
            ctx.beginPath();
            ctx.moveTo(screenX, by - buildingHeight);
            ctx.lineTo(screenX + tileWidth / 2, by + tileHeight / 2 - buildingHeight);
            ctx.lineTo(screenX, by + tileHeight - buildingHeight);
            ctx.lineTo(screenX - tileWidth / 2, by + tileHeight / 2 - buildingHeight);
            ctx.closePath();
            ctx.fillStyle = colorTop;
            ctx.fill();
          }
        }
      }
    };

    const render = () => {
      time += 0.05;
      drawGrid();
      animFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrame);
  }, [trades]);

  return (
    <div className="isometric-container glass-panel">
      <h2>개미노트 타운</h2>
      <p className="text-muted text-sm mb-4">매매 기록이 쌓일수록 나의 마을이 성장합니다.</p>
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={400} 
        className="isometric-canvas"
      ></canvas>
    </div>
  );
};
