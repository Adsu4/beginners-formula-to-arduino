import React, { useState, useEffect } from 'react';

export default function TrafficLightSim({ T }) {
  // Traffic cycle state: 'GREEN', 'YELLOW', 'RED', 'RED_YELLOW'
  const [cycleMode, setCycleMode] = useState('auto'); // 'auto', 'hazard', 'manual'
  const [trafficState, setTrafficState] = useState('GREEN');
  const [pedestrianRequested, setPedestrianRequested] = useState(false);
  const [flashTick, setFlashTick] = useState(false);

  // Manual pin states
  const [pin8Red, setPin8Red] = useState(false);
  const [pin9Yellow, setPin9Yellow] = useState(false);
  const [pin10Green, setPin10Green] = useState(true);

  // Ohm's Law Calculator states
  const [calcVf, setCalcVf] = useState(2.0); // 2.0V for Red/Yellow, 3.0V for Green
  const [calcCurrentmA, setCalcCurrentmA] = useState(15); // 15mA safe
  const vcc = 5.0; // Arduino Uno 5V

  const requiredR = Math.round((vcc - calcVf) / (calcCurrentmA / 1000));
  const nearestE12 = [100, 150, 180, 220, 270, 330, 470, 560, 680, 1000].reduce((prev, curr) =>
    Math.abs(curr - requiredR) < Math.abs(prev - requiredR) ? curr : prev
  );
  const actualCurrentmA = (((vcc - calcVf) / nearestE12) * 1000).toFixed(1);

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

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Title & Mode Switcher */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
            Traffic & Pedestrian Signal
          </span>
          <span
            style={{
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              padding: '2px 8px',
              borderRadius: 4,
              background: cycleMode === 'auto' ? T.greenBg : T.primaryBg,
              color: cycleMode === 'auto' ? T.green : T.primary,
              border: `1px solid ${cycleMode === 'auto' ? T.greenBorder : T.primaryBorder}`,
              fontWeight: 700,
            }}
          >
            {cycleMode === 'auto' ? '● AUTO CYCLE' : cycleMode === 'hazard' ? '● 1Hz FLASHER' : '● MANUAL'}
          </span>
        </div>

        {/* Mode Selector Tabs */}
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
            { id: 'auto', label: 'Auto' },
            { id: 'hazard', label: 'Standby' },
            { id: 'manual', label: 'Manual' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setCycleMode(m.id);
                if (m.id === 'auto') setTrafficState('GREEN');
              }}
              style={{
                background: cycleMode === m.id ? T.primary : 'transparent',
                color: cycleMode === m.id ? '#ffffff' : T.textSub,
                border: 'none',
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Traffic Light Housing & Pedestrian Module (Compact Horizontal or Vertical Card) */}
      <div
        style={{
          background: '#030712',
          border: '1px solid #1f2937',
          borderRadius: 14,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.6)',
        }}
      >
        {/* Signal Visor Chassis */}
        <div
          style={{
            background: '#111827',
            border: '2px solid #374151',
            borderRadius: 28,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
          }}
        >
          {/* Red Light (Pin 8) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: pin8Red ? '#ef4444' : '#280808',
                border: '2px solid #1f2937',
                boxShadow: pin8Red
                  ? '0 0 25px #ef4444, inset 0 -3px 8px rgba(0,0,0,0.4)'
                  : 'inset 0 3px 6px rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: pin8Red ? '#ffffff' : '#5c1414',
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                PIN 8
              </span>
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', fontFamily: "'JetBrains Mono'" }}>RED</span>
          </div>

          {/* Yellow Light (Pin 9) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: pin9Yellow ? '#f59e0b' : '#2a1b04',
                border: '2px solid #1f2937',
                boxShadow: pin9Yellow
                  ? '0 0 25px #f59e0b, inset 0 -3px 8px rgba(0,0,0,0.4)'
                  : 'inset 0 3px 6px rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: pin9Yellow ? '#ffffff' : '#6b4305',
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                PIN 9
              </span>
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#f59e0b', fontFamily: "'JetBrains Mono'" }}>YELLOW</span>
          </div>

          {/* Green Light (Pin 10) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: pin10Green ? '#10b981' : '#032115',
                border: '2px solid #1f2937',
                boxShadow: pin10Green
                  ? '0 0 25px #10b981, inset 0 -3px 8px rgba(0,0,0,0.4)'
                  : 'inset 0 3px 6px rgba(0,0,0,0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: pin10Green ? '#ffffff' : '#084832',
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                PIN 10
              </span>
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#10b981', fontFamily: "'JetBrains Mono'" }}>GREEN</span>
          </div>
        </div>

        {/* Pedestrian Crossing Bar & Button */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            style={{
              background: '#090d16',
              border: `1px solid ${pin8Red ? '#10b981' : '#1e293b'}`,
              borderRadius: 8,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Pedestrian Status:</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
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
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 11,
                fontWeight: 700,
                cursor: pedestrianRequested || pin8Red ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {pedestrianRequested ? 'Walk Signal Queued...' : '🚶 Press to Request Crosswalk'}
            </button>
          )}
        </div>
      </div>

      {/* Hardware Pin Monitoring & Manual Controls */}
      <div
        style={{
          background: T.surfaceAlt,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: 12,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: T.primary,
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 8,
          }}
        >
          ARDUINO UNO R3 DIGITAL PINS & 220Ω RESISTORS
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { pin: 8, color: '#ef4444', name: 'RED', active: pin8Red, toggle: () => setPin8Red((p) => !p) },
            { pin: 9, color: '#f59e0b', name: 'YELLOW', active: pin9Yellow, toggle: () => setPin9Yellow((p) => !p) },
            { pin: 10, color: '#10b981', name: 'GREEN', active: pin10Green, toggle: () => setPin10Green((p) => !p) },
          ].map((item) => (
            <div
              key={item.pin}
              style={{
                background: T.surface,
                border: `1px solid ${item.active ? item.color : T.border}`,
                borderRadius: 6,
                padding: '8px 6px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 9, color: T.textSub, fontFamily: "'JetBrains Mono'" }}>PIN {item.pin}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: item.color, margin: '2px 0' }}>{item.name}</div>
              <div
                style={{
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: '2px 4px',
                  borderRadius: 3,
                  background: item.active ? `${item.color}22` : T.surfaceAlt,
                  color: item.active ? item.color : T.textMuted,
                  fontWeight: 700,
                }}
              >
                {item.active ? '5.0V' : '0.0V'}
              </div>

              {cycleMode === 'manual' && (
                <button
                  onClick={item.toggle}
                  style={{
                    marginTop: 6,
                    width: '100%',
                    background: item.active ? item.color : T.surfaceAlt,
                    color: item.active ? '#ffffff' : T.text,
                    border: `1px solid ${T.border}`,
                    borderRadius: 4,
                    padding: '4px 0',
                    fontSize: 9,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {item.active ? 'OFF' : 'ON'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* In-Class Concept Tool: Ohm's Law Calculator */}
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
            📐 Resistor Calculator (Ohm's Law)
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 4,
              background: actualCurrentmA > 20 ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
              color: actualCurrentmA > 20 ? '#ef4444' : '#10b981',
              border: `1px solid ${actualCurrentmA > 20 ? '#ef4444' : '#10b981'}`,
            }}
          >
            {actualCurrentmA > 20 ? '⚠️ >20mA Limit' : '✓ Safe GPIO'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <label style={{ fontSize: 10, color: T.textSub, display: 'block', marginBottom: 3 }}>
              LED Color / Forward Voltage (Vf):
            </label>
            <select
              value={calcVf}
              onChange={(e) => setCalcVf(parseFloat(e.target.value))}
              style={{
                width: '100%',
                background: T.surface,
                border: `1px solid ${T.border}`,
                color: T.text,
                padding: '6px 8px',
                borderRadius: 6,
                fontSize: 11,
              }}
            >
              <option value="2.0">Red / Yellow LED (~2.0V)</option>
              <option value="3.0">Green LED (~3.0V)</option>
              <option value="3.2">Blue / White LED (~3.2V)</option>
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.textSub }}>
              <span>Target Current (If):</span>
              <strong style={{ color: T.primary }}>{calcCurrentmA} mA</strong>
            </div>
            <input
              type="range"
              min="5"
              max="35"
              value={calcCurrentmA}
              onChange={(e) => setCalcCurrentmA(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: T.primary }}
            />
          </div>

          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              padding: '8px 10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 9, color: T.textSub }}>IDEAL RESISTANCE</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.primary, fontFamily: "'JetBrains Mono'" }}>
                {requiredR} Ω
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 9, color: T.textSub }}>NEAREST E12</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono'" }}>
                {nearestE12} Ω <span style={{ fontSize: 10, color: T.textMuted }}>({actualCurrentmA}mA)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active C++ State Machine Terminal */}
      <div
        style={{
          background: '#040810',
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          padding: 10,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10.5,
          color: '#e2e8f0',
          lineHeight: 1.5,
        }}
      >
        <div style={{ color: '#64748b', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
          <span>ARDUINO C++ STATE MACHINE</span>
          <span style={{ color: '#22c55e' }}>● loop()</span>
        </div>
        {cycleMode === 'auto' && (
          <div>
            <span style={{ color: '#818cf8' }}>switch</span> (state) &#123;{'\n'}
            {'  '}case <span style={{ color: '#38bdf8' }}>STATE_{trafficState}</span>:{'\n'}
            {'    '}digitalWrite(8, {pin8Red ? 'HIGH' : 'LOW'});{'\n'}
            {'    '}digitalWrite(9, {pin9Yellow ? 'HIGH' : 'LOW'});{'\n'}
            {'    '}digitalWrite(10, {pin10Green ? 'HIGH' : 'LOW'});{'\n'}
            &#125;
          </div>
        )}
        {cycleMode === 'hazard' && (
          <div>
            <span style={{ color: '#f59e0b' }}>// Standby Hazard 1Hz Flasher</span>{'\n'}
            digitalWrite(9, {flashTick ? 'HIGH' : 'LOW'});{'\n'}
            delay(500);
          </div>
        )}
        {cycleMode === 'manual' && (
          <div>
            <span style={{ color: '#38bdf8' }}>// Direct Pin Override</span>{'\n'}
            digitalWrite(8, {pin8Red ? 'HIGH' : 'LOW'});{'\n'}
            digitalWrite(9, {pin9Yellow ? 'HIGH' : 'LOW'});{'\n'}
            digitalWrite(10, {pin10Green ? 'HIGH' : 'LOW'});
          </div>
        )}
      </div>
    </div>
  );
}
