import { useEffect, useRef } from 'react';

interface GaugeChartProps {
  value: number;
  meta: number;
}

export default function GaugeChart({ value, meta }: GaugeChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height * 0.75;
    const radius = Math.min(width, height) * 0.4;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw gauge background
    const metaBaixa = meta - 15;
    const segments = [
      { end: metaBaixa, color: '#ef4444' },
      { end: meta, color: '#ffd43b' },
      { end: 100, color: '#10b981' },
    ];

    let startAngle = Math.PI;
    segments.forEach((segment) => {
      const endAngle = Math.PI + (Math.PI * segment.end) / 100;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.lineWidth = 20;
      ctx.strokeStyle = segment.color;
      ctx.stroke();
      startAngle = endAngle;
    });

    // Draw needle
    const needleAngle = Math.PI + (Math.PI * value) / 100;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(needleAngle);
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(radius - 20, 0);
    ctx.lineTo(0, 8);
    ctx.fillStyle = '#374151';
    ctx.fill();
    ctx.restore();

    // Draw center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#6b7280';
    ctx.fill();

    // Draw meta marker
    const metaAngle = Math.PI + (Math.PI * meta) / 100;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(metaAngle);
    ctx.beginPath();
    ctx.moveTo(radius - 15, 0);
    ctx.lineTo(radius - 5, 0);
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }, [value, meta]);

  return (
    <div className="relative w-full h-40">
      <canvas ref={canvasRef} width={300} height={200} className="w-full h-full" />
    </div>
  );
}
