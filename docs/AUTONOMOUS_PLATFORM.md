# Kanyoza Autonomous Platform Integration

## Overview
The Kanyoza Autonomous Platform is an **optional external intelligence and workflow layer**. GrowthBridge communicates with it over server-to-server authenticated REST API calls.

## Capabilities
- `generateContent()`: AI blog & social media copy generation.
- `generateImage()`: AI image synthesis.
- `analyzeApplication()`: Automated candidate resume extraction and scoring.
- `executeWorkflow()`: Trigger multi-agent autonomous campaigns.
- `getAIInsights()`: Performance trends and strategic recommendations.

## Resilience & Circuit Breaking
Requests are protected with:
- Circuit breaker (`src/integrations/autonomous-platform/resilience.ts`)
- 15-second timeout
- Non-blocking domain events (`src/events/publisher.ts`)
