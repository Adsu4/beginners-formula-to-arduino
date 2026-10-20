import React, { useState, useEffect, useRef } from 'react';

export default function AdcSerialTelemetrySim({ T }) {
  // Pin 2 Push Button (INPUT_PULLUP)
  const [buttonPressed, setButtonPressed] = useState(false);
  const [debounceEnabled, setDebounceEnabled] = useState(true);

  // Analog Inputs
  const [potRaw, setPotRaw] = useState(512); // A0: 0-1023
  const [ambientLux, setAmbientLux] = useState(65); // A1 (LDR): 0-100%

  // LDR calculation: LDR resistance decreases with light
  // R_fixed = 10k. R_ldr ranges ~ 1k (bright) to 50k (dark)
  const rLdr = Math.round(1000 + (100 - ambientLux) * 450);
  const ldrAdc = Math.round(1023 * (10000 / (rLdr + 10000)));

  // Hysteresis Settings (Night Light)
  const [threshOn, setThreshOn] = useState(350); // Below 350: Turn LED ON
  const [threshOff, setThreshOff] = useState(450); // Above 450: Turn LED OFF
  const [nightLightLed, setNightLightLed] = useState(false);

  // Serial Monitor Log Buffer
  const [serialLogs, setSerialLogs] = useState([
    '[SYSTEM] Serial UART initialized at 9600 baud.',
    'A0_POT: 512 | V: 2.50V | BTN_PIN2: HIGH',
    'A1_LDR: 620 | V: 3.03V | NIGHT_LIGHT: OFF'
  ]);
  const [serialPaused, setSerialPaused] = useState(false);
  const logContainerRef = useRef(null);

  // Voltage conversions (5V Uno ADC: 4.887mV per unit)
  const potVoltage = ((potRaw * 5.0) / 1023).toFixed(2);
  const ldrVoltage = ((ldrAdc * 5.0) / 1023).toFixed(2);

  // Hysteresis calculation
  useEffect(() => {
    if (ldrAdc < threshOn) {
      setNightLightLed(true);
    } else if (ldrAdc > threshOff) {
      setNightLightLed(false);
    }
  }, [ldrAdc, threshOn, threshOff]);

  // Periodic Serial Telemetry Stream
  useEffect(() => {
    if (serialPaused) return;

    const interval = setInterval(() => {
      const pin2State = buttonPressed ? 'LOW (0)' : 'HIGH (1)';
      const timestamp = new Date().toLocaleTimeString().split(' ')[0];
      const entry = `[${timestamp}] A0:${potRaw} (${potVoltage}V) | LDR:${ldrAdc} (${ldrVoltage}V) | P2:${pin2State} | LED:${nightLightLed ? 'ON' : 'OFF'}`;

      setSerialLogs((prev) => [...prev.slice(-30), entry]);
    }, 1200);

    return () => clearInterval(interval);
  }, [potRaw, potVoltage, ldrAdc, ldrVoltage, buttonPressed, nightLightLed, serialPaused]);

  // Autoscroll serial monitor
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [serialLogs]);

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
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 12px #38bdf8' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
            Arduino Uno R3 · 10-Bit ADC, Pull-Up Logic & Serial Telemetry
          </h3>
        </div>
        <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: '#38bdf8', background: '#030b18', padding: '4px 10px', borderRadius: 6, border: '1px solid #0f2747' }}>
          ADC Quantization: 5.0V / 1023 ≈ 4.887 mV/step
        </div>
      </div>

      {/* Main Grid: Controls vs Live Telemetry */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) 1fr', gap: 24, marginBottom: 24 }}>
        
        {/* Left Column: Interactive Sensors & Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* Card 1: INPUT_PULLUP Button */}
          <div style={{ background: T?.surfaceAlt || '#0c1525', border: `1px solid ${T?.border || '#111d33'}`, borderRadius: 12, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', fontFamily: "'JetBrains Mono', monospace" }}>
                DIGITAL PIN 2 (pinMode: INPUT_PULLUP)
              </span>
              <button
                onClick={() => setDebounceEnabled(!debounceEnabled)}
                style={{
                  background: debounceEnabled ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                  color: debounceEnabled ? '#22c55e' : '#ef4444',
                  border: `1px solid ${debounceEnabled ? '#22c55e' : '#ef4444'}`,
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontSize: 10,
                  cursor: 'pointer'
                }}
              >
                {debounceEnabled ? '✓ Software Debounce Active' : '⚠ Bouncing Simulated'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                onMouseDown={() => setButtonPressed(true)}
                onMouseUp={() => setButtonPressed(false)}
                onTouchStart={() => setButtonPressed(true)}
                onTouchEnd={() => setButtonPressed(false)}
                style={{
                  width: 130,
                  height: 54,
                  borderRadius: 10,
                  background: buttonPressed ? '#1e293b' : '#334155',
                  color: '#fff',
                  border: '2px solid #64748b',
                  boxShadow: buttonPressed ? 'inset 0 4px 8px rgba(0,0,0,0.6)' : '0 6px 0 #1e293b, 0 8px 16px rgba(0,0,0,0.4)',
                  transform: buttonPressed ? 'translateY(4px)' : 'none',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'transform 0.05s, box-shadow 0.05s'
                }}
              >
                {buttonPressed ? 'PRESSED' : 'HOLD ME'}
              </button>

              <div style={{ flex: 1, background: T?.bg || '#04080f', padding: 10, borderRadius: 8, border: `1px solid ${T?.border || '#111d33'}`, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                <div>Internal 30kΩ: <span style={{ color: '#22c55e' }}>VCC 5V Tied</span></div>
                <div>Logic Read: <strong style={{ color: buttonPressed ? '#ef4444' : '#22c55e' }}>{buttonPressed ? 'LOW (0V)' : 'HIGH (5V)'}</strong></div>
                <div style={{ color: T?.textSub || '#64748b', fontSize: 10, marginTop: 4 }}>
                  {buttonPressed ? 'GND closed circuit.' : 'Open circuit held high.'}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: 10k Potentiometer (Analog Pin A0) */}
          <div style={{ background: T?.surfaceAlt || '#0c1525', border: `1px solid ${T?.border || '#111d33'}`, borderRadius: 12, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace" }}>
                ANALOG PIN A0 · 10kΩ ROTARY POTENTIOMETER
              </span>
              <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: '#fff' }}>
                ADC: <strong style={{ color: '#38bdf8' }}>{potRaw}</strong> / 1023
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="1023"
              value={potRaw}
              onChange={(e) => setPotRaw(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8', marginBottom: 10 }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
              <div style={{ background: T?.bg || '#04080f', padding: 6, borderRadius: 6, fontSize: 11 }}>
                <div style={{ color: T?.textSub || '#64748b', fontSize: 9 }}>WIPER VOLTAGE</div>
                <div style={{ color: '#fff', fontWeight: 700 }}>{potVoltage} V</div>
              </div>
              <div style={{ background: T?.bg || '#04080f', padding: 6, borderRadius: 6, fontSize: 11 }}>
                <div style={{ color: T?.textSub || '#64748b', fontSize: 9 }}>MAPPED BLINK RATE</div>
                <div style={{ color: '#22c55e', fontWeight: 700 }}>{Math.round(potRaw * 1.5) + 50} ms</div>
              </div>
              <div style={{ background: T?.bg || '#04080f', padding: 6, borderRadius: 6, fontSize: 11 }}>
                <div style={{ color: T?.textSub || '#64748b', fontSize: 9 }}>ADC RESOLUTION</div>
                <div style={{ color: '#818cf8', fontWeight: 700 }}>10-Bit (1024)</div>
              </div>
            </div>
          </div>

          {/* Card 3: LDR Voltage Divider (Analog Pin A1) */}
          <div style={{ background: T?.surfaceAlt || '#0c1525', border: `1px solid ${T?.border || '#111d33'}`, borderRadius: 12, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#ec4899', fontFamily: "'JetBrains Mono', monospace" }}>
                ANALOG PIN A1 · LDR VOLTAGE DIVIDER
              </span>
              <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: '#fff' }}>
                Lux: <strong style={{ color: '#ec4899' }}>{ambientLux}%</strong>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <span>🌑</span>
              <input
                type="range"
                min="0"
                max="100"
                value={ambientLux}
                onChange={(e) => setAmbientLux(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#ec4899' }}
              />
              <span>☀️</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
              <div style={{ background: T?.bg || '#04080f', padding: 6, borderRadius: 6, fontSize: 11 }}>
                <div style={{ color: T?.textSub || '#64748b', fontSize: 9 }}>LDR RESISTANCE</div>
                <div style={{ color: '#fff', fontWeight: 700 }}>{(rLdr / 1000).toFixed(1)} kΩ</div>
              </div>
              <div style={{ background: T?.bg || '#04080f', padding: 6, borderRadius: 6, fontSize: 11 }}>
                <div style={{ color: T?.textSub || '#64748b', fontSize: 9 }}>ADC READING</div>
                <div style={{ color: '#ec4899', fontWeight: 700 }}>{ldrAdc}</div>
              </div>
              <div style={{ background: T?.bg || '#04080f', padding: 6, borderRadius: 6, fontSize: 11 }}>
                <div style={{ color: T?.textSub || '#64748b', fontSize: 9 }}>DIVIDER VOUT</div>
                <div style={{ color: '#fff', fontWeight: 700 }}>{ldrVoltage} V</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Serial Monitor & Hysteresis Night Light HUD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* Virtual Arduino Serial Monitor */}
          <div style={{
            background: '#020617',
            border: '1px solid #1e293b',
            borderRadius: 12,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            height: 290
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottom: '1px solid #1e293b', paddingBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: serialPaused ? '#ef4444' : '#22c55e' }} />
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#e2e8f0' }}>
                  Serial Monitor [COM3 @ 9600 baud]
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setSerialPaused(!serialPaused)}
                  style={{ background: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 10, cursor: 'pointer' }}
                >
                  {serialPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={() => setSerialLogs([])}
                  style={{ background: '#1e293b', color: '#94a3b8', border: 'none', borderRadius: 4, padding: '3px 8px', fontSize: 10, cursor: 'pointer' }}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Serial stream terminal */}
            <div
              ref={logContainerRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                lineHeight: 1.6,
                color: '#38bdf8',
                paddingRight: 4
              }}
            >
              {serialLogs.map((log, index) => (
                <div key={index} style={{ color: log.includes('SYSTEM') ? '#f59e0b' : (log.includes('LED:ON') ? '#22c55e' : '#94a3b8') }}>
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Hysteresis Stabilizer (Homework Concept) */}
          <div style={{
            background: T?.surfaceAlt || '#0c1525',
            border: `1px solid ${T?.border || '#111d33'}`,
            borderRadius: 12,
            padding: 18
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e', fontFamily: "'JetBrains Mono', monospace" }}>
                HYSTERESIS-STABILIZED NIGHT LIGHT (PIN 13)
              </span>
              <div style={{
                background: nightLightLed ? '#22c55e' : '#334155',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 12,
                boxShadow: nightLightLed ? '0 0 16px #22c55e' : 'none'
              }}>
                {nightLightLed ? '💡 LED ON' : 'LED OFF'}
              </div>
            </div>

            <div style={{ fontSize: 11, color: T?.textSub || '#64748b', lineHeight: 1.5, marginBottom: 12 }}>
              Hysteresis creates a deadband to eliminate rapid lamp fluttering at twilight:
            </div>

            {/* Visual Threshold Bar */}
            <div style={{ position: 'relative', height: 26, background: '#020617', borderRadius: 6, overflow: 'hidden', border: '1px solid #1e293b', marginBottom: 10 }}>
              {/* ON zone */}
              <div style={{ position: 'absolute', left: 0, width: `${(threshOn / 1023) * 100}%`, height: '100%', background: 'rgba(34, 197, 94, 0.25)' }} />
              {/* Deadband zone */}
              <div style={{ position: 'absolute', left: `${(threshOn / 1023) * 100}%`, width: `${((threshOff - threshOn) / 1023) * 100}%`, height: '100%', background: 'rgba(245, 158, 11, 0.15)' }} />
              {/* OFF zone */}
              <div style={{ position: 'absolute', left: `${(threshOff / 1023) * 100}%`, right: 0, height: '100%', background: 'rgba(239, 68, 68, 0.15)' }} />

              {/* Current LDR marker needle */}
              <div style={{
                position: 'absolute',
                left: `${(ldrAdc / 1023) * 100}%`,
                top: 0, bottom: 0, width: 3,
                background: '#fff',
                boxShadow: '0 0 8px #fff',
                transition: 'left 0.1s'
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#94a3b8' }}>
              <span>Turn ON: &lt; {threshOn}</span>
              <span style={{ color: '#f59e0b' }}>Deadband: {threshOn} - {threshOff}</span>
              <span>Turn OFF: &gt; {threshOff}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
