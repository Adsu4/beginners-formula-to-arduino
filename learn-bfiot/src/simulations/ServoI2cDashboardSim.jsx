import React, { useState, useEffect } from 'react';

export default function ServoI2cDashboardSim({ T }) {
  // Tab switcher: 'servo', 'customChar', 'wiring'
  const [activeTab, setActiveTab] = useState('servo');

  // Servo Angle (0 deg to 180 deg)
  const [servoAngle, setServoAngle] = useState(90);
  const [controlMode, setControlMode] = useState('auto'); // 'auto', 'pot'
  const [sweepDir, setSweepDir] = useState(1);

  // Simulated Ultrasonic Distance for Dashboard
  const simDistance = Math.round(15 + Math.sin((servoAngle * Math.PI) / 180) * 20);

  // Custom Character 5x8 Matrix State (8 rows, each an array of 5 booleans)
  // Default: Radar Dish
  const [charMatrix, setCharMatrix] = useState([
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
  ]);
  const [copiedCode, setCopiedCode] = useState(false);

  // Presets for 5x8 custom characters
  const presets = {
    radar: [
      [0, 1, 1, 1, 0],
      [1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0],
    ],
    battery: [
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0],
    ],
    heart: [
      [0, 0, 0, 0, 0],
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    antenna: [
      [1, 0, 1, 0, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
    ],
    block: [
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0],
    ],
  };

  const togglePixel = (rowIdx, colIdx) => {
    setCharMatrix((prev) => {
      const next = prev.map((r, rIdx) =>
        rIdx === rowIdx
          ? r.map((c, cIdx) => (cIdx === colIdx ? (c ? 0 : 1) : c))
          : [...r]
      );
      return next;
    });
  };

  // Generate Arduino C++ byte array representation
  const generatedCode = `byte customChar[8] = {\n${charMatrix
    .map((r) => `  B${r.join('')},`)
    .join('\n')}\n};\n// Register in setup():\n// lcd.createChar(0, customChar);`;

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

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
      {/* Top Navigation Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 4,
          background: T.surfaceAlt,
          padding: 3,
          borderRadius: 8,
          border: `1px solid ${T.border}`,
        }}
      >
        {[
          { id: 'servo', label: '🤖 Servo & LCD' },
          { id: 'customChar', label: '🎨 5×8 Bitmapper' },
          { id: 'wiring', label: '🔌 Pin Wiring' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              background: activeTab === t.id ? T.primary : 'transparent',
              color: activeTab === t.id ? '#ffffff' : T.textSub,
              border: 'none',
              borderRadius: 6,
              padding: '6px 4px',
              fontSize: 10.5,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: SERVO PPM & 16X2 LCD DASHBOARD ── */}
      {activeTab === 'servo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Header & I2C Bus Address */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>
              Servo PPM & I2C HUD
            </span>
            <span
              style={{
                fontSize: 9,
                fontFamily: "'JetBrains Mono', monospace",
                padding: '2px 6px',
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

          {/* Mode Switcher */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            <button
              onClick={() => setControlMode('auto')}
              style={{
                background: controlMode === 'auto' ? T.primary : T.surfaceAlt,
                color: controlMode === 'auto' ? '#ffffff' : T.textSub,
                border: `1px solid ${controlMode === 'auto' ? T.primary : T.border}`,
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: 10.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Auto Sweep (0°–180°)
            </button>
            <button
              onClick={() => setControlMode('pot')}
              style={{
                background: controlMode === 'pot' ? T.primary : T.surfaceAlt,
                color: controlMode === 'pot' ? '#ffffff' : T.textSub,
                border: `1px solid ${controlMode === 'pot' ? T.primary : T.border}`,
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: 10.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Potentiometer (A0)
            </button>
          </div>

          {/* SG90 Servo Horn Graphic Card */}
          <div
            style={{
              background: T.surfaceAlt,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: 10.5 }}>
              <span style={{ fontWeight: 700, color: T.text }}>SG90 Servo (Pin 10)</span>
              <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 800, color: T.primary }}>
                {servoAngle}° <span style={{ color: T.textMuted, fontSize: 9 }}>({pulseWidthMs}ms / 50Hz)</span>
              </span>
            </div>

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
            <div style={{ position: 'relative', width: 140, height: 85, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="140" height="85" viewBox="0 0 140 85">
                <path d="M 15 70 A 55 55 0 0 1 125 70" fill="none" stroke={T.border} strokeWidth="3" strokeDasharray="3,3" />
                <text x="10" y="80" fill={T.textMuted} fontSize="8.5" fontFamily="'JetBrains Mono'">0°</text>
                <text x="63" y="12" fill={T.textMuted} fontSize="8.5" fontFamily="'JetBrains Mono'">90°</text>
                <text x="116" y="80" fill={T.textMuted} fontSize="8.5" fontFamily="'JetBrains Mono'">180°</text>

                {/* Blue Servo Body */}
                <rect x="45" y="50" width="50" height="35" rx="4" fill="#1e40af" stroke="#3b82f6" strokeWidth="1.5" />
                <circle cx="70" cy="50" r="9" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="1.5" />

                {/* Rotating Servo Horn */}
                <g transform={`rotate(${servoAngle - 90}, 70, 50)`}>
                  <line x1="70" y1="50" x2="70" y2="12" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="70" cy="18" r="2.5" fill="#ef4444" />
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
              padding: 10,
              fontFamily: "'Courier New', Courier, monospace",
              boxShadow: 'inset 0 0 16px rgba(0,0,0,0.8)',
            }}
          >
            <div style={{ fontSize: 8.5, color: '#4ade80', marginBottom: 4, letterSpacing: 1 }}>
              HD44780 16×2 I2C MATRIX
            </div>

            <div
              style={{
                background: '#134e2b',
                border: '1px solid #22c55e',
                borderRadius: 4,
                padding: '6px 8px',
                color: '#a7f3d0',
                fontSize: 11.5,
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

            <div style={{ fontSize: 8, color: '#86efac', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
              <span>✓ Zero Optical Refresh Flicker</span>
              <span>100 kHz I2C Fast-Mode</span>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: 5X8 CUSTOM LCD CHARACTER MATRIX BUILDER ── */}
      {activeTab === 'customChar' && (
        <div
          style={{
            background: T.surfaceAlt,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: T.text }}>
              5×8 Custom Icon Matrix Bitmapper
            </span>
            <span style={{ fontSize: 9.5, fontFamily: "'JetBrains Mono'", color: T.primary, fontWeight: 700 }}>
              CGRAM Generator
            </span>
          </div>

          <p style={{ fontSize: 10.5, color: T.textSub, margin: 0, lineHeight: 1.5 }}>
            HD44780 LCDs support 8 custom 5x8 user-defined glyphs. Click the pixels below to draw or choose a preset:
          </p>

          {/* Preset Buttons */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {[
              { id: 'radar', label: '📡 Radar' },
              { id: 'battery', label: '🔋 Battery' },
              { id: 'heart', label: '❤️ Heart' },
              { id: 'antenna', label: '📶 Signal' },
              { id: 'block', label: '█ Block' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setCharMatrix(presets[p.id])}
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 4,
                  padding: '4px 8px',
                  fontSize: 10,
                  color: T.text,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Interactive 5x8 Matrix Grid & Live Preview Side by Side */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', justifyContent: 'center' }}>
            {/* 5x8 Pixel Matrix Clicker */}
            <div
              style={{
                background: '#042211',
                padding: 8,
                borderRadius: 8,
                border: '2px solid #064e22',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              {charMatrix.map((row, rIdx) => (
                <div key={rIdx} style={{ display: 'flex', gap: 3 }}>
                  {row.map((pixel, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => togglePixel(rIdx, cIdx)}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 3,
                        background: pixel ? '#22c55e' : '#0a361c',
                        border: `1px solid ${pixel ? '#4ade80' : '#14532d'}`,
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'background 0.1s',
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Live LCD Preview */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                background: T.surface,
                padding: 10,
                borderRadius: 8,
                border: `1px solid ${T.border}`,
              }}
            >
              <span style={{ fontSize: 9.5, color: T.textSub, fontWeight: 700 }}>LCD Preview (1:1):</span>
              <div
                style={{
                  width: 32,
                  height: 48,
                  background: '#134e2b',
                  border: '1px solid #22c55e',
                  borderRadius: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 3,
                  gap: 1.5,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {charMatrix.map((row, rIdx) => (
                  <div key={rIdx} style={{ display: 'flex', gap: 1 }}>
                    {row.map((pixel, cIdx) => (
                      <div
                        key={cIdx}
                        style={{
                          width: 4,
                          height: 4,
                          background: pixel ? '#a7f3d0' : 'transparent',
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 8.5, color: '#10b981', fontFamily: "'JetBrains Mono'" }}>Char #0</span>
            </div>
          </div>

          {/* Generated C++ Code snippet & Copy button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono'" }}>
                Generated C++ Array:
              </span>
              <button
                onClick={copyCodeToClipboard}
                style={{
                  background: copiedCode ? T.greenBg : T.primaryBg,
                  color: copiedCode ? T.green : T.primary,
                  border: `1px solid ${copiedCode ? T.greenBorder : T.primaryBorder}`,
                  borderRadius: 4,
                  padding: '3px 8px',
                  fontSize: 9.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {copiedCode ? '✓ Copied!' : '📋 Copy C++ Code'}
              </button>
            </div>
            <pre
              style={{
                background: '#040810',
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                padding: 8,
                fontSize: 9.5,
                color: '#38bdf8',
                fontFamily: "'JetBrains Mono', monospace",
                margin: 0,
                lineHeight: 1.4,
                overflowX: 'auto',
              }}
            >
              {generatedCode}
            </pre>
          </div>
        </div>
      )}

      {/* ── TAB 3: BREADBOARD PINOUT & WIRING INSPECTOR ── */}
      {activeTab === 'wiring' && (
        <div
          style={{
            background: T.surfaceAlt,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 11.5, fontWeight: 800, color: T.text }}>
            Day 4 Point-to-Point Breadboard Pinout
          </div>
          <p style={{ fontSize: 10.5, color: T.textSub, lineHeight: 1.5, margin: 0 }}>
            Place a 100µF electrolytic decoupling capacitor immediately across the servo 5V and GND power rails to absorb motor stall inrush current spikes.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { from: 'SG90 Brown Lead', to: 'Breadboard Blue (-) Rail', net: 'Ground', color: '#000000' },
              { from: 'SG90 Red Lead', to: 'Breadboard Red (+) Rail', net: '5V Power', color: '#ef4444' },
              { from: 'SG90 Orange Lead', to: 'Uno Digital Pin 10', net: '50Hz PPM Signal', color: '#f59e0b' },
              { from: '100μF Capacitor', to: 'Across 5V (+) & GND (-) Rails', net: 'Decoupling Buffer', color: '#3b82f6' },
              { from: 'I2C Display GND', to: 'Breadboard Blue (-) Rail', net: 'Ground', color: '#000000' },
              { from: 'I2C Display VCC', to: 'Breadboard Red (+) Rail', net: '5V Power', color: '#ef4444' },
              { from: 'I2C Display SDA', to: 'Uno Analog Pin A4', net: 'I2C Serial Data', color: '#10b981' },
              { from: 'I2C Display SCL', to: 'Uno Analog Pin A5', net: 'I2C Serial Clock', color: '#a855f7' },
            ].map((conn, idx) => (
              <div
                key={idx}
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: 6,
                  padding: '6px 8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: conn.color }} />
                  <span style={{ fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono'" }}>{conn.from}</span>
                  <span style={{ color: T.textMuted }}>➔</span>
                  <span style={{ color: T.textSub }}>{conn.to}</span>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: T.primary, fontWeight: 700 }}>
                  {conn.net}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
