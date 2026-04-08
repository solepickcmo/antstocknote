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
    const tileHeight = 30; // Isometric scale 2:1

    // Map size based on number of trades (expand map as you get more trades)
    const gridSize = Math.max(5, Math.ceil(Math.sqrt(trades.length)) + 2);

    const drawGrid = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 4; // Start near top

      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          // Calculate isometric screen coordinates
          const screenX = cx + (x - y) * (tileWidth / 2);
          const screenY = cy + (x + y) * (tileHeight / 2);

          // Draw Base Tile
          ctx.beginPath();
          ctx.moveTo(screenX, screenY);
          ctx.lineTo(screenX + tileWidth / 2, screenY + tileHeight / 2);
          ctx.lineTo(screenX, screenY + tileHeight);
          ctx.lineTo(screenX - tileWidth / 2, screenY + tileHeight / 2);
          ctx.closePath();

          // Subtle bounce effect based on position
          const waveOffset = Math.sin(time + x * 0.5 + y * 0.5) * 2;
          
          // Fill tile color (checkered pattern)
          ctx.fillStyle = (x + y) % 2 === 0 ? '#1e293b' : '#334155';
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.stroke();

          // Determine if we should draw a building here
          const tradeIndex = x * gridSize + y;
          if (tradeIndex < trades.length) {
            const trade = trades[tradeIndex];
            const pnl = Number(trade.pnl) || 0;
            // Determine building size/color based on pnl/type
            let buildingHeight = 10 + Math.abs(pnl) / 10000; 
            if (buildingHeight > 60) buildingHeight = 60; // Max height
            
            let colorTop = trade.type === 'buy' ? '#3b82f6' : (pnl > 0 ? '#10b981' : '#f43f5e');
            let colorLeft = trade.type === 'buy' ? '#2563eb' : (pnl > 0 ? '#059669' : '#e11d48');
            let colorRight = trade.type === 'buy' ? '#1d4ed8' : (pnl > 0 ? '#047857' : '#be123c');

            const by = screenY + waveOffset - 2; // Offset slightly up from tile
            
            // Draw Left Face
            ctx.beginPath();
            ctx.moveTo(screenX - tileWidth / 2, by + tileHeight / 2);
            ctx.lineTo(screenX, by + tileHeight);
            ctx.lineTo(screenX, by + tileHeight - buildingHeight);
            ctx.lineTo(screenX - tileWidth / 2, by + tileHeight / 2 - buildingHeight);
            ctx.closePath();
            ctx.fillStyle = colorLeft;
            ctx.fill();

            // Draw Right Face
            ctx.beginPath();
            ctx.moveTo(screenX, by + tileHeight);
            ctx.lineTo(screenX + tileWidth / 2, by + tileHeight / 2);
            ctx.lineTo(screenX + tileWidth / 2, by + tileHeight / 2 - buildingHeight);
            ctx.lineTo(screenX, by + tileHeight - buildingHeight);
            ctx.closePath();
            ctx.fillStyle = colorRight;
            ctx.fill();
            
            // Draw Top Face
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

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [trades]);

  return (
    <div className="isometric-container glass-panel">
      <h2>개미의 집 타운</h2>
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
