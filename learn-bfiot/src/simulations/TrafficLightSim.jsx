import React, { useState, useEffect, useRef } from 'react';

export default function TrafficLightSim({ T }) {
  // Traffic cycle state: 0=Green, 1=Yellow, 2=Red, 3=Red+Yellow
  const [cycleMode, setCycleMode] = useState('auto'); // 'auto', 'pedestrian', 'manual'
  const [trafficState, setTrafficState] = useState('GREEN'); // 'GREEN', 'YELLOW', 'RED', 'RED_YELLOW', 'HAZARD_FLIP'
  const [pedestrianRequested, setPedestrianRequested] = useState(false);
  const [hazardFlashing, setHazardFlashing] = useState(false);
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
  const actualCurrentmA = ((vcc - calcVf) / nearestE12 * 1000).toFixed(1);

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

  // Hazard mode flasher
  useEffect(() => {
    if (cycleMode !== 'hazard') return;
    const interval = setInterval(() => {
      setFlashTick(prev => !prev);
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
    <div style={{
      background: T?.surface || '#080f1c',
      border: `1px solid ${T?.border || '#111d33'}`,
      borderRadius: 14,
      padding: 24,
      fontFamily: "'Inter', sans-serif",
      color: T?.text || '#e8edf5',
      marginBottom: 32,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: cycleMode === 'auto' ? '#22c55e' : (cycleMode === 'hazard' ? '#f59e0b' : '#3b82f6'),
            boxShadow: `0 0 12px ${cycleMode === 'auto' ? '#22c55e' : (cycleMode === 'hazard' ? '#f59e0b' : '#3b82f6')}`
          }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: 0.5 }}>
            Arduino Uno R3 · 3-Phase Traffic & Pedestrian Signal Controller
          </h3>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', gap: 6, background: T?.bg || '#04080f', padding: 4, borderRadius: 8, border: `1px solid ${T?.border || '#111d33'}` }}>
          {[
            { id: 'auto', label: 'Auto Sequence' },
            { id: 'hazard', label: 'Standby Flasher' },
            { id: 'manual', label: 'Manual Pin Overrides' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => {
                setCycleMode(m.id);
                if (m.id === 'auto') setTrafficState('GREEN');
              }}
              style={{
                background: cycleMode === m.id ? (T?.primary || '#4f4dc8') : 'transparent',
                color: cycleMode === m.id ? '#fff' : (T?.textSub || '#4a5a78'),
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Traffic Signal + Virtual Breadboard + Telemetry */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) 1.5fr', gap: 24, marginBottom: 24 }}>
        
        {/* Left: Physical Traffic Light Housing */}
        <div style={{
          background: '#030712',
          border: '2px solid #1f2937',
          borderRadius: 20,
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.8), 0 10px 25px rgba(0,0,0,0.5)',
          position: 'relative'
        }}>
          {/* Signal Visor Housing */}
          <div style={{
            background: '#111827',
            border: '2px solid #374151',
            borderRadius: 36,
            padding: '16px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            boxShadow: '0 8px 20px rgba(0,0,0,0.6)'
          }}>
            {/* Red Light (Pin 8) */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: pin8Red ? '#ef4444' : '#300a0a',
                border: '3px solid #1f2937',
                boxShadow: pin8Red ? '0 0 35px #ef4444, inset 0 -4px 12px rgba(0,0,0,0.4)' : 'inset 0 4px 8px rgba(0,0,0,0.8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: pin8Red ? '#fff' : '#661a1a', fontFamily: "'JetBrains Mono',monospace" }}>PIN 8</span>
              </div>
            </div>

            {/* Yellow Light (Pin 9) */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: pin9Yellow ? '#f59e0b' : '#332005',
                border: '3px solid #1f2937',
                boxShadow: pin9Yellow ? '0 0 35px #f59e0b, inset 0 -4px 12px rgba(0,0,0,0.4)' : 'inset 0 4px 8px rgba(0,0,0,0.8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: pin9Yellow ? '#fff' : '#664005', fontFamily: "'JetBrains Mono',monospace" }}>PIN 9</span>
              </div>
            </div>

            {/* Green Light (Pin 10) */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: pin10Green ? '#10b981' : '#04281b',
                border: '3px solid #1f2937',
                boxShadow: pin10Green ? '0 0 35px #10b981, inset 0 -4px 12px rgba(0,0,0,0.4)' : 'inset 0 4px 8px rgba(0,0,0,0.8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: pin10Green ? '#fff' : '#085038', fontFamily: "'JetBrains Mono',monospace" }}>PIN 10</span>
              </div>
            </div>
          </div>

          {/* Pedestrian Crossing Status */}
          <div style={{ marginTop: 20, width: '100%', textAlign: 'center' }}>
            <div style={{
              background: '#090d16',
              border: `1px solid ${pin8Red ? '#ef4444' : '#1e293b'}`,
              borderRadius: 10,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12
            }}>
              <span style={{ fontSize: 12, color: T?.textSub || '#64748b' }}>Pedestrian Status:</span>
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: pin8Red ? '#10b981' : '#ef4444',
                fontFamily: "'JetBrains Mono', monospace"
              }}>
                {pin8Red ? 'WALK 🚶' : 'DON\'T WALK ✋'}
              </span>
            </div>

            {cycleMode === 'auto' && (
              <button
                onClick={() => setPedestrianRequested(true)}
                disabled={pedestrianRequested || pin8Red}
                style={{
                  width: '100%',
                  background: pedestrianRequested ? '#059669' : '#1e293b',
                  color: '#fff',
                  border: `1px solid ${pedestrianRequested ? '#10b981' : '#334155'}`,
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: (pedestrianRequested || pin8Red) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <span>🔘</span> {pedestrianRequested ? 'Walk Signal Queued...' : 'Press to Cross Street'}
              </button>
            )}
          </div>
        </div>

        {/* Right: Breadboard Schematic Wiring & Code Monitor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Hardware Pin Mapping Panel */}
          <div style={{
            background: T?.surfaceAlt || '#0c1525',
            border: `1px solid ${T?.border || '#111d33'}`,
            borderRadius: 12,
            padding: 18
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T?.primary || '#818cf8', fontFamily: "'JetBrains Mono', monospace", marginBottom: 12 }}>
              ARDUINO UNO R3 GPIO TO RESISTOR WIRING
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { pin: 8, color: '#ef4444', name: 'RED LED', active: pin8Red, toggle: () => setPin8Red(p => !p) },
                { pin: 9, color: '#f59e0b', name: 'YELLOW LED', active: pin9Yellow, toggle: () => setPin9Yellow(p => !p) },
                { pin: 10, color: '#10b981', name: 'GREEN LED', active: pin10Green, toggle: () => setPin10Green(p => !p) }
              ].map(item => (
                <div key={item.pin} style={{
                  background: T?.bg || '#04080f',
                  border: `1px solid ${item.active ? item.color : (T?.border || '#111d33')}`,
                  borderRadius: 8,
                  padding: 12,
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}>
                  <div style={{ fontSize: 11, color: T?.textSub || '#64748b', marginBottom: 4 }}>DIGITAL PIN {item.pin}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: item.color, marginBottom: 8 }}>{item.name}</div>
                  <div style={{
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: item.active ? `${item.color}22` : '#111827',
                    color: item.active ? item.color : '#475569',
                    fontWeight: 700,
                    marginBottom: 8
                  }}>
                    {item.active ? 'HIGH (5.0V)' : 'LOW (0.0V)'}
                  </div>
                  <div style={{ fontSize: 10, color: T?.textSub || '#64748b' }}>Series: 220Ω → Cathode GND</div>

                  {cycleMode === 'manual' && (
                    <button
                      onClick={item.toggle}
                      style={{
                        marginTop: 10,
                        width: '100%',
                        background: item.active ? item.color : '#1e293b',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '6px 0',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {item.active ? 'Turn OFF' : 'Turn ON'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Microcontroller State Machine Monitor */}
          <div style={{
            background: '#040810',
            border: `1px solid ${T?.border || '#111d33'}`,
            borderRadius: 12,
            padding: 16,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12
          }}>
            <div style={{ color: '#64748b', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span>ACTIVE C++ STATE MACHINE</span>
              <span style={{ color: '#22c55e' }}>loop() ACTIVE</span>
            </div>
            <div style={{ color: '#e2e8f0', lineHeight: 1.6 }}>
              {cycleMode === 'auto' && (
                <>
                  <span style={{ color: '#818cf8' }}>switch</span> (currentState) {'{\n'}
                  {'  '}case <span style={{ color: '#38bdf8' }}>STATE_{trafficState}</span>: {'\n'}
                  {'    '}digitalWrite(8, {pin8Red ? 'HIGH' : 'LOW'}); // Red{'\n'}
                  {'    '}digitalWrite(9, {pin9Yellow ? 'HIGH' : 'LOW'}); // Yellow{'\n'}
                  {'    '}digitalWrite(10, {pin10Green ? 'HIGH' : 'LOW'}); // Green{'\n'}
                  {'}'}
                </>
              )}
              {cycleMode === 'hazard' && (
                <>
                  <span style={{ color: '#f59e0b' }}>// Standby Hazard Mode (Pedestrian Flasher)</span>{'\n'}
                  digitalWrite(9, {flashTick ? 'HIGH' : 'LOW'}); // 1Hz Yellow Beacon{'\n'}
                  delay(500);
                </>
              )}
              {cycleMode === 'manual' && (
                <>
                  <span style={{ color: '#38bdf8' }}>// Direct GPIO Register Output</span>{'\n'}
                  PORTB = (Pin 8: {pin8Red ? 1 : 0}, Pin 9: {pin9Yellow ? 1 : 0}, Pin 10: {pin10Green ? 1 : 0});
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Ohm's Law Calculator Section */}
      <div style={{
        background: T?.bg || '#04080f',
        border: `1px solid ${T?.border || '#111d33'}`,
        borderTop: `2px solid ${T?.primary || '#4f4dc8'}`,
        borderRadius: 12,
        padding: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T?.text || '#fff' }}>
              📐 In-Class Concept Tool: Current-Limiting Resistor Calculator
            </div>
            <div style={{ fontSize: 12, color: T?.textSub || '#64748b' }}>
              Formula: R = (Vcc - Vf) / If | ATmega328P Max GPIO Rating: 40mA (Safe limit: 20mA)
            </div>
          </div>
          <div style={{
            background: actualCurrentmA > 20 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
            border: `1px solid ${actualCurrentmA > 20 ? '#ef4444' : '#22c55e'}`,
            color: actualCurrentmA > 20 ? '#ef4444' : '#22c55e',
            borderRadius: 6,
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 700
          }}>
            {actualCurrentmA > 20 ? '⚠️ High Current Risk' : '✓ Safe GPIO Operation'}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: 11, color: T?.textSub || '#64748b', display: 'block', marginBottom: 6 }}>
              LED Color / Forward Voltage (Vf):
            </label>
            <select
              value={calcVf}
              onChange={(e) => setCalcVf(parseFloat(e.target.value))}
              style={{
                width: '100%',
                background: T?.surface || '#080f1c',
                border: `1px solid ${T?.border || '#111d33'}`,
                color: T?.text || '#fff',
                padding: '8px 10px',
                borderRadius: 6,
                fontSize: 12
              }}
            >
              <option value="2.0">Red / Yellow LED (~2.0V)</option>
              <option value="3.0">Green LED (~3.0V)</option>
              <option value="3.2">Blue / White LED (~3.2V)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, color: T?.textSub || '#64748b', display: 'block', marginBottom: 6 }}>
              Target Forward Current (If): <strong style={{ color: T?.primary || '#818cf8' }}>{calcCurrentmA} mA</strong>
            </label>
            <input
              type="range"
              min="5"
              max="35"
              value={calcCurrentmA}
              onChange={(e) => setCalcCurrentmA(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: T?.primary || '#4f4dc8' }}
            />
          </div>

          <div style={{
            background: T?.surface || '#080f1c',
            border: `1px solid ${T?.border || '#111d33'}`,
            borderRadius: 8,
            padding: '12px 16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 10, color: T?.textSub || '#64748b' }}>CALCULATED RESISTANCE</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace" }}>
              {requiredR} Ω
            </div>
            <div style={{ fontSize: 11, color: T?.textSub || '#64748b', marginTop: 2 }}>
              Nearest E12: <strong style={{ color: '#fff' }}>{nearestE12} Ω</strong> (Actual: {actualCurrentmA} mA)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
