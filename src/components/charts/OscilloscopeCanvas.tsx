import React, { useRef, useEffect } from 'react';

interface OscilloscopeCanvasProps {
  currentPower: number; // e.g. -58.4 dBm
  noiseFloor: number;  // e.g. -86.2 dBm
  activityScore: number;
  height?: number;
  isStreaming?: boolean;
}

export const OscilloscopeCanvas: React.FC<OscilloscopeCanvasProps> = ({
  currentPower,
  noiseFloor,
  activityScore,
  height = 240,
  isStreaming = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const historyRef = useRef<number[]>(new Array(180).fill(-86));
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    // Push new power with micro-jitter
    if (isStreaming) {
      const jitter = (Math.random() - 0.5) * 2;
      historyRef.current.push(currentPower + jitter);
      if (historyRef.current.length > 180) {
        historyRef.current.shift();
      }
    }
  }, [currentPower, isStreaming]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;

      // Clear with dark void
      ctx.fillStyle = '#080d12';
      ctx.fillRect(0, 0, width, h);

      // Draw Grid Lines (Blueprint style)
      ctx.strokeStyle = 'rgba(0, 191, 255, 0.08)';
      ctx.lineWidth = 1;

      // Vertical divisions
      const cols = 12;
      for (let i = 0; i <= cols; i++) {
        const x = (width / cols) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Horizontal dBm divisions (-30 to -90 dBm)
      const rows = 6;
      for (let j = 0; j <= rows; j++) {
        const y = (h / rows) * j;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        // Label dBm
        const dbm = Math.round(-30 - ((j / rows) * 60));
        ctx.fillStyle = 'rgba(135, 146, 155, 0.4)';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(`${dbm} dBm`, 8, y - 3);
      }

      // Draw Noise Floor baseline
      const noiseY = h - ((noiseFloor - (-90)) / 60) * h;
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, noiseY);
      ctx.lineTo(width, noiseY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw History Waveform
      const history = historyRef.current;
      const stepX = width / (history.length - 1);

      // Gradient Fill under RF wave
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(0, 191, 255, 0.35)');
      grad.addColorStop(0.7, 'rgba(0, 191, 255, 0.05)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.moveTo(0, h);

      for (let i = 0; i < history.length; i++) {
        const val = history[i];
        // map -90 dBm to h, -30 dBm to 0
        const normY = h - ((val - (-90)) / 60) * h;
        const x = i * stepX;
        if (i === 0) ctx.lineTo(x, normY);
        else ctx.lineTo(x, normY);
      }

      ctx.lineTo(width, h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Main glowing RF signal stroke
      ctx.beginPath();
      ctx.strokeStyle = '#00bfff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00bfff';
      ctx.shadowBlur = 10;

      for (let i = 0; i < history.length; i++) {
        const val = history[i];
        const normY = h - ((val - (-90)) / 60) * h;
        const x = i * stepX;
        if (i === 0) ctx.moveTo(x, normY);
        else ctx.lineTo(x, normY);
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Draw real-time high frequency RF Carrier Simulation Ripple
      ctx.strokeStyle = 'rgba(56, 232, 255, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const currentNormY = h - ((currentPower - (-90)) / 60) * h;
      for (let x = width - 80; x <= width; x += 2) {
        const ripple = Math.sin((x * 0.2) + phase) * (activityScore * 0.08);
        if (x === width - 80) ctx.moveTo(x, currentNormY + ripple);
        else ctx.lineTo(x, currentNormY + ripple);
      }
      ctx.stroke();

      // Draw leading scanner dot
      const lastX = width;
      const lastY = currentNormY;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00bfff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(lastX - 2, lastY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      phase += 0.15;
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [currentPower, noiseFloor, activityScore]);

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-white/10 bg-void">
      {/* Top telemetry banner */}
      <div className="absolute top-2 left-3 right-3 flex items-center justify-between pointer-events-none z-10 font-mono text-[10px]">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-neon opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-neon" />
          </span>
          <span className="text-cyan-neon font-bold">2.4 GHz OSCILLOSCOPE TRACE</span>
        </div>
        <span className="text-text-muted">SWEEP RATE: 100 MS/DIV</span>
      </div>

      <canvas
        ref={canvasRef}
        width={720}
        height={height}
        className="w-full h-full block"
      />
    </div>
  );
};
