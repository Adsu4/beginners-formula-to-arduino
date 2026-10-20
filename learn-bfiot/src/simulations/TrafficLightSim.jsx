import React, { useState, useEffect, useRef } from 'react';

export default function TrafficLightSim({ T }) {
  // Active simulator sub-tab: 'signals', 'ohms', 'wiring'
  const [activeTab, setActiveTab] = useState('signals');

  // Traffic cycle state: 'GREEN', 'YELLOW', 'RED', 'RED_YELLOW'
  const [cycleMode, setCycleMode] = useState('auto'); // 'auto', 'hazard', 'manual'
  const [trafficState, setTrafficState] = useState('GREEN');
  const [pedestrianRequested, setPedestrianRequested] = useState(false);
  const [flashTick, setFlashTick] = useState(false);

  // Manual pin states
  const [pin8Red, setPin8Red] = useState(false);
  const [pin9Yellow, setPin9Yellow] = useState(false);
  const [pin10Green, setPin10Green] = useState(true);

  // Real-time Waveform Canvas Ref
  const waveformCanvasRef = useRef(null);
  const waveformHistoryRef = useRef([]);

  // Ohm's Law Calculator states
  const [calcVf, setCalcVf] = useState(2.0); // 2.0V for Red/Yellow, 3.0V for Green
  const [calcCurrentmA, setCalcCurrentmA] = useState(15); // 15mA safe
  const vcc = 5.0; // Arduino Uno 5V

  const requiredR = Math.round((vcc - calcVf) / (calcCurrentmA / 1000));
  const nearestE12 = [100, 150, 180, 220, 270, 330, 470, 560, 680, 1000].reduce((prev, curr) =>
    Math.abs(curr - requiredR) < Math.abs(prev - requiredR) ? curr : prev
  );
  const actualCurrentmA = (((vcc - calcVf) / nearestE12) * 1000).toFixed(1);
  const resistorPowerMw = (Math.pow(actualCurrentmA / 1000, 2) * nearestE12 * 1000).toFixed(1);

  // Dynamic Chip Current Calculation
  const currentDrawTotal = (
    (pin8Red ? (5.0 - 2.0) / 220 : 0) * 1000 +
    (pin9Yellow ? (5.0 - 2.1) / 220 : 0) * 1000 +
    (pin10Green ? (5.0 - 3.0) / 220 : 0) * 1000
  ).toFixed(1);

  // Auto traffic cycle timer
  useEffect(() => {
    if (cycleMode !== 'auto') return;

    let timer;
    if (trafficState === 'GREEN') {
      setPin10Green(true);
      setPin9Yellow(false);
      setPin8Red(false);
      timer = setTimeout(() => {
        setTrafficState('YELLOW');
      }, pedestrianRequested ? 1500 : 3500);
    } else if (trafficState === 'YELLOW') {
      setPin10Green(false);
      setPin9Yellow(true);
      setPin8Red(false);
      timer = setTimeout(() => {
        setTrafficState('RED');
      }, 1500);
    } else if (trafficState === 'RED') {
      setPin10Green(false);
      setPin9Yellow(false);
      setPin8Red(true);
      timer = setTimeout(() => {
        if (pedestrianRequested) {
          setPedestrianRequested(false);
        }
        setTrafficState('RED_YELLOW');
      }, pedestrianRequested ? 4000 : 3000);
    } else if (trafficState === 'RED_YELLOW') {
      setPin10Green(false);
      setPin9Yellow(true);
      setPin8Red(true);
      timer = setTimeout(() => {
        setTrafficState('GREEN');
      }, 1200);
    }

    return () => clearTimeout(timer);
  }, [cycleMode, trafficState, pedestrianRequested]);

  // Hazard mode flasher (1 Hz = 500ms toggle)
  useEffect(() => {
    if (cycleMode !== 'hazard') return;
    const interval = setInterval(() => {
      setFlashTick((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, [cycleMode]);

  useEffect(() => {
    if (cycleMode === 'hazard') {
      setPin10Green(false);
      setPin8Red(false);
      setPin9Yellow(flashTick);
    }
  }, [cycleMode, flashTick]);

  // Waveform History Sampler (60 FPS / 100ms interval)
  useEffect(() => {
    const interval = setInterval(() => {
      waveformHistoryRef.current.push({
        r: pin8Red ? 1 : 0,
        y: pin9Yellow ? 1 : 0,
        g: pin10Green ? 1 : 0,
      });
      if (waveformHistoryRef.current.length > 70) {
        waveformHistoryRef.current.shift();
      }

      // Draw Waveform on canvas
      const canvas = waveformCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, w, h);

      // Grid Lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      [22, 50, 78].forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      });

      const history = waveformHistoryRef.current;
      const step = w / 70;

      // Draw Channel 1: Pin 8 Red (y: 6 to 22)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      history.forEach((sample, i) => {
        const x = i * step;
        const y = sample.r ? 8 : 22;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Draw Channel 2: Pin 9 Yellow (y: 34 to 50)
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      history.forEach((sample, i) => {
        const x = i * step;
        const y = sample.y ? 36 : 50;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Draw Channel 3: Pin 10 Green (y: 62 to 78)
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      history.forEach((sample, i) => {
        const x = i * step;
        const y = sample.g ? 64 : 78;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }, 80);

    return () => clearInterval(interval);
  }, [pin8Red, pin9Yellow, pin10Green]);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Simulator Top Nav Tabs */}
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
          { id: 'signals', label: '🚥 Signals & Scope' },
          { id: 'ohms', label: '📐 Ohm\'s Law' },
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

      {/* ── TAB 1: SIGNALS & LOGIC ANALYZER SCOPE ── */}
      {activeTab === 'signals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Mode Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>
              Traffic Controller Mode
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[
                { id: 'auto', label: 'Auto' },
                { id: 'hazard', label: 'Standby 1Hz' },
                { id: 'manual', label: 'Manual' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setCycleMode(m.id);
                    if (m.id === 'auto') setTrafficState('GREEN');
                  }}
                  style={{
                    background: cycleMode === m.id ? T.primary : T.surfaceAlt,
                    color: cycleMode === m.id ? '#ffffff' : T.textSub,
                    border: `1px solid ${cycleMode === m.id ? T.primary : T.border}`,
                    borderRadius: 6,
                    padding: '4px 8px',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Traffic Signal Visor Chassis */}
          <div
            style={{
              background: '#030712',
              border: '1px solid #1f2937',
              borderRadius: 14,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.6)',
            }}
          >
            <div
              style={{
                background: '#111827',
                border: '2px solid #374151',
                borderRadius: 24,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
              }}
            >
              {/* Red Light (Pin 8) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: pin8Red ? '#ef4444' : '#280808',
                    border: '2px solid #1f2937',
                    boxShadow: pin8Red
                      ? '0 0 22px #ef4444, inset 0 -3px 8px rgba(0,0,0,0.4)'
                      : 'inset 0 3px 6px rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      fontSize: 8.5,
                      fontWeight: 800,
                      color: pin8Red ? '#ffffff' : '#5c1414',
                      fontFamily: "'JetBrains Mono',monospace",
                    }}
                  >
                    D8
                  </span>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', fontFamily: "'JetBrains Mono'" }}>RED</span>
              </div>

              {/* Yellow Light (Pin 9) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: pin9Yellow ? '#f59e0b' : '#2a1b04',
                    border: '2px solid #1f2937',
                    boxShadow: pin9Yellow
                      ? '0 0 22px #f59e0b, inset 0 -3px 8px rgba(0,0,0,0.4)'
                      : 'inset 0 3px 6px rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      fontSize: 8.5,
                      fontWeight: 800,
                      color: pin9Yellow ? '#ffffff' : '#6b4305',
                      fontFamily: "'JetBrains Mono',monospace",
                    }}
                  >
                    D9
                  </span>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#f59e0b', fontFamily: "'JetBrains Mono'" }}>YELLOW</span>
              </div>

              {/* Green Light (Pin 10) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: pin10Green ? '#10b981' : '#032115',
                    border: '2px solid #1f2937',
                    boxShadow: pin10Green
                      ? '0 0 22px #10b981, inset 0 -3px 8px rgba(0,0,0,0.4)'
                      : 'inset 0 3px 6px rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      fontSize: 8.5,
                      fontWeight: 800,
                      color: pin10Green ? '#ffffff' : '#084832',
                      fontFamily: "'JetBrains Mono',monospace",
                    }}
                  >
                    D10
                  </span>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#10b981', fontFamily: "'JetBrains Mono'" }}>GREEN</span>
              </div>
            </div>

            {/* Pedestrian Crossing Bar & Request */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div
                style={{
                  background: '#090d16',
                  border: `1px solid ${pin8Red ? '#10b981' : '#1e293b'}`,
                  borderRadius: 6,
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 10, color: '#94a3b8' }}>Pedestrian Signal:</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: pin8Red ? '#10b981' : '#ef4444',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {pin8Red ? 'WALK 🚶' : "DON'T WALK ✋"}
                </span>
              </div>

              {cycleMode === 'auto' && (
                <button
                  onClick={() => setPedestrianRequested(true)}
                  disabled={pedestrianRequested || pin8Red}
                  style={{
                    width: '100%',
                    background: pedestrianRequested ? '#059669' : '#1e293b',
                    color: '#ffffff',
                    border: `1px solid ${pedestrianRequested ? '#10b981' : '#334155'}`,
                    borderRadius: 6,
                    padding: '6px 10px',
                    fontSize: 10.5,
                    fontWeight: 700,
                    cursor: pedestrianRequested || pin8Red ? 'not-allowed' : 'pointer',
                  }}
                >
                  {pedestrianRequested ? 'Walk Signal Queued...' : '🚶 Push Pedestrian Crosswalk Button'}
                </button>
              )}
            </div>
          </div>

          {/* Real-Time Logic Analyzer Scope */}
          <div
            style={{
              background: '#040812',
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ fontSize: 9.5, fontWeight: 700, fontFamily: "'JetBrains Mono'", color: '#94a3b8' }}>
                  LOGIC ANALYZER TIMING WAVEFORM
                </span>
              </div>
              <span style={{ fontSize: 9, color: '#64748b', fontFamily: "'JetBrains Mono'" }}>
                80ms/sample
              </span>
            </div>

            <div style={{ position: 'relative', width: '100%', height: 86, background: '#030712', borderRadius: 4, overflow: 'hidden' }}>
              <canvas
                ref={waveformCanvasRef}
                width={380}
                height={86}
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
              <div style={{ position: 'absolute', left: 4, top: 4, fontSize: 8.5, color: '#ef4444', fontWeight: 800, fontFamily: "'JetBrains Mono'" }}>
                CH1: D8 (RED)
              </div>
              <div style={{ position: 'absolute', left: 4, top: 32, fontSize: 8.5, color: '#f59e0b', fontWeight: 800, fontFamily: "'JetBrains Mono'" }}>
                CH2: D9 (YEL)
              </div>
              <div style={{ position: 'absolute', left: 4, top: 60, fontSize: 8.5, color: '#10b981', fontWeight: 800, fontFamily: "'JetBrains Mono'" }}>
                CH3: D10 (GRN)
              </div>
            </div>
          </div>

          {/* ATmega328P Chip Current & Power Budget Meter */}
          <div
            style={{
              background: T.surfaceAlt,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
              <span style={{ fontWeight: 700, color: T.text }}>Active GPIO Current Load:</span>
              <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 800, color: T.primary }}>
                {currentDrawTotal} mA <span style={{ color: T.textMuted }}>/ 200 mA Max</span>
              </span>
            </div>
            <div style={{ width: '100%', height: 6, background: T.surface, borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, (parseFloat(currentDrawTotal) / 40) * 100)}%`,
                  height: '100%',
                  background: parseFloat(currentDrawTotal) > 35 ? '#ef4444' : '#10b981',
                  transition: 'width 0.2s',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5, color: T.textSub }}>
              <span>Per Pin: ~13-14 mA (Safe &lt;20mA)</span>
              <span>ATmega328P Chip Limit: 200mA</span>
            </div>
          </div>

          {/* Manual Pin Override Toggles if in manual mode */}
          {cycleMode === 'manual' && (
            <div
              style={{
                background: T.surfaceAlt,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: 10,
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: T.text, marginBottom: 8 }}>
                Manual Pin Outputs:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {[
                  { name: 'Pin 8 (Red)', val: pin8Red, set: setPin8Red, c: '#ef4444' },
                  { name: 'Pin 9 (Yel)', val: pin9Yellow, set: setPin9Yellow, c: '#f59e0b' },
                  { name: 'Pin 10 (Grn)', val: pin10Green, set: setPin10Green, c: '#10b981' },
                ].map((p) => (
                  <button
                    key={p.name}
                    onClick={() => p.set(!p.val)}
                    style={{
                      background: p.val ? p.c : T.surface,
                      color: p.val ? '#ffffff' : T.textSub,
                      border: `1px solid ${p.val ? p.c : T.border}`,
                      borderRadius: 6,
                      padding: '6px 4px',
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {p.name}: {p.val ? 'HIGH' : 'LOW'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: OHM'S LAW & RESISTOR LAB ── */}
      {activeTab === 'ohms' && (
        <div
          style={{
            background: T.surfaceAlt,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: T.text }}>
              Ohm's Law LED Calculator
            </span>
            <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono'", color: T.primary, fontWeight: 700 }}>
              R = (Vcc - Vf) / If
            </span>
          </div>

          {/* LED Color / Vf Selector */}
          <div>
            <div style={{ fontSize: 10.5, color: T.textSub, marginBottom: 6 }}>
              Select LED Color & Forward Voltage (Vf):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              {[
                { name: 'Red', vf: 2.0, c: '#ef4444' },
                { name: 'Yellow', vf: 2.1, c: '#f59e0b' },
                { name: 'Green', vf: 3.0, c: '#10b981' },
                { name: 'Blue', vf: 3.2, c: '#3b82f6' },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => setCalcVf(item.vf)}
                  style={{
                    background: calcVf === item.vf ? item.c : T.surface,
                    color: calcVf === item.vf ? '#ffffff' : T.text,
                    border: `1px solid ${calcVf === item.vf ? item.c : T.border}`,
                    borderRadius: 6,
                    padding: '6px 4px',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {item.name} ({item.vf}V)
                </button>
              ))}
            </div>
          </div>

          {/* Target Forward Current Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, marginBottom: 4 }}>
              <span style={{ color: T.textSub }}>Target Current (If):</span>
              <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, color: T.primary }}>
                {calcCurrentmA} mA
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              value={calcCurrentmA}
              onChange={(e) => setCalcCurrentmA(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: T.primary }}
            />
          </div>

          {/* Calculation Card */}
          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.primaryBorder}`,
              borderRadius: 8,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <span style={{ color: T.textSub }}>Ideal Resistance:</span>
              <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700 }}>
                {requiredR} Ω
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <span style={{ color: T.textSub }}>Standard E12 Resistor:</span>
              <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 800, color: T.green }}>
                {nearestE12} Ω
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <span style={{ color: T.textSub }}>Actual Forward Current:</span>
              <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700 }}>
                {actualCurrentmA} mA
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
              <span style={{ color: T.textSub }}>Resistor Power (P = I²R):</span>
              <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700 }}>
                {resistorPowerMw} mW <span style={{ color: T.textMuted }}>(&lt; 250mW 1/4W limit)</span>
              </span>
            </div>

            {/* Resistor Color Code Bands for 220 Ohm */}
            {nearestE12 === 220 && (
              <div
                style={{
                  marginTop: 6,
                  padding: 8,
                  background: T.surfaceAlt,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 10, color: T.textSub }}>220Ω Color Bands:</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <span style={{ background: '#ef4444', color: '#fff', fontSize: 8.5, padding: '2px 5px', borderRadius: 3, fontWeight: 700 }}>RED (2)</span>
                  <span style={{ background: '#ef4444', color: '#fff', fontSize: 8.5, padding: '2px 5px', borderRadius: 3, fontWeight: 700 }}>RED (2)</span>
                  <span style={{ background: '#92400e', color: '#fff', fontSize: 8.5, padding: '2px 5px', borderRadius: 3, fontWeight: 700 }}>BRN (×10)</span>
                  <span style={{ background: '#eab308', color: '#000', fontSize: 8.5, padding: '2px 5px', borderRadius: 3, fontWeight: 700 }}>GLD (±5%)</span>
                </div>
              </div>
            )}
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
            Day 1 Point-to-Point Breadboard Pinout
          </div>
          <p style={{ fontSize: 10.5, color: T.textSub, lineHeight: 1.5, margin: 0 }}>
            Ensure LED cathodes (shorter lead) connect to the 220Ω resistors, and anodes (longer lead) connect to the Arduino GPIO pins.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { from: 'Uno Pin 8', to: 'Breadboard Row 15e', net: 'Red Anode (+)', color: '#ef4444' },
              { from: 'Uno Pin 9', to: 'Breadboard Row 20e', net: 'Yellow Anode (+)', color: '#f59e0b' },
              { from: 'Uno Pin 10', to: 'Breadboard Row 25e', net: 'Green Anode (+)', color: '#10b981' },
              { from: 'Row 16a (Cathode -)', to: 'Blue (-) Rail', net: '220Ω Resistor', color: '#64748b' },
              { from: 'Row 21a (Cathode -)', to: 'Blue (-) Rail', net: '220Ω Resistor', color: '#64748b' },
              { from: 'Row 26a (Cathode -)', to: 'Blue (-) Rail', net: '220Ω Resistor', color: '#64748b' },
              { from: 'Uno GND Header', to: 'Blue (-) Ground Rail', net: 'Common Ground Return', color: '#000000' },
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
