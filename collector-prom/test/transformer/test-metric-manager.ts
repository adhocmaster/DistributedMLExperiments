import {expect} from 'chai'
import 'mocha'
import "reflect-metadata"
import {IoC} from "src/inversify.config"
import {inject} from 'inversify'
import { ConfigManager } from 'src/util/config-manager';
import { KafkaManager } from 'src/kafka/kafka-manager';
import { MetricManager } from 'src/transformer/metric-manager';
import { IO } from 'src/util/io';

describe("Test Metric Manager", function() {

    const config = IoC.get<ConfigManager>("ConfigManager")
    const metricManager = IoC.get<MetricManager>("MetricManager")

    it('Prom ranged: must have valid sources', function() {
        let config =   {
            id: 'test-kafka-001',
            topic: 'test-kafka-memory',
            captureStep: '5m',
            requestInterval: '30s',
            resolution: 30.0,
            timeout: '30s',
            sources: [
              {
                type: 'PROM',
                isRanged: true,
                query: 'container_memory_usage_bytes{namespace=kafka}'
              },
              {
                type: 'PROM',
                isRanged: true,
                query: 'container_memory_max_usage_bytes{namespace=kafka}',
                resolution: 10.0,
                captureStep: '10m',
                timeout: '60s'
              }
            ]
          }
        let sources = metricManager.getValidatedSources(config)

        IO.deepPrint(sources)

        expect(sources).to.have.length(2)
        expect(sources[0]).to.have.property('captureStep')
        expect(sources[0]).to.have.property('requestInterval')
        expect(sources[0]).to.have.property('timeout')
        expect(sources[0].type).to.equal("PROM")
        expect(sources[0].isRanged).to.equal(true)
        expect(sources[0].query).to.equal('container_memory_usage_bytes{namespace=kafka}')
        expect(sources[0].requestInterval).to.equal("30s")
        expect(sources[0].captureStep).to.equal("5m")
        expect(sources[0].timeout).to.equal("30s")
        expect(sources[0].resolution).to.equal(30.0)

        expect(sources[1].resolution).to.equal(10.0)
        expect(sources[1].captureStep).to.equal("10m")
        expect(sources[1].timeout).to.equal("60s")
    })
    
})