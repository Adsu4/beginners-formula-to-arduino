import React, { useState, useEffect, useRef } from 'react';

export default function AdcSerialTelemetrySim({ T }) {
  // Pin 2 Push Button (INPUT_PULLUP)
  const [buttonPressed, setButtonPressed] = useState(false);
  const [debounceEnabled, setDebounceEnabled] = useState(true);

  // Analog Inputs
  const [potRaw, setPotRaw] = useState(512); // A0: 0-1023
  const [ambientLux, setAmbientLux] = useState(65); // A1 (LDR): 0-100%

  // LDR calculation: LDR resistance decreases with light
  const rLdr = Math.round(1000 + (100 - ambientLux) * 450);
  const ldrAdc = Math.round(1023 * (10000 / (rLdr + 10000)));

  // Hysteresis Settings (Night Light)
  const [threshOn] = useState(350); // Below 350: Turn LED ON
  const [threshOff] = useState(450); // Above 450: Turn LED OFF
  const [nightLightLed, setNightLightLed] = useState(false);

  // Serial Monitor Log Buffer
  const [serialLogs, setSerialLogs] = useState([
    '[INIT] Hardware UART: 9600 baud.',
    'A0_POT: 512 (2.50V) | PIN2: HIGH (1)',
    'A1_LDR: 620 (3.03V) | LED: OFF',
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
      const entry = `[${timestamp}] A0:${potRaw} (${potVoltage}V) | LDR:${ldrAdc} (${ldrVoltage}V) | P2:${pin2State}`;

      setSerialLogs((prev) => [...prev.slice(-25), entry]);
    }, 1400);

    return () => clearInterval(interval);
  }, [potRaw, potVoltage, ldrAdc, ldrVoltage, buttonPressed, nightLightLed, serialPaused]);

  // Autoscroll serial monitor
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [serialLogs]);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Title & Quantization Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
          10-Bit ADC & Serial Telemetry
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
          4.887 mV / ADC step
        </span>
      </div>

      {/* Push Button (Pin 2 with INPUT_PULLUP) */}
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
            Digital Pin 2 · INPUT_PULLUP
          </span>
          <span
            style={{
              fontSize: 10,
              fontFamily: "'JetBrains Mono'",
              fontWeight: 700,
              color: buttonPressed ? '#ef4444' : '#10b981',
            }}
          >
            {buttonPressed ? 'LOW (0V / Pressed)' : 'HIGH (5V / Idle)'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onMouseDown={() => setButtonPressed(true)}
            onMouseUp={() => setButtonPressed(false)}
            onTouchStart={() => setButtonPressed(true)}
            onTouchEnd={() => setButtonPressed(false)}
            style={{
              flex: 1,
              background: buttonPressed ? T.primary : T.surface,
              color: buttonPressed ? '#ffffff' : T.text,
              border: `2px solid ${buttonPressed ? T.primary : T.border}`,
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: buttonPressed ? 'inset 0 2px 4px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'all 0.1s ease',
            }}
          >
            {buttonPressed ? '🔘 Pressed (Pin 2 → GND)' : '⚪ Press & Hold Button'}
          </button>

          <button
            onClick={() => setDebounceEnabled(!debounceEnabled)}
            style={{
              background: debounceEnabled ? T.greenBg : T.surface,
              color: debounceEnabled ? T.green : T.textSub,
              border: `1px solid ${debounceEnabled ? T.greenBorder : T.border}`,
              borderRadius: 6,
              padding: '8px 10px',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {debounceEnabled ? '✓ Debounced' : 'Bouncy'}
          </button>
        </div>
      </div>

      {/* Analog Sensors: Potentiometer (A0) & LDR (A1) */}
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
        {/* Potentiometer A0 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
            <span style={{ fontWeight: 700, color: T.text }}>A0 · Rotary Potentiometer</span>
            <span style={{ fontFamily: "'JetBrains Mono'", color: T.primary, fontWeight: 700 }}>
              {potRaw} <span style={{ color: T.textMuted }}>({potVoltage}V)</span>
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1023"
            value={potRaw}
            onChange={(e) => setPotRaw(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: T.primary }}
          />
        </div>

        {/* LDR A1 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
            <span style={{ fontWeight: 700, color: T.text }}>A1 · LDR Ambient Light Sensor</span>
            <span style={{ fontFamily: "'JetBrains Mono'", color: '#f59e0b', fontWeight: 700 }}>
              {ldrAdc} <span style={{ color: T.textMuted }}>({ldrVoltage}V)</span>
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={ambientLux}
            onChange={(e) => setAmbientLux(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#f59e0b' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: T.textSub, marginTop: 2 }}>
            <span>Dark (~50kΩ)</span>
            <span>Lux: {ambientLux}%</span>
            <span>Bright (~1kΩ)</span>
          </div>
        </div>
      </div>

      {/* Software Hysteresis Night Light Status */}
      <div
        style={{
          background: T.surfaceAlt,
          border: `1px solid ${nightLightLed ? '#10b981' : T.border}`,
          borderRadius: 8,
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.text }}>
            Hysteresis Night-Light (Pin 13)
          </div>
          <div style={{ fontSize: 9.5, color: T.textSub }}>
            ON if &lt;{threshOn} | OFF if &gt;{threshOff}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 6,
            background: nightLightLed ? 'rgba(16,185,129,0.15)' : T.surface,
            border: `1px solid ${nightLightLed ? '#10b981' : T.border}`,
            color: nightLightLed ? '#10b981' : T.textMuted,
            fontSize: 11,
            fontWeight: 800,
            fontFamily: "'JetBrains Mono'",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: nightLightLed ? '#10b981' : '#64748b',
              boxShadow: nightLightLed ? '0 0 8px #10b981' : 'none',
            }}
          />
          {nightLightLed ? 'LED ON' : 'LED OFF'}
        </div>
      </div>

      {/* Virtual Serial Monitor (9600 Baud) */}
      <div
        style={{
          background: '#040810',
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          overflow: 'hidden',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <div
          style={{
            background: '#0b1324',
            padding: '6px 10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #1e293b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#94a3b8' }}>
            <span style={{ color: '#22c55e' }}>●</span>
            SERIAL MONITOR (9600 BAUD)
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setSerialPaused(!serialPaused)}
              style={{
                background: 'transparent',
                border: 'none',
                color: serialPaused ? '#f59e0b' : '#38bdf8',
                fontSize: 10,
                cursor: 'pointer',
              }}
            >
              {serialPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={() => setSerialLogs([])}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: 10,
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          </div>
        </div>

        <div
          ref={logContainerRef}
          style={{
            padding: '8px 10px',
            height: 100,
            overflowY: 'auto',
            fontSize: 10,
            color: '#38bdf8',
            lineHeight: 1.6,
          }}
        >
          {serialLogs.map((log, i) => (
            <div key={i} style={{ whiteSpace: 'nowrap' }}>
              &gt; {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
