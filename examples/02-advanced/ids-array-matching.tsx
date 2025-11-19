import { InteractiveSVG, parseSVG } from 'svg-interactive';
import 'svg-interactive/styles';
import type { ExamplePreset } from '../presets';

const restaurantBillSVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="700" height="600" viewBox="0 0 700 600">
    <!-- Background -->
    <rect width="700" height="600" fill="#fef7f0"/>

    <!-- Title -->
    <text x="350" y="40" text-anchor="middle" font-size="28" font-weight="bold" fill="#d97706">
      🍽️ Restaurant Bill Calculator
    </text>

    <!-- Input Section Container -->
    <rect x="50" y="80" width="300" height="290" fill="#fff" stroke="#d97706" stroke-width="3" rx="12"/>
    <text x="200" y="110" text-anchor="middle" font-size="18" font-weight="bold" fill="#d97706">
      💵 Your Order
    </text>

    <!-- Food Price Input -->
    <g id="food-label">
      <text x="70" y="150" font-size="14" font-weight="600" fill="#78716c">🍕 Food:</text>
    </g>
    <g id="food-price">
      <rect x="70" y="160" width="240" height="45" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" rx="6"/>
      <text x="80" y="188" font-size="12" fill="#92400e">$</text>
    </g>

    <!-- Drinks Price Input -->
    <g id="drinks-label">
      <text x="70" y="225" font-size="14" font-weight="600" fill="#78716c">🥤 Drinks:</text>
    </g>
    <g id="drinks-price">
      <rect x="70" y="235" width="240" height="45" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" rx="6"/>
      <text x="80" y="263" font-size="12" fill="#92400e">$</text>
    </g>

    <!-- Number of People Input -->
    <g id="people-label">
      <text x="70" y="300" font-size="14" font-weight="600" fill="#78716c">👥 People:</text>
    </g>
    <g id="num-people">
      <rect x="70" y="310" width="240" height="45" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" rx="6"/>
      <text x="80" y="338" font-size="12" fill="#92400e">#</text>
    </g>

    <!-- Arrow Flow -->
    <g id="arrow-decoration">
      <path d="M 370 210 L 410 210" stroke="#d97706" stroke-width="4" marker-end="url(#arrowhead)"/>
      <circle cx="390" cy="210" r="15" fill="#fbbf24" opacity="0.3"/>
    </g>

    <!-- Output Section Container -->
    <rect x="430" y="80" width="240" height="460" fill="#fff" stroke="#059669" stroke-width="3" rx="12"/>
    <text x="550" y="110" text-anchor="middle" font-size="18" font-weight="bold" fill="#059669">
      📊 Bill Breakdown
    </text>

    <!-- Subtotal Output -->
    <g id="subtotal-label">
      <text x="450" y="150" font-size="13" font-weight="600" fill="#78716c">Subtotal:</text>
    </g>
    <g id="bill-subtotal">
      <rect x="450" y="160" width="200" height="42" fill="#d1fae5" stroke="#10b981" stroke-width="2" rx="6"/>
      <text x="460" y="186" font-size="12" fill="#065f46">$</text>
    </g>

    <!-- Tax Output -->
    <g id="tax-label">
      <text x="450" y="220" font-size="13" font-weight="600" fill="#78716c">Tax (8%):</text>
    </g>
    <g id="bill-tax">
      <rect x="450" y="230" width="200" height="42" fill="#d1fae5" stroke="#10b981" stroke-width="2" rx="6"/>
      <text x="460" y="256" font-size="12" fill="#065f46">$</text>
    </g>

    <!-- Tip Output -->
    <g id="tip-label">
      <text x="450" y="290" font-size="13" font-weight="600" fill="#78716c">Tip (15%):</text>
    </g>
    <g id="bill-tip">
      <rect x="450" y="300" width="200" height="42" fill="#d1fae5" stroke="#10b981" stroke-width="2" rx="6"/>
      <text x="460" y="326" font-size="12" fill="#065f46">$</text>
    </g>

    <!-- Divider Line -->
    <line x1="450" y1="360" x2="650" y2="360" stroke="#6b7280" stroke-width="2" stroke-dasharray="5,5"/>

    <!-- Total Output (Highlighted) -->
    <g id="total-label">
      <text x="450" y="385" font-size="15" font-weight="bold" fill="#059669">💰 TOTAL:</text>
    </g>
    <g id="bill-total">
      <rect x="450" y="395" width="200" height="50" fill="#6ee7b7" stroke="#059669" stroke-width="3" rx="6"/>
      <text x="460" y="426" font-size="14" font-weight="bold" fill="#065f46">$</text>
    </g>

    <!-- Per Person Output (Highlighted) -->
    <g id="per-person-label">
      <text x="550" y="465" text-anchor="middle" font-size="13" font-weight="600" fill="#78716c">Per Person:</text>
    </g>
    <g id="per-person">
      <rect x="450" y="475" width="200" height="50" fill="#fbbf24" stroke="#d97706" stroke-width="3" rx="6"/>
      <text x="550" y="505" text-anchor="middle" font-size="16" font-weight="bold" fill="#78350f">
        $ each
      </text>
    </g>

    <!-- Bottom decoration -->
    <g id="bottom-decoration">
      <circle cx="100" cy="550" r="8" fill="#fbbf24" opacity="0.4"/>
      <circle cx="130" cy="555" r="6" fill="#f59e0b" opacity="0.4"/>
      <circle cx="155" cy="550" r="7" fill="#fbbf24" opacity="0.4"/>
      <text x="200" y="560" font-size="12" fill="#9ca3af" font-style="italic">
        Tip helps support your server! 😊
      </text>
    </g>

    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
        <path d="M0,0 L0,6 L9,3 z" fill="#d97706"/>
      </marker>
    </defs>
  </svg>
`;

export const idsArrayPreset: ExamplePreset = {
  id: 'ids-array',
  title: 'IDs Array Matching',
  description: 'Calculate restaurant bill with tax, tip, and per-person split using exact ID matching.',
  category: 'Advanced',
  tags: ['ids', 'calculator', 'explicit-matching'],
  accentColor: '#d97706',
  svgContent: restaurantBillSVG,
  patterns: [
    { ids: ['food-price', 'drinks-price', 'num-people'], type: 'input' },
    { ids: ['bill-subtotal', 'bill-tax', 'bill-tip', 'bill-total', 'per-person'], type: 'output' }
  ],
  theme: 'default',
  defaultInputs: {
    'food-price': '85.00',
    'drinks-price': '28.00',
    'num-people': '4'
  },
  onOutputCompute: (inputs) => {
    const foodPrice = parseFloat(inputs['food-price'] || '0');
    const drinksPrice = parseFloat(inputs['drinks-price'] || '0');
    const numPeople = parseInt(inputs['num-people'] || '1');

    const subtotal = foodPrice + drinksPrice;
    const tax = subtotal * 0.08; // 8% tax
    const tip = subtotal * 0.15; // 15% tip
    const total = subtotal + tax + tip;
    const perPerson = numPeople > 0 ? total / numPeople : 0;

    return {
      'bill-subtotal': subtotal.toFixed(2),
      'bill-tax': tax.toFixed(2),
      'bill-tip': tip.toFixed(2),
      'bill-total': total.toFixed(2),
      'per-person': perPerson.toFixed(2)
    };
  }
};

/**
 * IDs Array Matching - Restaurant Bill Calculator
 *
 * This example demonstrates:
 * - Matching specific elements by exact IDs (not prefix/regex)
 * - Using ids array: { ids: ['food-price', 'drinks-price', 'num-people'], type: 'input' }
 * - Field names are the full IDs (no extraction)
 * - Multiple outputs calculated from inputs
 * - Real-world calculation example everyone can relate to!
 *
 * Pattern Matching:
 * - Input pattern: { ids: ['food-price', 'drinks-price', 'num-people'], type: 'input' }
 * - Output pattern: { ids: ['bill-subtotal', 'bill-tax', 'bill-tip', 'bill-total', 'per-person'], type: 'output' }
 *
 * When to use IDs array:
 * - Fixed set of known elements (like specific form fields)
 * - Elements with descriptive names that don't follow a pattern
 * - You want explicit control over which elements are interactive
 * - Legacy SVGs with inconsistent naming
 *
 * Key features:
 * 1. Explicit control - only specified IDs become interactive
 * 2. No pattern needed - works with any naming convention
 * 3. Labels and decorations remain static (not in IDs array)
 * 4. Perfect for forms, calculators, and dashboards
 */
export function IdsArrayExample() {
  const { mappings } = parseSVG(idsArrayPreset.svgContent, {
    patterns: idsArrayPreset.patterns
  });

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🍽️ Restaurant Bill Calculator</h1>
      <p>
        This example uses <strong>IDs array matching</strong> to make specific elements interactive.
        Try changing the food price, drinks, or number of people!
      </p>
      <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
        <strong>💡 Why IDs array?</strong> Notice how labels (🍕 Food, 💰 TOTAL, etc.) and
        decorations stay static - only the exact IDs in our array become interactive fields.
        Perfect when you know exactly which elements should be inputs/outputs!
      </p>

      <InteractiveSVG
        mappings={mappings}
        svgContent={idsArrayPreset.svgContent}
        defaultInputs={idsArrayPreset.defaultInputs}
        onOutputCompute={idsArrayPreset.onOutputCompute}
        theme={idsArrayPreset.theme}
      />

      <div style={{ marginTop: '20px', padding: '15px', background: '#f3f4f6', borderRadius: '8px' }}>
        <h3 style={{ marginTop: '0', fontSize: '16px', color: '#374151' }}>📝 How it works:</h3>
        <ul style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6' }}>
          <li><strong>Inputs:</strong> food-price, drinks-price, num-people</li>
          <li><strong>Outputs:</strong> bill-subtotal, bill-tax (8%), bill-tip (15%), bill-total, per-person</li>
          <li><strong>Static elements:</strong> Labels, icons, decorations (not in IDs array)</li>
        </ul>
      </div>
    </div>
  );
}
