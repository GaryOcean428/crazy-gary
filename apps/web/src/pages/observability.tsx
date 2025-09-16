import React from 'react'
import AgentObservability from '@/components/agent-observability'

export function ObservabilityPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Agent Observability</h1>
        <p className="text-muted-foreground">
          Monitor and analyze agent activities, performance, and decision-making in real-time
        </p>
      </div>
      <AgentObservability />
    </div>
  )
}

export default ObservabilityPage