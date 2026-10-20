import React, { useState, useEffect, useRef } from 'react';

export default function AutonomousRadarStationSim({ T }) {
  // Tab switcher: 'radar', 'targets', 'telemetry', 'wiring'
  const [activeTab, setActiveTab] = useState('radar');

  // Radar Sweep Angle (15 deg to 165 deg)
  const [angle, setAngle] = useState(90);
  const [sweepDirection, setSweepDirection] = useState(1);
  const [isScanning, setIsScanning] = useState(true);
  const [sweepSpeedMs, setSweepSpeedMs] = useState(35); // 20ms, 35ms, 60ms
  const [sweepStepDeg, setSweepStepDeg] = useState(2); // 1, 2, 3 deg

  // Targets in the radar field: array of { id, angle, distance }
  const [targets, setTargets] = useState([
    { id: 1, angle: 45, distance: 28 },
    { id: 2, angle: 120, distance: 18 },
  ]);

  // Target Editor inputs
  const [newTargetAngle, setNewTargetAngle] = useState(90);
  const [newTargetDist, setNewTargetDist] = useState(20);

  // Detected point history for radar persistence: array of { angle, distance, timestamp }
  const [blips, setBlips] = useState([]);

  // Telemetry string
  const [currentDistance, setCurrentDistance] = useState(null);
  const [alarmState, setAlarmState] = useState('NORMAL'); // 'NORMAL', 'CAUTION', 'ALARM'
  const [telemetryLogs, setTelemetryLogs] = useState([
    '45,28',
    '47,28',
    '88,400',
    '90,400',
    '118,18',
    '120,18',
  ]);
  const [copiedTelemetry, setCopiedTelemetry] = useState(false);

  // Decoupling capacitor toggle (educational feature)
  const [decouplingCapacitor, setDecouplingCapacitor] = useState(true);
  const [brownoutWarning, setBrownoutWarning] = useState(false);

  // Canvas Ref
  const canvasRef = useRef(null);

  // Non-blocking Sweep Loop
  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      setAngle((prevAngle) => {
        let nextAngle = prevAngle + sweepDirection * sweepStepDeg;
        if (nextAngle >= 165) {
          nextAngle = 165;
          setSweepDirection(-1);
        } else if (nextAngle <= 15) {
          nextAngle = 15;
          setSweepDirection(1);
        }

        // Check if any target is near the current angle (+/- 4 degrees)
        const hit = targets.find((t) => Math.abs(t.angle - nextAngle) <= 4);
        if (hit) {
          setCurrentDistance(hit.distance);
          setBlips((prev) => [
            ...prev.slice(-30),
            { angle: nextAngle, distance: hit.distance, timestamp: Date.now() },
          ]);

          setTelemetryLogs((prev) => [...prev.slice(-25), `${nextAngle},${hit.distance}`]);

          if (hit.distance < 15) {
            setAlarmState('ALARM');
          } else if (hit.distance < 30) {
            setAlarmState('CAUTION');
          } else {
            setAlarmState('NORMAL');
          }
        } else {
          setCurrentDistance(null);
          setAlarmState('NORMAL');
          if (Math.random() < 0.25) {
            setTelemetryLogs((prev) => [...prev.slice(-25), `${nextAngle},400`]);
          }
        }

        // Simulate brownout if decoupling capacitor is removed
        if (!decouplingCapacitor && Math.random() < 0.04) {
          setBrownoutWarning(true);
          setTimeout(() => setBrownoutWarning(false), 800);
        }

        return nextAngle;
      });
    }, sweepSpeedMs);

    return () => clearInterval(interval);
  }, [isScanning, sweepDirection, targets, decouplingCapacitor, sweepSpeedMs, sweepStepDeg]);

  // Render Radar Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height - 12;
    const radius = Math.min(cx - 12, cy - 12);

    ctx.clearRect(0, 0, width, height);

    // Background Arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, 2 * Math.PI, false);
    ctx.fillStyle = '#020b08';
    ctx.fill();
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Concentric Range Rings (10cm, 20cm, 30cm, 40cm)
    [0.25, 0.5, 0.75, 1.0].forEach((ratio, idx) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * ratio, Math.PI, 2 * Math.PI, false);
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ring Distance Labels
      ctx.fillStyle = '#22c55e';
      ctx.font = "8px 'JetBrains Mono', monospace";
      ctx.fillText(`${(idx + 1) * 10}cm`, cx + 4, cy - radius * ratio + 10);
    });

    // Radial Angle Lines (30, 60, 90, 120, 150)
    [30, 60, 90, 120, 150].forEach((deg) => {
      const rad = (deg * Math.PI) / 180;
      const x = cx - radius * Math.cos(rad);
      const y = cy - radius * Math.sin(rad);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#4ade80';
      ctx.font = "8px 'JetBrains Mono', monospace";
      ctx.fillText(`${deg}°`, x - (deg > 90 ? 18 : -2), y - 2);
    });

    // Render Blips (Targets)
    const now = Date.now();
    blips.forEach((b) => {
      const age = now - b.timestamp;
      if (age > 3500) return; // Fade after 3.5 seconds

      const opacity = Math.max(0, 1 - age / 3500);
      const rad = (b.angle * Math.PI) / 180;
      const distRatio = Math.min(1, b.distance / 40);
      const bx = cx - radius * distRatio * Math.cos(rad);
      const by = cy - radius * distRatio * Math.sin(rad);

      ctx.beginPath();
      ctx.arc(bx, by, 4, 0, 2 * Math.PI);
      ctx.fillStyle = b.distance < 15 ? `rgba(239, 68, 68, ${opacity})` : `rgba(34, 197, 94, ${opacity})`;
      ctx.fill();

      // Blip Ping Ring
      ctx.beginPath();
      ctx.arc(bx, by, 6 + age / 120, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(34, 197, 94, ${opacity * 0.4})`;
      ctx.stroke();
    });

    // Sweeping Radar Line
    const currentRad = (angle * Math.PI) / 180;
    const sweepX = cx - radius * Math.cos(currentRad);
    const sweepY = cy - radius * Math.sin(currentRad);

    const grad = ctx.createLinearGradient(cx, cy, sweepX, sweepY);
    grad.addColorStop(0, '#22c55e');
    grad.addColorStop(1, '#86efac');

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(sweepX, sweepY);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center Origin Dot
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#22c55e';
    ctx.fill();
  }, [angle, blips]);

  // Target Editor Add Target
  const addTarget = () => {
    setTargets((prev) => [
      ...prev,
      { id: Date.now(), angle: newTargetAngle, distance: newTargetDist },
    ]);
  };

  const removeTarget = (id) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
  };

  // Convert polar to cartesian
  const cartX = (newTargetDist * Math.cos((newTargetAngle * Math.PI) / 180)).toFixed(1);
  const cartY = (newTargetDist * Math.sin((newTargetAngle * Math.PI) / 180)).toFixed(1);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Navigation Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 3,
          background: T.surfaceAlt,
          padding: 3,
          borderRadius: 8,
          border: `1px solid ${T.border}`,
        }}
      >
        {[
          { id: 'radar', label: '🎯 Scope' },
          { id: 'targets', label: '📍 Targets' },
          { id: 'telemetry', label: '📊 Stream' },
          { id: 'wiring', label: '🔌 Pinout' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              background: activeTab === t.id ? T.primary : 'transparent',
              color: activeTab === t.id ? '#ffffff' : T.textSub,
              border: 'none',
              borderRadius: 6,
              padding: '6px 2px',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: 180° POLAR RADAR SCOPE ── */}
      {activeTab === 'radar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Header & Scanning Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isScanning ? '#10b981' : '#f59e0b',
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>
                180° Autonomous Radar Scope
              </span>
            </div>

            <button
              onClick={() => setIsScanning(!isScanning)}
              style={{
                background: isScanning ? T.primary : T.surfaceAlt,
                color: isScanning ? '#ffffff' : T.textSub,
                border: `1px solid ${isScanning ? T.primary : T.border}`,
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isScanning ? '❚❚ Pause' : '▶ Scan'}
            </button>
          </div>

          {/* Canvas Radar Scope Screen */}
          <div
            style={{
              background: '#010804',
              border: `2px solid ${alarmState === 'ALARM' ? '#ef4444' : '#064e22'}`,
              borderRadius: 12,
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: alarmState === 'ALARM' ? '0 0 16px rgba(239,68,68,0.3)' : 'inset 0 0 14px rgba(0,0,0,0.8)',
              transition: 'border 0.2s',
            }}
          >
            <canvas
              ref={canvasRef}
              width={340}
              height={180}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />

            {/* Sweep Angle & Real-Time Proximity Status Bar */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 8,
                borderTop: '1px solid #064e22',
                marginTop: 6,
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <div style={{ color: '#4ade80' }}>
                ANGLE: <span style={{ color: '#ffffff', fontWeight: 800 }}>{angle}°</span>
              </div>
              <div
                style={{
                  color: alarmState === 'ALARM' ? '#ef4444' : alarmState === 'CAUTION' ? '#f59e0b' : '#10b981',
                  fontWeight: 800,
                }}
              >
                {currentDistance ? `TARGET: ${currentDistance}cm` : 'RANGE: CLEAR'}
              </div>
            </div>
          </div>

          {/* Decoupling Capacitor Safety Simulator */}
          <div
            style={{
              background: T.surfaceAlt,
              border: `1px solid ${brownoutWarning ? '#ef4444' : T.border}`,
              borderRadius: 8,
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: T.text }}>
                100μF Decoupling Capacitor
              </div>
              <div style={{ fontSize: 9, color: brownoutWarning ? '#ef4444' : T.textSub }}>
                {brownoutWarning ? '⚠️ BROWNOUT RESET DETECTED!' : 'Buffers servo motor inrush spikes'}
              </div>
            </div>

            <button
              onClick={() => setDecouplingCapacitor(!decouplingCapacitor)}
              style={{
                background: decouplingCapacitor ? T.greenBg : '#ef444420',
                color: decouplingCapacitor ? T.green : '#ef4444',
                border: `1px solid ${decouplingCapacitor ? T.greenBorder : '#ef4444'}`,
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {decouplingCapacitor ? '✓ Installed' : '❌ Removed'}
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 2: INTERACTIVE TARGET FIELD & POLAR CONVERTER ── */}
      {activeTab === 'targets' && (
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
              Target Field & Polar Coordinates
            </span>
            <span style={{ fontSize: 9.5, fontFamily: "'JetBrains Mono'", color: T.primary, fontWeight: 700 }}>
              (r, θ) ➔ (X, Y)
            </span>
          </div>

          {/* Add Target Controls */}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
              <span style={{ color: T.textSub }}>Target Angle (θ):</span>
              <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 800, color: T.primary }}>{newTargetAngle}°</span>
            </div>
            <input
              type="range"
              min="15"
              max="165"
              value={newTargetAngle}
              onChange={(e) => setNewTargetAngle(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: T.primary }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
              <span style={{ color: T.textSub }}>Target Distance (r):</span>
              <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 800, color: '#f59e0b' }}>{newTargetDist} cm</span>
            </div>
            <input
              type="range"
              min="5"
              max="38"
              value={newTargetDist}
              onChange={(e) => setNewTargetDist(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b' }}
            />

            {/* Cartesian Coordinate Preview */}
            <div
              style={{
                background: T.surfaceAlt,
                padding: '6px 8px',
                borderRadius: 6,
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 9.5,
                fontFamily: "'JetBrains Mono'",
              }}
            >
              <span style={{ color: T.textSub }}>X = r·cos(θ): {cartX}cm</span>
              <span style={{ color: T.textSub }}>Y = r·sin(θ): {cartY}cm</span>
            </div>

            <button
              onClick={addTarget}
              style={{
                background: T.primary,
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: 10.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              + Place Target in Field
            </button>
          </div>

          {/* Active Targets List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: T.text }}>Active Obstacles in Arena:</span>
            {targets.map((t, idx) => (
              <div
                key={t.id}
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
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.distance < 15 ? '#ef4444' : '#10b981' }} />
                  <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700 }}>
                    #{idx + 1}: {t.angle}° @ {t.distance}cm
                  </span>
                </div>
                <button
                  onClick={() => removeTarget(t.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  ✕ Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: SERIAL TELEMETRY STREAM / PLOTTER ── */}
      {activeTab === 'telemetry' && (
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
              SERIAL PLOTTER STREAM ("ANGLE,DIST\n")
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(telemetryLogs.join('\n'));
                  setCopiedTelemetry(true);
                  setTimeout(() => setCopiedTelemetry(false), 2000);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: copiedTelemetry ? '#10b981' : '#38bdf8',
                  fontSize: 9.5,
                  cursor: 'pointer',
                }}
              >
                {copiedTelemetry ? 'Copied!' : 'Copy CSV'}
              </button>
              <button
                onClick={() => setTelemetryLogs([])}
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
            style={{
              padding: '8px 10px',
              height: 120,
              overflowY: 'auto',
              fontSize: 9.5,
              color: '#38bdf8',
              lineHeight: 1.6,
            }}
          >
            {telemetryLogs.map((log, i) => (
              <div key={i} style={{ whiteSpace: 'nowrap' }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: MASTER BREADBOARD PINOUT & MECHATRONIC WIRING ── */}
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
            Day 5 Capstone Unified Pinout Map
          </div>
          <p style={{ fontSize: 10.5, color: T.textSub, lineHeight: 1.5, margin: 0 }}>
            Every subsystem interfaces concurrently without GPIO or timer resource conflicts.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { from: 'Servo Signal', to: 'Uno Pin 10 (Timer1)', net: '50Hz PPM Sweep', color: '#f59e0b' },
              { from: 'Sonar Trig', to: 'Uno Pin 12', net: '10μs Pulse Trigger', color: '#38bdf8' },
              { from: 'Sonar Echo', to: 'Uno Pin 13', net: 'Time-of-Flight Return', color: '#10b981' },
              { from: 'I2C LCD SDA', to: 'Uno Pin A4', net: 'I2C Serial Data', color: '#a855f7' },
              { from: 'I2C LCD SCL', to: 'Uno Pin A5', net: 'I2C Serial Clock', color: '#6366f1' },
              { from: 'Piezo Buzzer', to: 'Uno Pin 11 (Timer2)', net: 'tone() Proximity Alarm', color: '#ef4444' },
              { from: 'Red Status LED', to: 'Uno Pin 8 + 220Ω', net: 'Visual Warning Flasher', color: '#ef4444' },
              { from: '100μF Buffer Cap', to: 'Across 5V & GND Rails', net: 'Inrush Brownout Guard', color: '#3b82f6' },
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
