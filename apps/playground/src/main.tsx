import React, { useState } from 'react';
import { render } from '@react-pxl/reconciler';
import { View, Text } from '@react-pxl/components';

/**
 * Demo app showcasing react-pxl capabilities.
 * This entire UI is rendered to a <canvas> — no DOM elements for the UI itself.
 */
function App() {
  const [count, setCount] = useState(0);

  return (
    <View style={{
      flex: 1,
      backgroundColor: '#f8fafc',
      padding: 24,
      gap: 16,
    }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#1e293b',
        padding: 20,
        borderRadius: 12,
      }}>
        <Text style={{ color: '#f1f5f9', fontSize: 28, fontWeight: 'bold' }}>
          react-pxl
        </Text>
        <Text style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
          React → Canvas. Declarative UI, pixel-perfect rendering.
        </Text>
      </View>

      {/* Cards row */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{
          flex: 1,
          backgroundColor: '#3b82f6',
          padding: 16,
          borderRadius: 8,
        }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
            Flexbox Layout
          </Text>
          <Text style={{ color: '#dbeafe', fontSize: 12, marginTop: 4 }}>
            Powered by Yoga WASM
          </Text>
        </View>

        <View style={{
          flex: 1,
          backgroundColor: '#10b981',
          padding: 16,
          borderRadius: 8,
        }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
            Canvas 2D
          </Text>
          <Text style={{ color: '#d1fae5', fontSize: 12, marginTop: 4 }}>
            60fps rendering
          </Text>
        </View>

        <View style={{
          flex: 1,
          backgroundColor: '#8b5cf6',
          padding: 16,
          borderRadius: 8,
        }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
            React 19
          </Text>
          <Text style={{ color: '#ede9fe', fontSize: 12, marginTop: 4 }}>
            Full reconciler
          </Text>
        </View>
      </View>

      {/* Counter */}
      <View style={{
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        padding: 20,
        borderRadius: 8,
        alignItems: 'center',
      }}>
        <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#1e293b' }}>
          {String(count)}
        </Text>
        <Text style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
          Click the button to increment
        </Text>
        <View
          style={{
            backgroundColor: '#3b82f6',
            paddingHorizontal: 24,
            paddingVertical: 10,
            borderRadius: 6,
            marginTop: 12,
          }}
          onClick={() => setCount(c => c + 1)}
        >
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
            Increment
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={{ alignItems: 'center', padding: 8 }}>
        <Text style={{ color: '#94a3b8', fontSize: 12 }}>
          No DOM elements were harmed in the rendering of this UI.
        </Text>
      </View>
    </View>
  );
}

const canvas = document.getElementById('root') as HTMLCanvasElement;
render(<App />, canvas);
