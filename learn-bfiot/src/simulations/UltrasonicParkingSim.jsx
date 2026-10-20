import React, { useState, useEffect, useRef } from 'react';

export default function UltrasonicParkingSim({ T }) {
  // Tab switcher: 'parking', 'timing', 'wiring'
  const [activeTab, setActiveTab] = useState('parking');

  // Distance in cm (2cm to 60cm)
  const [distance, setDistance] = useState(24);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Temperature Compensation Lab (-10°C to +50°C)
  const [ambientTempC, setAmbientTempC] = useState(20);

  // PWM Duty Cycle on Pin 9 (0 to 255)
  const [pwmVal, setPwmVal] = useState(128);

  // Audio Context Ref for Piezo Buzzer
  const audioCtxRef = useRef(null);

  // Physics speed of sound formula: c = 331.4 + (0.6 * T_celsius) m/s = c_cm_per_us
  const speedOfSoundMps = (331.4 + 0.6 * ambientTempC).toFixed(1);
  const speedOfSoundCmPerUs = (parseFloat(speedOfSoundMps) / 10000).toFixed(6);

  // Time-of-flight in microseconds: t = (2 * distance) / c
  const echoMicros = Math.round((2 * distance) / parseFloat(speedOfSoundCmPerUs));

  // Distance calculated if using uncalibrated default 343 m/s (20°C standard)
  const uncalibratedDistCm = ((echoMicros * 0.0343) / 2).toFixed(1);

  // 3-Zone Classification
  let zoneName = 'SAFE';
  let zoneColor = '#10b981';
  let beepIntervalMs = 0; // 0 = silent

  if (distance < 10) {
    zoneName = 'CRITICAL ALARM';
    zoneColor = '#ef4444';
    beepIntervalMs = 120;
  } else if (distance <= 30) {
    zoneName = 'CAUTION';
    zoneColor = '#f59e0b';
    beepIntervalMs = 350;
  } else {
    zoneName = 'SAFE CLEAR';
    zoneColor = '#10b981';
    beepIntervalMs = 0;
  }

  // Sound synthesis via Web Audio API
  useEffect(() => {
    if (!soundEnabled || beepIntervalMs === 0) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const interval = setInterval(() => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = distance < 10 ? 2400 : 1200;
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.07);
      } catch {
        // Audio error handling
      }
    }, beepIntervalMs);

    return () => clearInterval(interval);
  }, [soundEnabled, beepIntervalMs, distance]);

  const pwmDutyPercent = Math.round((pwmVal / 255) * 100);
  const pwmAverageVoltage = ((pwmVal * 5.0) / 255).toFixed(2);

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
          { id: 'parking', label: '🚗 Sonar Assistant' },
          { id: 'timing', label: '📡 Acoustic Waveform' },
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

      {/* ── TAB 1: SONAR PARKING ASSISTANT ── */}
      {activeTab === 'parking' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Header & Audio Switch */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>
              Reverse Parking Radar
            </span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                background: soundEnabled ? T.greenBg : T.surfaceAlt,
                color: soundEnabled ? T.green : T.textSub,
                border: `1px solid ${soundEnabled ? T.greenBorder : T.border}`,
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {soundEnabled ? '🔊 Piezo Tone ON' : '🔇 Buzzer Muted'}
            </button>
          </div>

          {/* Sonar Sensor & Obstacle Range Card */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: T.text }}>
                HC-SR04 Sonar (Trig: 12, Echo: 13)
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono'",
                  fontWeight: 800,
                  color: zoneColor,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: `${zoneColor}18`,
                  border: `1px solid ${zoneColor}`,
                }}
              >
                {zoneName}
              </span>
            </div>

            {/* Distance Slider & Metric Readout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: T.textSub }}>Obstacle Range:</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: zoneColor, fontFamily: "'JetBrains Mono'" }}>
                  {distance} cm
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="60"
                value={distance}
                onChange={(e) => setDistance(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: zoneColor }}
              />
            </div>

            {/* Automotive Reverse Proximity Bar */}
            <div style={{ width: '100%', height: 10, background: T.surface, borderRadius: 5, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.max(5, Math.min(100, (distance / 60) * 100))}%`,
                  height: '100%',
                  background: zoneColor,
                  transition: 'width 0.15s, background 0.15s',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: T.textSub }}>
              <span>2cm Blind Zone</span>
              <span>10cm Critical</span>
              <span>30cm Caution</span>
              <span>60cm Safe</span>
            </div>
          </div>

          {/* PWM Modulation Fader (Pin 9) */}
          <div
            style={{
              background: T.surfaceAlt,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: T.text }}>
                Timer PWM Output (Pin 9 · 490 Hz)
              </span>
              <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono'", color: T.primary, fontWeight: 800 }}>
                {pwmVal}/255 ({pwmDutyPercent}%)
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="255"
              value={pwmVal}
              onChange={(e) => setPwmVal(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: T.primary }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 9.5,
                background: T.surface,
                padding: '6px 8px',
                borderRadius: 6,
                border: `1px solid ${T.border}`,
              }}
            >
              <span style={{ color: T.textSub }}>Average Analog Voltage:</span>
              <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, color: T.text }}>
                {pwmAverageVoltage} V
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ACOUSTIC TIMING & TEMP COMPENSATION LAB ── */}
      {activeTab === 'timing' && (
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
              Time-of-Flight Sonar Timing
            </span>
            <span style={{ fontSize: 9.5, fontFamily: "'JetBrains Mono'", color: T.primary, fontWeight: 700 }}>
              d = (t × c) / 2
            </span>
          </div>

          {/* Timing Diagram Visual */}
          <div
            style={{
              background: '#030712',
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {/* Trig Pulse Line */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#94a3b8', marginBottom: 2 }}>
                <span>PIN 12 (TRIG)</span>
                <span>10 μs HIGH Pulse</span>
              </div>
              <div style={{ height: 16, display: 'flex', alignItems: 'center' }}>
                <svg width="100%" height="16">
                  <path d="M 0 14 L 30 14 L 30 2 L 45 2 L 45 14 L 350 14" fill="none" stroke="#38bdf8" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* 40kHz Ultrasonic Burst Line */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#94a3b8', marginBottom: 2 }}>
                <span>TRANSDUCER ACOUSTIC</span>
                <span>8-Cycle 40 kHz Sound Burst</span>
              </div>
              <div style={{ height: 16, display: 'flex', alignItems: 'center' }}>
                <svg width="100%" height="16">
                  <path d="M 0 8 L 48 8 L 52 2 L 56 14 L 60 2 L 64 14 L 68 2 L 72 14 L 76 2 L 80 8 L 350 8" fill="none" stroke="#f59e0b" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Echo Return Pulse Line */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#94a3b8', marginBottom: 2 }}>
                <span>PIN 13 (ECHO)</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>Pulse Width: {echoMicros} μs</span>
              </div>
              <div style={{ height: 16, display: 'flex', alignItems: 'center' }}>
                <svg width="100%" height="16">
                  <path
                    d={`M 0 14 L 80 14 L 80 2 L ${Math.min(330, 80 + (distance / 60) * 240)} 2 L ${Math.min(330, 80 + (distance / 60) * 240)} 14 L 350 14`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Temperature Compensation Slider */}
          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5 }}>
              <span style={{ color: T.textSub }}>Ambient Room Temperature:</span>
              <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 800, color: T.primary }}>
                {ambientTempC}°C
              </span>
            </div>
            <input
              type="range"
              min="-10"
              max="50"
              value={ambientTempC}
              onChange={(e) => setAmbientTempC(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: T.primary }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 10 }}>
              <div style={{ background: T.surfaceAlt, padding: 6, borderRadius: 6 }}>
                <div style={{ color: T.textSub, fontSize: 9 }}>Speed of Sound (c):</div>
                <div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, color: T.text }}>
                  {speedOfSoundMps} m/s
                </div>
              </div>
              <div style={{ background: T.surfaceAlt, padding: 6, borderRadius: 6 }}>
                <div style={{ color: T.textSub, fontSize: 9 }}>Uncalibrated Error:</div>
                <div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, color: Math.abs(distance - parseFloat(uncalibratedDistCm)) > 0.5 ? '#ef4444' : '#10b981' }}>
                  {uncalibratedDistCm} cm (Δ {(parseFloat(uncalibratedDistCm) - distance).toFixed(1)}cm)
                </div>
              </div>
            </div>
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
            Day 3 Point-to-Point Breadboard Pinout
          </div>
          <p style={{ fontSize: 10.5, color: T.textSub, lineHeight: 1.5, margin: 0 }}>
            HC-SR04 sonar requires direct 5V power. Passive buzzer connects to Pin 11 with no series resistor needed for square waves.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { from: 'HC-SR04 VCC', to: 'Breadboard 5V (+) Rail', net: '5V Regulated Power', color: '#ef4444' },
              { from: 'HC-SR04 GND', to: 'Breadboard Blue (-) Rail', net: 'Ground Reference', color: '#000000' },
              { from: 'HC-SR04 Trig', to: 'Uno Digital Pin 12', net: '10μs Burst Trigger', color: '#38bdf8' },
              { from: 'HC-SR04 Echo', to: 'Uno Digital Pin 13', net: 'Return Pulse In', color: '#10b981' },
              { from: 'Piezo Buzzer (+)', to: 'Uno Digital Pin 11', net: 'tone() AC Frequency', color: '#f59e0b' },
              { from: 'Piezo Buzzer (-)', to: 'Breadboard Blue (-) Rail', net: 'Ground Return', color: '#000000' },
              { from: 'PWM LED Anode (+)', to: 'Uno Pin 9 (PWM ~)', net: 'analogWrite() 0-255', color: '#a855f7' },
              { from: 'PWM LED Cathode (-)', to: '220Ω Resistor ➔ GND Rail', net: 'Current Limiter', color: '#64748b' },
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
