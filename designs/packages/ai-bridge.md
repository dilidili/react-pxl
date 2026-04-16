# Package: @react-pxl/ai-bridge

> AI/LLM integration utilities — stub, not yet implemented.

## Purpose

Will provide tools for AI-generated UI: JSON schema for LLM output, JSON-to-JSX converter, streaming render support.

## Current State

Stub only — exports `AI_BRIDGE_VERSION = '0.0.1'`. Implementation deferred to Phase 5.

## Planned Exports (Phase 5)

| Symbol | Kind | Description |
|--------|------|-------------|
| Schema definition | object | JSON schema for AI-friendly component API |
| JSON-to-JSX bridge | function | AI outputs JSON → render to canvas |
| Streaming render | function | Partial trees render progressively |

## Files

```
src/
  index.ts — Stub with version constant
```

## Dependencies

`@react-pxl/core`, `react`
