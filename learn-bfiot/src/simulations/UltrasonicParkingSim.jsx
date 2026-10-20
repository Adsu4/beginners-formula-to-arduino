import React, { useState, useEffect, useRef } from 'react';

export default function UltrasonicParkingSim({ T }) {
  // Distance in cm (2cm to 80cm)
  const [distance, setDistance] = useState(24);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // PWM Duty Cycle on Pin 9 (0 to 255)
  const [pwmVal, setPwmVal] = useState(128);

  // Audio Context Ref for Piezo Buzzer
  const audioCtxRef = useRef(null);

  // Physics time-of-flight: t = (2 * distance) / 0.0343 microsecs
  const echoMicros = Math.round((distance * 2) / 0.0343);

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
      {/* Title & Zone Status Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
          PWM & Ultrasonic Sonar Ranging
        </span>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          style={{
            background: soundEnabled ? T.greenBg : T.surfaceAlt,
            color: soundEnabled ? T.green : T.textSub,
            border: `1px solid ${soundEnabled ? T.greenBorder : T.border}`,
            borderRadius: 6,
            padding: '3px 8px',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {soundEnabled ? '🔊 Buzzer ON' : '🔇 Buzzer Muted'}
        </button>
      </div>

      {/* HC-SR04 Interactive Sonar Distance Arena */}
      <div
        style={{
          background: T.surfaceAlt,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.text }}>
            HC-SR04 Distance (Trig: 12, Echo: 13)
          </span>
          <span
            style={{
              fontSize: 10,
              fontFamily: "'JetBrains Mono'",
              fontWeight: 800,
              color: zoneColor,
              padding: '2px 6px',
              borderRadius: 4,
              background: `${zoneColor}18`,
              border: `1px solid ${zoneColor}`,
            }}
          >
            {zoneName}
          </span>
        </div>

        {/* Distance Slider & Metric Readout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: T.textSub }}>Obstacle Proximity:</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: zoneColor, fontFamily: "'JetBrains Mono'" }}>
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

          {/* Time of flight physics strip */}
          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              padding: '6px 10px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 9.5,
              fontFamily: "'JetBrains Mono'",
              color: T.textSub,
              marginTop: 4,
            }}
          >
            <span>Echo Pulse: {echoMicros} μs</span>
            <span>Speed: 343 m/s</span>
          </div>
        </div>
      </div>

      {/* 3-Tier Automotive Collision Zones Visualizer */}
      <div
        style={{
          background: T.surfaceAlt,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: 12,
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 700, color: T.textSub, marginBottom: 6 }}>
          3-ZONE PROXIMITY CLASSIFIER
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          {[
            { name: 'ZONE 1 (>30cm)', desc: 'Green LED / Silent', active: distance > 30, color: '#10b981' },
            { name: 'ZONE 2 (10-30cm)', desc: 'Yellow / Beep', active: distance <= 30 && distance >= 10, color: '#f59e0b' },
            { name: 'ZONE 3 (<10cm)', desc: 'Red / Continuous', active: distance < 10, color: '#ef4444' },
          ].map((z) => (
            <div
              key={z.name}
              style={{
                background: z.active ? `${z.color}15` : T.surface,
                border: `1px solid ${z.active ? z.color : T.border}`,
                borderRadius: 6,
                padding: '6px 4px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 800, color: z.active ? z.color : T.textMuted }}>
                {z.name}
              </div>
              <div style={{ fontSize: 8.5, color: T.textSub, marginTop: 2 }}>{z.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 8-Bit PWM Duty Cycle Engine (Pin 9) */}
      <div
        style={{
          background: T.surfaceAlt,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.text }}>
            PWM Pin 9 (analogWrite: 0–255)
          </span>
          <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono'", color: T.primary, fontWeight: 700 }}>
            {pwmDutyPercent}% ({pwmAverageVoltage}V)
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="255"
          value={pwmVal}
          onChange={(e) => setPwmVal(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: T.primary, marginBottom: 8 }}
        />

        {/* Oscilloscope Square Wave Graphic */}
        <div
          style={{
            background: '#040810',
            border: '1px solid #1e293b',
            borderRadius: 6,
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <svg width="120" height="32" viewBox="0 0 120 32">
            <polyline
              points={`0,28 ${120 * (pwmDutyPercent / 100)},28 ${120 * (pwmDutyPercent / 100)},4 120,4`}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
            />
          </svg>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 9.5, color: '#94a3b8', fontFamily: "'JetBrains Mono'" }}>490 Hz</span>
            {/* LED brightness preview */}
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: `rgba(56, 189, 248, ${Math.max(0.1, pwmDutyPercent / 100)})`,
                boxShadow: `0 0 ${12 * (pwmDutyPercent / 100)}px #38bdf8`,
                border: '1px solid #38bdf8',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
