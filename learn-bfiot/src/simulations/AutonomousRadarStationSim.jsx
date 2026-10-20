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
            ...prev.slice(-25),
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
    const cy = height - 15;
    const radius = Math.min(cx - 15, cy - 15);

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

    const gradient = ctx.createLinearGradient(cx, cy, sweepX, sweepY);
    gradient.addColorStop(0, '#22c55e');
    gradient.addColorStop(1, '#86efac');

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(sweepX, sweepY);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [angle, blips]);

  // Click canvas to drop or move a target
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = canvas.width / 2;
    const cy = canvas.height - 15;

    const dx = cx - x;
    const dy = cy - y;
    if (dy < 0) return; // Below baseline

    const distPixels = Math.sqrt(dx * dx + dy * dy);
    const radius = Math.min(cx - 15, cy - 15);
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
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Title & Sweep Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
          Autonomous Radar Station
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setIsScanning(!isScanning)}
            style={{
              background: isScanning ? T.greenBg : T.surfaceAlt,
              color: isScanning ? T.green : T.textSub,
              border: `1px solid ${isScanning ? T.greenBorder : T.border}`,
              borderRadius: 6,
              padding: '3px 8px',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isScanning ? '⏸ Pause' : '▶ Sweep'}
          </button>
          <button
            onClick={() => setTargets([])}
            style={{
              background: T.surfaceAlt,
              color: T.textSub,
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              padding: '3px 8px',
              fontSize: 10,
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Brownout alert warning */}
      {brownoutWarning && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: 6,
            padding: '6px 10px',
            color: '#ef4444',
            fontSize: 10.5,
            fontWeight: 700,
          }}
        >
          ⚡ BROWNOUT RESET! Servo surge dropped VCC &lt;4.3V! Connect 100μF cap.
        </div>
      )}

      {/* Polar Sonar Radar Scope */}
      <div
        style={{
          background: '#010503',
          border: '1px solid #052e16',
          borderRadius: 10,
          padding: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: 'inset 0 0 20px rgba(5, 46, 22, 0.4)',
        }}
      >
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: '#22c55e', fontFamily: "'JetBrains Mono'", marginBottom: 4 }}>
          <span>POLAR SWEEP (180°)</span>
          <span style={{ color: '#86efac' }}>CLICK TO DROP TARGET</span>
        </div>

        <canvas
          ref={canvasRef}
          width={300}
          height={165}
          onClick={handleCanvasClick}
          style={{ cursor: 'crosshair', maxWidth: '100%', height: 'auto' }}
        />

        {/* Real-time Telemetry Bar */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 10,
            fontFamily: "'JetBrains Mono'",
            color: '#86efac',
            marginTop: 8,
            borderTop: '1px solid #052e16',
            paddingTop: 6,
          }}
        >
          <div>ANG: <strong>{angle}°</strong></div>
          <div>
            STATUS:{' '}
            <strong style={{ color: alarmState === 'ALARM' ? '#ef4444' : '#22c55e' }}>
              {alarmState}
            </strong>
          </div>
          <div>DIST: <strong>{currentDistance ? `${currentDistance}cm` : 'SCANNING'}</strong></div>
        </div>
      </div>

      {/* Decoupling Capacitor Switch & FSM Architecture */}
      <div
        style={{
          background: T.surfaceAlt,
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          padding: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: T.text }}>
            100μF Power Decoupling
          </div>
          <div style={{ fontSize: 9.5, color: T.textSub }}>
            Prevents servo inductive surge resets
          </div>
        </div>

        <button
          onClick={() => setDecouplingCapacitor(!decouplingCapacitor)}
          style={{
            background: decouplingCapacitor ? T.greenBg : 'rgba(239, 68, 68, 0.15)',
            color: decouplingCapacitor ? T.green : '#ef4444',
            border: `1px solid ${decouplingCapacitor ? T.greenBorder : '#ef4444'}`,
            borderRadius: 4,
            padding: '4px 8px',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {decouplingCapacitor ? '✓ Connected' : '✕ Removed (Surge)'}
        </button>
      </div>

      {/* Serial Output Feed */}
      <div
        style={{
          background: '#020617',
          border: `1px solid ${T.border}`,
          borderRadius: 6,
          padding: '8px 10px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ color: '#64748b' }}>SERIAL "ANGLE,DIST":</span>
        <span style={{ color: '#86efac', fontWeight: 700 }}>
          {angle},{currentDistance || 0}
        </span>
      </div>
    </div>
  );
}
