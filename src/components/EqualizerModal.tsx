import React, { useState, useEffect, useRef } from 'react';
import { X, Sliders, Volume2, Sparkles, Activity } from 'lucide-react';
import { audioEngine } from '../lib/audioEngine';
import { EqualizerPreset } from '../types';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESETS: EqualizerPreset[] = [
  { name: 'Flat (Studio Direct)', gains: [0, 0, 0, 0, 0] },
  { name: 'Bass Boost (Sub Heavy)', gains: [8, 5, 1, 0, -2] },
  { name: 'Vocal Clarity & Acoustic', gains: [-2, 1, 6, 4, 2] },
  { name: 'Electronic & Synthwave', gains: [6, 4, 0, 3, 5] },
  { name: 'Audiophile Master', gains: [3, 2, -1, 3, 6] },
  { name: 'Lo-Fi Chill Warmth', gains: [4, 3, 2, -3, -5] },
];

export const EqualizerModal: React.FC<EqualizerModalProps> = ({ isOpen, onClose }) => {
  const [gains, setGains] = useState<[number, number, number, number, number]>([0, 0, 0, 0, 0]);
  const [activePreset, setActivePreset] = useState<string>('Flat (Studio Direct)');
  const [spatialAudio, setSpatialAudio] = useState<boolean>(false);
  const [loudnessNorm, setLoudnessNorm] = useState<boolean>(() => audioEngine.isLoudnessNormalizationEnabled());
  const [visualizerMode, setVisualizerMode] = useState<'bars' | 'wave' | 'spectrum'>('bars');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoudnessNorm(audioEngine.isLoudnessNormalizationEnabled());

    // Canvas animation loop
    const renderCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const freqData = audioEngine.getFrequencyData();
      const waveData = audioEngine.getWaveformData();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (visualizerMode === 'bars') {
        const barWidth = (canvas.width / freqData.length) * 1.5;
        let x = 0;

        for (let i = 0; i < freqData.length; i++) {
          const barHeight = (freqData[i] / 255) * canvas.height;

          // Gradient from cyan to purple
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
          gradient.addColorStop(0, 'rgba(6, 182, 212, 0.9)');
          gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.9)');
          gradient.addColorStop(1, 'rgba(168, 85, 247, 1)');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

          x += barWidth;
        }
      } else if (visualizerMode === 'wave') {
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#38bdf8';

        const sliceWidth = canvas.width / waveData.length;
        let x = 0;

        for (let i = 0; i < waveData.length; i++) {
          const v = waveData[i] / 128.0;
          const y = (v * canvas.height) / 2;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          x += sliceWidth;
        }
        ctx.stroke();
      } else {
        // Glowing Circular Spectrum
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 35;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();

        for (let i = 0; i < freqData.length; i += 2) {
          const angle = (i / freqData.length) * Math.PI * 2;
          const amplitude = (freqData[i] / 255) * 45;

          const x1 = centerX + Math.cos(angle) * radius;
          const y1 = centerY + Math.sin(angle) * radius;
          const x2 = centerX + Math.cos(angle) * (radius + amplitude);
          const y2 = centerY + Math.sin(angle) * (radius + amplitude);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `hsl(${i * 4}, 100%, 60%)`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      animFrameIdRef.current = requestAnimationFrame(renderCanvas);
    };

    renderCanvas();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isOpen, visualizerMode]);

  if (!isOpen) return null;

  const bandLabels = ['60Hz (Sub)', '230Hz (Bass)', '910Hz (Mid)', '4.0kHz (Presence)', '14kHz (Air)'];

  const handleGainChange = (bandIdx: number, val: number) => {
    const newGains = [...gains] as [number, number, number, number, number];
    newGains[bandIdx] = val;
    setGains(newGains);
    setActivePreset('Custom');
    audioEngine.setEQBandGain(bandIdx, val);
  };

  const handleSelectPreset = (preset: EqualizerPreset) => {
    setActivePreset(preset.name);
    setGains(preset.gains);
    audioEngine.setEQGains(preset.gains);
  };

  const handleToggleSpatial = () => {
    const nextVal = !spatialAudio;
    setSpatialAudio(nextVal);
    audioEngine.setSpatialAudio(nextVal);
  };

  const handleToggleLoudnessNorm = () => {
    const nextVal = !loudnessNorm;
    setLoudnessNorm(nextVal);
    audioEngine.setLoudnessNormalization(nextVal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="rounded-lg bg-indigo-950 p-2 text-indigo-400 border border-indigo-800/50">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Parametric Equalizer & Audio FX</h3>
              <p className="text-xs text-slate-400">Web Audio API 5-Band High Fidelity Processing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Realtime Canvas Visualizer */}
        <div className="relative rounded-xl border border-slate-800 bg-slate-900/80 p-3 overflow-hidden">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-cyan-400" /> Live Spectrum Visualizer
            </span>
            <div className="flex space-x-1.5">
              {(['bars', 'wave', 'spectrum'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setVisualizerMode(mode)}
                  className={`rounded px-2 py-0.5 text-[10px] uppercase font-semibold transition-all ${
                    visualizerMode === mode
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <canvas ref={canvasRef} width={580} height={100} className="w-full rounded bg-slate-950" />
        </div>

        {/* 5-Band Sliders */}
        <div className="grid grid-cols-5 gap-3 pt-2">
          {gains.map((gainVal, idx) => (
            <div key={idx} className="flex flex-col items-center space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-xs font-mono font-semibold text-cyan-300">
                {gainVal > 0 ? `+${gainVal}` : gainVal} dB
              </span>
              <div className="h-32 flex items-center">
                <input
                  type="range"
                  min={-12}
                  max={12}
                  step={0.5}
                  value={gainVal}
                  onChange={(e) => handleGainChange(idx, parseFloat(e.target.value))}
                  className="h-28 w-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 [writing-mode:vertical-lr] [direction:rtl]"
                />
              </div>
              <span className="text-[10px] text-center text-slate-400 font-medium">{bandLabels[idx]}</span>
            </div>
          ))}
        </div>

        {/* Presets & 3D Spatial Switch */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-4">
          <div className="flex flex-wrap gap-1.5 max-w-md">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleSelectPreset(preset)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition-all ${
                  activePreset === preset.name
                    ? 'border-indigo-500 bg-indigo-950 text-indigo-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleLoudnessNorm}
              className={`flex items-center space-x-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                loudnessNorm
                  ? 'border-cyan-500 bg-cyan-950 text-cyan-300 shadow-lg shadow-cyan-900/30'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
              title="Automatic gain & compressor loudness leveler across tracks"
            >
              <Volume2 className="h-4 w-4 text-cyan-400" />
              <span>Loudness Leveler: {loudnessNorm ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={handleToggleSpatial}
              className={`flex items-center space-x-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                spatialAudio
                  ? 'border-purple-500 bg-purple-950 text-purple-300 shadow-lg shadow-purple-900/30'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>3D Spatial: {spatialAudio ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
