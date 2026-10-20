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
    "title": "1.1 Day 1 · Digital Outputs & Municipal Traffic Light Controller",
    "phase": "PHASE 1: The Arduino Cohort (GEC Thrissur)",
    "isCapstone": false,
    "overview": {
      "hook": "Master the ATmega328P GPIO internal architecture, derive current-limiting resistors using Ohm's Law, and architect an automated timed municipal traffic signal controller with hazard flashing modes.",
      "concept": "Microcontroller General Purpose Input/Output (GPIO) pins operate as software-controllable solid-state CMOS push-pull switches. At 5.0V logic, the ATmega328P can source or sink up to 40mA per pin (20mA recommended for longevity) with an absolute maximum chip aggregate of 200mA across its VCC and GND pins. In this module, we explore the fundamental embedded program execution lifecycle (setup() vs loop()), calculate exact series resistance to prevent thermal runaway in LEDs, and implement a deterministic timed state machine for vehicular flow and pedestrian standby hazards.",
      "difficulty": "Beginner",
      "buildTime": "30 mins"
    },
    "keyFormulas": [
      {
        "name": "Ohm's Law for Series LED Resistors",
        "formula": "R = (V_CC - V_f) / I_f",
        "desc": "Calculates required ballast resistance. For a Red LED on 5V Uno: R = (5.0V - 2.0V) / 0.015A = 200Ω → standard 220Ω."
      },
      {
        "name": "Resistor Power Dissipation",
        "formula": "P = I_f² × R = V_R² / R",
        "desc": "P = (0.0136A)² × 220Ω = 40.7 mW. Standard 1/4W (250 mW) carbon film resistors operate well below their thermal limit."
      },
      {
        "name": "Total Chip Current Budget",
        "formula": "I_total = Σ I_pin ≤ 200 mA",
        "desc": "The entire ATmega328P package must not exceed 200mA total current across all I/O pins combined to prevent substrate overheating."
      },
      {
        "name": "E12 4-Band Resistor Color Code (220Ω)",
        "formula": "Red (2) · Red (2) · Brown (×10) · Gold (±5%)",
        "desc": "First band = 2, second band = 2, multiplier = 10¹, tolerance = ±5% (209Ω to 231Ω allowable range)."
      }
    ],
    "parts": [
      {
        "category": "Microcontroller",
        "name": "Arduino Uno R3 SMD (ATmega328P)",
        "quantity": 1,
        "why": "Central processor providing timed 5V push-pull digital GPIO switching."
      },
      {
        "category": "Visual Indicators",
        "name": "Red, Yellow & Green 5mm Diffused LEDs",
        "quantity": 3,
        "why": "Optical indicators representing municipal 3-phase traffic signaling."
      },
      {
        "category": "Passive Protection",
        "name": "220Ω 1/4W Carbon Film Resistors",
        "quantity": 3,
        "why": "Limits forward diode current to ~14mA to safeguard the ATmega328P output transistors."
      },
      {
        "category": "Prototyping",
        "name": "Half-Size Solderless Breadboard & M-M Jumpers",
        "quantity": 6,
        "why": "Establishes a common ground reference rail and organizes component tie-points."
      }
    ],
    "wiringMap": [
      {
        "pin": "Uno Digital Pin 8",
        "tiePoint": "Breadboard Row 15e",
        "component": "Red LED Anode (Long Lead +)",
        "wire": "Red Jumper Wire",
        "notes": "PORTB Pin 0. High (5V) illuminates Red signal."
      },
      {
        "pin": "Uno Digital Pin 9",
        "tiePoint": "Breadboard Row 20e",
        "component": "Yellow LED Anode (Long Lead +)",
        "wire": "Yellow Jumper Wire",
        "notes": "PORTB Pin 1. High (5V) illuminates Yellow caution."
      },
      {
        "pin": "Uno Digital Pin 10",
        "tiePoint": "Breadboard Row 25e",
        "component": "Green LED Anode (Long Lead +)",
        "wire": "Green Jumper Wire",
        "notes": "PORTB Pin 2. High (5V) illuminates Green go."
      },
      {
        "pin": "Breadboard Row 16a",
        "tiePoint": "Blue Negative (-) Rail",
        "component": "Red LED Cathode (Short Lead -)",
        "wire": "220Ω Resistor Lead",
        "notes": "Series ballast resistor connecting LED cathode to ground."
      },
      {
        "pin": "Breadboard Row 21a",
        "tiePoint": "Blue Negative (-) Rail",
        "component": "Yellow LED Cathode (Short Lead -)",
        "wire": "220Ω Resistor Lead",
        "notes": "Series ballast resistor connecting LED cathode to ground."
      },
      {
        "pin": "Breadboard Row 26a",
        "tiePoint": "Blue Negative (-) Rail",
        "component": "Green LED Cathode (Short Lead -)",
        "wire": "220Ω Resistor Lead",
        "notes": "Series ballast resistor connecting LED cathode to ground."
      },
      {
        "pin": "Uno GND Header",
        "tiePoint": "Blue Negative (-) Power Rail",
        "component": "Common Ground Reference",
        "wire": "Black Jumper Wire",
        "notes": "Completes the return circuit for all three LED cathode loops."
      }
    ],
    "steps": [
      {
        "number": 1,
        "title": "Establish the Common Ground Reference Rail",
        "instruction": "Firmly insert a black male-to-male jumper wire from one of the Arduino Uno's header pins labeled <strong>GND</strong> into the blue negative power bus strip (-) of your breadboard. This common reference rail provides the 0V return path for all three LED circuits.",
        "sanityCheck": "Always use black or dark jumper wires for ground connections to maintain standardized electrical color coding."
      },
      {
        "number": 2,
        "title": "Insert the Three Signal LEDs with Correct Polarity",
        "instruction": "Carefully identify the polarity of each 5mm LED. The longer leg is the <strong>anode (+)</strong> and the shorter leg beside the flat rim on the plastic epoxy lens is the <strong>cathode (-)</strong>. Plug the Red LED anode into Row 15e and cathode into Row 16e. Plug the Yellow LED anode into Row 20e and cathode into Row 21e. Plug the Green LED anode into Row 25e and cathode into Row 26e.",
        "sanityCheck": "Plugging an LED backward will not destroy it at 5V, but it will block all current and fail to illuminate.",
        "proTip": "Ensure the legs are pushed straight down into the breadboard clips without bending or touching adjacent rows."
      },
      {
        "number": 3,
        "title": "Install 220Ω Current-Limiting Resistors",
        "instruction": "Insert one 220Ω resistor (Color bands: <em>Red-Red-Brown-Gold</em>) between Row 16a (Red cathode) and the blue negative ground rail. Repeat for the Yellow LED (Row 21a to ground rail) and the Green LED (Row 26a to ground rail).",
        "sanityCheck": "Never omit the current-limiting resistor! Connecting an LED directly between a 5V digital output and GND causes a dead short that can permanently burn out the microcontroller's internal output MOSFET.",
        "proTip": "Trim or bend the resistor leads into neat 90° U-shapes so they sit flush against the breadboard surface."
      },
      {
        "number": 4,
        "title": "Connect the Microcontroller GPIO Control Lines",
        "instruction": "Connect a red jumper wire from Arduino <strong>Digital Pin 8</strong> to Breadboard Row 15a (Red LED anode). Connect a yellow jumper wire from <strong>Digital Pin 9</strong> to Breadboard Row 20a (Yellow LED anode). Connect a green jumper wire from <strong>Digital Pin 10</strong> to Breadboard Row 25a (Green LED anode).",
        "sanityCheck": "Verify that your jumper wires plug into the same numbered 5-hole terminal strip rows as the corresponding LED anodes."
      },
      {
        "number": 5,
        "title": "Configure GPIO Data Direction Registers in setup()",
        "instruction": "Inside the Arduino IDE sketch, use <code>pinMode(pin, OUTPUT)</code> in the <code>setup()</code> function for Pins 8, 9, and 10. This modifies the ATmega328P's internal Data Direction Register (DDRB), switching the pins from high-impedance inputs to active 5V push-pull drivers.",
        "proTip": "The setup() function executes exactly once upon microcontroller power-up or hardware reset."
      },
      {
        "number": 6,
        "title": "Architect the 4-Phase Timed Municipal State Machine",
        "instruction": "In the <code>loop()</code> function, construct the deterministic state sequence: Green ON (3500ms) → Yellow ON (1500ms) → Red ON (3500ms) → Red + Yellow ON (1200ms prepare-to-go phase). Compile and upload the sketch to the Arduino Uno R3 over USB.",
        "sanityCheck": "Before each phase transition, explicitly set unused digital pins to LOW to prevent multiple conflicting lights from remaining lit simultaneously."
      }
    ],
    "whatYouWillObserve": "Upon successful sketch upload, the green LED illuminates for 3.5 seconds signaling safe vehicular passage, followed by an amber yellow warning for 1.5 seconds, transitioning to red for 3.5 seconds. Before returning to green, the red and yellow illuminate together for 1.2 seconds, replicating modern international traffic control standards.",
    "troubleshooting": [
      {
        "q": "None of the three LEDs illuminate when the sketch runs.",
        "cause": "Reversed diode polarity or a missing connection between the breadboard negative rail and the Arduino GND header.",
        "solution": "Verify that the longer LED lead (anode) connects to the Arduino digital pin and the shorter lead (cathode) connects to GND through the 220Ω resistor. Ensure the black jumper wire is plugged into an authentic GND pin on the Arduino Uno."
      },
      {
        "q": "Why is the Green LED slightly dimmer than the Red LED with the same 220Ω resistor?",
        "cause": "Different semiconductor bandgaps result in different forward voltage drops (Vf).",
        "solution": "Red LEDs drop ~1.8V to 2.0V, leaving (5V - 2.0V) = 3.0V across the resistor (I = 13.6mA). Green LEDs drop ~3.0V, leaving only (5V - 3.0V) = 2.0V across the resistor (I = 9.1mA). To equalize brightness, use a 150Ω resistor on the green channel."
      },
      {
        "q": "One of the LEDs glows dimly even when the code commands it LOW.",
        "cause": "The pin was left in high-impedance floating input mode or digital output voltage is leaking through a shared breadboard row.",
        "solution": "Verify that pinMode(pin, OUTPUT) is declared inside setup(). A pin left as INPUT will weakly illuminate an LED if its internal pull-up is accidentally enabled."
      },
      {
        "q": "The Arduino board disconnects from USB or reboots repeatedly.",
        "cause": "A short circuit between 5V/output pins and GND caused by an LED inserted without a series resistor.",
        "solution": "Immediately disconnect USB power. Inspect every LED to verify that a 220Ω resistor is in series with the cathode before ground."
      }
    ],
    "simulation": "traffic_light",
    "code": {
      "filename": "MunicipalTrafficController.ino",
      "snippet": "/*\n * GEC Thrissur - The Arduino Cohort: Day 1\n * Municipal 4-Phase Traffic Light Controller\n * Platform: Arduino Uno R3 SMD (ATmega328P @ 16MHz)\n */\n\nconst int RED_PIN = 8;     // PORTB Pin 0\nconst int YELLOW_PIN = 9;  // PORTB Pin 1\nconst int GREEN_PIN = 10;  // PORTB Pin 2\n\nvoid setup() {\n  // Configure Data Direction Registers (DDRB) for 5V push-pull output\n  pinMode(RED_PIN, OUTPUT);\n  pinMode(YELLOW_PIN, OUTPUT);\n  pinMode(GREEN_PIN, OUTPUT);\n  \n  // Initialize all lights to safe state (RED active)\n  digitalWrite(GREEN_PIN, LOW);\n  digitalWrite(YELLOW_PIN, LOW);\n  digitalWrite(RED_PIN, HIGH);\n  delay(1000);\n}\n\nvoid loop() {\n  // ── PHASE 1: GREEN (Vehicular Go) ────────────────\n  digitalWrite(RED_PIN, LOW);\n  digitalWrite(YELLOW_PIN, LOW);\n  digitalWrite(GREEN_PIN, HIGH);\n  delay(3500); // 3.5 seconds flow\n\n  // ── PHASE 2: YELLOW (Clearance Caution) ──────────\n  digitalWrite(GREEN_PIN, LOW);\n  digitalWrite(YELLOW_PIN, HIGH);\n  delay(1500); // 1.5 seconds warning\n\n  // ── PHASE 3: RED (Full Stop / Pedestrian Cross) ──\n  digitalWrite(YELLOW_PIN, LOW);\n  digitalWrite(RED_PIN, HIGH);\n  delay(3500); // 3.5 seconds stop\n\n  // ── PHASE 4: RED + YELLOW (Prepare to Start) ─────\n  digitalWrite(YELLOW_PIN, HIGH); // Red remains HIGH\n  delay(1200); // 1.2 seconds prepare\n}",
      "breakdown": [
        { "line": 8, "desc": "Declares const int identifiers for pin mapping, allowing the avr-gcc compiler to optimize register operations and prevent accidental variable reassignments." },
        { "line": 14, "desc": "pinMode(pin, OUTPUT) configures the ATmega328P Data Direction Register (DDRB) to enable the complementary N-channel and P-channel MOSFET push-pull output drivers." },
        { "line": 20, "desc": "Sets the default fail-safe condition immediately upon reboot, guaranteeing that traffic enters the intersection only after the system stabilises." },
        { "line": 28, "desc": "digitalWrite(GREEN_PIN, HIGH) sets PORTB bit 2 to 1, delivering 5.0V to the Green LED anode with ~10mA forward current." },
        { "line": 39, "desc": "Phase 4 illuminates both Red and Yellow simultaneously, matching British and European standard signal transition protocols." }
      ]
    },
    "takeHomeChallenge": {
      "title": "Night-Time Pedestrian Standby Flasher",
      "objective": "Expand the traffic light firmware to support a dual-mode municipal operation: a normal 4-phase daytime cycle and a 1Hz yellow standby hazard flasher for low-traffic midnight hours.",
      "tasks": [
        "Create a state variable bool nightMode = false; to toggle between daytime and nighttime operation.",
        "In nightMode, write a non-blocking loop that pulses the Yellow LED ON for 500ms and OFF for 500ms (1.0 Hz European hazard warning standard).",
        "Add a momentary pushbutton on Digital Pin 2 that allows an operator to toggle between daytime cycling and night-time hazard flasher modes."
      ],
      "hint": "Explore using millis() instead of delay() so the button press can be registered instantaneously even while the yellow light is flashing."
    }
  },

  "p1m2": {
    "title": "1.2 Day 2 · Digital Inputs, 10-Bit ADC & Serial Telemetry",
    "phase": "PHASE 1: The Arduino Cohort (GEC Thrissur)",
    "isCapstone": false,
    "overview": {
      "hook": "Bridge the physical analog world to digital software: read momentary pushbuttons with internal pull-up resistors, sample continuous analog voltages via the 10-bit SAR ADC, and stream formatted UART telemetry over USB.",
      "concept": "Digital microcontrollers require deterministic voltage levels. Leaving an input pin disconnected results in a high-impedance 'floating' state where ambient electromagnetic interference induces random 0V and 5V fluctuations. To resolve this without external components, we activate the ATmega328P's internal 20kΩ-50kΩ pull-up resistor using INPUT_PULLUP. For analog acquisition, the chip incorporates a 10-bit Successive Approximation Register (SAR) Analog-to-Digital Converter (ADC) that quantizes input voltages between 0V and 5.0V into 1024 discrete integer steps (4.887mV/step). We construct a voltage divider using a Cadmium-Sulfide (CdS) Light Dependent Resistor (LDR) and implement a software hysteresis deadband to prevent twilight relay chatter.",
      "difficulty": "Beginner",
      "buildTime": "35 mins"
    },
    "keyFormulas": [
      {
        "name": "ADC Quantization Resolution",
        "formula": "V_step = V_REF / 1024 = 5.000V / 1024 ≈ 4.8828 mV/count",
        "desc": "Converts integer ADC counts (0-1023) to physical voltage: V_in = ADC_val × (5.0 / 1023.0)."
      },
      {
        "name": "Voltage Divider Transfer Equation",
        "formula": "V_out = V_CC × [R_fixed / (R_sensor + R_fixed)]",
        "desc": "For a 10kΩ fixed resistor and LDR: as ambient light increases, R_ldr decreases from 50kΩ to 1kΩ, causing V_out on Analog Pin A1 to rise."
      },
      {
        "name": "Software Hysteresis Deadband",
        "formula": "ΔV_hyst = V_OFF - V_ON = (450 - 350) × 4.887mV ≈ 488.7 mV",
        "desc": "Separates turn-ON (350 count) and turn-OFF (450 count) thresholds to completely eliminate optical/electrical boundary oscillation."
      },
      {
        "name": "Hardware UART 9600 Baud Timing",
        "formula": "T_bit = 1 / 9600 baud ≈ 104.16 μs per bit",
        "desc": "Standard 8N1 serial frame (1 Start bit + 8 Data bits + 1 Stop bit = 10 bits total) transmits 960 bytes/second over USB."
      }
    ],
    "parts": [
      {
        "category": "Microcontroller",
        "name": "Arduino Uno R3 SMD (ATmega328P)",
        "quantity": 1,
        "why": "Integrated 10-bit SAR ADC multiplexer and hardware USART serial engine."
      },
      {
        "category": "Passive Sensor",
        "name": "10kΩ Linear Rotary Potentiometer",
        "quantity": 1,
        "why": "Provides an adjustable 0V to 5.0V manual analog voltage reference into Pin A0."
      },
      {
        "category": "Optical Sensor",
        "name": "5mm Cadmium-Sulfide (CdS) Photoresistor (LDR)",
        "quantity": 1,
        "why": "Variable resistance sensor changing from ~50kΩ in dark to ~1kΩ in bright ambient light."
      },
      {
        "category": "Passive Divider",
        "name": "10kΩ 1/4W Resistor (Brown-Black-Orange-Gold)",
        "quantity": 1,
        "why": "Forms the fixed reference leg of the LDR voltage divider on Pin A1."
      },
      {
        "category": "Tactile Input",
        "name": "6mm Momentary Pushbutton",
        "quantity": 1,
        "why": "Mechanical contact providing deterministic active-low digital switching on Pin 2."
      }
    ],
    "wiringMap": [
      {
        "pin": "Uno Digital Pin 2",
        "tiePoint": "Breadboard Row 10c",
        "component": "Pushbutton Terminal 1",
        "wire": "Cyan Jumper Wire",
        "notes": "Configured as INPUT_PULLUP. Reads HIGH when released, LOW when pressed."
      },
      {
        "pin": "Breadboard Row 12c",
        "tiePoint": "Blue Negative (-) Ground Rail",
        "component": "Pushbutton Terminal 2",
        "wire": "Black Jumper Wire",
        "notes": "Connects diagonal button leg to GND. Pressing button shorts Pin 2 to 0V."
      },
      {
        "pin": "Uno Analog Pin A0",
        "tiePoint": "Potentiometer Center Wiper",
        "component": "Potentiometer Pin 2",
        "wire": "Blue Jumper Wire",
        "notes": "Reads adjustable analog divider voltage from 0.00V to 5.00V."
      },
      {
        "pin": "Red Positive (+) 5V Rail",
        "tiePoint": "Potentiometer Outer Terminal 1",
        "component": "Potentiometer Pin 1",
        "wire": "Red Jumper Wire",
        "notes": "Supplies 5.0V across the internal 10kΩ resistive carbon track."
      },
      {
        "pin": "Blue Negative (-) GND Rail",
        "tiePoint": "Potentiometer Outer Terminal 3",
        "component": "Potentiometer Pin 3",
        "wire": "Black Jumper Wire",
        "notes": "Connects opposite end of carbon track to 0V ground."
      },
      {
        "pin": "Uno Analog Pin A1",
        "tiePoint": "Breadboard Row 20c (Divider Node)",
        "component": "LDR & 10kΩ Resistor Junction",
        "wire": "Yellow Jumper Wire",
        "notes": "Voltage divider tap. Voltage varies with ambient lux."
      },
      {
        "pin": "Red Positive (+) 5V Rail",
        "tiePoint": "Breadboard Row 20a",
        "component": "10kΩ Fixed Resistor",
        "wire": "Resistor Lead",
        "notes": "Upper divider leg pulling the junction toward 5V."
      },
      {
        "pin": "Breadboard Row 20e",
        "tiePoint": "Blue Negative (-) GND Rail",
        "component": "CdS LDR Photoresistor",
        "wire": "LDR Wire Lead",
        "notes": "Lower divider leg pulling junction toward GND as illumination increases."
      }
    ],
    "steps": [
      {
        "number": 1,
        "title": "Wire Digital Pin 2 with Internal Pull-Up Architecture",
        "instruction": "Insert the 6mm momentary tactile button across the center divider trough of the breadboard (Row 10 and Row 12). Connect a jumper wire from Arduino <strong>Digital Pin 2</strong> to Row 10c. Connect a black jumper wire from Row 12c to the blue negative ground rail. No external resistor is needed because we activate the ATmega328P's internal 30kΩ pull-up in code.",
        "sanityCheck": "Tactile buttons have two pairs of internally connected legs. Always connect across diagonal corners to ensure switching action.",
        "proTip": "With INPUT_PULLUP, the logic is inverted: digitalRead(2) returns HIGH (1) when unpressed and LOW (0) when pressed."
      },
      {
        "number": 2,
        "title": "Wire the 10kΩ Potentiometer to Analog Pin A0",
        "instruction": "Plug the 3-pin rotary potentiometer into three adjacent rows on the breadboard. Connect outer pin 1 to the 5V power rail, outer pin 3 to the GND rail, and connect the center wiper pin to Arduino <strong>Analog Pin A0</strong>.",
        "sanityCheck": "Never wire both outer pins together to 5V! The outer pins must span across the power supply rails to form a true variable voltage divider."
      },
      {
        "number": 3,
        "title": "Construct the LDR Voltage Divider on Analog Pin A1",
        "instruction": "Place one leg of the 10kΩ fixed resistor (Brown-Black-Orange) into the 5V rail and the other into Breadboard Row 20a. Place one leg of the LDR photoresistor into Row 20e and the other into the GND rail. Connect a jumper wire from Row 20c directly to Arduino <strong>Analog Pin A1</strong>.",
        "sanityCheck": "Row 20 is the central voltage divider node. Both the resistor, the LDR, and the jumper to A1 must share this exact row."
      },
      {
        "number": 4,
        "title": "Initialize Hardware USART Serial at 9600 Baud",
        "instruction": "In the <code>setup()</code> routine, call <code>Serial.begin(9600);</code>. This configures the ATmega328P's hardware UART baud rate generator, allocating Digital Pin 0 (RX) and Digital Pin 1 (TX) for asynchronous communication over the onboard ATmega16U2 USB-to-serial converter.",
        "proTip": "Open the Arduino IDE Serial Monitor (Ctrl+Shift+M) and ensure the dropdown in the bottom right is set to exactly 9600 baud."
      },
      {
        "number": 5,
        "title": "Acquire 10-Bit ADC Channels and Stream Telemetry",
        "instruction": "Inside <code>loop()</code>, call <code>analogRead(A0)</code> and <code>analogRead(A1)</code>. The ATmega328P successive approximation converter halts for ~104 microseconds to charge its sample-and-hold capacitor and returns an integer from 0 to 1023. Format and print these values over Serial.",
        "sanityCheck": "analogRead() takes approximately 100 microseconds per sample. Do not spam analogRead() in microsecond loops without allowing sample-and-hold settling time."
      },
      {
        "number": 6,
        "title": "Program the Hysteresis Twilight Night-Light Controller",
        "instruction": "To prevent an LED from rapidly chattering when ambient room light hovers right at the switching threshold, program a dual-threshold deadband: activate the built-in LED (Pin 13) when A1 drops below 350 counts, and deactivate it only when A1 rises back above 450 counts.",
        "proTip": "The 100-count deadband corresponds to ~488mV of electrical noise immunity, eliminating optical relay oscillation."
      }
    ],
    "whatYouWillObserve": "Rotating the potentiometer knob produces a silky-smooth integer progression from 0 (0.00V) up to 1023 (5.00V) in the Serial Monitor. Pressing the button prints immediate state transitions. Covering the LDR with your palm drops the analog reading below 350, triggering the Pin 13 night-light LED with zero boundary flicker.",
    "troubleshooting": [
      {
        "q": "Why does digitalRead(2) return 1 when unpressed and 0 when pressed?",
        "cause": "Inverted pull-up logic. The internal resistor continuously pulls the input up to 5.0V (HIGH) until closing the mechanical contact grounds the pin to 0.0V (LOW).",
        "solution": "Invert your conditional check in code: if (digitalRead(BTN_PIN) == LOW) { /* Pressed */ }."
      },
      {
        "q": "Analog readings jump erratically between 200 and 800 without touching the potentiometer.",
        "cause": "The analog pin is floating because the center wiper jumper is loose or plugged into an incorrect breadboard row.",
        "solution": "Re-seat the jumper firmly into the center terminal row of the potentiometer. High-impedance CMOS analog inputs float wildly when ungrounded."
      },
      {
        "q": "The Serial Monitor displays bizarre question marks and inverted symbols (⸮⸮⸮).",
        "cause": "Baud rate mismatch between microcontroller USART configuration and PC terminal client.",
        "solution": "Set the baud rate dropdown in the bottom-right corner of the Arduino IDE Serial Monitor window to exactly 9600 baud to match Serial.begin(9600)."
      },
      {
        "q": "The button press triggers multiple rapid false events on a single physical tap.",
        "cause": "Mechanical contact bounce. Elastic spring leaves vibrate against each other for 5ms to 20ms upon closure.",
        "solution": "Implement software lockout debouncing by storing unsigned long lastDebounceTime and verifying that at least 50ms has elapsed since the last state change."
      }
    ],
    "simulation": "adc_serial_telemetry",
    "code": {
      "filename": "TelemetryAndHysteresis.ino",
      "snippet": "/*\n * GEC Thrissur - The Arduino Cohort: Day 2\n * 10-Bit ADC Telemetry, Pull-Up Inputs & Hysteresis Controller\n * Platform: Arduino Uno R3 SMD (ATmega328P @ 16MHz)\n */\n\nconst int BTN_PIN = 2;       // Digital input with internal pull-up\nconst int POT_PIN = A0;      // 10-bit analog voltage channel 0\nconst int LDR_PIN = A1;      // 10-bit analog voltage channel 1\nconst int LED_PIN = 13;      // Built-in status indicator\n\n// Hysteresis deadband thresholds (0-1023)\nconst int THRESHOLD_DARK = 350;   // ~1.71V - Turn ON night light\nconst int THRESHOLD_BRIGHT = 450; // ~2.20V - Turn OFF night light\nbool nightLightState = false;\n\nvoid setup() {\n  // Initialize hardware USART at 9600 baud\n  Serial.begin(9600);\n  \n  // Activate internal 20k-50k ohm pull-up on Digital Pin 2\n  pinMode(BTN_PIN, INPUT_PULLUP);\n  pinMode(LED_PIN, OUTPUT);\n  digitalWrite(LED_PIN, LOW);\n  \n  Serial.println(F(\"--- ARDUINO COHORT: DAY 2 TELEMETRY INITIALIZED ---\"));\n}\n\nvoid loop() {\n  // 1. Sample digital active-low input\n  bool btnPressed = (digitalRead(BTN_PIN) == LOW);\n\n  // 2. Sample 10-bit Successive Approximation ADC (4.887mV/step)\n  int rawPot = analogRead(POT_PIN);\n  int rawLdr = analogRead(LDR_PIN);\n\n  // Convert ADC integer to physical voltage\n  float potVoltage = (rawPot * 5.0) / 1023.0;\n  float ldrVoltage = (rawLdr * 5.0) / 1023.0;\n\n  // 3. Evaluate Schmitt-Trigger Hysteresis Deadband\n  if (rawLdr < THRESHOLD_DARK) {\n    nightLightState = true;  // Ambient light dropped below lower limit\n  } else if (rawLdr > THRESHOLD_BRIGHT) {\n    nightLightState = false; // Ambient light climbed above upper limit\n  }\n  digitalWrite(LED_PIN, nightLightState ? HIGH : LOW);\n\n  // 4. Stream formatted telemetry packet over UART\n  Serial.print(F(\"POT:\"));\n  Serial.print(rawPot);\n  Serial.print(F(\" (\"));\n  Serial.print(potVoltage, 2);\n  Serial.print(F(\"V) | LDR:\"));\n  Serial.print(rawLdr);\n  Serial.print(F(\" (\"));\n  Serial.print(ldrVoltage, 2);\n  Serial.print(F(\"V) | BTN:\"));\n  Serial.print(btnPressed ? F(\"PRESSED\") : F(\"RELEASED\"));\n  Serial.print(F(\" | LAMP:\"));\n  Serial.println(nightLightState ? F(\"ON\") : F(\"OFF\"));\n\n  delay(200); // 5Hz telemetry sampling rate\n}",
      "breakdown": [
        { "line": 23, "desc": "pinMode(BTN_PIN, INPUT_PULLUP) enables the internal ATmega328P pull-up resistor, ensuring deterministic 5V logic when the mechanical contacts are open." },
        { "line": 34, "desc": "analogRead() initiates a 10-bit Successive Approximation ADC conversion, clocking the internal ADC prescaler at 125kHz to achieve ±2 LSB accuracy." },
        { "line": 42, "desc": "Hysteresis state machine compares against two separate thresholds, providing 488mV of noise margin to eliminate boundary relay contact chatter." },
        { "line": 49, "desc": "Serial.print(F(...)) places string literals into flash memory (PROGMEM) instead of SRAM, conserving the ATmega328P's limited 2KB RAM." }
      ]
    },
    "takeHomeChallenge": {
      "title": "Industrial Twilight Controller with User-Calibrated Sensitivity",
      "objective": "Build a self-calibrating ambient lighting controller where the user can adjust the hysteresis trigger sensitivity in real-time using the rotary potentiometer.",
      "tasks": [
        "Use the A0 potentiometer reading (0-1023) to dynamically define the lower threshold: int dynamicDark = map(rawPot, 0, 1023, 100, 700);.",
        "Set the upper threshold automatically to dynamicDark + 100 counts to maintain a constant 488mV deadband margin regardless of user tuning.",
        "Log the dynamic threshold and ambient lux to the Arduino IDE Serial Plotter so students can visually observe the real-time hysteresis deadband window."
      ],
      "hint": "The Serial Plotter automatically graphs comma-separated numeric outputs. Print: Serial.print(rawLdr); Serial.print(','); Serial.print(dynamicDark); Serial.println(dynamicDark + 100);"
    }
  },

  "p1m3": {
    "title": "1.3 Day 3 · PWM Modulation, Sound & Ultrasonic Distance Sonar",
    "phase": "PHASE 1: The Arduino Cohort (GEC Thrissur)",
    "isCapstone": false,
    "overview": {
      "hook": "Synthesize analog-like voltages using high-speed hardware timer Pulse Width Modulation (PWM), drive acoustic frequencies through a passive piezo transducer, and construct an automotive reverse parking radar using ultrasonic time-of-flight physics.",
      "concept": "Digital microcontrollers can only output binary 0V or 5V rails. To create intermediate voltage levels for LED dimming or motor throttle control, the ATmega328P incorporates 8-bit hardware timers that generate Pulse Width Modulation (PWM) at 490Hz (Pins 3, 9, 10, 11) and 980Hz (Pins 5, 6). By modulating duty cycle from 0 to 255 with analogWrite(), we synthesize variable average voltages. For acoustics, we drive passive piezoelectric buzzers using tone() square waves. Finally, we interface the HC-SR04 ultrasonic rangefinder: triggering a 10µs pulse causes the transducer to emit an 8-cycle 40kHz acoustic burst. We measure the returning echo pulse width using pulseIn() and compute obstacle distance based on the speed of sound with temperature compensation.",
      "difficulty": "Intermediate",
      "buildTime": "40 mins"
    },
    "keyFormulas": [
      {
        "name": "PWM Duty Cycle & Average Voltage",
        "formula": "D = (val / 255) × 100%,  V_avg = 5.0V × (val / 255)",
        "desc": "At val = 128: Duty cycle D = 50.2%, resulting in an integrated DC average voltage of 2.51V."
      },
      {
        "name": "Speed of Sound in Dry Air with Temperature",
        "formula": "c = 331.4 + (0.6 × T_celsius) m/s",
        "desc": "At 20°C: c = 331.4 + 12.0 = 343.4 m/s = 0.03434 cm/μs (or ~29.12 μs per cm round-trip)."
      },
      {
        "name": "Acoustic Time-of-Flight Distance Equation",
        "formula": "Distance (cm) = [t_echo (μs) × 0.03434 cm/μs] / 2",
        "desc": "Divided by 2 because the acoustic wavefront travels to the target obstacle and reflects back."
      },
      {
        "name": "HC-SR04 Acoustic Blind Zone",
        "formula": "d_min = 2.0 cm (t_blind ≈ 116 μs)",
        "desc": "Transducer ceramic ringing decay requires ~116μs to dampen before the receiver circuit can detect reflections."
      }
    ],
    "parts": [
      {
        "category": "Microcontroller",
        "name": "Arduino Uno R3 SMD (ATmega328P)",
        "quantity": 1,
        "why": "Hardware Timer1 and Timer2 generating PWM and precision acoustic pulse capture."
      },
      {
        "category": "Acoustic Transceiver",
        "name": "HC-SR04 Ultrasonic Sonar Module",
        "quantity": 1,
        "why": "Piezoelectric 40kHz ultrasound transmitter and receiver pair (2cm to 400cm range)."
      },
      {
        "category": "Acoustic Actuator",
        "name": "Passive Piezoelectric Buzzer",
        "quantity": 1,
        "why": "Excited with square-wave frequencies (100Hz-5kHz) via tone() to produce multi-tone alarms."
      },
      {
        "category": "Visual Indicators",
        "name": "Red, Yellow & Green 5mm LEDs + 220Ω Resistors",
        "quantity": 3,
        "why": "3-Zone automotive proximity classification indicators (Safe, Caution, Critical Alarm)."
      }
    ],
    "wiringMap": [
      {
        "pin": "HC-SR04 VCC",
        "tiePoint": "Breadboard Red 5V (+) Rail",
        "component": "Ultrasonic Power",
        "wire": "Red Jumper Wire",
        "notes": "Requires clean 5.0V regulated power (~15mA active current)."
      },
      {
        "pin": "HC-SR04 GND",
        "tiePoint": "Breadboard Blue GND (-) Rail",
        "component": "Ultrasonic Ground",
        "wire": "Black Jumper Wire",
        "notes": "Common ground reference."
      },
      {
        "pin": "HC-SR04 Trig",
        "tiePoint": "Uno Digital Pin 12",
        "component": "Trigger Input",
        "wire": "Cyan Jumper Wire",
        "notes": "Pulsed HIGH for 10μs to launch the 40kHz ultrasound burst."
      },
      {
        "pin": "HC-SR04 Echo",
        "tiePoint": "Uno Digital Pin 13",
        "component": "Echo Pulse Output",
        "wire": "Green Jumper Wire",
        "notes": "Outputs a 5V TTL pulse whose duration equals round-trip flight time."
      },
      {
        "pin": "Piezo Buzzer (+)",
        "tiePoint": "Uno Digital Pin 11 (PWM ~)",
        "component": "Piezo Positive Terminal",
        "wire": "Yellow Jumper Wire",
        "notes": "Driven with variable frequency square waves via tone(11, freq)."
      },
      {
        "pin": "Piezo Buzzer (-)",
        "tiePoint": "Breadboard Blue GND (-) Rail",
        "component": "Piezo Negative Terminal",
        "wire": "Black Jumper Wire",
        "notes": "Direct connection to ground. No series resistor needed for square waves."
      },
      {
        "pin": "Uno Digital Pin 9 (PWM ~)",
        "tiePoint": "Breadboard Row 30e",
        "component": "PWM Indicator LED Anode",
        "wire": "Purple Jumper Wire",
        "notes": "Modulated via analogWrite(9, val) to demonstrate hardware PWM dimming."
      },
      {
        "pin": "Breadboard Row 31a",
        "tiePoint": "Breadboard Blue GND (-) Rail",
        "component": "220Ω Resistor to LED Cathode",
        "wire": "Resistor Lead",
        "notes": "Current-limiting protection for the PWM demonstration LED."
      }
    ],
    "steps": [
      {
        "number": 1,
        "title": "Wire the PWM LED Fading Circuit",
        "instruction": "Connect an LED anode to Arduino <strong>Pin 9 (PWM ~)</strong> through a 220Ω series resistor to ground. In code, test <code>analogWrite(9, val)</code> across the 0 to 255 range to observe how high-speed 490Hz timer switching creates continuous perceived analog dimming.",
        "sanityCheck": "Only pins marked with a tilde (~) on the Uno board support hardware PWM: 3, 5, 6, 9, 10, and 11."
      },
      {
        "number": 2,
        "title": "Interface the Passive Piezo Buzzer on Pin 11",
        "instruction": "Insert the passive piezo buzzer into the breadboard. Connect its positive terminal (often marked with a + or longer lead) to Arduino <strong>Digital Pin 11</strong> and its negative terminal to GND. Unlike active buzzers which only click on DC, passive buzzers require an oscillating square wave from <code>tone(11, frequency)</code>.",
        "proTip": "Human hearing is most sensitive between 1kHz and 3kHz. Use 1800Hz for caution beeps and 2400Hz for urgent proximity alarms."
      },
      {
        "number": 3,
        "title": "Wire Power and Signal Lines for the HC-SR04 Sonar",
        "instruction": "Seat the 4-pin HC-SR04 ultrasonic module into the breadboard. Connect <strong>VCC to 5V</strong>, <strong>GND to GND</strong>, <strong>Trig to Pin 12</strong>, and <strong>Echo to Pin 13</strong>.",
        "sanityCheck": "Never power the HC-SR04 from 3.3V! The internal ultrasonic comparator circuits require a full 5.0V supply to detect reflected acoustic echoes reliably."
      },
      {
        "number": 4,
        "title": "Generate the Precision 10-Microsecond Trigger Pulse",
        "instruction": "To initiate acoustic ranging, pull Trig LOW for 2µs to clear line capacitance, pull Trig HIGH for exactly 10µs using <code>delayMicroseconds(10)</code>, and pull Trig LOW. The onboard module microchip immediately fires an 8-cycle 40kHz ultrasound packet through the transmitting transducer.",
        "proTip": "Ensure delays are precisely in microseconds. Standard delay() operates in milliseconds and will fail to trigger the sensor."
      },
      {
        "number": 5,
        "title": "Measure Acoustic Flight Time with a Strict Timeout",
        "instruction": "Capture the high pulse duration of the Echo pin using <code>pulseIn(ECHO_PIN, HIGH, 30000)</code>. Always provide the 30,000 microsecond (30ms) timeout parameter! Without a timeout, pulseIn() blocks program execution for a full 1,000,000 microseconds (1 second) whenever sound is lost in an open room.",
        "sanityCheck": "A 30ms timeout corresponds to an acoustic travel distance of ~5 meters, perfectly bounding the sensor's physical range."
      },
      {
        "number": 6,
        "title": "Implement the 3-Zone Automotive Parking Assistant",
        "instruction": "Convert the pulse duration into centimeters: <code>dist = (duration * 0.0343) / 2</code>. Construct a 3-zone classifier: Safe (>30cm, Green LED, silent), Caution (10-30cm, Yellow LED, intermittent beeps accelerating with proximity), and Critical Alarm (<10cm, Red LED, continuous rapid 2.4kHz warning tone).",
        "proTip": "Modulate the delay between beeps proportionally: delay(dist * 15) naturally accelerates the audio warning cadence as obstacles approach."
      }
    ],
    "whatYouWillObserve": "Moving your hand toward the HC-SR04 transducer smoothly updates obstacle distance readouts in the Serial Monitor. In the safe zone (>30cm), the system remains silent with the green LED lit. In the caution zone (10-30cm), the yellow LED flashes while the buzzer emits rhythmic beeps that accelerate in rate as distance decreases. Penetrating the critical zone (<10cm) flashes the red LED and triggers an intense, high-frequency emergency proximity tone.",
    "troubleshooting": [
      {
        "q": "The microcontroller freezes or stutters for a full second between readings.",
        "cause": "Calling pulseIn() without a timeout parameter. When an echo returns out of range, pulseIn() blocks for its default 1-second timeout.",
        "solution": "Always supply the 30ms timeout: pulseIn(ECHO_PIN, HIGH, 30000). If the function returns 0, treat the obstacle as out of range."
      },
      {
        "q": "The HC-SR04 reads 0 cm or 400 cm constantly regardless of obstacle position.",
        "cause": "Swapped Trigger and Echo jumper wires, or obstacle is closer than the 2cm physical blind zone.",
        "solution": "Verify that Pin 12 connects to Trig and Pin 13 connects to Echo. Maintain at least 3cm separation from the metal transducer barrels."
      },
      {
        "q": "The buzzer makes a faint, single click instead of sounding an audible musical tone.",
        "cause": "Using digitalWrite(11, HIGH) on a passive buzzer, or calling noTone() immediately without allowing the tone duration to sound.",
        "solution": "Passive buzzers require an oscillating frequency: call tone(BUZZER_PIN, 1800, 50) where 1800 is the frequency in Hertz and 50 is the duration in milliseconds."
      },
      {
        "q": "The sonar readings fluctuate wildly when pointing at soft fabrics or angled walls.",
        "cause": "Acoustic specular reflection and sound absorption. 40kHz ultrasound reflects like light from mirrors; angled surfaces bounce the sound away from the receiver.",
        "solution": "Target a rigid, flat perpendicular obstacle (such as a cardboard box or book) to obtain clean acoustic reflections."
      }
    ],
    "simulation": "ultrasonic_parking",
    "code": {
      "filename": "AutomotiveReverseRadar.ino",
      "snippet": "/*\n * GEC Thrissur - The Arduino Cohort: Day 3\n * Automotive Reverse Parking Radar with 3-Zone Acoustic Alerts\n * Platform: Arduino Uno R3 SMD (ATmega328P @ 16MHz)\n */\n\nconst int TRIG_PIN = 12;\nconst int ECHO_PIN = 13;\nconst int BUZZER_PIN = 11;\nconst int RED_LED = 8;\nconst int YELLOW_LED = 9;\nconst int GREEN_LED = 10;\n\n// Speed of sound in cm/us at 20°C: 343.4 m/s = 0.03434 cm/us\nconst float SPEED_OF_SOUND_CM_US = 0.03434;\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(TRIG_PIN, OUTPUT);\n  pinMode(ECHO_PIN, INPUT);\n  pinMode(BUZZER_PIN, OUTPUT);\n  pinMode(RED_LED, OUTPUT);\n  pinMode(YELLOW_LED, OUTPUT);\n  pinMode(GREEN_LED, OUTPUT);\n  \n  Serial.println(F(\"--- ARDUINO COHORT: DAY 3 ULTRASONIC RADAR ONLINE ---\"));\n}\n\n// Precision acoustic time-of-flight distance calculation\nlong getDistanceCm() {\n  // 1. Clear trigger line\n  digitalWrite(TRIG_PIN, LOW);\n  delayMicroseconds(2);\n\n  // 2. Transmit 10 microsecond trigger pulse\n  digitalWrite(TRIG_PIN, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG_PIN, LOW);\n\n  // 3. Capture echo return with 30ms (~5 meter) timeout\n  long duration = pulseIn(ECHO_PIN, HIGH, 30000);\n  \n  // 4. Evaluate valid range bounds\n  if (duration == 0) return 400; // Out of range\n  return (duration * SPEED_OF_SOUND_CM_US) / 2.0;\n}\n\nvoid loop() {\n  long dist = getDistanceCm();\n  \n  Serial.print(F(\"Proximity: \"));\n  Serial.print(dist);\n  Serial.println(F(\" cm\"));\n\n  // ── 3-ZONE VEHICULAR SAFETY CLASSIFIER ───────────\n  if (dist > 30) {\n    // ZONE 1: SAFE (>30cm)\n    digitalWrite(GREEN_LED, HIGH);\n    digitalWrite(YELLOW_LED, LOW);\n    digitalWrite(RED_LED, LOW);\n    noTone(BUZZER_PIN);\n    delay(150);\n  } \n  else if (dist >= 10) {\n    // ZONE 2: CAUTION (10cm - 30cm)\n    // Beep repetition accelerates as distance drops\n    digitalWrite(GREEN_LED, LOW);\n    digitalWrite(YELLOW_LED, HIGH);\n    digitalWrite(RED_LED, LOW);\n    tone(BUZZER_PIN, 1800, 40); // 1.8kHz alert beep\n    delay(dist * 12);           // Dynamic cadence delay\n  } \n  else {\n    // ZONE 3: CRITICAL COLLISION HAZARD (<10cm)\n    digitalWrite(GREEN_LED, LOW);\n    digitalWrite(YELLOW_LED, LOW);\n    digitalWrite(RED_LED, HIGH);\n    tone(BUZZER_PIN, 2400, 80); // High-urgency 2.4kHz alarm tone\n    delay(100);                 // Fast continuous strobe\n  }\n}",
      "breakdown": [
        { "line": 28, "desc": "Generates the precision 10µs ultrasonic burst trigger required by the HC-SR04 transducer logic." },
        { "line": 34, "desc": "pulseIn(ECHO_PIN, HIGH, 30000) measures round-trip time in microseconds with a 30ms guard limit, preventing MCU lockups." },
        { "line": 37, "desc": "Computes one-way distance by multiplying acoustic flight time by 0.03434 cm/µs and dividing by 2." },
        { "line": 56, "desc": "Dynamically scales pause duration via delay(dist * 12), naturally creating an intuitive automotive parking radar chirp cadence." }
      ]
    },
    "takeHomeChallenge": {
      "title": "Temperature-Compensated Blind-Spot Collision Radar",
      "objective": "Integrate an analog temperature sensor or thermistor to dynamically calibrate the speed of sound formula in real-time.",
      "tasks": [
        "Incorporate a temperature reading: float tempC = 25.0; (or read from an analog thermistor divider).",
        "Compute dynamic speed of sound: float soundSpeed = (331.4 + 0.6 * tempC) / 10000.0; in cm/microsecond.",
        "Benchmark the distance discrepancy between a 0°C winter environment and a 40°C summer dashboard, printing both readings to the Serial Monitor."
      ],
      "hint": "At 40°C, sound travels at 355.4 m/s compared to 331.4 m/s at 0°C—a 7.2% measurement error without temperature compensation!"
    }
  },

  "p1m4": {
    "title": "1.4 Day 4 · Servo Motor Actuation & I2C Alphanumeric Dashboard",
    "phase": "PHASE 1: The Arduino Cohort (GEC Thrissur)",
    "isCapstone": false,
    "overview": {
      "hook": "Command real mechanical articulation! Control an SG90 micro servo using 50Hz Pulse Position Modulation (PPM) signals, eliminate motor inrush brownout resets with decoupling capacitors, and render a flicker-free telemetry HUD on an I2C 16x2 LCD display.",
      "concept": "Mechatronic systems require precise angular positioning. Unlike continuous DC motors, hobby servomotors utilize an internal closed-loop feedback potentiometer, reduction gearbox, and error amplifier driven by a 50Hz (20ms period) Pulse Position Modulation (PPM) signal. Pulse widths ranging from 1.0ms (0°) to 1.5ms (90°) and 2.0ms (180°) define shaft position. Because motors draw inductive inrush currents exceeding 500mA during rapid direction changes, power rail decoupling using 100µF capacitors is required to prevent ATmega328P brownout resets. To display system telemetry, we interface an HD44780 16x2 LCD via an I2C (Inter-Integrated Circuit) backpack: condensing 16 parallel data lines down to two synchronous serial lines: SDA (Pin A4) and SCL (Pin A5). We write custom 5x8 pixel graphic icons to CGRAM and eliminate optical refresh flicker through fixed-buffer cursor targeting.",
      "difficulty": "Intermediate",
      "buildTime": "45 mins"
    },
    "keyFormulas": [
      {
        "name": "Servo 50Hz PPM Standard Pulse Width",
        "formula": "T_pulse = 1.0 ms + (θ / 180°) × 1.0 ms  (Period T = 20.0 ms)",
        "desc": "At θ = 0° → 1.0ms pulse; θ = 90° → 1.5ms pulse; θ = 180° → 2.0ms pulse. Frame rate is fixed at 50Hz."
      },
      {
        "name": "I2C Bus Transmission Clock Frequency",
        "formula": "f_SCL = 100 kHz (Standard Mode) / 400 kHz (Fast Mode)",
        "desc": "Two-wire open-drain synchronous bus with internal/external pull-ups on SDA (A4) and SCL (A5)."
      },
      {
        "name": "Motor Inrush Decoupling Capacitance",
        "formula": "C_bulk = (I_surge × Δt) / ΔV = (0.50A × 0.002s) / 0.5V ≈ 200 μF",
        "desc": "A 100μF to 470μF electrolytic capacitor buffers the 5V rail during servo acceleration, keeping VCC above the 4.3V brownout threshold."
      },
      {
        "name": "Linear Angular Teleoperation Mapping",
        "formula": "Angle (°) = map(ADC_val, 0, 1023, 0, 180)",
        "desc": "Translates 10-bit analog voltage readings proportionally into servomotor angular commands."
      }
    ],
    "parts": [
      {
        "category": "Actuator",
        "name": "TowerPro SG90 9g Micro Servo Motor",
        "quantity": 1,
        "why": "Provides precision 0° to 180° rotational mechanical positioning."
      },
      {
        "category": "Display",
        "name": "16x2 Alphanumeric LCD with PCF8574 I2C Backpack",
        "quantity": 1,
        "why": "Displays 2 rows of 16 characters for real-time telemetry HUD over 2 wires."
      },
      {
        "category": "Control",
        "name": "10kΩ Rotary Potentiometer",
        "quantity": 1,
        "why": "Manual teleoperation control input on Analog Pin A0."
      },
      {
        "category": "Decoupling",
        "name": "100μF to 470μF 16V Electrolytic Capacitor",
        "quantity": 1,
        "why": "Filters motor stall current transients, preventing microcontroller brownout resets."
      }
    ],
    "wiringMap": [
      {
        "pin": "SG90 Orange (Signal)",
        "tiePoint": "Uno Digital Pin 10 (PWM ~)",
        "component": "Servo PPM Control Lead",
        "wire": "Orange Lead",
        "notes": "Driven by the Arduino Servo library using Timer1 at 50Hz."
      },
      {
        "pin": "SG90 Red (VCC)",
        "tiePoint": "Breadboard Red 5V (+) Rail",
        "component": "Servo Motor Power",
        "wire": "Red Lead",
        "notes": "Draws 100mA to 550mA peak current during motor articulation."
      },
      {
        "pin": "SG90 Brown (GND)",
        "tiePoint": "Breadboard Blue GND (-) Rail",
        "component": "Servo Motor Ground",
        "wire": "Brown Lead",
        "notes": "Return path to system common ground."
      },
      {
        "pin": "100μF Electrolytic Cap",
        "tiePoint": "Across 5V (+) and GND (-) Rails",
        "component": "Power Rail Decoupling Buffer",
        "wire": "Capacitor Leads",
        "notes": "Long leg to 5V rail, negative stripe leg to GND rail. Absorbs stall spikes."
      },
      {
        "pin": "I2C LCD SDA",
        "tiePoint": "Uno Analog Pin A4",
        "component": "I2C Serial Data Bus",
        "wire": "Green Jumper Wire",
        "notes": "Hardware I2C data line. Open-drain architecture with pull-ups."
      },
      {
        "pin": "I2C LCD SCL",
        "tiePoint": "Uno Analog Pin A5",
        "component": "I2C Serial Clock Bus",
        "wire": "Blue Jumper Wire",
        "notes": "Hardware I2C clock line. Generates 100kHz synchronization pulses."
      },
      {
        "pin": "I2C LCD VCC & GND",
        "tiePoint": "5V (+) and GND (-) Power Rails",
        "component": "Display Power Supply",
        "wire": "Red & Black Wires",
        "notes": "Powers the HD44780 controller and LED backlight (~25mA)."
      },
      {
        "pin": "Potentiometer Wiper",
        "tiePoint": "Uno Analog Pin A0",
        "component": "Manual Teleoperation Knob",
        "wire": "Yellow Jumper Wire",
        "notes": "Translates 0-5V analog voltage into 0°-180° servo angle."
      }
    ],
    "steps": [
      {
        "number": 1,
        "title": "Wire the SG90 Servo and Install the Decoupling Buffer",
        "instruction": "Identify the SG90 servo connector leads: <strong>Brown = GND</strong>, <strong>Red = 5V</strong>, and <strong>Orange = Signal (Pin 10)</strong>. Plug an electrolytic capacitor (100µF to 470µF) directly across the 5V and GND breadboard rails right next to the servo power pins. Ensure the capacitor's negative lead (marked with a white stripe and minus sign) connects to GND.",
        "sanityCheck": "Electrolytic capacitors are polarized! Connecting an electrolytic capacitor backward can cause it to overheat and vent electrolyte.",
        "proTip": "The decoupling capacitor acts as a miniature rechargeable reservoir, supplying immediate surge current when the servo changes direction so the 5V rail doesn't droop."
      },
      {
        "number": 2,
        "title": "Interface the I2C 16x2 Liquid Crystal Display",
        "instruction": "Connect the 4 pins of the I2C backpack module: <strong>GND to GND</strong>, <strong>VCC to 5V</strong>, <strong>SDA to Analog Pin A4</strong>, and <strong>SCL to Analog Pin A5</strong>. On the Arduino Uno R3, Pins A4 and A5 are hardwired to the ATmega328P's hardware Two-Wire Interface (TWI) peripheral.",
        "sanityCheck": "Do not confuse SDA and SCL! SDA carries bidirectional data while SCL carries clock pulses."
      },
      {
        "number": 3,
        "title": "Calibrate the LCD Contrast Trimpot",
        "instruction": "Power up the Arduino. If the LCD display shows blank blue boxes or dark rectangular solid blocks with no visible letters, use a small flat-blade screwdriver to gently rotate the small blue potentiometer on the back of the I2C backpack until clear, high-contrast characters emerge.",
        "proTip": "Ninety percent of 'broken LCD' reports are caused simply by an uncalibrated contrast trimpot!"
      },
      {
        "number": 4,
        "title": "Design and Register a 5x8 Custom Character Matrix",
        "instruction": "The HD44780 controller features 64 bytes of CGRAM (Character Generator RAM) capable of storing eight custom 5x8 pixel icons. Define an 8-byte array representing a custom radar dish or battery icon, and register it in setup() using <code>lcd.createChar(0, customChar);</code>.",
        "proTip": "Print your custom character anytime using lcd.write((byte)0);."
      },
      {
        "number": 5,
        "title": "Implement Teleoperation Control via Potentiometer A0",
        "instruction": "In code, sample Analog Pin A0 and map the reading to servomotor angles: <code>int angle = map(analogRead(A0), 0, 1023, 0, 180);</code>. Send the command to the servo using <code>scannerServo.write(angle);</code>. The Servo library automatically configures hardware Timer1 to output 50Hz PPM pulses.",
        "sanityCheck": "Standard SG90 plastic gear servos have a physical mechanical stop at 0° and 180°. Never command angles outside the 0°-180° range to avoid stripping nylon gears."
      },
      {
        "number": 6,
        "title": "Eliminate Optical Screen Refresh Flicker",
        "instruction": "Never call <code>lcd.clear()</code> inside the active <code>loop()</code>! lcd.clear() takes over 1.5ms and forces the liquid crystal to discharge, producing visible display strobing. Instead, use <code>lcd.setCursor(col, row)</code> and overwrite fixed-width character buffers with space padding.",
        "sanityCheck": "Fixed-width formatting: If the angle is less than 100, print a leading zero; if less than 10, print two leading zeros."
      }
    ],
    "whatYouWillObserve": "Rotating the potentiometer smoothly steers the physical servomotor horn between 0° and 180°. Simultaneously, the 16x2 LCD display provides real-time angular metrics and an animated horizontal range progress bar with absolute stability and zero optical refresh flicker.",
    "troubleshooting": [
      {
        "q": "The Arduino board resets or reboots as soon as the servomotor starts moving.",
        "cause": "Inductive motor inrush brownout. Under rapid acceleration or load, the SG90 motor draws over 500mA, causing the 5V rail to dip below the ATmega328P brownout detection (BOD) voltage (4.3V).",
        "solution": "Install the 100µF to 470µF electrolytic decoupling capacitor across the 5V and GND breadboard rails immediately beside the servo connector. If using multiple servos, power them from an external 5V 2A power supply with common ground."
      },
      {
        "q": "The 16x2 LCD backlight is on, but shows only solid white boxes with no text.",
        "cause": "Contrast potentiometer on the I2C backpack is out of calibration, or the I2C address is incorrect.",
        "solution": "Gently rotate the contrast potentiometer on the back of the I2C backpack with a screwdriver until characters appear. Verify your I2C address (most PCF8574 modules use 0x27, while PCF8574A modules use 0x3F)."
      },
      {
        "q": "The servo motor jitters, buzzes, and gets warm when holding a position.",
        "cause": "Mechanical stall against the internal hard stop, or timer interrupt conflicts with SoftwareSerial.",
        "solution": "Verify that the servo horn is not being forced beyond its mechanical physical limits (constrain angles between 10° and 170°). Avoid heavy blocking interrupts while the Servo library is active."
      },
      {
        "q": "The LCD text flickers and strobes uncomfortably every time loop() runs.",
        "cause": "Calling lcd.clear() inside loop(). Clearing the screen takes ~1.5ms and discharges all liquid crystal segments.",
        "solution": "Remove lcd.clear() from loop(). Position the cursor using lcd.setCursor(col, row) and overwrite existing characters with space-padded text."
      }
    ],
    "simulation": "servo_i2c_dashboard",
    "code": {
      "filename": "ServoDashboardHUD.ino",
      "snippet": "/*\n * GEC Thrissur - The Arduino Cohort: Day 4\n * Servo PPM Teleoperation & I2C Alphanumeric HUD\n * Platform: Arduino Uno R3 SMD (ATmega328P @ 16MHz)\n */\n\n#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n#include <Servo.h>\n\n// Initialize I2C LCD at address 0x27 (16 columns by 2 rows)\nLiquidCrystal_I2C lcd(0x27, 16, 2);\nServo scannerServo;\n\nconst int SERVO_PIN = 10; // Hardware Timer1 PPM output\nconst int POT_PIN = A0;   // Manual teleoperation knob\n\n// Custom 5x8 pixel graphic: Radar Dish Icon for CGRAM position 0\nbyte radarIcon[8] = {\n  B00100,\n  B01110,\n  B11011,\n  B10001,\n  B00100,\n  B00100,\n  B01110,\n  B00000\n};\n\nvoid setup() {\n  scannerServo.attach(SERVO_PIN); // Allocates Timer1 for 50Hz PPM\n  \n  // Initialize I2C communication (SDA=A4, SCL=A5)\n  lcd.init();\n  lcd.backlight();\n  \n  // Register custom 5x8 icon in HD44780 CGRAM slot 0\n  lcd.createChar(0, radarIcon);\n  \n  lcd.setCursor(0, 0);\n  lcd.write((byte)0); // Render custom icon\n  lcd.print(F(\" RADAR DASHBOARD\"));\n  lcd.setCursor(0, 1);\n  lcd.print(F(\"INITIALIZING...\"));\n  delay(1200);\n  lcd.clear();\n}\n\nvoid loop() {\n  // 1. Acquire teleoperation knob and map to 0°-180°\n  int rawPot = analogRead(POT_PIN);\n  int angle = map(rawPot, 0, 1023, 0, 180);\n  \n  // 2. Command servomotor to target angle\n  scannerServo.write(angle);\n\n  // 3. Render flicker-free LCD telemetry update\n  // Line 0: Angle readout with fixed-width zero padding\n  lcd.setCursor(0, 0);\n  lcd.write((byte)0); // Radar Icon\n  lcd.print(F(\" ANG:\"));\n  if (angle < 100) lcd.print(F(\"0\"));\n  if (angle < 10)  lcd.print(F(\"0\"));\n  lcd.print(angle);\n  lcd.print(F(\" deg   \"));\n\n  // Line 1: Mode and Graphic Proximity Bar\n  lcd.setCursor(0, 1);\n  lcd.print(F(\"BAR:[\"));\n  int bars = map(angle, 0, 180, 1, 8);\n  for (int i = 0; i < 8; i++) {\n    if (i < bars) lcd.print(F(\"=\"));\n    else lcd.print(F(\" \"));\n  }\n  lcd.print(F(\"]   \"));\n\n  delay(35); // 28Hz update rate matching human persistence of vision\n}",
      "breakdown": [
        { "line": 11, "desc": "LiquidCrystal_I2C lcd(0x27, 16, 2) instantiates the driver targeting I2C address 0x27 over Analog Pins A4 (SDA) and A5 (SCL)." },
        { "line": 21, "desc": "Defines an 8-byte bit array where each row represents 5 active horizontal pixels for the HD44780 CGRAM generator." },
        { "line": 39, "desc": "scannerServo.write(angle) translates integer angles directly into 1.0ms-2.0ms 50Hz PPM pulse widths via Timer1." },
        { "line": 49, "desc": "Selective cursor positioning with leading zero padding completely eliminates optical display strobing without using lcd.clear()." }
      ]
    },
    "takeHomeChallenge": {
      "title": "Robotic Pan-Tilt Scanner with Multi-Character Bar Graphs",
      "objective": "Design an automated sweeping scanner that dynamically generates a high-resolution 5-tier graphical progress bar on the LCD screen.",
      "tasks": [
        "Create five custom CGRAM characters representing 1/5, 2/5, 3/5, 4/5, and 5/5 vertical column fills.",
        "Program an auto-sweep routine that pans the SG90 servo continuously between 15° and 165° using non-blocking millis() timing.",
        "Render the high-resolution custom bar graph across characters 8 to 15 on LCD row 1 to provide smooth visual feedback of current position."
      ],
      "hint": "Use CGRAM slots 1 through 5 to store each fractional vertical bar slice, allowing your progress bar to have 5x finer graphical resolution than standard block characters!"
    }
  },

  "p1cap": {
    "title": "1.5 Capstone · Autonomous Ultrasonic Radar Station",
    "phase": "PHASE 1: The Arduino Cohort (GEC Thrissur)",
    "isCapstone": true,
    "overview": {
      "hook": "The ultimate capstone mechatronic build: consolidate all five days of electronic interfacing, sensors, actuators, and serial communication into an integrated Autonomous 180° Ultrasonic Radar Station.",
      "concept": "Mechatronic systems require harmonious coordination of multiple concurrent subsystems without CPU blocking. In this capstone, the SG90 servomotor continuously sweeps the HC-SR04 sonar module across a 180° horizontal field of view. We replace blocking delay() with a non-blocking asynchronous state machine using millis(), allowing simultaneous servo articulation, acoustic pulse timing, I2C telemetry dashboard rendering, and multi-tier audible warning sirens. The station transmits formatted 'ANGLE,DISTANCE\\n' data frames over UART at 9600 baud, enabling live 2D green-phosphor radar scope visualization in the Arduino IDE Serial Plotter or external Python/Processing graphical interfaces.",
      "difficulty": "Master",
      "buildTime": "60 mins"
    },
    "keyFormulas": [
      {
        "name": "Polar to Cartesian Coordinate Transformation",
        "formula": "X = r × cos(θ),   Y = r × sin(θ)",
        "desc": "Translates radar range r (cm) and azimuth angle θ (degrees) into 2D Cartesian coordinates for computer radar scopes."
      },
      {
        "name": "Non-Blocking Asynchronous Timing Condition",
        "formula": "if (currentMillis - previousMillis >= interval) { ... }",
        "desc": "Permits concurrent execution of multiple subsystems without halting the microcontroller CPU."
      },
      {
        "name": "Radar Angular Sweep Cycle Period",
        "formula": "T_sweep = (θ_max - θ_min) / Δθ × Δt_step",
        "desc": "For a 15° to 165° sweep (150° span) at 2° per step every 35ms: T_sweep = 75 steps × 35ms = 2.625 seconds per half-cycle."
      },
      {
        "name": "Total Mechatronic Current Budget",
        "formula": "I_total = I_MCU(45mA) + I_servo(150-500mA) + I_sonar(15mA) + I_LCD(25mA) + I_buzzer(20mA)",
        "desc": "Peak current can reach ~600mA during motor direction changes, demanding solid 100μF rail decoupling."
      }
    ],
    "parts": [
      {
        "category": "Microcontroller",
        "name": "Arduino Uno R3 SMD (ATmega328P)",
        "quantity": 1,
        "why": "Main supervisory controller executing asynchronous state machines and telemetry streaming."
      },
      {
        "category": "Actuator",
        "name": "TowerPro SG90 9g Micro Servo Motor",
        "quantity": 1,
        "why": "Mechanical rotational scanner articulation (15° to 165° continuous sweep)."
      },
      {
        "category": "Sensor",
        "name": "HC-SR04 Ultrasonic Sonar Module",
        "quantity": 1,
        "why": "Rotating acoustic distance ranger mounted atop the servomotor horn."
      },
      {
        "category": "Display",
        "name": "16x2 Alphanumeric I2C LCD Display",
        "quantity": 1,
        "why": "Real-time telemetry HUD displaying current angle, range, and threat level."
      },
      {
        "category": "Audible Alarm",
        "name": "Passive Piezo Buzzer",
        "quantity": 1,
        "why": "Generates dynamic proximity warning sirens when obstacles breach the safety perimeter."
      },
      {
        "category": "Visual Alarm",
        "name": "Red 5mm LED + 220Ω Resistor",
        "quantity": 1,
        "why": "Visual strobe warning during critical proximity intrusions (<15cm)."
      },
      {
        "category": "Decoupling",
        "name": "100μF 16V Electrolytic Capacitor",
        "quantity": 1,
        "why": "Suppresses servo motor stall inrush current spikes to prevent MCU brownout resets."
      }
    ],
    "wiringMap": [
      {
        "pin": "SG90 Servo Signal",
        "tiePoint": "Uno Digital Pin 10",
        "component": "Servo PPM Control",
        "wire": "Orange Lead",
        "notes": "Hardware Timer1 50Hz PPM control."
      },
      {
        "pin": "HC-SR04 Trig",
        "tiePoint": "Uno Digital Pin 12",
        "component": "Sonar Burst Trigger",
        "wire": "Cyan Jumper Wire",
        "notes": "10μs trigger pulse output."
      },
      {
        "pin": "HC-SR04 Echo",
        "tiePoint": "Uno Digital Pin 13",
        "component": "Sonar Pulse Return",
        "wire": "Green Jumper Wire",
        "notes": "Time-of-flight echo return input."
      },
      {
        "pin": "I2C LCD SDA",
        "tiePoint": "Uno Analog Pin A4",
        "component": "I2C Serial Data",
        "wire": "Yellow Jumper Wire",
        "notes": "Synchronous I2C bidirectional data line."
      },
      {
        "pin": "I2C LCD SCL",
        "tiePoint": "Uno Analog Pin A5",
        "component": "I2C Serial Clock",
        "wire": "Blue Jumper Wire",
        "notes": "Synchronous I2C clock line."
      },
      {
        "pin": "Piezo Buzzer (+)",
        "tiePoint": "Uno Digital Pin 11",
        "component": "Audio Alarm Input",
        "wire": "Purple Jumper Wire",
        "notes": "Multi-frequency proximity tone siren."
      },
      {
        "pin": "Red Alarm LED Anode",
        "tiePoint": "Uno Digital Pin 8",
        "component": "Visual Strobe Alarm",
        "wire": "Red Jumper Wire",
        "notes": "In series with 220Ω resistor to ground rail."
      },
      {
        "pin": "100μF Capacitor",
        "tiePoint": "Across 5V and GND Rails",
        "component": "Power Rail Buffer",
        "wire": "Direct to Bus Rails",
        "notes": "Absorbs motor stall current spikes across power rail."
      }
    ],
    "steps": [
      {
        "number": 1,
        "title": "Electromechanical Turret Assembly",
        "instruction": "Secure the HC-SR04 ultrasonic sensor to the SG90 servomotor horn using double-sided mounting foam or zip ties. Ensure the sonar sensor's center of mass is centered over the servo output spline to prevent rotational bearing strain. Orient the sensor wires with sufficient slack so the turret can articulate freely from 15° to 165° without snagging or binding.",
        "sanityCheck": "Rotate the servo horn manually through its full arc before powering up to ensure the wiring harness has unrestricted freedom of motion.",
        "proTip": "Use flexible multi-strand silicone jumper wires for the rotating sensor to minimize torsional mechanical resistance."
      },
      {
        "number": 2,
        "title": "Unified Circuit Architecture & Power Decoupling",
        "instruction": "Wire the Arduino Uno 5V and GND pins to the breadboard distribution rails. Immediately place the 100µF electrolytic capacitor across the 5V and GND rail right next to the servo header. Connect the Servo to Pin 10, Sonar Trig to Pin 12, Echo to Pin 13, I2C LCD to A4/A5, Buzzer to Pin 11, and the Red Alarm LED to Pin 8 through a 220Ω resistor.",
        "sanityCheck": "Verify that all 5V power leads (Servo, Sonar, LCD) share the same filtered 5V breadboard rail and all GND leads connect to common ground."
      },
      {
        "number": 3,
        "title": "Architect the Non-Blocking millis() State Machine",
        "instruction": "Never use delay() in a multi-tasking embedded build! Replace delay() with an asynchronous timer: <code>if (millis() - lastSweepTime >= SWEEP_INTERVAL_MS) { ... }</code>. This allows the servomotor to articulate by small 2° increments every 35ms while the microcontroller continues executing sensor calculations and telemetry streaming without pausing.",
        "proTip": "A non-blocking architecture allows the audio alarm and LCD updates to execute with microsecond responsiveness even while the motor is in motion."
      },
      {
        "number": 4,
        "title": "Stream Serial Polar Telemetry for 2D Radar Scopes",
        "instruction": "In every scan step, transmit the current polar coordinates over UART in standard comma-separated format: <code>Serial.print(currentAngle); Serial.print(','); Serial.println(dist);</code>. This packet structure is natively parsed by the Arduino IDE Serial Plotter and Processing radar visualization scripts.",
        "sanityCheck": "Do not add excessive decorative text labels to the serial output stream if you intend to plot data on the Serial Plotter; print only 'angle,distance'."
      },
      {
        "number": 5,
        "title": "Calibrate Threat Boundary Alarms and LCD HUD",
        "instruction": "Evaluate obstacle proximity: If distance is less than 15cm, enter CRITICAL ALARM state: pulse the red status LED, sound a 2.2kHz urgent alert beep on the piezo buzzer, and print 'ALERT: [dist]cm!' on row 1 of the LCD. If the perimeter is clear, print 'CLEAR: [dist]cm' and silence the alarm.",
        "proTip": "Ensure the LCD cursor position is explicitly reset on every update to keep the display completely rock-solid and free of optical jitter."
      },
      {
        "number": 6,
        "title": "Post-Cohort Extension: Connect 2D Green-Phosphor Radar GUI",
        "instruction": "Connect the Arduino Uno over USB to your computer. Open the Arduino IDE Serial Plotter (Ctrl+Shift+L) to see a live dual-trace chart of angular position and target distance. For an authentic naval radar experience, run an open-source Processing sketch to plot glowing green phosphor radar blips on your desktop screen.",
        "sanityCheck": "Ensure the Serial Monitor is closed before opening the Serial Plotter or Processing GUI, as only one computer application can access the COM port at a time."
      }
    ],
    "whatYouWillObserve": "The servo arm continuously pans the ultrasonic sensor across a 180° horizontal field of view. The I2C LCD dashboard displays live angular tracking and distance metrics. Detected obstacles stream in real-time as 'angle,distance' polar pairs over USB. When an intruder breaches the 15cm safety zone, the system immediately sounds audio-visual alarms while maintaining smooth, uninterrupted scanning.",
    "troubleshooting": [
      {
        "q": "The servo stutters and halts momentarily at each angle step instead of sweeping smoothly.",
        "cause": "The ultrasonic pulseIn() function is blocking because sound is escaping into an open room with no timeout.",
        "solution": "Verify that pulseIn(ECHO_PIN, HIGH, 25000) includes a strict 25ms timeout parameter (~4 meters max range)."
      },
      {
        "q": "The Serial Plotter shows flat lines or erratic diagonal zig-zags.",
        "cause": "Serial print formatting includes extra spaces or text labels that confuse the serial plotter parser.",
        "solution": "Output strictly numeric comma-separated tuples: Serial.print(angle); Serial.print(','); Serial.println(dist); with no extra spaces or words."
      },
      {
        "q": "The servo sweeps smoothly for a few seconds, then snags or jerks violently.",
        "cause": "Jumper wires to the rotating HC-SR04 sensor are too short and are wrapping tightly around the motor shaft.",
        "solution": "Provide a loose service loop of flexible wire above the servo horn, securing the fixed end to the stationary breadboard with tape."
      },
      {
        "q": "False proximity alarms trigger when scanning between 70° and 110° even with no objects nearby.",
        "cause": "Transducer acoustic floor reflection or breadboard edge interference.",
        "solution": "Elevate the radar station assembly 5cm to 10cm above the tabletop, or tilt the sensor upward by 2° to avoid ground reflections."
      }
    ],
    "simulation": "autonomous_radar_station",
    "code": {
      "filename": "AutonomousRadarStation.ino",
      "snippet": "/*\n * GEC Thrissur - The Arduino Cohort: Capstone Project\n * Autonomous 180° Ultrasonic Radar Station\n * Platform: Arduino Uno R3 SMD (ATmega328P @ 16MHz)\n */\n\n#include <Wire.h>\n#include <LiquidCrystal_I2C.h>\n#include <Servo.h>\n\n// Hardware Peripherals\nLiquidCrystal_I2C lcd(0x27, 16, 2);\nServo radarServo;\n\n// Pin Mappings\nconst int TRIG_PIN = 12;\nconst int ECHO_PIN = 13;\nconst int SERVO_PIN = 10;\nconst int BUZZER_PIN = 11;\nconst int RED_LED = 8;\n\n// Non-blocking Sweep Variables\nint currentAngle = 15; // Sweep bounds: 15° to 165°\nint sweepStep = 2;\nunsigned long lastSweepTime = 0;\nconst int SWEEP_INTERVAL_MS = 35;\n\n// Speed of sound in cm/us at 20°C: 0.03434\nconst float SPEED_OF_SOUND = 0.03434;\n\nlong getDistanceCm() {\n  digitalWrite(TRIG_PIN, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG_PIN, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG_PIN, LOW);\n  \n  long duration = pulseIn(ECHO_PIN, HIGH, 25000); // 25ms timeout (~4m limit)\n  if (duration == 0) return 400; // Return out of range\n  return (duration * SPEED_OF_SOUND) / 2.0;\n}\n\nvoid setup() {\n  Serial.begin(9600);\n  \n  pinMode(TRIG_PIN, OUTPUT);\n  pinMode(ECHO_PIN, INPUT);\n  pinMode(BUZZER_PIN, OUTPUT);\n  pinMode(RED_LED, OUTPUT);\n\n  radarServo.attach(SERVO_PIN);\n  radarServo.write(currentAngle);\n\n  lcd.init();\n  lcd.backlight();\n  lcd.setCursor(0, 0);\n  lcd.print(F(\"RADAR SCANNER\"));\n  lcd.setCursor(0, 1);\n  lcd.print(F(\"INITIALIZING...\"));\n  delay(1200);\n  lcd.clear();\n  \n  Serial.println(F(\"--- ARDUINO COHORT CAPSTONE: RADAR STATION ONLINE ---\"));\n}\n\nvoid loop() {\n  // Non-blocking asynchronous sweep timer using millis()\n  if (millis() - lastSweepTime >= SWEEP_INTERVAL_MS) {\n    lastSweepTime = millis();\n\n    // 1. Advance servo angle\n    currentAngle += sweepStep;\n    if (currentAngle >= 165 || currentAngle <= 15) {\n      sweepStep = -sweepStep; // Reverse sweep direction\n    }\n    radarServo.write(currentAngle);\n\n    // 2. Measure acoustic distance\n    long dist = getDistanceCm();\n\n    // 3. Transmit Polar Telemetry: \"ANGLE,DISTANCE\\n\"\n    Serial.print(currentAngle);\n    Serial.print(F(\",\"));\n    Serial.println(dist);\n\n    // 4. Update Alphanumeric LCD Dashboard\n    lcd.setCursor(0, 0);\n    lcd.print(F(\"ANG:\"));\n    if (currentAngle < 100) lcd.print(F(\"0\"));\n    if (currentAngle < 10)  lcd.print(F(\"0\"));\n    lcd.print(currentAngle);\n    lcd.print(F(\" deg    \"));\n\n    lcd.setCursor(0, 1);\n    if (dist < 15) {\n      // CRITICAL PROXIMITY ALERT (<15cm)\n      lcd.print(F(\"ALERT: \"));\n      if (dist < 10) lcd.print(F(\"0\"));\n      lcd.print(dist);\n      lcd.print(F(\"cm! \"));\n      \n      digitalWrite(RED_LED, HIGH);\n      tone(BUZZER_PIN, 2200, 30); // 2.2kHz alarm beep\n    } else {\n      // SAFE / CLEAR ZONE\n      lcd.print(F(\"CLEAR: \"));\n      if (dist < 100) lcd.print(F(\" \"));\n      if (dist < 10)  lcd.print(F(\" \"));\n      lcd.print(dist);\n      lcd.print(F(\"cm  \"));\n      \n      digitalWrite(RED_LED, LOW);\n      noTone(BUZZER_PIN);\n    }\n  }\n}",
      "breakdown": [
        { "line": 49, "desc": "Asynchronous millis() timing loop executes the servo sweep every 35ms without halting microcontroller execution." },
        { "line": 63, "desc": "Serial.print(currentAngle); Serial.print(','); Serial.println(dist) formats the polar coordinate packet for the PC Serial Plotter." },
        { "line": 78, "desc": "Evaluates perimeter security threshold (<15cm) and coordinates simultaneous red strobe and audio sirens." }
      ]
    },
    "takeHomeChallenge": {
      "title": "Dual-Axis Cartesian Target Tracking Visualizer",
      "objective": "Build a PC-side graphical user interface in Processing or Python (Pygame/Matplotlib) that converts the live polar telemetry stream into an animated 2D radar screen.",
      "tasks": [
        "In your Processing/Python sketch, read the incoming serial string and parse it using split(','): int angle = int(parts[0]); int dist = int(parts[1]);.",
        "Calculate Cartesian positions: float x = dist * cos(radians(angle)); float y = dist * sin(radians(angle));.",
        "Render persistent glowing green phosphor radar blips with fading trails simulating genuine military radar cathode-ray tubes (CRTs)."
      ],
      "hint": "In Processing, draw a translucent black rectangle rect(0, 0, width, height) with alpha = 20 on every frame to create authentic phosphor persistence decay trails!"
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
