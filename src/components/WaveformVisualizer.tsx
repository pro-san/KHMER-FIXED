import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../lib/audioEngine';
import { Activity, BarChart2, Waves, Sliders } from 'lucide-react';

interface WaveformVisualizerProps {
  isPlaying: boolean;
  width?: number;
  height?: number;
  className?: string;
  showBandLabels?: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isPlaying,
  width = 110,
  height = 32,
  className = '',
  showBandLabels = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const [visualMode, setVisualMode] = useState<'spectrum' | 'bars' | 'wave' | 'pulses'>('spectrum');

  // Peak hold physics tracking for multi-band spectrum
  const peaksRef = useRef<number[]>(new Array(64).fill(0));
  const peakSpeedsRef = useRef<number[]>(new Array(64).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Support High DPI Displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const freqData = audioEngine.getFrequencyData();
      const waveData = audioEngine.getWaveformData();

      if (visualMode === 'spectrum') {
        // Detailed Multi-Band Frequency Spectrum Visualizer with Logarithmic Distribution & Peak Holds
        const numBands = 32;
        const barGap = 1.5;
        const totalGap = barGap * (numBands - 1);
        const barWidth = Math.max(2, (width - totalGap) / numBands);

        const bandHeightLimit = showBandLabels ? height - 10 : height;

        for (let i = 0; i < numBands; i++) {
          // Logarithmic bin calculation to reflect human hearing range (sub-bass -> treble)
          const logIdx = Math.floor(Math.pow(i / numBands, 1.8) * (freqData.length * 0.75));
          let val = isPlaying ? freqData[logIdx] || 0 : 12 + Math.sin(phase + i * 0.3) * 6;

          if (!isPlaying) {
            val = Math.max(4, val * 0.3);
          }

          const barHeight = Math.max(2, (val / 255) * (bandHeightLimit - 4));
          const x = i * (barWidth + barGap);
          const y = bandHeightLimit - barHeight;

          // Multi-band Frequency Color Spectrum Mapping
          // 0-4: Sub-Bass (Magenta/Red), 5-10: Bass (Purple), 11-18: Mids (Cyan), 19-31: Treble (Indigo/Blue)
          const hue = 300 - (i / numBands) * 120; // 300 (Magenta) -> 180 (Cyan)
          const gradient = ctx.createLinearGradient(0, y, 0, bandHeightLimit);
          gradient.addColorStop(0, `hsla(${hue}, 95%, 65%, 0.95)`);
          gradient.addColorStop(0.6, `hsla(${hue - 20}, 85%, 50%, 0.8)`);
          gradient.addColorStop(1, `hsla(${hue - 40}, 80%, 30%, 0.4)`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
          } else {
            ctx.rect(x, y, barWidth, barHeight);
          }
          ctx.fill();

          // Peak Hold Dot with Gravity Decay Physics
          if (!peaksRef.current[i] || barHeight > peaksRef.current[i]) {
            peaksRef.current[i] = barHeight;
            peakSpeedsRef.current[i] = 0;
          } else {
            peakSpeedsRef.current[i] += 0.18; // gravity acceleration
            peaksRef.current[i] = Math.max(0, peaksRef.current[i] - peakSpeedsRef.current[i]);
          }

          const peakY = bandHeightLimit - peaksRef.current[i];
          ctx.fillStyle = `hsla(${hue}, 100%, 75%, 0.9)`;
          ctx.fillRect(x, Math.max(0, peakY - 1.5), barWidth, 1.5);
        }

        if (showBandLabels) {
          ctx.fillStyle = '#64748b';
          ctx.font = '8px monospace';
          ctx.fillText('SUB', 2, height - 2);
          ctx.fillText('MID', width / 2 - 8, height - 2);
          ctx.fillText('HIGH', width - 22, height - 2);
        }
      } else if (visualMode === 'bars') {
        const barCount = 20;
        const barGap = 2;
        const totalGap = barGap * (barCount - 1);
        const barWidth = Math.max(2, (width - totalGap) / barCount);

        for (let i = 0; i < barCount; i++) {
          const sampleIdx = Math.floor((i / barCount) * (freqData.length / 2));
          let val = isPlaying ? freqData[sampleIdx] || 0 : 15 + Math.sin(phase + i * 0.5) * 8;

          if (!isPlaying) {
            val = Math.max(6, val * 0.4);
          }

          const barHeight = Math.max(3, (val / 255) * height);
          const x = i * (barWidth + barGap);
          const y = (height - barHeight) / 2;

          const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
          gradient.addColorStop(0, '#06b6d4');
          gradient.addColorStop(0.5, '#6366f1');
          gradient.addColorStop(1, '#a855f7');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, barWidth, barHeight, 2);
          } else {
            ctx.rect(x, y, barWidth, barHeight);
          }
          ctx.fill();
        }
      } else if (visualMode === 'wave') {
        ctx.beginPath();
        ctx.lineWidth = 1.8;

        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#38bdf8');
        gradient.addColorStop(0.5, '#818cf8');
        gradient.addColorStop(1, '#c084fc');
        ctx.strokeStyle = gradient;

        const sliceWidth = width / waveData.length;
        let x = 0;

        for (let i = 0; i < waveData.length; i++) {
          let v = isPlaying ? waveData[i] / 128.0 : 1.0 + Math.sin(phase + i * 0.2) * 0.08;
          const y = (v * height) / 2;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          x += sliceWidth;
        }
        ctx.stroke();
      } else {
        // Pulses / Spectrum Glow Rings
        const centerX = width / 2;
        const centerY = height / 2;

        const numRings = 5;
        for (let r = 0; r < numRings; r++) {
          const sample = freqData[r * 4] || 30;
          const amplitude = isPlaying ? (sample / 255) * (height / 2.5) : 3 + Math.sin(phase + r) * 2;

          ctx.beginPath();
          ctx.ellipse(centerX, centerY, (r + 1) * 8 + amplitude, 6 + amplitude * 0.5, 0, 0, 2 * Math.PI);
          ctx.strokeStyle = `hsla(${200 + r * 30}, 90%, 65%, ${0.3 + amplitude / 20})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      phase += 0.08;
      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isPlaying, visualMode, width, height, showBandLabels]);

  const toggleMode = () => {
    setVisualMode((prev) => {
      if (prev === 'spectrum') return 'bars';
      if (prev === 'bars') return 'wave';
      if (prev === 'wave') return 'pulses';
      return 'spectrum';
    });
  };

  return (
    <div
      onClick={toggleMode}
      className={`group relative flex items-center justify-center rounded-xl border border-slate-800/90 bg-slate-900/80 p-1.5 cursor-pointer hover:border-cyan-500/50 hover:bg-slate-900 transition-all shadow-inner ${className}`}
      title="Web Audio API AnalyserNode Frequency Spectrum Visualizer (Click to change mode)"
    >
      <canvas
        ref={canvasRef}
        style={{ width: `${width}px`, height: `${height}px` }}
        className="block rounded-lg"
      />

      {/* Mode icon indicator on hover */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl text-[10px] text-cyan-300 font-mono space-x-1 font-semibold">
        {visualMode === 'spectrum' && <Sliders className="h-3.5 w-3.5 text-magenta-400" />}
        {visualMode === 'bars' && <BarChart2 className="h-3.5 w-3.5 text-cyan-400" />}
        {visualMode === 'wave' && <Waves className="h-3.5 w-3.5 text-indigo-400" />}
        {visualMode === 'pulses' && <Activity className="h-3.5 w-3.5 text-purple-400" />}
        <span className="capitalize">{visualMode}</span>
      </div>
    </div>
  );
};
