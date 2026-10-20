import React, { useState, useEffect } from 'react';

export default function ServoI2cDashboardSim({ T }) {
  // Servo Angle (0 deg to 180 deg)
  const [servoAngle, setServoAngle] = useState(90);
  const [controlMode, setControlMode] = useState('auto'); // 'auto', 'pot'
  const [sweepDir, setSweepDir] = useState(1);

  // Simulated Ultrasonic Distance for Dashboard
  const simDistance = Math.round(15 + Math.sin((servoAngle * Math.PI) / 180) * 20);

  // Auto Sweep Timer
  useEffect(() => {
    if (controlMode !== 'auto') return;

    const interval = setInterval(() => {
      setServoAngle((prev) => {
        let next = prev + sweepDir * 4;
        if (next >= 180) {
          next = 180;
          setSweepDir(-1);
        } else if (next <= 0) {
          next = 0;
          setSweepDir(1);
        }
        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [controlMode, sweepDir]);

  // PPM Pulse Width Calculation: 1.0ms (0 deg) to 2.0ms (180 deg)
  const pulseWidthMs = (1.0 + (servoAngle / 180) * 1.0).toFixed(2);

  // Custom Character LCD Bar Graph
  const barBlocks = Math.round((simDistance / 35) * 8);
  const barStr = '█'.repeat(Math.min(8, barBlocks)) + ' '.repeat(Math.max(0, 8 - barBlocks));

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Title & I2C Bus Address Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
          Servo PPM & I2C LCD Dashboard
        </span>
        <span
          style={{
            fontSize: 9.5,
            fontFamily: "'JetBrains Mono', monospace",
            padding: '2px 8px',
            borderRadius: 4,
            background: T.primaryBg,
            color: T.primary,
            border: `1px solid ${T.primaryBorder}`,
            fontWeight: 700,
          }}
        >
          I2C: A4(SDA), A5(SCL) @ 0x27
        </span>
      </div>

      {/* Control Mode Switcher */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 4,
          background: T.surfaceAlt,
          padding: 3,
          borderRadius: 8,
          border: `1px solid ${T.border}`,
        }}
      >
        <button
          onClick={() => setControlMode('auto')}
          style={{
            background: controlMode === 'auto' ? T.primary : 'transparent',
            color: controlMode === 'auto' ? '#ffffff' : T.textSub,
            border: 'none',
            borderRadius: 6,
            padding: '6px 8px',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Auto Sweep (0°–180°)
        </button>
        <button
          onClick={() => setControlMode('pot')}
          style={{
            background: controlMode === 'pot' ? T.primary : 'transparent',
            color: controlMode === 'pot' ? '#ffffff' : T.textSub,
            border: 'none',
            borderRadius: 6,
            padding: '6px 8px',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Potentiometer (A0)
        </button>
      </div>

      {/* SG90 Servo Horn Articulation Graphic */}
      <div
        style={{
          background: T.surfaceAlt,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
          <span style={{ fontWeight: 700, color: T.text }}>SG90 Servo (Pin 10)</span>
          <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 800, color: T.primary }}>
            {servoAngle}° <span style={{ color: T.textMuted, fontSize: 9.5 }}>({pulseWidthMs}ms)</span>
          </span>
        </div>

        {/* Potentiometer slider if in pot mode */}
        {controlMode === 'pot' && (
          <div style={{ width: '100%' }}>
            <input
              type="range"
              min="0"
              max="180"
              value={servoAngle}
              onChange={(e) => setServoAngle(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: T.primary }}
            />
          </div>
        )}

        {/* Compact SVG Animated Servo Horn */}
        <div style={{ position: 'relative', width: 140, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="140" height="90" viewBox="0 0 140 90">
            {/* Degree Arc */}
            <path d="M 15 75 A 55 55 0 0 1 125 75" fill="none" stroke={T.border} strokeWidth="3" strokeDasharray="3,3" />
            <text x="10" y="86" fill={T.textMuted} fontSize="9" fontFamily="'JetBrains Mono'">0°</text>
            <text x="63" y="14" fill={T.textMuted} fontSize="9" fontFamily="'JetBrains Mono'">90°</text>
            <text x="116" y="86" fill={T.textMuted} fontSize="9" fontFamily="'JetBrains Mono'">180°</text>

            {/* Blue Servo Body */}
            <rect x="45" y="55" width="50" height="35" rx="4" fill="#1e40af" stroke="#3b82f6" strokeWidth="1.5" />
            <circle cx="70" cy="55" r="9" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="1.5" />

            {/* Rotating Servo Horn */}
            <g transform={`rotate(${servoAngle - 90}, 70, 55)`}>
              <line x1="70" y1="55" x2="70" y2="15" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <circle cx="70" cy="20" r="2.5" fill="#ef4444" />
            </g>
          </svg>
        </div>
      </div>

      {/* Realistic 16x2 I2C LCD Display Matrix */}
      <div
        style={{
          background: '#042211',
          border: '3px solid #064e22',
          borderRadius: 8,
          padding: 12,
          fontFamily: "'Courier New', Courier, monospace",
          boxShadow: 'inset 0 0 16px rgba(0,0,0,0.8)',
        }}
      >
        <div style={{ fontSize: 9, color: '#4ade80', marginBottom: 4, letterSpacing: 1 }}>
          HD44780 16×2 I2C MATRIX
        </div>

        {/* Screen Bezel */}
        <div
          style={{
            background: '#134e2b',
            border: '1px solid #22c55e',
            borderRadius: 4,
            padding: '8px 10px',
            color: '#a7f3d0',
            fontSize: 12,
            fontWeight: 800,
            lineHeight: 1.5,
            letterSpacing: 1,
            textShadow: '0 0 4px #22c55e',
          }}
        >
          <div>
            ANG:{String(servoAngle).padStart(3, '0')}° DIST:{simDistance}cm
          </div>
          <div style={{ whiteSpace: 'pre' }}>
            BAR:[{barStr}]
          </div>
        </div>

        <div style={{ fontSize: 8.5, color: '#86efac', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
          <span>✓ Zero Optical Flicker</span>
          <span>createChar() HUD</span>
        </div>
      </div>
    </div>
  );
}
