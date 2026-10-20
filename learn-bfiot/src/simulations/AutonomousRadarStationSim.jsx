import React, { useState, useEffect, useRef } from 'react';

export default function AutonomousRadarStationSim({ T }) {
  // Radar Sweep Angle (15 deg to 165 deg)
  const [angle, setAngle] = useState(90);
  const [sweepDirection, setSweepDirection] = useState(1);
  const [isScanning, setIsScanning] = useState(true);

  // Targets in the radar field: array of { id, angle, distance }
  const [targets, setTargets] = useState([
    { id: 1, angle: 45, distance: 28 },
    { id: 2, angle: 120, distance: 18 },
  ]);

  // Detected point history for radar persistence: array of { angle, distance, timestamp }
  const [blips, setBlips] = useState([]);

  // Telemetry string
  const [currentDistance, setCurrentDistance] = useState(null);
  const [alarmState, setAlarmState] = useState('NORMAL'); // 'NORMAL', 'CAUTION', 'ALARM'

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
        let nextAngle = prevAngle + sweepDirection * 2;
        if (nextAngle >= 165) {
          nextAngle = 165;
          setSweepDirection(-1);
        } else if (nextAngle <= 15) {
          nextAngle = 15;
          setSweepDirection(1);
        }

        // Check if any target is near the current angle (+/- 3 degrees)
        const hit = targets.find((t) => Math.abs(t.angle - nextAngle) <= 3);
        if (hit) {
          setCurrentDistance(hit.distance);
          setBlips((prev) => [
            ...prev.slice(-30),
            { angle: nextAngle, distance: hit.distance, timestamp: Date.now() },
          ]);

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
        }

        // Simulate brownout if decoupling capacitor is removed
        if (!decouplingCapacitor && Math.random() < 0.04) {
          setBrownoutWarning(true);
          setTimeout(() => setBrownoutWarning(false), 800);
        }

        return nextAngle;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [isScanning, sweepDirection, targets, decouplingCapacitor]);

  // Render Radar Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height - 20;
    const radius = Math.min(cx - 20, cy - 20);

    ctx.clearRect(0, 0, width, height);

    // Background Arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, 2 * Math.PI, false);
    ctx.fillStyle = '#020b08';
    ctx.fill();
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Concentric Range Rings (10cm, 20cm, 30cm, 40cm)
    [0.25, 0.5, 0.75, 1.0].forEach((ratio, idx) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * ratio, Math.PI, 2 * Math.PI, false);
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ring Distance Labels
      ctx.fillStyle = '#22c55e';
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillText(`${(idx + 1) * 10}cm`, cx + 6, cy - radius * ratio + 12);
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
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText(`${deg}°`, x - (deg > 90 ? 24 : -4), y - 4);
    });

    // Render Blips (Targets)
    const now = Date.now();
    blips.forEach((b) => {
      const age = now - b.timestamp;
      if (age > 4000) return; // Fade after 4 seconds

      const opacity = Math.max(0, 1 - age / 4000);
      const rad = (b.angle * Math.PI) / 180;
      const distRatio = Math.min(1, b.distance / 40);
      const bx = cx - radius * distRatio * Math.cos(rad);
      const by = cy - radius * distRatio * Math.sin(rad);

      ctx.beginPath();
      ctx.arc(bx, by, 5, 0, 2 * Math.PI);
      ctx.fillStyle = b.distance < 15 ? `rgba(239, 68, 68, ${opacity})` : `rgba(34, 197, 94, ${opacity})`;
      ctx.fill();

      // Blip Ping Ring
      ctx.beginPath();
      ctx.arc(bx, by, 8 + (age / 100), 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(34, 197, 94, ${opacity * 0.5})`;
      ctx.stroke();
    });

    // Sweeping Radar Line
    const currentRad = (angle * Math.PI) / 180;
    const sweepX = cx - radius * Math.cos(currentRad);
    const sweepY = cy - radius * Math.sin(currentRad);

    const gradient = ctx.createLinearGradient(cx, cy, sweepX, sweepY);
    gradient.addColorStop(0, '#22c55e');
    gradient.addColorStop(1, '#86efac');

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(sweepX, sweepY);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [angle, blips]);

  // Click canvas to drop or move a target
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = canvas.width / 2;
    const cy = canvas.height - 20;

    const dx = cx - x;
    const dy = cy - y;
    if (dy < 0) return; // Below baseline

    const distPixels = Math.sqrt(dx * dx + dy * dy);
    const radius = Math.min(cx - 20, cy - 20);
    const distance = Math.min(40, Math.max(5, Math.round((distPixels / radius) * 40)));

    let angleRad = Math.atan2(dy, dx);
    let clickAngle = Math.round((angleRad * 180) / Math.PI);
    if (clickAngle < 15) clickAngle = 15;
    if (clickAngle > 165) clickAngle = 165;

    setTargets((prev) => [
      ...prev.slice(-3),
      { id: Date.now(), angle: clickAngle, distance },
    ]);
  };

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
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: alarmState === 'ALARM' ? '#ef4444' : (alarmState === 'CAUTION' ? '#f59e0b' : '#22c55e'),
            boxShadow: `0 0 12px ${alarmState === 'ALARM' ? '#ef4444' : '#22c55e'}`
          }} />
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
            Arduino Uno R3 · Capstone: Autonomous Ultrasonic Radar Station
          </h3>
        </div>

        {/* Scan Toggle */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setIsScanning(!isScanning)}
            style={{
              background: isScanning ? '#22c55e' : '#334155',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isScanning ? '⏸ Pause Sweep' : '▶ Resume Sweep'}
          </button>
          <button
            onClick={() => setTargets([])}
            style={{
              background: '#1e293b',
              color: '#94a3b8',
              border: '1px solid #334155',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 11,
              cursor: 'pointer'
            }}
          >
            Clear Targets
          </button>
        </div>
      </div>

      {/* Brownout alert warning */}
      {brownoutWarning && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid #ef4444',
          borderRadius: 8,
          padding: '8px 14px',
          marginBottom: 16,
          color: '#ef4444',
          fontSize: 12,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span>⚡ BROWNOUT RESET DETECTED!</span>
          <span style={{ fontWeight: 400, color: '#fca5a5' }}>
            Servo surge current caused MCU VCC to dip below 4.3V! Add a 100μF decoupling capacitor to stabilize power.
          </span>
        </div>
      )}

      {/* Main Grid: Radar Scope vs Integrated Mechatronic Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) 1fr', gap: 24, marginBottom: 24 }}>
        
        {/* Left: Polar Radar Canvas */}
        <div style={{
          background: '#010503',
          border: '2px solid #052e16',
          borderRadius: 16,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: 'inset 0 0 30px rgba(5, 46, 22, 0.4)'
        }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#22c55e', fontFamily: "'JetBrains Mono'", marginBottom: 6 }}>
            <span>POLAR SONAR SWEEP (180° FOV)</span>
            <span>CLICK SCOPE TO DROP TARGET</span>
          </div>

          <canvas
            ref={canvasRef}
            width={380}
            height={220}
            onClick={handleCanvasClick}
            style={{ cursor: 'crosshair', maxWidth: '100%', height: 'auto' }}
          />

          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around', fontSize: 11, fontFamily: "'JetBrains Mono'", color: '#86efac', marginTop: 10 }}>
            <div>SERVO ANGLE: <strong>{angle}°</strong></div>
            <div>STATUS: <strong style={{ color: alarmState === 'ALARM' ? '#ef4444' : '#22c55e' }}>{alarmState}</strong></div>
            <div>DISTANCE: <strong>{currentDistance ? `${currentDistance}cm` : 'SCANNING'}</strong></div>
          </div>
        </div>

        {/* Right: Mechatronics & Telemetry Architecture */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* FSM Non-Blocking Engine */}
          <div style={{ background: T?.surfaceAlt || '#0c1525', border: `1px solid ${T?.border || '#111d33'}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', fontFamily: "'JetBrains Mono'", marginBottom: 8 }}>
              NON-BLOCKING FINITE STATE MACHINE (millis)
            </div>
            <div style={{ fontSize: 11, color: T?.textSub || '#94a3b8', lineHeight: 1.6, marginBottom: 10 }}>
              Zero <code>delay()</code> calls. The servo advances every 20ms while the HC-SR04 sonar takes microsecond time-of-flight measurements asynchronously.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontSize: 10, fontFamily: "'JetBrains Mono'" }}>
              <div style={{ background: '#040810', padding: 6, borderRadius: 4, border: '1px solid #1e293b' }}>
                <span style={{ color: '#22c55e' }}>STATE:</span> SWEEP_ACTIVE
              </div>
              <div style={{ background: '#040810', padding: 6, borderRadius: 4, border: '1px solid #1e293b' }}>
                <span style={{ color: '#38bdf8' }}>TELEMETRY:</span> SERIAL_9600
              </div>
            </div>
          </div>

          {/* Educational Decoupling Capacitor Switch */}
          <div style={{ background: T?.surfaceAlt || '#0c1525', border: `1px solid ${T?.border || '#111d33'}`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', fontFamily: "'JetBrains Mono'" }}>
                POWER DECOUPLING (100μF CAPACITOR)
              </span>
              <button
                onClick={() => setDecouplingCapacitor(!decouplingCapacitor)}
                style={{
                  background: decouplingCapacitor ? '#10b981' : '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '3px 8px',
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {decouplingCapacitor ? 'Capacitor Connected' : 'Removed (Test Surge)'}
              </button>
            </div>
            <div style={{ fontSize: 11, color: T?.textSub || '#94a3b8', lineHeight: 1.5 }}>
              Servos draw high surge currents (&gt;500mA) during reversal. A 100μF electrolytic capacitor buffers the power rail to stop the ATmega328P from resetting.
            </div>
          </div>

          {/* Serial Telemetry Feed ("ANGLE,DISTANCE\n") */}
          <div style={{
            background: '#020617',
            border: '1px solid #1e293b',
            borderRadius: 10,
            padding: 12,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: '#38bdf8'
          }}>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>
              SERIAL PLOTTER OUTPUT (Format: "ANGLE,DISTANCE\n"):
            </div>
            <div style={{ color: '#86efac' }}>
              &gt; {angle},{currentDistance || 0}
            </div>
            <div style={{ color: '#475569', fontSize: 10, marginTop: 4 }}>
              Directly compatible with Processing Radar GUI and Serial Plotter.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
