# Collector Plan

We are dividing the configurations for metrics based on
1. Specific Purpose
2. Common patterns

## Goal/Purpose Specific Configurations:
1. Capture step.
2. Aggregation.
3. Topic
4. Sources, i.e. - namespace, app, etc
5. Rate of request?
6. Resolution/step (#secs)
7. timeout (different queries can indeed have different expected execution time)

## Common Configuration
1. Target Application / name spaces
2. hosts

## Metric Channel
So, we compose a metric channel with specific configurations for it and combine it with common configurations. Metric channel is defined as a stream of measurements which is created for a specific purpose. A metric channel has an exclusive topic, a strict schema or a set of schema, and can have multiple sources.

## Setting up purpose specific configurations:

There should be an easy way for consumer developers to make metric channels.