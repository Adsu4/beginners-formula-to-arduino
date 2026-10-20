// ── SYSTEM CONFIGURATION ─────────────────────────────────────────────
const OR_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OR_MODEL = 'deepseek/deepseek-chat';

const PROJ_SYSTEM = `You are an expert hardware maker and robotics mentor with the personality of a confident technical YouTuber — think GreatScott! meets The Engineering Mindset. You talk to makers like a knowledgeable friend.

HARD RULES:
1. Always design around the Arduino Uno R3 SMD (ATmega328P). That is the primary microcontroller.
2. The AI system MUST try its level best to curate the whole step-by-step answer with the minimum number of external components. Prioritize using ONLY components from the user's kit: Arduino Uno R3 SMD Development Board, 16x2 I2C LCD Display, 0.96 inch I2C OLED Display, HC-SR04 Ultrasonic Sensor, SG90 Micro Servo Motor, Passive Piezo Buzzer, Active Buzzer, Light Dependent Resistor (LDR), 10k Rotary Potentiometer, Momentary Push Buttons, Solderless Breadboard, Jumper Wires (M-M, M-F, F-F), Diffused LEDs (Red, Yellow, Green, Blue, RGB), 100uF Electrolytic Capacitors, 0.1uF Ceramic Capacitors, Resistors (220 ohm, 1k, 10k), Single channel relay module, USB Cable.
3. While the step-by-step answer tries its best to keep components limited to the kit, it's okay if it mentions things not included in the kit, but it MUST be clearly mentioned that the component should be externally sourced from somewhere and is not present in the kit. If an idea ABSOLUTELY requires a component outside this kit, you MUST flag it in the "why" field by starting with "[EXTERNAL]" and clearly state it needs to be sourced externally.
4. Return ONLY a raw JSON object. Zero markdown fences. Zero preamble. Zero explanation. Just the JSON.
5. All code must be real, working Arduino C++ (ATmega328P compliant, standard Arduino libraries: Wire.h, LiquidCrystal_I2C.h, Servo.h).

Return exactly this JSON shape:
{
  "overview": {
    "hook": "Punchy 1-sentence hook",
    "concept": "2-3 sentences explaining the core engineering concept (e.g., how PWM fakes analog, or how a voltage divider works).",
    "difficulty": "Beginner | Intermediate | Advanced | Master",
    "buildTime": "Estimated time (e.g., '20 mins')"
  },
  "parts": [
    { "category": "Component/Microcontroller/Cable", "name": "Name", "quantity": 1, "why": "1-sentence reason why it is needed" }
  ],
  "steps": [
    { 
      "number": 1, 
      "title": "Action-oriented title", 
      "instruction": "Clear, direct instruction.", 
      "proTip": "Optional tip for this specific step",
      "sanityCheck": "Optional check to ensure they didn't mess up"
    }
  ],
  "whatYouWillObserve": "1-2 sentences describing exactly what happens when they power it on.",
  "troubleshooting": [
    { "q": "Common issue symptom?", "a": "Direct solution." }
  ],
  "code": {
    "filename": "Main.ino",
    "snippet": "const int pin = 8;\nvoid setup() { ...",
    "breakdown": [
      { "line": 2, "desc": "Explanation of what line 2 does." }
    ]
  }
}`;

export const LESSONS = {
  // ── PHASE 0: GROUND ZERO ──────────────────────────────────────────────
  "gz1": {
    "title": "0.1 The Language of Electricity (V, I, R)",
    "phase": "GROUND ZERO: Before You Build",
    "isCapstone": false,
    "overview": {
      "hook": "Voltage is the push, Current is the flow, Resistance is the squeeze. Learn why connecting an LED directly to 5V will pop it instantly.",
      "concept": "Before touching any hardware, you need a crystal-clear mental model of electricity. Think of it like water in a plumbing system: Voltage is the water pressure, Current is the volume of water moving per second, and Resistance is the constriction in the pipe.",
      "difficulty": "Beginner",
      "buildTime": "10 mins"
    },
    "parts": [],
    "steps": [
      {
        "number": 1,
        "title": "Voltage (V)",
        "instruction": "Imagine a water tower. The height of the water creates downward pressure. In our Arduino Uno R3 circuits, our regulated main power rail provides 5.0 Volts of electrical pressure."
      },
      {
        "number": 2,
        "title": "Current (I)",
        "instruction": "The actual volume of electrical charge flowing through the wire is Current, measured in Amperes or Milliamps (mA). The ATmega328P microcontroller has a maximum rating of 40mA per I/O pin (20mA safe continuous limit)."
      },
      {
        "number": 3,
        "title": "Resistance (R)",
        "instruction": "If you squeeze a garden hose, you restrict the flow of water. Resistors are miniature ceramic components designed to choke down electrical current so fragile parts don't burn out."
      },
      {
        "number": 4,
        "title": "Ohm's Law: V = I * R",
        "instruction": "If voltage stays at 5V and resistance is zero, current spikes to infinity! This is called a Dead Short Circuit, and it will immediately destroy microcontroller pins.",
        "sanityCheck": "Always place a resistor in series with LEDs and sensitive loads!"
      },
      {
        "number": 5,
        "title": "Why LEDs Pop",
        "instruction": "A standard red LED has a forward voltage drop (Vf) of about 2.0V and burns out if current exceeds 25mA. With 5V from an Arduino, we use a 220Ω resistor to soak up the excess (5V - 2V = 3V), limiting current to a safe 13.6mA."
      }
    ],
    "whatYouWillObserve": "You will master the mathematical and physical relationship between Voltage, Current, and Resistance, ensuring you never destroy an ATmega328P GPIO pin.",
    "troubleshooting": [
      {
        "q": "Can I get shocked by an Arduino Uno's 5V pin?",
        "a": "No! 5.0 Volts is an extremely low, touch-safe potential. Human skin resistance is high enough that you cannot feel 5V."
      },
      {
        "q": "Why is 220Ω the universal LED resistor for Arduino?",
        "a": "Using R = (5V - 2V) / 0.015A gives 200Ω. 220Ω is the closest standard commercial E12 resistor value, providing a perfectly safe 13.6mA flow."
      }
    ],
    "simulation": "plumbing"
  },

  "gz2": {
    "title": "0.2 Breadboard Internal Mechanics",
    "phase": "GROUND ZERO: Before You Build",
    "isCapstone": false,
    "overview": {
      "hook": "Destroying the 'magic grid' misconception. Breadboards are just spring-loaded rows of hidden copper clips.",
      "concept": "A solderless breadboard is not a circuit board—it is an organized prototyping canvas. Underneath the ABS plastic shell are rows of nickel-plated bronze clips that connect your wires together without a single drop of solder.",
      "difficulty": "Beginner",
      "buildTime": "5 mins"
    },
    "parts": [],
    "steps": [
      {
        "number": 1,
        "title": "The Power Distribution Rails",
        "instruction": "Look at the outer sides of your breadboard. You will see vertical columns marked with red (+) and blue (-) lines. All holes in a vertical power strip are internally connected together."
      },
      {
        "number": 2,
        "title": "The Terminal Strips",
        "instruction": "In the center work area, holes are arranged in horizontal rows numbered 1 to 30. The 5 holes in each horizontal row (A-B-C-D-E or F-G-H-I-J) share a single hidden metal clip."
      },
      {
        "number": 3,
        "title": "Making Electrical Nodes",
        "instruction": "Plugging two component leads into the same numbered row (e.g., hole A10 and hole C10) connects them together as if they were soldered.",
        "proTip": "Always verify row numbers before applying 5V power!"
      },
      {
        "number": 4,
        "title": "The Center Isolation Trench",
        "instruction": "The 0.3-inch groove down the middle completely isolates the left bank from the right bank. This allows dual-inline ICs (like 555 timers) to straddle the trench without shorting their opposite pins."
      }
    ],
    "whatYouWillObserve": "You will mentally 'see through' the opaque plastic housing of your breadboard to understand exactly how internal copper strips conduct current.",
    "troubleshooting": [
      {
        "q": "Why isn't electricity reaching the bottom half of my breadboard?",
        "a": "Full-size 830-point breadboards have an intentional split right in the middle of the power rails! Use jumper wires to bridge the gap."
      },
      {
        "q": "Are rows 10A and 10F connected?",
        "a": "No! The center ravine separates columns A-E from columns F-J."
      }
    ],
    "simulation": "xray_breadboard"
  },

  "gz3": {
    "title": "0.3 Reading Resistors & Color Codes",
    "phase": "GROUND ZERO: Before You Build",
    "isCapstone": false,
    "overview": {
      "hook": "How to decode color bands instantly so you never confuse a 220Ω (LED protector) and a 10kΩ (pull-up) resistor.",
      "concept": "Through-hole resistors are too small to stamp numbers onto. Instead, international color bands encode their ohmic value. We decode the significant digits, multiplier, and tolerance.",
      "difficulty": "Beginner",
      "buildTime": "15 mins"
    },
    "parts": [],
    "steps": [
      {
        "number": 1,
        "title": "Identify the Tolerance Band",
        "instruction": "Hold the resistor so the single separated gold or silver stripe is positioned on the far right. Gold signifies ±5% tolerance."
      },
      {
        "number": 2,
        "title": "Read Significant Digits",
        "instruction": "The first two colored bands represent digits (Black=0, Brown=1, Red=2, Orange=3, Yellow=4, Green=5, Blue=6, Violet=7, Grey=8, White=9). Red-Red = 22."
      },
      {
        "number": 3,
        "title": "The Multiplier Band",
        "instruction": "The third band indicates the power of 10 multiplier (number of zeros). Brown = 1 zero (×10). Red-Red-Brown = 22 × 10 = 220 Ohms (Ω).",
        "sanityCheck": "220Ω is your essential LED current limiter on a 5V Arduino Uno!"
      },
      {
        "number": 4,
        "title": "The 10kΩ Pull-Up Resistor",
        "instruction": "Brown (1) - Black (0) - Orange (3 zeros) = 10,000 Ohms = 10kΩ. Used for button pull-ups and sensor dividers."
      }
    ],
    "whatYouWillObserve": "You will be able to pick up any resistor from your starter kit and identify its resistance in seconds without a multimeter.",
    "troubleshooting": [
      {
        "q": "Does resistor orientation matter in a circuit?",
        "a": "No! Resistors are completely non-polarized. Electricity flows through them identically in both directions."
      },
      {
        "q": "Why are some resistors blue with 5 bands?",
        "a": "Blue metal film resistors are precision 1% resistors. They use 3 significant digit bands before the multiplier."
      }
    ],
    "simulation": "resistor_decoder"
  },

  "gz4": {
    "title": "0.4 The Arduino Uno R3 SMD Hardware Arsenal",
    "phase": "GROUND ZERO: Before You Build",
    "isCapstone": false,
    "overview": {
      "hook": "Anatomy of the Arduino Uno R3 SMD board: the ATmega328P microcontroller, CH340 USB chip, and peripheral pin limits.",
      "concept": "The Uno R3 SMD uses an ATmega328P surface-mount IC running at 16MHz on 5V logic. We inspect digital pins 0-13, analog pins A0-A5, PWM timers, and power distribution rails.",
      "difficulty": "Beginner",
      "buildTime": "15 mins"
    },
    "parts": [],
    "steps": [
      {
        "number": 1,
        "title": "The Central Processing Unit",
        "instruction": "Locate the small square 32-pin ATmega328P SMD package in the center of the board. It contains 32KB Flash memory, 2KB SRAM, and 1KB EEPROM running at 16 MHz."
      },
      {
        "number": 2,
        "title": "USB Interface Controller",
        "instruction": "Near the USB jack sits the USB-to-UART bridge chip (CH340G or ATmega16U2). It handles high-speed communication between your PC's USB port and the microcontroller's hardware serial pins (Pins 0 & 1)."
      },
      {
        "number": 3,
        "title": "Digital Input / Output Header (D0 - D13)",
        "instruction": "The 14 digital pins operate at 5V logic. Pins marked with a tilde (~) — 3, 5, 6, 9, 10, 11 — support hardware 8-bit Pulse Width Modulation (PWM)."
      },
      {
        "number": 4,
        "title": "Analog Input Header (A0 - A5)",
        "instruction": "6 dedicated analog pins read continuous voltages (0V to 5V) using the internal 10-bit Successive Approximation ADC. Pins A4 (SDA) and A5 (SCL) also serve as the hardware I2C communication bus."
      },
      {
        "number": 5,
        "title": "Power Rails & Safety Limits",
        "instruction": "The board supplies regulated 5V and 3.3V rails. Absolute maximum current limit per I/O pin is 40mA, with a cumulative total package limit of 200mA across the entire chip."
      }
    ],
    "whatYouWillObserve": "You will know every pin, port, and electrical constraint on the Arduino Uno R3 SMD before writing your first sketch.",
    "troubleshooting": [
      {
        "q": "What happens if I short 5V directly to GND on the board?",
        "a": "The onboard polyfuse will trigger and temporarily shut down power to protect your computer's USB port. Unplug the board immediately!"
      },
      {
        "q": "Can I use Pins 0 and 1 for buttons or LEDs?",
        "a": "Avoid using Pins 0 (RX) and 1 (TX) for external components whenever possible. They are directly wired to the USB chip for code uploading and Serial Monitor telemetry."
      }
    ],
    "simulation": "kit_arsenal"
  },

  // ── PHASE 1: THE ARDUINO COHORT (GEC THRISSUR HANDS-ON PROGRAMME) ───
  "p1m1": {
    "title": "1.1 Day 1 · Digital Outputs & Traffic Light Controller",
    "phase": "PHASE 1: The Arduino Cohort (GEC Thrissur)",
    "isCapstone": false,
    "overview": {
      "hook": "Master the ATmega328P GPIO architecture, calculate current-limiting resistors, and build an automated 3-phase municipal traffic signal controller.",
      "concept": "Microcontroller pins act as software-controlled 5V solid-state switches. We learn the fundamental embedded lifecycle (setup vs loop), calculate current limits using Ohm's Law (V = IR), and construct an automated timed state machine for Red, Yellow, and Green LEDs with a pedestrian standby hazard flasher.",
      "difficulty": "Beginner",
      "buildTime": "30 mins"
    },
    "parts": [
      {
        "category": "Microcontroller",
        "name": "Arduino Uno R3 SMD",
        "quantity": 1,
        "why": "Central processor providing timed 5V digital switching."
      },
      {
        "category": "Component",
        "name": "Red, Yellow & Green LEDs",
        "quantity": 3,
        "why": "Visual indicators for 3-phase traffic signaling."
      },
      {
        "category": "Component",
        "name": "220Ω Resistors",
        "quantity": 3,
        "why": "Current-limiting series protection for each LED."
      },
      {
        "category": "Prototyping",
        "name": "Breadboard & M-M Jumpers",
        "quantity": 6,
        "why": "Circuit interconnections and common ground rail."
      }
    ],
    "steps": [
      {
        "number": 1,
        "title": "Establish Common Ground",
        "instruction": "Connect a black jumper wire from one of the Arduino Uno's GND pins to the negative blue power rail of your solderless breadboard."
      },
      {
        "number": 2,
        "title": "Insert the Three Traffic LEDs",
        "instruction": "Plug the Red, Yellow, and Green LEDs into three separate rows. Ensure the shorter cathode legs are oriented toward the negative rail."
      },
      {
        "number": 3,
        "title": "Install Current-Limiting Resistors",
        "instruction": "Connect a 220Ω resistor (Red-Red-Brown) from the cathode of each LED to the blue GND rail. Formula: R = (5.0V - 2.0V) / 0.015A = 200Ω ≈ 220Ω.",
        "sanityCheck": "Never wire an LED directly between an Arduino pin and GND without a resistor!"
      },
      {
        "number": 4,
        "title": "Connect Digital Control Pins",
        "instruction": "Wire Arduino Digital Pin 8 to the Red LED anode, Pin 9 to the Yellow LED anode, and Pin 10 to the Green LED anode."
      },
      {
        "number": 5,
        "title": "Program the 3-Phase State Machine",
        "instruction": "Configure Pins 8, 9, 10 as OUTPUT in setup(). In loop(), program the sequence: Green (3500ms) → Yellow (1500ms) → Red (3500ms) → Red+Yellow (1200ms)."
      },
      {
        "number": 6,
        "title": "Take-Home Extended Challenge: Hazard Flasher",
        "instruction": "Implement an alternating 1Hz standby flasher routine on Pin 9 (500ms ON, 500ms OFF) when entering night hazard mode."
      }
    ],
    "whatYouWillObserve": "The three breadboard LEDs will automatically transition through authentic international traffic signal states. Selecting the Standby Flasher mode demonstrates the pedestrian hazard warning cycle.",
    "troubleshooting": [
      {
        "q": "None of the LEDs illuminate.",
        "a": "Check diode polarity. LEDs only conduct in one direction! The longer lead (anode) must connect to the Arduino pin, and the shorter lead (cathode) to GND through the 220Ω resistor."
      },
      {
        "q": "Why is the yellow LED dimmer than the red LED?",
        "a": "Different color dyes have different forward voltage drops (Vf). Green and yellow drop slightly more voltage than red, resulting in slightly less forward current with identical resistors."
      }
    ],
    "simulation": "traffic_light",
    "code": {
      "filename": "TrafficLightController.ino",
      "snippet": "const int RED_PIN = 8;\nconst int YELLOW_PIN = 9;\nconst int GREEN_PIN = 10;\n\nvoid setup() {\n  pinMode(RED_PIN, OUTPUT);\n  pinMode(YELLOW_PIN, OUTPUT);\n  pinMode(GREEN_PIN, OUTPUT);\n}\n\nvoid loop() {\n  // Phase 1: Green Go\n  digitalWrite(GREEN_PIN, HIGH);\n  digitalWrite(YELLOW_PIN, LOW);\n  digitalWrite(RED_PIN, LOW);\n  delay(3500);\n\n  // Phase 2: Yellow Caution\n  digitalWrite(GREEN_PIN, LOW);\n  digitalWrite(YELLOW_PIN, HIGH);\n  delay(1500);\n\n  // Phase 3: Red Stop\n  digitalWrite(YELLOW_PIN, LOW);\n  digitalWrite(RED_PIN, HIGH);\n  delay(3500);\n\n  // Phase 4: Red + Yellow Prepare\n  digitalWrite(YELLOW_PIN, HIGH);\n  delay(1200);\n}",
      "breakdown": [
        { "line": 5, "desc": "pinMode() configures the ATmega328P DDR (Data Direction Register) to enable 5V output drivers." },
        { "line": 12, "desc": "digitalWrite(GREEN_PIN, HIGH) outputs 5.0V to illuminate the green LED." },
        { "line": 15, "desc": "delay(3500) pauses program execution for 3.5 seconds during the green phase." }
      ]
    }
  },

  "p1m2": {
    "title": "1.2 Day 2 · Digital Inputs, 10-Bit ADC & Serial Telemetry",
    "phase": "PHASE 1: The Arduino Cohort (GEC Thrissur)",
    "isCapstone": false,
    "overview": {
      "hook": "Acquire real environmental data! Read momentary buttons with internal pull-ups, stream telemetry over UART at 9600 baud, and calibrate an LDR night light with hysteresis.",
      "concept": "High-impedance inputs float unpredictably without a deterministic reference. We activate the ATmega328P's internal 30kΩ pull-up with INPUT_PULLUP, read continuous analog voltages with the 10-bit ADC (0-1023, 4.887mV/step), and implement software hysteresis to eliminate boundary flickering.",
      "difficulty": "Beginner",
      "buildTime": "35 mins"
    },
    "parts": [
      {
        "category": "Microcontroller",
        "name": "Arduino Uno R3 SMD",
        "quantity": 1,
        "why": "10-bit ADC acquisition and hardware UART telemetry engine."
      },
      {
        "category": "Sensor",
        "name": "10kΩ Rotary Potentiometer",
        "quantity": 1,
        "why": "Adjustable voltage divider on Analog Pin A0."
      },
      {
        "category": "Sensor",
        "name": "Light Dependent Resistor (LDR)",
        "quantity": 1,
        "why": "Photoresistor measuring ambient lux."
      },
      {
        "category": "Component",
        "name": "10kΩ Resistor & Push Button",
        "quantity": 2,
        "why": "Fixed divider leg and tactile digital input."
      }
    ],
    "steps": [
      {
        "number": 1,
        "title": "Wire Digital Pin 2 with INPUT_PULLUP",
        "instruction": "Connect one terminal of a push button to Digital Pin 2 and the diagonal terminal to GND. No external resistor is required because the chip enables its internal 30kΩ pull-up."
      },
      {
        "number": 2,
        "title": "Wire 10k Potentiometer to Analog Pin A0",
        "instruction": "Connect the outer legs of the potentiometer to 5V and GND. Connect the center wiper terminal to Analog Pin A0."
      },
      {
        "number": 3,
        "title": "Construct LDR Voltage Divider on A1",
        "instruction": "Connect the 10kΩ fixed resistor from 5V to row 20. Connect the LDR from row 20 to GND. Connect row 20 to Analog Pin A1. Formula: Vout = 5V * (10k / (R_ldr + 10k))."
      },
      {
        "number": 4,
        "title": "Initialize Serial Telemetry",
        "instruction": "In setup(), start the hardware UART at 9600 baud using Serial.begin(9600). Stream live readings to the Arduino IDE Serial Monitor."
      },
      {
        "number": 5,
        "title": "Implement Hysteresis Night-Light Switch",
        "instruction": "To prevent rapid twilight lamp flickering, program two separate thresholds: Turn ON when A1 < 350; Turn OFF when A1 > 450."
      }
    ],
    "whatYouWillObserve": "Turning the potentiometer prints smooth integer steps from 0 to 1023 in the Serial Monitor. Covering the LDR triggers the night-light LED with a rock-solid, flicker-free transition.",
    "troubleshooting": [
      {
        "q": "Why does digitalRead(2) return 1 when unpressed and 0 when pressed?",
        "a": "This is inverted pull-up logic. The internal resistor holds the pin high at 5V (1) until the button contact grounds it to 0V (0)."
      },
      {
        "q": "What is the voltage value per ADC integer step?",
        "a": "5.0V / 1023 steps = 0.004887V = 4.887 mV per count."
      }
    ],
    "simulation": "adc_serial_telemetry",
    "code": {
      "filename": "TelemetryAndHysteresis.ino",
      "snippet": "const int BTN_PIN = 2;\nconst int POT_PIN = A0;\nconst int LDR_PIN = A1;\nconst int LED_PIN = 13;\n\nconst int THRESH_ON = 350;\nconst int THRESH_OFF = 450;\nbool nightLightActive = false;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(BTN_PIN, INPUT_PULLUP);\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  int rawPot = analogRead(POT_PIN);\n  int rawLdr = analogRead(LDR_PIN);\n  bool btnPressed = (digitalRead(BTN_PIN) == LOW);\n\n  // Hysteresis deadband logic\n  if (rawLdr < THRESH_ON) {\n    nightLightActive = true;\n  } else if (rawLdr > THRESH_OFF) {\n    nightLightActive = false;\n  }\n  digitalWrite(LED_PIN, nightLightActive ? HIGH : LOW);\n\n  Serial.print(\"POT:\"); Serial.print(rawPot);\n  Serial.print(\" | LDR:\"); Serial.print(rawLdr);\n  Serial.print(\" | BTN:\"); Serial.println(btnPressed ? \"PRESSED\" : \"OPEN\");\n  delay(200);\n}",
      "breakdown": [
        { "line": 11, "desc": "INPUT_PULLUP enables the internal 20k-50k ohm pullup resistor inside the ATmega328P." },
        { "line": 16, "desc": "analogRead() initiates a 10-bit Successive Approximation ADC conversion taking ~100 microseconds." },
        { "line": 21, "desc": "Hysteresis prevents relay/LED chatter when ambient light is hovering near the threshold." }
      ]
    }
  },

  "p1m3": {
    "title": "1.3 Day 3 · PWM Modulation, Sound & Ultrasonic Sonar",
    "phase": "PHASE 1: The Arduino Cohort (GEC Thrissur)",
    "isCapstone": false,
    "overview": {
      "hook": "Generate continuous analog voltages using high-speed PWM timers, synthesize audio tones with a piezo buzzer, and build an automotive reverse parking radar.",
      "concept": "Digital pins only output 0V or 5V. We fake intermediate voltages using 490Hz Pulse Width Modulation (analogWrite 0-255). We excite passive piezo buzzers using tone(), send 10µs ultrasonic bursts on the HC-SR04, and compute obstacle distances using acoustic time-of-flight physics.",
      "difficulty": "Intermediate",
      "buildTime": "40 mins"
    },
    "parts": [
      {
        "category": "Microcontroller",
        "name": "Arduino Uno R3 SMD",
        "quantity": 1,
        "why": "Hardware timers for PWM, tone generation, and pulse timing."
      },
      {
        "category": "Sensor",
        "name": "HC-SR04 Ultrasonic Sonar",
        "quantity": 1,
        "why": "40kHz acoustic time-of-flight distance measurement."
      },
      {
        "category": "Actuator",
        "name": "Passive Piezo Buzzer",
        "quantity": 1,
        "why": "Acoustic frequency tone and alert generation."
      },
      {
        "category": "Component",
        "name": "LEDs & 220Ω Resistors",
        "quantity": 3,
        "why": "Multi-zone visual proximity feedback."
      }
    ],
    "steps": [
      {
        "number": 1,
        "title": "Wire PWM LED Fading Circuit",
        "instruction": "Connect an LED anode to PWM Pin 9 through a 220Ω resistor, with cathode to GND. Use analogWrite(9, val) to modulate duty cycle from 0 to 255."
      },
      {
        "number": 2,
        "title": "Wire Passive Piezo Buzzer to Pin 11",
        "instruction": "Connect the positive buzzer pin to Digital Pin 11 and negative to GND. Use tone(11, freq) to drive the internal ceramic piezo disc with a square wave."
      },
      {
        "number": 3,
        "title": "Interface HC-SR04 Ultrasonic Sensor",
        "instruction": "Connect VCC to 5V, GND to GND, Trigger to Pin 12, and Echo to Pin 13."
      },
      {
        "number": 4,
        "title": "Calculate Acoustic Time-of-Flight",
        "instruction": "Pulse Trig HIGH for 10µs, capture round-trip echo return with pulseIn(13, HIGH), and compute distance: Distance (cm) = (Echo Time µs * 0.0343) / 2."
      },
      {
        "number": 5,
        "title": "Build Reverse Parking Assistant",
        "instruction": "Program dynamic audible feedback: As obstacle distance drops from 40cm down to 5cm, accelerate beep repetition from 1Hz up to a continuous alarm tone."
      },
      {
        "number": 6,
        "title": "Take-Home Extended Challenge: 3-Zone Collision Classifier",
        "instruction": "Establish Zone 1 (Safe, >30cm: Green LED), Zone 2 (Caution, 10-30cm: Yellow LED pulsing), and Zone 3 (Critical, <10cm: Red LED strobe + continuous tone)."
      }
    ],
    "whatYouWillObserve": "Moving an object closer to the ultrasonic sensor accelerates the audible piezo beep rate while dynamically altering LED indicators, mimicking modern automotive radar systems.",
    "troubleshooting": [
      {
        "q": "Why does pulseIn() pause my program for a full second when out of range?",
        "a": "pulseIn() has a default 1-second timeout! Always supply a microsecond timeout parameter: pulseIn(13, HIGH, 30000) for a 30ms (~5 meter) limit."
      },
      {
        "q": "What is the speed of sound used in the calculation?",
        "a": "c ≈ 343 m/s = 0.0343 cm/µs at 20°C in dry air."
      }
    ],
    "simulation": "ultrasonic_parking",
    "code": {
      "filename": "ReverseParkingAssistant.ino",
      "snippet": "const int TRIG_PIN = 12;\nconst int ECHO_PIN = 13;\nconst int BUZZER_PIN = 11;\nconst int RED_LED = 8;\nconst int YELLOW_LED = 9;\nconst int GREEN_LED = 10;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(TRIG_PIN, OUTPUT);\n  pinMode(ECHO_PIN, INPUT);\n  pinMode(BUZZER_PIN, OUTPUT);\n  pinMode(RED_LED, OUTPUT);\n  pinMode(YELLOW_LED, OUTPUT);\n  pinMode(GREEN_LED, OUTPUT);\n}\n\nlong getDistanceCm() {\n  digitalWrite(TRIG_PIN, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG_PIN, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG_PIN, LOW);\n\n  long duration = pulseIn(ECHO_PIN, HIGH, 30000);\n  if (duration == 0) return 400; // Out of range\n  return (duration * 0.0343) / 2;\n}\n\nvoid loop() {\n  long dist = getDistanceCm();\n  Serial.print(\"Distance: \"); Serial.print(dist); Serial.println(\" cm\");\n\n  if (dist > 30) {\n    // Zone 1: Safe\n    digitalWrite(GREEN_LED, HIGH);\n    digitalWrite(YELLOW_LED, LOW);\n    digitalWrite(RED_LED, LOW);\n    noTone(BUZZER_PIN);\n    delay(200);\n  } else if (dist >= 10) {\n    // Zone 2: Caution\n    digitalWrite(GREEN_LED, LOW);\n    digitalWrite(YELLOW_LED, HIGH);\n    digitalWrite(RED_LED, LOW);\n    tone(BUZZER_PIN, 1800, 60);\n    delay(dist * 15);\n  } else {\n    // Zone 3: Critical Alarm\n    digitalWrite(GREEN_LED, LOW);\n    digitalWrite(YELLOW_LED, LOW);\n    digitalWrite(RED_LED, HIGH);\n    tone(BUZZER_PIN, 2400, 100);\n    delay(120);\n  }\n}",
      "breakdown": [
        { "line": 20, "desc": "Generates the precision 10µs ultrasonic burst trigger required by the HC-SR04 transducer." },
        { "line": 24, "desc": "pulseIn() measures the high duration of the echo return pin in microseconds." },
        { "line": 26, "desc": "Divides by 2 because the acoustic pulse travels to the object and back." }
      ]
    }
  },

  "p1m4": {
    "title": "1.4 Day 4 · Servo Motor & I2C Alphanumeric Dashboard",
    "phase": "PHASE 1: The Arduino Cohort (GEC Thrissur)",
    "isCapstone": false,
    "overview": {
      "hook": "Actuate physical mechanical linkages! Control an SG90 micro servo using 50Hz PPM signals and display real-time sensor HUD metrics on an I2C 16x2 LCD display.",
      "concept": "Servomotors use 50Hz Pulse Position Modulation (1.0ms = 0°, 1.5ms = 90°, 2.0ms = 180°). The I2C bus condenses 16 display pins down to two synchronous lines: SDA (Pin A4) and SCL (Pin A5). We prevent inductive brownout resets using 100µF decoupling capacitors.",
      "difficulty": "Intermediate",
      "buildTime": "45 mins"
    },
    "parts": [
      {
        "category": "Actuator",
        "name": "SG90 Micro Servo Motor",
        "quantity": 1,
        "why": "Precision 0°-180° rotational mechanical positioning."
      },
      {
        "category": "Display",
        "name": "I2C 16x2 LCD Display Module",
        "quantity": 1,
        "why": "Alphanumeric real-time telemetry HUD."
      },
      {
        "category": "Sensor",
        "name": "10k Potentiometer",
        "quantity": 1,
        "why": "Manual angular teleoperation control on A0."
      },
      {
        "category": "Decoupling",
        "name": "100µF Electrolytic Capacitor",
        "quantity": 1,
        "why": "Buffers motor stall inrush current to prevent brownout MCU resets."
      }
    ],
    "steps": [
      {
        "number": 1,
        "title": "Wire SG90 Servo with Decoupling Buffer",
        "instruction": "Connect Brown wire to GND, Red to 5V, and Orange (PWM signal) to Pin 10. Place a 100µF capacitor across the 5V and GND rail next to the servo connector."
      },
      {
        "number": 2,
        "title": "Calibrate Automated Servo Sweep",
        "instruction": "Include <Servo.h>, attach to Pin 10, and sweep angles between 0° and 180° using 15ms non-blocking positional increments."
      },
      {
        "number": 3,
        "title": "Wire Potentiometer Teleoperation",
        "instruction": "Connect potentiometer wiper to Pin A0. In code, map the 10-bit ADC reading (0-1023) directly to angular position: angle = map(potVal, 0, 1023, 0, 180)."
      },
      {
        "number": 4,
        "title": "Interface I2C LCD Display",
        "instruction": "Connect Display VCC to 5V, GND to GND, SDA to Analog Pin A4, and SCL to Analog Pin A5."
      },
      {
        "number": 5,
        "title": "Eliminate Display Refresh Flicker",
        "instruction": "Never call lcd.clear() inside loop()! Use lcd.setCursor(col, row) and overwrite fixed-width character buffers with space padding."
      },
      {
        "number": 6,
        "title": "Take-Home Extended Challenge: Custom Character Range Bar",
        "instruction": "Use lcd.createChar() to design a 5x8 pixel graphic bargraph showing obstacle proximity directly on the LCD screen."
      }
    ],
    "whatYouWillObserve": "Turning the potentiometer smoothly aims the physical servo horn while the 16x2 LCD display provides real-time angle readouts and a graphic progress bar with zero optical flicker.",
    "troubleshooting": [
      {
        "q": "The Arduino board restarts as soon as the servo starts moving.",
        "a": "This is an inductive load brownout reset! The motor draws >500mA during direction changes, dropping the 5V rail below 4.3V. Add the 100µF decoupling capacitor immediately across 5V and GND."
      },
      {
        "q": "I2C screen shows white boxes and no text.",
        "a": "Twist the small blue potentiometer on the back of the I2C backpack module using a screwdriver to adjust the liquid crystal contrast!"
      }
    ],
    "simulation": "servo_i2c_dashboard",
    "code": {
      "filename": "ServoDashboard.ino",
      "snippet": "#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n#include <Servo.h>\n\nLiquidCrystal_I2C lcd(0x27, 16, 2);\nServo scannerServo;\nconst int SERVO_PIN = 10;\nconst int POT_PIN = A0;\n\nvoid setup() {\n  scannerServo.attach(SERVO_PIN);\n  lcd.init();\n  lcd.backlight();\n  lcd.setCursor(0, 0);\n  lcd.print(\"RADAR DASHBOARD\");\n  delay(1000);\n  lcd.clear();\n}\n\nvoid loop() {\n  int rawPot = analogRead(POT_PIN);\n  int angle = map(rawPot, 0, 1023, 0, 180);\n  scannerServo.write(angle);\n\n  // Non-flickering formatted display update\n  lcd.setCursor(0, 0);\n  lcd.print(\"ANG:\");\n  if (angle < 100) lcd.print(\"0\");\n  if (angle < 10) lcd.print(\"0\");\n  lcd.print(angle);\n  lcd.print(\" deg\");\n\n  lcd.setCursor(0, 1);\n  lcd.print(\"MODE: MANUAL POT\");\n  delay(30);\n}",
      "breakdown": [
        { "line": 5, "desc": "Initializes the I2C LCD driver using hex bus address 0x27 for a 16 column by 2 row matrix." },
        { "line": 21, "desc": "map() proportionally translates a 0-1023 ADC integer into a 0-180 degree angular command." },
        { "line": 25, "desc": "Selective cursor positioning avoids screen wipe delays and optical refresh jitter." }
      ]
    }
  },

  "p1cap": {
    "title": "1.5 Capstone · Autonomous Ultrasonic Radar Station",
    "phase": "PHASE 1: The Arduino Cohort (GEC Thrissur)",
    "isCapstone": true,
    "overview": {
      "hook": "The ultimate capstone mechatronic build: an autonomous 180° scanning radar station featuring dynamic target tracking, I2C telemetry, audio alarms, and serial polar plotting.",
      "concept": "Consolidating all five days into a non-blocking embedded state machine. The SG90 servo sweeps the HC-SR04 sonar from 15° to 165°, computes real-time polar coordinates, updates the I2C dashboard, sounds warning alarms on proximity breaches, and streams 'ANGLE,DISTANCE' packets to the PC Serial Plotter.",
      "difficulty": "Master",
      "buildTime": "60 mins"
    },
    "parts": [
      {
        "category": "Microcontroller",
        "name": "Arduino Uno R3 SMD",
        "quantity": 1,
        "why": "Algorithmic control, non-blocking timing, and UART telemetry."
      },
      {
        "category": "Actuator",
        "name": "SG90 Micro Servo",
        "quantity": 1,
        "why": "Rotational scanning mount."
      },
      {
        "category": "Sensor",
        "name": "HC-SR04 Ultrasonic Sensor",
        "quantity": 1,
        "why": "Acoustic rangefinding."
      },
      {
        "category": "Display",
        "name": "I2C 16x2 LCD Display",
        "quantity": 1,
        "why": "Real-time telemetry HUD."
      },
      {
        "category": "Alert",
        "name": "Piezo Buzzer & Diffused LEDs",
        "quantity": 3,
        "why": "Multi-tier proximity warning system."
      },
      {
        "category": "Decoupling",
        "name": "100µF & 0.1µF Capacitors",
        "quantity": 2,
        "why": "Power decoupling and noise suppression across servo rails."
      }
    ],
    "steps": [
      {
        "number": 1,
        "title": "Electromechanical Assembly",
        "instruction": "Securely attach the HC-SR04 ultrasonic sensor to the SG90 servo horn assembly so the sonar transceivers rotate freely in a 180° horizontal arc without wire binding."
      },
      {
        "number": 2,
        "title": "Unified Circuit Layout & Power Decoupling",
        "instruction": "Wire Uno 5V and GND to breadboard rails. Place a 100µF capacitor across the rails. Connect Servo to Pin 10, HC-SR04 Trig to Pin 12, Echo to Pin 13, I2C Display to A4/A5, and Buzzer to Pin 11."
      },
      {
        "number": 3,
        "title": "Implement Non-Blocking millis() State Machine",
        "instruction": "Structure the codebase into dedicated modular functions: scanEnvironment(angle), calculateDistance(), updateDashboard(), and evaluateCollisionAlarm(). Never use blocking delay()!"
      },
      {
        "number": 4,
        "title": "Stream Polar Serial Telemetry",
        "instruction": "Transmit angular coordinate and distance tuples over serial at 9600 baud in the standard comma-separated format: Serial.print(angle); Serial.print(','); Serial.println(dist);"
      },
      {
        "number": 5,
        "title": "Calibrate Collision Alarm Triggers",
        "instruction": "If any obstacle is detected within 15cm during the scan, trigger high-priority warning beeps on the piezo buzzer and flash the red status indicator."
      },
      {
        "number": 6,
        "title": "Post-Cohort Extension: 2D Polar GUI Interface",
        "instruction": "Connect the Arduino USB port to the Arduino IDE Serial Plotter or a Processing / Python script to render an animated green phosphor radar sweep screen on your computer."
      }
    ],
    "whatYouWillObserve": "The servo arm continuously pans the sonar across a 180° field of view. Detected objects appear as live blips on the polar radar scope while distance and angle metrics stream dynamically to the LCD display and buzzer alarms sound on close approach.",
    "troubleshooting": [
      {
        "q": "Why does the servo jitter or halt while pinging?",
        "a": "Ensure pulseIn() has a strict 30000 microsecond timeout so an open room doesn't freeze microcontroller execution."
      },
      {
        "q": "The serial plotter shows garbled characters.",
        "a": "Make sure your Serial Monitor baud rate dropdown is set to exactly 9600 baud to match Serial.begin(9600)."
      }
    ],
    "simulation": "autonomous_radar_station",
    "code": {
      "filename": "AutonomousRadarStation.ino",
      "snippet": "#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n#include <Servo.h>\n\nLiquidCrystal_I2C lcd(0x27, 16, 2);\nServo radarServo;\n\nconst int TRIG_PIN = 12;\nconst int ECHO_PIN = 13;\nconst int SERVO_PIN = 10;\nconst int BUZZER_PIN = 11;\nconst int RED_LED = 8;\n\nint currentAngle = 15;\nint sweepStep = 2;\nunsigned long lastSweepTime = 0;\nconst int SWEEP_INTERVAL_MS = 35;\n\nlong getDistanceCm() {\n  digitalWrite(TRIG_PIN, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG_PIN, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG_PIN, LOW);\n  long duration = pulseIn(ECHO_PIN, HIGH, 25000);\n  if (duration == 0) return 400;\n  return (duration * 0.0343) / 2;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(TRIG_PIN, OUTPUT);\n  pinMode(ECHO_PIN, INPUT);\n  pinMode(BUZZER_PIN, OUTPUT);\n  pinMode(RED_LED, OUTPUT);\n\n  radarServo.attach(SERVO_PIN);\n  radarServo.write(currentAngle);\n\n  lcd.init();\n  lcd.backlight();\n  lcd.setCursor(0, 0);\n  lcd.print(\"RADAR SCANNER\");\n  lcd.setCursor(0, 1);\n  lcd.print(\"INITIALIZING...\");\n  delay(1200);\n  lcd.clear();\n}\n\nvoid loop() {\n  // Non-blocking servo sweep and acoustic sampling\n  if (millis() - lastSweepTime >= SWEEP_INTERVAL_MS) {\n    lastSweepTime = millis();\n\n    currentAngle += sweepStep;\n    if (currentAngle >= 165 || currentAngle <= 15) {\n      sweepStep = -sweepStep;\n    }\n    radarServo.write(currentAngle);\n\n    long dist = getDistanceCm();\n\n    // Serial Polar Telemetry: \"ANGLE,DISTANCE\\n\"\n    Serial.print(currentAngle);\n    Serial.print(\",\");\n    Serial.println(dist);\n\n    // Dashboard HUD update\n    lcd.setCursor(0, 0);\n    lcd.print(\"ANG:\");\n    if (currentAngle < 100) lcd.print(\"0\");\n    if (currentAngle < 10) lcd.print(\"0\");\n    lcd.print(currentAngle);\n    lcd.print(\" deg\");\n\n    lcd.setCursor(0, 1);\n    if (dist < 15) {\n      lcd.print(\"ALERT: \"); lcd.print(dist); lcd.print(\"cm! \");\n      digitalWrite(RED_LED, HIGH);\n      tone(BUZZER_PIN, 2200, 30);\n    } else {\n      lcd.print(\"CLEAR: \"); lcd.print(dist); lcd.print(\"cm  \");\n      digitalWrite(RED_LED, LOW);\n      noTone(BUZZER_PIN);\n    }\n  }\n}",
      "breakdown": [
        { "line": 45, "desc": "Non-blocking millis() timer allows the servo to articulate while concurrently sampling ultrasonic pulses." },
        { "line": 56, "desc": "Streams polar coordinates directly to the Arduino Serial Plotter or external GUI visualizer." },
        { "line": 67, "desc": "Evaluates dynamic obstacle safety thresholds and activates the audio-visual alert subsystem." }
      ]
    }
  },

  // ── PHASE 2: PURE HARDWARE FUNDAMENTALS (SHIFTED FROM PHASE 1) ─────────
  "p2m1": {
    "title": "2.1 The Basic Loop & Circuit Continuity",
    "phase": "PHASE 2: Pure Hardware Fundamentals",
    "isCapstone": false,
    "overview": {
      "hook": "Wiring an LED and 220Ω resistor to an Arduino Uno power header. Proving Ohm's Law physically with zero code.",
      "concept": "We use the Arduino Uno strictly as a 5V/3.3V power supply. No software allowed. We physically close an electrical loop to prove current continuity safely.",
      "difficulty": "Beginner",
      "buildTime": "15 mins",
      "simulation": "m1"
    },
    "parts": [
      { "category": "Microcontroller", "name": "Arduino Uno R3 SMD", "quantity": 1, "why": "Regulated 5V/3.3V bench power supply." },
      { "category": "Component", "name": "Red LED", "quantity": 1, "why": "Visual indicator of current flow." },
      { "category": "Component", "name": "220Ω Resistor", "quantity": 1, "why": "Current-limiting voltage drop." }
    ],
    "steps": [
      { "number": 1, "title": "Connect Power Rails", "instruction": "Connect a red jumper wire from the Uno 5V (or 3.3V) header to the breadboard positive rail. Connect a black wire from GND to the blue rail." },
      { "number": 2, "title": "Insert Resistor", "instruction": "Plug a 220Ω resistor from the positive power rail into a blank row (e.g., row 10)." },
      { "number": 3, "title": "Insert LED", "instruction": "Plug the LONG leg (Anode) of the LED into row 10. Plug the SHORT leg (Cathode) into the blue power rail (GND)." }
    ],
    "whatYouWillObserve": "The LED turns on instantly. You have successfully created a complete, unbroken circuit loop for electricity to flow.",
    "troubleshooting": [
      { "q": "My LED isn't turning on.", "a": "Check the legs! LEDs are polarized. The longer leg MUST be connected to the positive side." }
    ],
    "simulation": "m1"
  },

  "p2m2": {
    "title": "2.2 The Analog Valve (Potentiometer)",
    "phase": "PHASE 2: Pure Hardware Fundamentals",
    "isCapstone": false,
    "overview": {
      "hook": "Introducing the Potentiometer to dynamically control current flow and fade an LED mechanically.",
      "concept": "A potentiometer is an adjustable resistor. By twisting the dial, we physically change the resistance, altering current flow to the LED in real-time without writing a line of code.",
      "difficulty": "Beginner",
      "buildTime": "15 mins",
      "simulation": "m2"
    },
    "parts": [
      { "category": "Component", "name": "10k Potentiometer", "quantity": 1, "why": "Adjustable analog resistive valve." },
      { "category": "Component", "name": "Red LED", "quantity": 1, "why": "Visual output." },
      { "category": "Component", "name": "220Ω Resistor", "quantity": 1, "why": "Baseline current-limiting protection." }
    ],
    "steps": [
      { "number": 1, "title": "Mount Potentiometer", "instruction": "Place the potentiometer on the breadboard so its 3 pins sit in separate rows." },
      { "number": 2, "title": "Input Power", "instruction": "Connect the left pin to the positive power rail." },
      { "number": 3, "title": "Output Signal", "instruction": "Connect the center wiper pin to the LED anode through the 220Ω resistor, with cathode to GND." }
    ],
    "whatYouWillObserve": "The LED smoothly fades from completely dark to full brightness as you twist the physical potentiometer knob.",
    "troubleshooting": [
      { "q": "The LED is always on full brightness.", "a": "Ensure you are using the center wiper pin for the output, not the two outer pins." }
    ],
    "simulation": "m2"
  },

  "p2m3": {
    "title": "2.3 Physical Logic Gates (Series & Parallel)",
    "phase": "PHASE 2: Pure Hardware Fundamentals",
    "isCapstone": false,
    "overview": {
      "hook": "Building physical AND and OR logic gates using mechanical push buttons.",
      "concept": "Computers make decisions using logic gates. Before writing if-statements in software, we can physically build AND logic (series switches) and OR logic (parallel switches) with buttons.",
      "difficulty": "Intermediate",
      "buildTime": "20 mins",
      "simulation": "m3"
    },
    "parts": [
      { "category": "Component", "name": "Push Buttons", "quantity": 2, "why": "Mechanical switches." },
      { "category": "Component", "name": "LED & 220Ω Resistor", "quantity": 1, "why": "Logic output indicator." }
    ],
    "steps": [
      { "number": 1, "title": "Mount Buttons", "instruction": "Place two push buttons across the breadboard center trench." },
      { "number": 2, "title": "Build AND Circuit (Series)", "instruction": "Wire 5V to Button A. Connect Button A output to Button B input. Connect Button B output to the LED anode." },
      { "number": 3, "title": "Build OR Circuit (Parallel)", "instruction": "Wire 5V to BOTH Button A and Button B inputs. Connect both button outputs together to the LED anode." }
    ],
    "whatYouWillObserve": "In series (AND), both buttons must be pressed simultaneously to light the LED. In parallel (OR), pressing either button completes the circuit.",
    "troubleshooting": [
      { "q": "The button doesn't do anything.", "a": "Breadboard buttons have 4 pins connected in internal pairs. Wire diagonally across opposite corners." }
    ],
    "simulation": "m3"
  },

  "p2m4": {
    "title": "2.4 The Electronic Muscle (BC547 Transistor)",
    "phase": "PHASE 2: Pure Hardware Fundamentals",
    "isCapstone": false,
    "overview": {
      "hook": "Using a BC547 BJT transistor to switch high-current loads using tiny sensor signals.",
      "concept": "A transistor is an electronic switch with zero moving parts. A microscopic current at the Base opens the floodgates for large currents to flow from Collector to Emitter.",
      "difficulty": "Advanced",
      "buildTime": "25 mins",
      "simulation": "m4"
    },
    "parts": [
      { "category": "Component", "name": "BC547 NPN Transistor", "quantity": 1, "why": "Solid-state electronic switch." },
      { "category": "Component", "name": "LDR (Light Sensor)", "quantity": 1, "why": "Generates weak base trigger current." },
      { "category": "Component", "name": "LED & 220Ω Resistor", "quantity": 1, "why": "Switched load." }
    ],
    "steps": [
      { "number": 1, "title": "Identify Transistor Pins", "instruction": "Hold the BC547 with the flat face pointing toward you. Left pin is Collector (C), center is Base (B), right is Emitter (E)." },
      { "number": 2, "title": "Connect Emitter to GND", "instruction": "Connect the Emitter directly to the blue GND rail." },
      { "number": 3, "title": "Connect Load to Collector", "instruction": "Connect 5V to the LED anode, cathode to 220Ω resistor, and resistor to the Collector." },
      { "number": 4, "title": "Connect Base Trigger", "instruction": "Connect the LDR sensor signal to the Base through a 1kΩ base-limiting resistor." }
    ],
    "whatYouWillObserve": "Covering or exposing the light sensor modulates base current, causing the transistor to act as an automatic switch.",
    "troubleshooting": [
      { "q": "The LED is stuck always on.", "a": "You may have reversed the Collector and Emitter. Double-check the flat face orientation." }
    ],
    "simulation": "m4"
  },

  "p2m5": {
    "title": "2.5 The Hardware Heartbeat (555 Timer IC)",
    "phase": "PHASE 2: Pure Hardware Fundamentals",
    "isCapstone": false,
    "overview": {
      "hook": "Introducing the legendary NE555 timer IC to flash an LED rhythmically with zero software.",
      "concept": "Before microcontrollers existed, astable multivibrators generated clock pulses. The 555 timer charges and discharges an external capacitor between 1/3 and 2/3 VCC to create a physical heartbeat.",
      "difficulty": "Expert",
      "buildTime": "30 mins"
    },
    "parts": [
      { "category": "Component", "name": "NE555 Timer IC", "quantity": 1, "why": "Hardware oscillator chip." },
      { "category": "Component", "name": "10uF Capacitor", "quantity": 1, "why": "Sets oscillation pulse width." },
      { "category": "Component", "name": "10k & 100k Resistors", "quantity": 2, "why": "Timing network." }
    ],
    "steps": [
      { "number": 1, "title": "Mount IC", "instruction": "Place the 555 across the center trench. Locate the notch or dot for Pin 1." },
      { "number": 2, "title": "Power the IC", "instruction": "Connect Pin 8 (VCC) and Pin 4 (Reset) to 5V. Connect Pin 1 to GND." },
      { "number": 3, "title": "Timing Network", "instruction": "Connect Pin 2 to Pin 6. Wire 10uF capacitor from Pin 2 to GND. Wire 10k resistor from Pin 7 to 5V, and 100k from Pin 7 to Pin 6." },
      { "number": 4, "title": "Output Load", "instruction": "Connect Pin 3 (Output) to the LED anode through a 220Ω resistor to GND." }
    ],
    "whatYouWillObserve": "The LED blinks with precision timing. You have constructed an autonomous clock generator completely independent of code.",
    "troubleshooting": [
      { "q": "The LED stays solid and never blinks.", "a": "Check capacitor polarity. The side with the minus stripe must connect to GND." }
    ],
    "simulation": "m5"
  },

  "p2cap": {
    "title": "2.6 Capstone · Pure Hardware Vault Alarm",
    "phase": "PHASE 2: Pure Hardware Fundamentals",
    "isCapstone": true,
    "overview": {
      "hook": "Integrate the LDR, Transistor, and Active Buzzer into a laser tripwire perimeter security alarm.",
      "concept": "Integrates all of Phase 2 into a complete standalone security appliance. When a beam of light hitting the LDR is broken, base bias flips the transistor on and sounds an active piezo buzzer alarm.",
      "difficulty": "Master",
      "buildTime": "45 mins"
    },
    "parts": [
      { "category": "Component", "name": "Active Buzzer", "quantity": 1, "why": "Audible security siren." },
      { "category": "Component", "name": "BC547 Transistor", "quantity": 1, "why": "High-current alarm driver." },
      { "category": "Component", "name": "LDR Sensor", "quantity": 1, "why": "Optical tripwire." }
    ],
    "steps": [
      { "number": 1, "title": "Transistor Stage", "instruction": "Mount the BC547. Emitter to GND." },
      { "number": 2, "title": "Buzzer Connection", "instruction": "Connect 5V to the Buzzer positive (+) terminal. Connect negative (-) to the Collector." },
      { "number": 3, "title": "Sensor Biasing", "instruction": "Connect LDR between 5V and Base, with a 10k potentiometer pull-down to GND for sensitivity tuning." },
      { "number": 4, "title": "Test the Tripwire", "instruction": "Shine a light on the LDR. Block the light with your hand: the buzzer screams immediately!" }
    ],
    "whatYouWillObserve": "A fully functional standalone perimeter security alarm operating with zero microcontrollers or firmware.",
    "troubleshooting": [
      { "q": "The buzzer sounds weak.", "a": "Ensure you are using an Active Buzzer (sealed sticker on top) connected directly to 5V through the transistor." }
    ]
  },

  // ── PHASE 3: SOFTWARE GATEKEEPER & C++ (SHIFTED FROM PHASE 2) ─────────
  "p3m1": {
    "title": "3.1 Setting Up the Arduino IDE & Toolchain",
    "phase": "PHASE 3: Software Gatekeeper & C++",
    "isCapstone": false,
    "overview": {
      "hook": "Configure your development environment to compile and upload firmware to the Arduino Uno R3 SMD.",
      "concept": "The Arduino IDE translates high-level C++ sketches into machine code using avr-gcc and uploads hex binaries through the USB serial bootloader.",
      "difficulty": "Beginner",
      "buildTime": "15 mins"
    },
    "parts": [
      { "category": "Microcontroller", "name": "Arduino Uno R3 SMD", "quantity": 1, "why": "Target board." },
      { "category": "Cable", "name": "USB Cable", "quantity": 1, "why": "Data connection to PC." }
    ],
    "steps": [
      { "number": 1, "title": "Install Arduino IDE", "instruction": "Download and install Arduino IDE 2.x from the official website." },
      { "number": 2, "title": "Connect USB Cable", "instruction": "Plug the Uno R3 into your PC using the USB data cable. The green ON power LED will light up." },
      { "number": 3, "title": "Select Board & Port", "instruction": "Under Tools > Board, select 'Arduino Uno'. Under Tools > Port, select the active COM port." },
      { "number": 4, "title": "CH340 Drivers (SMD Clones)", "instruction": "If your COM port does not appear on Windows, install the standard WCH CH340 USB-SERIAL driver." }
    ],
    "whatYouWillObserve": "Your computer is now fully equipped to compile C++ code and flash it into the ATmega328P Flash memory.",
    "troubleshooting": [
      { "q": "COM port doesn't show up.", "a": "Ensure you are using a genuine data cable and have installed the CH340 driver." }
    ]
  },

  "p3m2": {
    "title": "3.2 Embedded C++ Lifecycle (Blink)",
    "phase": "PHASE 3: Software Gatekeeper & C++",
    "isCapstone": false,
    "overview": {
      "hook": "Hello World! Writing your first C++ sketch to toggle Digital Pin 13 and the onboard LED.",
      "concept": "Every Arduino sketch executes setup() once at boot for pin configurations, then executes loop() continuously. We use pinMode() and digitalWrite() to control hardware.",
      "difficulty": "Beginner",
      "buildTime": "15 mins",
      "simulation": "m6"
    },
    "parts": [
      { "category": "Microcontroller", "name": "Arduino Uno R3 SMD", "quantity": 1, "why": "Running C++ firmware." }
    ],
    "steps": [
      { "number": 1, "title": "Write Setup", "instruction": "In setup(), configure Pin 13 (connected to the onboard 'L' LED) as an OUTPUT using pinMode(13, OUTPUT)." },
      { "number": 2, "title": "Write Loop", "instruction": "In loop(), write Pin 13 HIGH, delay 1000ms, write LOW, and delay 1000ms." },
      { "number": 3, "title": "Upload Sketch", "instruction": "Click the Upload button (Right Arrow) and watch the TX/RX LEDs flash as bytes transfer." }
    ],
    "whatYouWillObserve": "The onboard amber LED marked 'L' will blink on and off exactly once per second.",
    "troubleshooting": [
      { "q": "avrdude: stk500_recv(): programmer is not responding", "a": "Check your COM port under Tools > Port and ensure no other software is using the serial connection." }
    ],
    "code": {
      "filename": "BlinkUno.ino",
      "snippet": "void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}",
      "breakdown": [
        { "line": 2, "desc": "pinMode(13, OUTPUT) enables the pin driver." },
        { "line": 6, "desc": "digitalWrite(13, HIGH) puts 5.0V on the pin." },
        { "line": 7, "desc": "delay(1000) blocks execution for 1 second." }
      ]
    }
  },

  "p3m3": {
    "title": "3.3 Digital Translation & Inverted Logic",
    "phase": "PHASE 3: Software Gatekeeper & C++",
    "isCapstone": false,
    "overview": {
      "hook": "Reading physical button presses into C++ boolean variables to control external LEDs.",
      "concept": "Using INPUT_PULLUP, we eliminate external resistors. The microcontroller reads LOW when the switch completes a path to GND.",
      "difficulty": "Beginner",
      "buildTime": "20 mins"
    },
    "parts": [
      { "category": "Component", "name": "Push Button", "quantity": 1, "why": "Digital input." },
      { "category": "Component", "name": "LED & 220Ω Resistor", "quantity": 1, "why": "Output load." }
    ],
    "steps": [
      { "number": 1, "title": "Wire Button", "instruction": "Connect button between Digital Pin 2 and GND." },
      { "number": 2, "title": "Wire LED", "instruction": "Connect Digital Pin 8 through a 220Ω resistor to the LED anode, cathode to GND." },
      { "number": 3, "title": "Upload & Test", "instruction": "Upload the sketch. Press the button to light the LED." }
    ],
    "whatYouWillObserve": "The LED responds instantly to tactile contact. The microcontroller samples the pin state thousands of times per second.",
    "troubleshooting": [
      { "q": "The LED flickers randomly.", "a": "Ensure you declared pinMode(2, INPUT_PULLUP) and not plain INPUT." }
    ],
    "code": {
      "filename": "DigitalButton.ino",
      "snippet": "const int btnPin = 2;\nconst int ledPin = 8;\n\nvoid setup() {\n  pinMode(btnPin, INPUT_PULLUP);\n  pinMode(ledPin, OUTPUT);\n}\n\nvoid loop() {\n  if (digitalRead(btnPin) == LOW) {\n    digitalWrite(ledPin, HIGH);\n  } else {\n    digitalWrite(ledPin, LOW);\n  }\n}",
      "breakdown": [
        { "line": 5, "desc": "INPUT_PULLUP activates the internal pull-up resistor." },
        { "line": 10, "desc": "LOW signifies the button is pressed (connected to GND)." }
      ]
    }
  },

  "p3m4": {
    "title": "3.4 Pulse Width Modulation (PWM)",
    "phase": "PHASE 3: Software Gatekeeper & C++",
    "isCapstone": false,
    "overview": {
      "hook": "Fading an LED smoothly using 8-bit timer Pulse Width Modulation on Uno pins 3, 5, 6, 9, 10, 11.",
      "concept": "analogWrite() switches 5V on and off rapidly. A 50% duty cycle yields an effective average of 2.5V, tricking the human eye into perceiving smooth brightness fading.",
      "difficulty": "Intermediate",
      "buildTime": "20 mins"
    },
    "parts": [
      { "category": "Component", "name": "LED & 220Ω Resistor", "quantity": 1, "why": "PWM indicator." }
    ],
    "steps": [
      { "number": 1, "title": "Wire LED to PWM Pin 9", "instruction": "Connect Pin 9 to the LED anode through 220Ω, cathode to GND." },
      { "number": 2, "title": "Program Fading Loop", "instruction": "Use a for-loop incrementing duty cycle from 0 to 255 using analogWrite(9, duty)." }
    ],
    "whatYouWillObserve": "The LED pulses up and down in brightness like a rhythmic breathing indicator.",
    "troubleshooting": [
      { "q": "The LED blinks instead of fading.", "a": "Verify the pin has a tilde (~) mark! On the Uno, only Pins 3, 5, 6, 9, 10, 11 support PWM." }
    ],
    "code": {
      "filename": "PWMBreathing.ino",
      "snippet": "const int ledPin = 9;\n\nvoid setup() {\n  pinMode(ledPin, OUTPUT);\n}\n\nvoid loop() {\n  for (int duty = 0; duty <= 255; duty++) {\n    analogWrite(ledPin, duty);\n    delay(5);\n  }\n  for (int duty = 255; duty >= 0; duty--) {\n    analogWrite(ledPin, duty);\n    delay(5);\n  }\n}",
      "breakdown": [
        { "line": 9, "desc": "analogWrite() outputs a PWM square wave with duty cycle proportional to duty/255." }
      ]
    }
  },

  "p3m5": {
    "title": "3.5 UART Serial Telemetry & Debugging",
    "phase": "PHASE 3: Software Gatekeeper & C++",
    "isCapstone": false,
    "overview": {
      "hook": "Transmit live diagnostic integers and strings from your Uno to your computer over hardware UART.",
      "concept": "The Serial library enables bidirectional 8N1 communication between the ATmega328P and your PC over the USB connection.",
      "difficulty": "Intermediate",
      "buildTime": "20 mins"
    },
    "parts": [
      { "category": "Sensor", "name": "10k Potentiometer", "quantity": 1, "why": "Analog test signal." }
    ],
    "steps": [
      { "number": 1, "title": "Wire Potentiometer to A0", "instruction": "Outer legs to 5V and GND, center leg to Pin A0." },
      { "number": 2, "title": "Initialize Serial", "instruction": "In setup(), call Serial.begin(9600)." },
      { "number": 3, "title": "Stream Telemetry", "instruction": "Read A0 and print formatted strings using Serial.print() and Serial.println()." }
    ],
    "whatYouWillObserve": "Real-time numbers stream into the Serial Monitor as you turn the physical potentiometer dial.",
    "troubleshooting": [
      { "q": "Garbled characters in Serial Monitor.", "a": "Ensure your Serial Monitor baud rate dropdown is set to 9600 baud." }
    ],
    "code": {
      "filename": "SerialTelemetry.ino",
      "snippet": "void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int val = analogRead(A0);\n  float voltage = (val * 5.0) / 1023.0;\n  Serial.print(\"ADC: \"); Serial.print(val);\n  Serial.print(\" | V: \"); Serial.println(voltage, 2);\n  delay(200);\n}",
      "breakdown": [
        { "line": 2, "desc": "Initializes the ATmega328P hardware UART module at 9600 baud." }
      ]
    }
  },

  "p3cap": {
    "title": "3.6 Capstone · Precision Temperature Monitor",
    "phase": "PHASE 3: Software Gatekeeper & C++",
    "isCapstone": true,
    "overview": {
      "hook": "Build an active environmental monitor using a DHT11 sensor and RGB LED multi-tier threshold warning indicators.",
      "concept": "Combines digital single-wire protocols, analog mapping, and conditional decision-making into an active environmental monitor.",
      "difficulty": "Advanced",
      "buildTime": "30 mins"
    },
    "parts": [
      { "category": "Sensor", "name": "DHT11 Sensor", "quantity": 1, "why": "Temperature and humidity telemetry." },
      { "category": "Component", "name": "RGB LED & 220Ω Resistors", "quantity": 1, "why": "Status indicator." }
    ],
    "steps": [
      { "number": 1, "title": "Wire DHT11", "instruction": "Connect VCC to 5V, GND to GND, and Data to Digital Pin 4." },
      { "number": 2, "title": "Wire RGB LED", "instruction": "Common cathode to GND. Red pin to Pin 8, Green to Pin 9 via 220Ω resistors." },
      { "number": 3, "title": "Upload & Test", "instruction": "If temperature exceeds 28°C, the LED switches from Green to Red." }
    ],
    "whatYouWillObserve": "The system monitors environmental temperature digitally, printing metrics to the Serial Monitor and updating the RGB LED.",
    "troubleshooting": [
      { "q": "DHT11 returns NaN.", "a": "Check your wiring and ensure you allow at least 2 seconds between consecutive readTemperature() calls." }
    ],
    "code": {
      "filename": "TempMonitor.ino",
      "snippet": "#include <DHT.h>\n#define DHTPIN 4\n#define DHTTYPE DHT11\n\nDHT dht(DHTPIN, DHTTYPE);\nconst int RED_PIN = 8;\nconst int GREEN_PIN = 9;\n\nvoid setup() {\n  Serial.begin(9600);\n  dht.begin();\n  pinMode(RED_PIN, OUTPUT);\n  pinMode(GREEN_PIN, OUTPUT);\n}\n\nvoid loop() {\n  delay(2000);\n  float t = dht.readTemperature();\n  if (isnan(t)) return;\n\n  Serial.print(\"Temp: \"); Serial.print(t); Serial.println(\" C\");\n  if (t > 28.0) {\n    digitalWrite(RED_PIN, HIGH);\n    digitalWrite(GREEN_PIN, LOW);\n  } else {\n    digitalWrite(RED_PIN, LOW);\n    digitalWrite(GREEN_PIN, HIGH);\n  }\n}",
      "breakdown": [
        { "line": 5, "desc": "Initializes the DHT sensor driver on Digital Pin 4." }
      ]
    }
  },

  // ── PHASE 4: ACTUATORS, DISPLAYS & SENSORS (SHIFTED FROM PHASE 3) ─────
  "p4m1": {
    "title": "4.1 Servos & Angular Position Control",
    "phase": "PHASE 4: Actuation & Sensors",
    "isCapstone": false,
    "overview": {
      "hook": "Controlling an SG90 micro servo's exact angle using 50Hz Pulse Position Modulation.",
      "concept": "Unlike continuous DC motors, servomotors use an internal potentiometer and feedback control circuit to lock into a precise angle (0° to 180°).",
      "difficulty": "Intermediate",
      "buildTime": "20 mins",
      "simulation": "m9"
    },
    "parts": [
      { "category": "Actuator", "name": "SG90 Servo", "quantity": 1, "why": "Position-controlled motor." }
    ],
    "steps": [
      { "number": 1, "title": "Wire Servo", "instruction": "Brown to GND, Red to 5V, Orange (Signal) to Pin 10." },
      { "number": 2, "title": "Upload Sweep", "instruction": "Use <Servo.h> to sweep positions from 0° to 180°." }
    ],
    "whatYouWillObserve": "The servo arm sweeps back and forth smoothly across a 180-degree arc.",
    "troubleshooting": [
      { "q": "Arduino resets during motion.", "a": "Place a 100µF capacitor across 5V and GND to buffer servo current surges." }
    ],
    "code": {
      "filename": "ServoSweep.ino",
      "snippet": "#include <Servo.h>\nServo myServo;\n\nvoid setup() {\n  myServo.attach(10);\n}\n\nvoid loop() {\n  for (int pos = 0; pos <= 180; pos += 1) {\n    myServo.write(pos);\n    delay(15);\n  }\n  for (int pos = 180; pos >= 0; pos -= 1) {\n    myServo.write(pos);\n    delay(15);\n  }\n}",
      "breakdown": [
        { "line": 5, "desc": "Attaches the Servo control instance to Arduino Pin 10." }
      ]
    }
  },

  "p4m2": {
    "title": "4.2 I2C Display Modules (OLED & LCD)",
    "phase": "PHASE 4: Actuation & Sensors",
    "isCapstone": false,
    "overview": {
      "hook": "Drive a full alphanumeric or graphic display using only two data wires via the I2C bus.",
      "concept": "The I2C bus connects multiple peripheral chips to Arduino Pins A4 (SDA) and A5 (SCL) using 7-bit hardware addresses like 0x27 or 0x3C.",
      "difficulty": "Intermediate",
      "buildTime": "25 mins",
      "simulation": "m7"
    },
    "parts": [
      { "category": "Display", "name": "0.96 OLED or 16x2 LCD", "quantity": 1, "why": "Visual output." }
    ],
    "steps": [
      { "number": 1, "title": "Wire I2C Lines", "instruction": "VCC to 5V, GND to GND, SDA to Pin A4, SCL to Pin A5." },
      { "number": 2, "title": "Upload Display Sketch", "instruction": "Initialize the display and print test strings." }
    ],
    "whatYouWillObserve": "The screen illuminates with crisp text and telemetry metrics without tying up your digital I/O pins.",
    "troubleshooting": [
      { "q": "Screen is completely blank.", "a": "Check your I2C address! LCD backpacks are usually 0x27 or 0x3F, while OLEDs are 0x3C." }
    ],
    "code": {
      "filename": "I2C_Display.ino",
      "snippet": "#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\nLiquidCrystal_I2C lcd(0x27, 16, 2);\n\nvoid setup() {\n  lcd.init();\n  lcd.backlight();\n  lcd.setCursor(0, 0);\n  lcd.print(\"ARDUINO UNO R3\");\n  lcd.setCursor(0, 1);\n  lcd.print(\"I2C BUS ONLINE\");\n}\n\nvoid loop() {}",
      "breakdown": [
        { "line": 3, "desc": "Instantiates the I2C LCD on address 0x27." }
      ]
    }
  },

  "p4m3": {
    "title": "4.3 Environmental Sensor Arrays",
    "phase": "PHASE 4: Actuation & Sensors",
    "isCapstone": false,
    "overview": {
      "hook": "Simultaneously read temperature, humidity, and ambient light into a unified embedded telemetry string.",
      "concept": "Combines analog transducers and digital timing protocols into a synchronized sensor array.",
      "difficulty": "Intermediate",
      "buildTime": "25 mins",
      "simulation": "m8"
    },
    "parts": [
      { "category": "Sensor", "name": "DHT11 & LDR", "quantity": 2, "why": "Environmental data." }
    ],
    "steps": [
      { "number": 1, "title": "Wire DHT11 to Pin 4", "instruction": "Data to Pin 4, VCC to 5V, GND to GND." },
      { "number": 2, "title": "Wire LDR Divider to A0", "instruction": "LDR + 10k resistor divider to Analog Pin A0." },
      { "number": 3, "title": "Stream Unified Telemetry", "instruction": "Print combined sensor metrics over Serial." }
    ],
    "whatYouWillObserve": "A synchronized environmental monitoring stream showing room temperature, humidity, and lux.",
    "troubleshooting": [
      { "q": "DHT11 read failure.", "a": "Ensure minimum 2000ms delay between reads." }
    ],
    "code": {
      "filename": "SensorArray.ino",
      "snippet": "#include <DHT.h>\nDHT dht(4, DHT11);\n\nvoid setup() {\n  Serial.begin(9600);\n  dht.begin();\n}\n\nvoid loop() {\n  float t = dht.readTemperature();\n  int light = analogRead(A0);\n  Serial.print(\"Temp: \"); Serial.print(t);\n  Serial.print(\"C | Light: \"); Serial.println(light);\n  delay(2000);\n}",
      "breakdown": [
        { "line": 10, "desc": "Samples temperature and light concurrently." }
      ]
    }
  },

  "p4m4": {
    "title": "4.4 Relay High-Power Control",
    "phase": "PHASE 4: Actuation & Sensors",
    "isCapstone": false,
    "overview": {
      "hook": "Use a 5V digital signal to safely switch high-current DC motors or appliances using an electromagnetic relay.",
      "concept": "A relay uses an internal electromagnet to physically pull an isolated mechanical contact closed, isolating sensitive microcontroller circuitry from high-voltage spikes.",
      "difficulty": "Intermediate",
      "buildTime": "20 mins",
      "simulation": "m10"
    },
    "parts": [
      { "category": "Actuator", "name": "Single Channel Relay", "quantity": 1, "why": "Isolated power switch." }
    ],
    "steps": [
      { "number": 1, "title": "Wire Relay Control", "instruction": "VCC to 5V, GND to GND, and IN to Digital Pin 7." },
      { "number": 2, "title": "Upload Toggle Sketch", "instruction": "Toggle Pin 7 HIGH and LOW with 2-second delays." }
    ],
    "whatYouWillObserve": "You will hear a distinct mechanical *CLICK* as the electromagnet activates.",
    "troubleshooting": [
      { "q": "The relay LED lights up but no click.", "a": "Ensure Relay VCC connects to 5V (not 3.3V), as the coil requires 5V to engage." }
    ],
    "code": {
      "filename": "RelayControl.ino",
      "snippet": "const int RELAY_PIN = 7;\n\nvoid setup() {\n  pinMode(RELAY_PIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(RELAY_PIN, HIGH);\n  delay(2000);\n  digitalWrite(RELAY_PIN, LOW);\n  delay(2000);\n}",
      "breakdown": [
        { "line": 8, "desc": "Energizes the internal relay coil." }
      ]
    }
  },

  "p4cap": {
    "title": "4.5 Capstone · Desktop Radar Scanner",
    "phase": "PHASE 4: Actuation & Sensors",
    "isCapstone": true,
    "overview": {
      "hook": "Mount the Ultrasonic sensor on the Servo motor and visualize target distance directly on an I2C display.",
      "concept": "Combines servomotor angular positioning, ultrasonic time-of-flight ranging, and synchronous I2C display drawing.",
      "difficulty": "Master",
      "buildTime": "60 mins"
    },
    "parts": [
      { "category": "Sensor", "name": "HC-SR04 Sonar", "quantity": 1, "why": "Rangefinder." },
      { "category": "Actuator", "name": "SG90 Servo", "quantity": 1, "why": "Panning mount." },
      { "category": "Display", "name": "I2C Display", "quantity": 1, "why": "Radar HUD." }
    ],
    "steps": [
      { "number": 1, "title": "Mechanical Mount", "instruction": "Mount the HC-SR04 onto the SG90 servo horn." },
      { "number": 2, "title": "Wire Circuit", "instruction": "Servo on Pin 10, Trig on 12, Echo on 13, Display on A4/A5." },
      { "number": 3, "title": "Upload Firmware", "instruction": "Sweep the servo in 5° steps, ping the sonar, and plot distance." }
    ],
    "whatYouWillObserve": "The radar scanner sweeps across a 180° arc and plots target distances continuously.",
    "troubleshooting": [
      { "q": "Servo twitches.", "a": "Add a 100µF capacitor across the servo power lines." }
    ],
    "code": {
      "filename": "DesktopRadarUno.ino",
      "snippet": "#include <Servo.h>\n#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n\nServo scanner;\nLiquidCrystal_I2C lcd(0x27, 16, 2);\nconst int trig = 12, echo = 13;\n\nvoid setup() {\n  scanner.attach(10);\n  pinMode(trig, OUTPUT);\n  pinMode(echo, INPUT);\n  lcd.init(); lcd.backlight();\n}\n\nvoid loop() {\n  for (int a = 0; a <= 180; a += 5) scan(a);\n  for (int a = 180; a >= 0; a -= 5) scan(a);\n}\n\nvoid scan(int a) {\n  scanner.write(a);\n  delay(30);\n  digitalWrite(trig, LOW); delayMicroseconds(2);\n  digitalWrite(trig, HIGH); delayMicroseconds(10);\n  digitalWrite(trig, LOW);\n  long d = (pulseIn(echo, HIGH, 30000) * 0.0343) / 2;\n  lcd.setCursor(0, 0);\n  lcd.print(\"A:\"); lcd.print(a); lcd.print(\" D:\"); lcd.print(d); lcd.print(\"cm \");\n}",
      "breakdown": [
        { "line": 23, "desc": "Calculates distance and renders live telemetry to the I2C screen." }
      ]
    }
  },

  // ── PHASE 5: HIGH-VOLTAGE & ADVANCED SYSTEMS (SHIFTED FROM PHASE 4) ───
  "p5m1": {
    "title": "5.1 High-Power Inductive Load Driving",
    "phase": "PHASE 5: High-Voltage Bridge & Advanced Systems",
    "isCapstone": false,
    "overview": {
      "hook": "Safely driving high-current inductive loads (DC motors and solenoid valves) with flyback diode protection.",
      "concept": "Inductive loads store energy in magnetic fields. When switched off, the collapsing field generates massive reverse voltage spikes. We implement flyback diodes and relay isolation.",
      "difficulty": "Advanced",
      "buildTime": "30 mins",
      "simulation": "m11"
    },
    "parts": [
      { "category": "Actuator", "name": "Relay Module & DC Motor", "quantity": 1, "why": "Inductive load." },
      { "category": "Component", "name": "1N4007 Diode", "quantity": 1, "why": "Flyback protection." }
    ],
    "steps": [
      { "number": 1, "title": "Wire Relay", "instruction": "Wire relay control to Pin 7. Wire motor power through the relay COM and NO terminals." },
      { "number": 2, "title": "Install Flyback Diode", "instruction": "Place diode in reverse across motor terminals (cathode to positive)." }
    ],
    "whatYouWillObserve": "The motor engages smoothly without causing electromagnetic interference or microcontroller resets.",
    "troubleshooting": [
      { "q": "Microcontroller crashes when motor stops.", "a": "Flyback diode is missing or backwards! Always install reverse diode protection across inductive coils." }
    ]
  },

  "p5m2": {
    "title": "5.2 Serial Packet Protocols & Checksums",
    "phase": "PHASE 5: High-Voltage Bridge & Advanced Systems",
    "isCapstone": false,
    "overview": {
      "hook": "Design robust framed communication packets with start/stop bytes and XOR checksum verification.",
      "concept": "Industrial embedded networks require structured packet framing to reject noise and guarantee payload integrity.",
      "difficulty": "Advanced",
      "buildTime": "35 mins",
      "simulation": "m12"
    },
    "parts": [
      { "category": "Microcontroller", "name": "Arduino Uno R3 SMD", "quantity": 1, "why": "Protocol processor." }
    ],
    "steps": [
      { "number": 1, "title": "Define Packet Format", "instruction": "Structure packets as [START_BYTE, COMMAND, VALUE, CHECKSUM, END_BYTE]." },
      { "number": 2, "title": "Implement Parser", "instruction": "Parse incoming UART buffer in real-time." }
    ],
    "whatYouWillObserve": "Commands are executed reliably only when packet checksums validate.",
    "troubleshooting": [
      { "q": "Corrupted bytes received.", "a": "Ensure baud rate matches on both host and microcontroller." }
    ]
  },

  "p5m3": {
    "title": "5.3 Bidirectional Host Control",
    "phase": "PHASE 5: High-Voltage Bridge & Advanced Systems",
    "isCapstone": false,
    "overview": {
      "hook": "Full bidirectional master-slave control: control Arduino actuators from custom PC Python scripts.",
      "concept": "Establishing a bidirectional command pipeline between host computers and embedded microcontrollers.",
      "difficulty": "Advanced",
      "buildTime": "35 mins"
    },
    "parts": [
      { "category": "Microcontroller", "name": "Arduino Uno R3 SMD", "quantity": 1, "why": "Slave node." }
    ],
    "steps": [
      { "number": 1, "title": "Upload Firmware", "instruction": "Upload command dispatcher sketch." },
      { "number": 2, "title": "Run Host Script", "instruction": "Send serial command bytes from PC terminal." }
    ],
    "whatYouWillObserve": "Hardware responds in real-time to commands sent from your host computer.",
    "troubleshooting": [
      { "q": "Port busy error.", "a": "Close the Arduino Serial Monitor before running external Python scripts." }
    ]
  },

  "p5cap": {
    "title": "5.4 Capstone · Integrated Industrial Automation Node",
    "phase": "PHASE 5: High-Voltage Bridge & Advanced Systems",
    "isCapstone": true,
    "overview": {
      "hook": "The ultimate industrial node: multi-sensor telemetry, actuator isolation, hardware watchdog, and fail-safe automation.",
      "concept": "Combines all advanced hardware and firmware principles into a fail-safe embedded controller.",
      "difficulty": "Master",
      "buildTime": "90 mins"
    },
    "parts": [
      { "category": "Microcontroller", "name": "Arduino Uno R3 SMD", "quantity": 1, "why": "Core PLC." },
      { "category": "Sensor", "name": "Sensors Array", "quantity": 3, "why": "Telemetry." },
      { "category": "Actuator", "name": "Relay & Servo", "quantity": 2, "why": "Output stages." }
    ],
    "steps": [
      { "number": 1, "title": "Wire System", "instruction": "Connect sensor array, relay, and servo with proper power decoupling." },
      { "number": 2, "title": "Upload Modular Controller", "instruction": "Flash non-blocking firmware with watchdog timer." }
    ],
    "whatYouWillObserve": "A robust, industrial-grade automation station monitoring sensors and actuating loads with rock-solid stability.",
    "troubleshooting": [
      { "q": "Watchdog triggers reset.", "a": "Ensure no blocking delays exceed the watchdog timer window." }
    ]
  }
};
