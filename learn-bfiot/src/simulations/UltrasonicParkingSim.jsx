import React, { useState, useEffect, useRef } from 'react';

export default function UltrasonicParkingSim({ T }) {
  // Ultrasonic Obstacle Distance (cm)
  const [distanceCm, setDistanceCm] = useState(24);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // PWM LED Engine (Pin 9)
  const [pwmVal, setPwmVal] = useState(128); // 0 - 255
  const [autoBreathe, setAutoBreathe] = useState(false);

  // Audio Context Ref for Real Piezo Tone Generation
  const audioCtxRef = useRef(null);

  // Derived Acoustic Calculations (Speed of sound = 343 m/s = 0.0343 cm/us)
  const echoDurationUs = Math.round((distanceCm * 2) / 0.0343);
  const pwmDutyPercent = Math.round((pwmVal / 255) * 100);
  const pwmAvgVoltage = ((pwmVal / 255) * 5.0).toFixed(2);

  // 3-Tier Warning Zone classification
  const zone = distanceCm > 30 ? 'SAFE' : distanceCm >= 10 ? 'CAUTION' : 'CRITICAL';
  const zoneColor = zone === 'SAFE' ? '#10b981' : zone === 'CAUTION' ? '#f59e0b' : '#ef4444';

  // Auto Breathing Animation
  useEffect(() => {
    if (!autoBreathe) return;
    let val = pwmVal;
    let direction = 1;
    const interval = setInterval(() => {
      val += direction * 5;
      if (val >= 255) { val = 255; direction = -1; }
      if (val <= 0) { val = 0; direction = 1; }
      setPwmVal(val);
    }, 30);
    return () => clearInterval(interval);
  }, [autoBreathe, pwmVal]);

  // Audio Beep Generator for Parking Sensor
  const playTone = (freq, durationMs) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square'; // Piezo ceramic square wave tone
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  // Beep interval tied to distance
  useEffect(() => {
    if (zone === 'SAFE' || !soundEnabled) return;

    // Ramping rate: closer = faster beeps
    const intervalMs = zone === 'CRITICAL' ? 120 : Math.max(150, distanceCm * 20);
    const freq = zone === 'CRITICAL' ? 2400 : 1800;

    const timer = setInterval(() => {
      playTone(freq, zone === 'CRITICAL' ? 90 : 60);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [distanceCm, zone, soundEnabled]);

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
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: zoneColor, boxShadow: `0 0 12px ${zoneColor}` }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
            Arduino Uno R3 · PWM Duty Cycle & Ultrasonic Sonar Ranging
          </h3>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          style={{
            background: soundEnabled ? 'rgba(34,197,94,0.15)' : '#1e293b',
            color: soundEnabled ? '#22c55e' : '#94a3b8',
            border: `1px solid ${soundEnabled ? '#22c55e' : '#334155'}`,
            borderRadius: 8,
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s'
          }}
        >
          <span>{soundEnabled ? '🔊' : '🔇'}</span>
          <span>{soundEnabled ? 'Piezo Buzzer Active' : 'Enable Audio Feedback'}</span>
        </button>
      </div>

      {/* Grid: Ultrasonic Ranging vs PWM Oscilloscope */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, marginBottom: 24 }}>
        
        {/* Left: HC-SR04 Interactive Sonar Arena */}
        <div style={{
          background: '#030712',
          border: '1px solid #1f2937',
          borderRadius: 14,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace" }}>
              HC-SR04 SONAR RANGING (Trig: Pin 12, Echo: Pin 13)
            </span>
            <div style={{
              background: `${zoneColor}22`,
              border: `1px solid ${zoneColor}`,
              color: zoneColor,
              borderRadius: 6,
              padding: '3px 10px',
              fontSize: 11,
              fontWeight: 800
            }}>
              ZONE: {zone} ({distanceCm} cm)
            </div>
          </div>

          {/* Interactive Distance Track */}
          <div style={{
            position: 'relative',
            height: 120,
            background: '#090d16',
            borderRadius: 10,
            border: '1px solid #1e293b',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center'
          }}>
            {/* Ultrasonic Sensor Icon (Left Edge) */}
            <div style={{
              position: 'absolute',
              left: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 2
            }}>
              <div style={{ display: 'flex', gap: 4 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#64748b', border: '2px solid #38bdf8' }} />
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#64748b', border: '2px solid #38bdf8' }} />
              </div>
              <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#94a3b8', marginTop: 4 }}>HC-SR04</span>
            </div>

            {/* Ultrasonic Sound Wave Cones */}
            <svg style={{ position: 'absolute', left: 45, width: `${(distanceCm / 80) * 100}%`, height: '100%', pointerEvents: 'none' }}>
              <path
                d={`M 0 60 L ${((distanceCm / 80) * 260)} 20 L ${((distanceCm / 80) * 260)} 100 Z`}
                fill="url(#sonarGradient)"
                opacity="0.35"
              />
              <defs>
                <linearGradient id="sonarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor={zoneColor} stopOpacity="0.1" />
                </linearGradient>
              </defs>
            </svg>

            {/* Movable Obstacle Target */}
            <div
              style={{
                position: 'absolute',
                left: `${Math.min(90, Math.max(14, (distanceCm / 80) * 90))}%`,
                width: 38,
                height: 70,
                background: zoneColor,
                borderRadius: 8,
                boxShadow: `0 0 20px ${zoneColor}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'ew-resize',
                zIndex: 3,
                transition: 'left 0.05s'
              }}
            >
              <span style={{ fontSize: 18 }}>🚗</span>
              <span style={{ fontSize: 9, fontWeight: 900, color: '#000', fontFamily: "'JetBrains Mono'" }}>{distanceCm}cm</span>
            </div>
          </div>

          {/* Distance Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 4 }}>
              <span>2 cm (Blind Zone)</span>
              <span>Slide Obstacle Distance</span>
              <span>80 cm</span>
            </div>
            <input
              type="range"
              min="2"
              max="80"
              value={distanceCm}
              onChange={(e) => setDistanceCm(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: zoneColor }}
            />
          </div>

          {/* Time-of-Flight Physics HUD */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            background: '#090d16',
            padding: 10,
            borderRadius: 8,
            border: '1px solid #1e293b',
            textAlign: 'center',
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            <div>
              <div style={{ color: '#64748b', fontSize: 9 }}>SPEED OF SOUND (c)</div>
              <div style={{ color: '#fff', fontWeight: 700 }}>0.0343 cm/μs</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: 9 }}>ECHO PULSE DURATION</div>
              <div style={{ color: '#38bdf8', fontWeight: 700 }}>{echoDurationUs} μs</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: 9 }}>pulseIn() FORMULA</div>
              <div style={{ color: '#22c55e', fontWeight: 700 }}>({echoDurationUs} × .0343) / 2</div>
            </div>
          </div>
        </div>

        {/* Right: PWM Duty Cycle & Oscilloscope */}
        <div style={{
          background: T?.surfaceAlt || '#0c1525',
          border: `1px solid ${T?.border || '#111d33'}`,
          borderRadius: 14,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', fontFamily: "'JetBrains Mono', monospace" }}>
              PWM PIN 9 (analogWrite: 0-255)
            </span>
            <button
              onClick={() => setAutoBreathe(!autoBreathe)}
              style={{
                background: autoBreathe ? '#4f4dc8' : '#1e293b',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '3px 8px',
                fontSize: 10,
                cursor: 'pointer'
              }}
            >
              {autoBreathe ? 'Stop Breathing' : 'Auto Breathe'}
            </button>
          </div>

          {/* LED Visualizer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            background: '#040810',
            padding: 14,
            borderRadius: 10,
            border: '1px solid #111d33'
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#818cf8',
              opacity: Math.max(0.08, pwmVal / 255),
              boxShadow: `0 0 ${Math.round((pwmVal / 255) * 40)}px #818cf8`,
              transition: 'all 0.05s'
            }} />
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
              <div>Duty: <strong style={{ color: '#818cf8' }}>{pwmDutyPercent}%</strong></div>
              <div style={{ color: '#94a3b8' }}>Avg V: <strong>{pwmAvgVoltage} V</strong></div>
            </div>
          </div>

          {/* Simulated 490Hz Oscilloscope Square Wave */}
          <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: 8, padding: 8 }}>
            <div style={{ fontSize: 9, color: '#64748b', fontFamily: "'JetBrains Mono'", marginBottom: 4 }}>
              VIRTUAL OSCILLOSCOPE (490 Hz TIMER 1 SQUARE WAVE)
            </div>
            <svg width="100%" height="45" viewBox="0 0 200 45">
              {/* Grid lines */}
              <line x1="0" y1="22" x2="200" y2="22" stroke="#1e293b" strokeWidth="1" strokeDasharray="2,2" />
              {/* Waveform for 2 cycles */}
              <polyline
                fill="none"
                stroke="#818cf8"
                strokeWidth="2"
                points={`
                  0,40 
                  ${(pwmDutyPercent / 100) * 100},40 
                  ${(pwmDutyPercent / 100) * 100},8 
                  100,8 
                  100,40 
                  ${100 + (pwmDutyPercent / 100) * 100},40 
                  ${100 + (pwmDutyPercent / 100) * 100},8 
                  200,8
                `}
              />
            </svg>
          </div>

          {/* PWM Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 4 }}>
              <span>analogWrite(9, 0)</span>
              <span>Value: {pwmVal}</span>
              <span>255</span>
            </div>
            <input
              type="range"
              min="0"
              max="255"
              value={pwmVal}
              onChange={(e) => setPwmVal(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#818cf8' }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
