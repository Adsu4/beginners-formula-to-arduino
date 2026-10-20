import React, { useState, useEffect } from 'react';

export default function ServoI2cDashboardSim({ T }) {
  // Servo Angle: 0 to 180
  const [servoAngle, setServoAngle] = useState(90);
  const [controlMode, setControlMode] = useState('auto'); // 'auto', 'pot'
  const [lcdBacklight, setLcdBacklight] = useState(true);
  const [i2cAddress] = useState('0x27'); // Standard PCF8574 I2C Backpack

  // Simulated Distance for Dashboard
  const [measuredDistance, setMeasuredDistance] = useState(25);

  // PPM Pulse Width Calculation: 1.0ms (0 deg) to 2.0ms (180 deg) in 20ms period (50Hz)
  const pulseWidthMs = (1.0 + (servoAngle / 180.0) * 1.0).toFixed(2);
  const estimatedCurrentMa = controlMode === 'auto' ? 240 : 120;

  // Auto Sweep loop
  useEffect(() => {
    if (controlMode !== 'auto') return;
    let angle = servoAngle;
    let step = 2;
    const interval = setInterval(() => {
      angle += step;
      if (angle >= 180) { angle = 180; step = -2; }
      if (angle <= 0) { angle = 0; step = 2; }
      setServoAngle(angle);

      // Random small drift in simulated distance
      setMeasuredDistance(prev => Math.min(60, Math.max(10, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 40);

    return () => clearInterval(interval);
  }, [controlMode, servoAngle]);

  // Generate 8-character custom bar graph for 16x2 LCD
  const filledBars = Math.min(8, Math.max(0, Math.round((measuredDistance / 60) * 8)));
  const customBarString = '█'.repeat(filledBars) + '░'.repeat(8 - filledBars);

  return (
    <div
      style={{
        background: T?.surface || '#080f1c',
        border: `1px solid ${T?.border || '#111d33'}`,
        borderRadius: 14,
        padding: 24,
        fontFamily: "'Inter', sans-serif",
        color: T?.text || '#e8edf5',
        marginBottom: 32,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#818cf8', boxShadow: '0 0 12px #818cf8' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
            Arduino Uno R3 · SG90 Servo PPM Actuation & I2C Display
          </h3>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', gap: 6, background: T?.bg || '#04080f', padding: 4, borderRadius: 8, border: `1px solid ${T?.border || '#111d33'}` }}>
          <button
            onClick={() => setControlMode('auto')}
            style={{
              background: controlMode === 'auto' ? (T?.primary || '#4f4dc8') : 'transparent',
              color: controlMode === 'auto' ? '#fff' : (T?.textSub || '#4a5a78'),
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Auto Sweep (0°-180°)
          </button>
          <button
            onClick={() => setControlMode('pot')}
            style={{
              background: controlMode === 'pot' ? (T?.primary || '#4f4dc8') : 'transparent',
              color: controlMode === 'pot' ? '#fff' : (T?.textSub || '#4a5a78'),
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Potentiometer Teleoperation (A0)
          </button>
        </div>
      </div>

      {/* Grid: Servo Motor vs I2C LCD Display */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 24, marginBottom: 24 }}>
        
        {/* Left: SG90 Micro Servo Articulation Visualizer */}
        <div style={{
          background: '#030712',
          border: '1px solid #1f2937',
          borderRadius: 14,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16
        }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace" }}>
              SG90 MICRO SERVO (PIN 10)
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: "'JetBrains Mono'" }}>
              {servoAngle}°
            </span>
          </div>

          {/* SVG Animated Servo Housing & Horn */}
          <div style={{ position: 'relative', width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Degree Arc Markings */}
            <svg width="180" height="180" viewBox="0 0 180 180">
              <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="#1f2937" strokeWidth="6" strokeDasharray="4,4" />
              <text x="14" y="105" fill="#64748b" fontSize="10" fontFamily="'JetBrains Mono'">0°</text>
              <text x="82" y="18" fill="#64748b" fontSize="10" fontFamily="'JetBrains Mono'">90°</text>
              <text x="148" y="105" fill="#64748b" fontSize="10" fontFamily="'JetBrains Mono'">180°</text>

              {/* Blue Servo Body */}
              <rect x="55" y="90" width="70" height="80" rx="6" fill="#1e40af" stroke="#3b82f6" strokeWidth="2" />
              <rect x="45" y="105" width="90" height="8" rx="2" fill="#1d4ed8" />
              <circle cx="50" cy="109" r="2.5" fill="#0f172a" />
              <circle cx="130" cy="109" r="2.5" fill="#0f172a" />

              {/* Rotational Axis & White Horn */}
              <g transform={`rotate(${servoAngle - 90}, 90, 90)`} style={{ transition: controlMode === 'pot' ? 'none' : 'transform 0.05s linear' }}>
                {/* Arm / Horn */}
                <rect x="85" y="25" width="10" height="70" rx="5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
                <circle cx="90" cy="35" r="2" fill="#475569" />
                <circle cx="90" cy="50" r="2" fill="#475569" />
                <circle cx="90" cy="65" r="2" fill="#475569" />
                {/* Center Gear Cap */}
                <circle cx="90" cy="90" r="14" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
                <circle cx="90" cy="90" r="4" fill="#334155" />
              </g>
            </svg>
          </div>

          {/* Manual Slider if in Potentiometer Mode */}
          {controlMode === 'pot' ? (
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                <span>Pot A0: 0°</span>
                <span>Angle: {servoAngle}°</span>
                <span>180°</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                value={servoAngle}
                onChange={(e) => setServoAngle(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8' }}
              />
            </div>
          ) : (
            <div style={{ fontSize: 11, color: T?.textSub || '#64748b', textAlign: 'center' }}>
              Sweeping back and forth using non-blocking microsecond pulses.
            </div>
          )}

          {/* PPM Timing & Inrush Metrics */}
          <div style={{
            width: '100%',
            background: '#090d16',
            border: '1px solid #1e293b',
            borderRadius: 8,
            padding: 10,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 8,
            textAlign: 'center',
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            <div>
              <div style={{ color: '#64748b', fontSize: 9 }}>PPM PULSE WIDTH</div>
              <div style={{ color: '#38bdf8', fontWeight: 700 }}>{pulseWidthMs} ms</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: 9 }}>ACTIVE CURRENT</div>
              <div style={{ color: '#f59e0b', fontWeight: 700 }}>~{estimatedCurrentMa} mA</div>
            </div>
          </div>
        </div>

        {/* Right: I2C 16x2 Liquid Crystal Display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Physical 16x2 LCD Simulation */}
          <div style={{
            background: '#0f172a',
            border: '4px solid #1e293b',
            borderRadius: 14,
            padding: 16,
            boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>
                I2C LCD 16x2 [ADDR: {i2cAddress}]
              </span>
              <button
                onClick={() => setLcdBacklight(!lcdBacklight)}
                style={{
                  background: lcdBacklight ? '#10b981' : '#334155',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '3px 8px',
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {lcdBacklight ? 'Backlight ON' : 'Backlight OFF'}
              </button>
            </div>

            {/* LCD Screen Glass Matrix */}
            <div style={{
              background: lcdBacklight ? '#0284c7' : '#082f49',
              border: '3px solid #0369a1',
              borderRadius: 6,
              padding: '16px 20px',
              fontFamily: "'Courier New', Courier, monospace",
              color: lcdBacklight ? '#f0f9ff' : '#0369a1',
              boxShadow: lcdBacklight ? 'inset 0 0 20px rgba(0,0,0,0.4), 0 0 25px rgba(2, 132, 199, 0.4)' : 'inset 0 0 10px rgba(0,0,0,0.8)',
              fontSize: 18,
              letterSpacing: 2,
              fontWeight: 700,
              textTransform: 'uppercase',
              minHeight: 70,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s'
            }}>
              <div>
                ANG:{servoAngle.toString().padStart(3, '0')}° DST:{measuredDistance}CM
              </div>
              <div>
                [{customBarString}] {measuredDistance < 15 ? 'WARN' : 'SAFE'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 10, color: '#64748b', fontFamily: "'JetBrains Mono'" }}>
              <span>Wire: SDA → Pin A4</span>
              <span>SCL → Pin A5</span>
              <span>VCC: 5V | GND</span>
            </div>
          </div>

          {/* I2C Protocol Analyzer HUD */}
          <div style={{
            background: T?.surfaceAlt || '#0c1525',
            border: `1px solid ${T?.border || '#111d33'}`,
            borderRadius: 12,
            padding: 16
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
              I2C PROTOCOL SNIFFER & POWER DECOUPLING
            </div>

            <div style={{ fontSize: 12, color: T?.textSub || '#94a3b8', lineHeight: 1.6, marginBottom: 10 }}>
              The PCF8574 I2C adapter decodes two wires (<strong style={{ color: '#fff' }}>SDA on A4</strong>, <strong style={{ color: '#fff' }}>SCL on A5</strong>) into 8 parallel lines to control the screen without using up all the digital pins!
            </div>

            <div style={{ background: '#020617', padding: 10, borderRadius: 6, border: '1px solid #1e293b', fontSize: 11, fontFamily: "'JetBrains Mono'" }}>
              <div style={{ color: '#38bdf8' }}>I2C.write(0x27) → ACK RECEIVED</div>
              <div style={{ color: '#94a3b8' }}>
                Cursor Overwrite Active · Zero Flicker Refresh Logic
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
