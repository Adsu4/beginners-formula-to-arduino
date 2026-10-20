import React, { useState, useEffect, useRef } from 'react';

export default function AdcSerialTelemetrySim({ T }) {
  // Tab switcher: 'inputs', 'bounce', 'wiring'
  const [activeTab, setActiveTab] = useState('inputs');

  // Pin 2 Push Button (INPUT_PULLUP)
  const [buttonPressed, setButtonPressed] = useState(false);

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

  // Contact Bounce Scope States
  const [bounceMode, setBounceMode] = useState('bouncy'); // 'bouncy', 'debounced'
  const [bounceTriggerCount, setBounceTriggerCount] = useState(0);
  const bounceCanvasRef = useRef(null);
  const bounceWaveformRef = useRef([]);

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

  // Handle Contact Bounce Simulator Press
  const handleBouncePress = () => {
    const samples = [];
    if (bounceMode === 'bouncy') {
      // Generate 5-7 chaotic bouncing pulses (5-15ms transient)
      const spikes = Math.floor(Math.random() * 3) + 4;
      setBounceTriggerCount((prev) => prev + spikes);

      // Pre-press: HIGH (5V)
      for (let i = 0; i < 10; i++) samples.push(5.0);
      // Bouncing spikes
      for (let i = 0; i < spikes; i++) {
        samples.push(0.0);
        samples.push(0.0);
        samples.push(4.8);
        samples.push(1.2);
        samples.push(3.9);
      }
      // Settled LOW
      for (let i = 0; i < 25; i++) samples.push(0.0);
    } else {
      // Debounced: Exactly 1 clean falling edge
      setBounceTriggerCount((prev) => prev + 1);
      for (let i = 0; i < 15; i++) samples.push(5.0);
      samples.push(2.5); // transition
      for (let i = 0; i < 35; i++) samples.push(0.0);
    }
    bounceWaveformRef.current = samples;
    renderBounceCanvas();
  };

  const renderBounceCanvas = () => {
    const canvas = bounceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);

    // Grid lines for 0V, 2.5V, 5.0V
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    [15, 45, 75].forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    });

    const samples = bounceWaveformRef.current;
    if (!samples || samples.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText('Press button below to capture contact bounce waveform...', 12, 48);
      return;
    }

    ctx.strokeStyle = bounceMode === 'bouncy' ? '#ef4444' : '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const step = w / samples.length;
    samples.forEach((v, idx) => {
      // v=5V -> y=15, v=0V -> y=75
      const y = 75 - (v / 5.0) * 60;
      const x = idx * step;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  };

  useEffect(() => {
    renderBounceCanvas();
  }, [bounceMode]);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Tab Switcher */}
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
          { id: 'inputs', label: '🎛️ Live ADC & UART' },
          { id: 'bounce', label: '⚡ Bounce Scope' },
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

      {/* ── TAB 1: LIVE ADC & SERIAL TELEMETRY ── */}
      {activeTab === 'inputs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Header resolution badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>
              Analog Telemetry & Serial Monitor
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
              10-Bit ADC (4.887 mV/count)
            </span>
          </div>

          {/* Push Button (Pin 2 with INPUT_PULLUP) */}
          <div
            style={{
              background: T.surfaceAlt,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: 10,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: T.text }}>
                Digital Pin 2 · INPUT_PULLUP
              </span>
              <span
                style={{
                  fontSize: 9.5,
                  fontFamily: "'JetBrains Mono'",
                  fontWeight: 800,
                  color: buttonPressed ? '#ef4444' : '#10b981',
                }}
              >
                {buttonPressed ? 'LOW (0V / Pressed)' : 'HIGH (5V / Idle Pull-Up)'}
              </span>
            </div>

            <button
              onMouseDown={() => setButtonPressed(true)}
              onMouseUp={() => setButtonPressed(false)}
              onTouchStart={() => setButtonPressed(true)}
              onTouchEnd={() => setButtonPressed(false)}
              style={{
                width: '100%',
                background: buttonPressed ? T.primary : T.surface,
                color: buttonPressed ? '#ffffff' : T.text,
                border: `2px solid ${buttonPressed ? T.primary : T.border}`,
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: buttonPressed ? 'inset 0 2px 4px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.1s ease',
              }}
            >
              {buttonPressed ? '🔘 Pressed (Pin 2 Grounded)' : '⚪ Press & Hold Button (Pin 2)'}
            </button>
          </div>

          {/* Analog Inputs: Potentiometer (A0) & LDR (A1) */}
          <div
            style={{
              background: T.surfaceAlt,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {/* Potentiometer A0 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: T.text }}>A0 · Rotary Potentiometer</span>
                <span style={{ fontFamily: "'JetBrains Mono'", color: T.primary, fontWeight: 800 }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: T.text }}>A1 · LDR Ambient Light Sensor</span>
                <span style={{ fontFamily: "'JetBrains Mono'", color: '#f59e0b', fontWeight: 800 }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: T.textSub, marginTop: 2 }}>
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
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: T.text }}>
                Hysteresis Night-Light (Pin 13)
              </div>
              <div style={{ fontSize: 9, color: T.textSub }}>
                Turn ON &lt;{threshOn} | Turn OFF &gt;{threshOff}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 8px',
                borderRadius: 6,
                background: nightLightLed ? 'rgba(16,185,129,0.15)' : T.surface,
                border: `1px solid ${nightLightLed ? '#10b981' : T.border}`,
                color: nightLightLed ? '#10b981' : T.textMuted,
                fontSize: 10,
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9.5, color: '#94a3b8' }}>
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
                    fontSize: 9.5,
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
                    fontSize: 9.5,
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
                height: 90,
                overflowY: 'auto',
                fontSize: 9.5,
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
      )}

      {/* ── TAB 2: CONTACT BOUNCE OSCILLOSCOPE ── */}
      {activeTab === 'bounce' && (
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
              Mechanical Contact Bounce Scope
            </span>
            <span style={{ fontSize: 9.5, fontFamily: "'JetBrains Mono'", color: T.primary, fontWeight: 700 }}>
              5-15ms Transients
            </span>
          </div>

          <p style={{ fontSize: 10.5, color: T.textSub, margin: 0, lineHeight: 1.5 }}>
            Mechanical switch contacts flutter on closing, causing rapid 0V/5V spikes. Without debouncing, 1 press causes multiple false triggers!
          </p>

          {/* Mode Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <button
              onClick={() => {
                setBounceMode('bouncy');
                bounceWaveformRef.current = [];
                renderBounceCanvas();
              }}
              style={{
                background: bounceMode === 'bouncy' ? '#ef4444' : T.surface,
                color: bounceMode === 'bouncy' ? '#ffffff' : T.textSub,
                border: `1px solid ${bounceMode === 'bouncy' ? '#ef4444' : T.border}`,
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: 10.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ⚠️ Raw Switch (Bouncy)
            </button>
            <button
              onClick={() => {
                setBounceMode('debounced');
                bounceWaveformRef.current = [];
                renderBounceCanvas();
              }}
              style={{
                background: bounceMode === 'debounced' ? '#10b981' : T.surface,
                color: bounceMode === 'debounced' ? '#ffffff' : T.textSub,
                border: `1px solid ${bounceMode === 'debounced' ? '#10b981' : T.border}`,
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: 10.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ✓ Software Debounced
            </button>
          </div>

          {/* Waveform Canvas */}
          <div style={{ position: 'relative', width: '100%', height: 90, background: '#030712', borderRadius: 6, overflow: 'hidden' }}>
            <canvas
              ref={bounceCanvasRef}
              width={380}
              height={90}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />
            <div style={{ position: 'absolute', top: 4, right: 6, fontSize: 8.5, color: '#94a3b8', fontFamily: "'JetBrains Mono'" }}>
              5.0V HIGH
            </div>
            <div style={{ position: 'absolute', bottom: 4, right: 6, fontSize: 8.5, color: '#94a3b8', fontFamily: "'JetBrains Mono'" }}>
              0.0V LOW (GND)
            </div>
          </div>

          {/* Test Trigger Button & False Interrupt Counter */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={handleBouncePress}
              style={{
                flex: 1,
                background: T.primary,
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🔘 Click to Trigger Contact
            </button>
            <div
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: '6px 12px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 8.5, color: T.textSub }}>Trigger Count</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: bounceMode === 'bouncy' ? '#ef4444' : '#10b981', fontFamily: "'JetBrains Mono'" }}>
                {bounceTriggerCount}
              </div>
            </div>
            <button
              onClick={() => setBounceTriggerCount(0)}
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: 9.5,
                color: T.textMuted,
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
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
            Day 2 Point-to-Point Breadboard Pinout
          </div>
          <p style={{ fontSize: 10.5, color: T.textSub, lineHeight: 1.5, margin: 0 }}>
            Button uses internal pull-up (no external resistor needed). LDR forms a voltage divider with a 10kΩ fixed resistor.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { from: 'Uno Pin 2', to: 'Button Terminal A (Row 10)', net: 'INPUT_PULLUP', color: '#38bdf8' },
              { from: 'Button Terminal B', to: 'Blue (-) Ground Rail', net: 'Return to GND', color: '#000000' },
              { from: 'Uno Pin A0', to: 'Potentiometer Wiper (Center)', net: 'Analog ADC (0-1023)', color: '#3b82f6' },
              { from: 'Pot Leg 1 & 2', to: '5V (+) & GND (-) Rails', net: 'Potentiometer Bias', color: '#f59e0b' },
              { from: 'Uno Pin A1', to: 'Divider Junction (Row 20)', net: 'LDR Analog Sense', color: '#f59e0b' },
              { from: 'Row 20 (Divider)', to: '5V Rail via 10kΩ Resistor', net: 'Upper Divider Leg', color: '#64748b' },
              { from: 'Row 20 (Divider)', to: 'GND Rail via LDR Photoresistor', net: 'Lower Divider Leg', color: '#eab308' },
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
