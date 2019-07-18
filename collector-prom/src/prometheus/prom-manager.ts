import { MetricChannel } from "src/transformer/metric-channel";
import Axios from 'axios'
import { SourceConfiguration } from "src/transformer/source-configuration";
import { inject, injectable } from "inversify";
import { ConfigManager } from "src/util/config-manager";
import { ChannelStats } from "src/transformer/channel-stats";
import { MetricChannelStatus } from "src/transformer/metric-channel-status";
import { logger } from "src/logger";
import { KafkaManager } from "src/kafka/kafka-manager";
import { resolve } from "url";
import { SourceType } from "src/transformer/source-types";

@injectable()
export class PromManager {
    
    kafkaManager: KafkaManager
    host: string
    port: string
    instantUrl: string
    rangeUrl: string
    liveChannels:{} //{ id: channel }
    channelStats: {number: ChannelStats} // {id: {lastProbeTS: remote UTC, lastNumRecords:, totalNumRecords:}}
    timers: {}

    constructor(@inject('ConfigManager') configManager, @inject('KafkaManager') kafkaManager) {

        this.kafkaManager = kafkaManager
        this.host = configManager.getStr('prom.host')
        this.port = configManager.getStr('prom.port')
        this.instantUrl = 'http://' + this.host + ':' + this.port + '/api/v1/query'
        this.rangeUrl = 'http://' + this.host + ':' + this.port + '/api/v1/query_range'
    }

    /* 
    need to explicitly pass which sourceConfiguration to use as there can be multiple schema publishing to the same topic
    */
    setupStreamForChannel(channel: MetricChannel, sourceConfiguration: SourceConfiguration) {

        if (channel.id in this.liveChannels) {
            let existingChannel = this.liveChannels[channel.id]
            throw Error(`Channel with id ${channel.id} already exists with status ${existingChannel.status}`)
        }

        this.initChannelStats(channel)

        // we need a process which makes a request at requestInterval if captureStep is not set. 
        let requestInterval = channel.getrequestIntervalInMS()

        // TODO streaming should be in child-processes/
        let self = this

        let timer = setInterval(function(){
            // this will be converted to a child process. It does not need to be a async task as the child process only do one task
            self.fetchAndPublish(channel, sourceConfiguration)
        }, requestInterval)

        this.timers[channel.id] = timer


    }
    initChannelStats(channel: MetricChannel) {

        this.liveChannels[channel.id] = channel
        let initialProbTS = Date.now() - channel.getrequestIntervalInMS() // TODO ensure now is in sync with prom
        this.channelStats[channel.id] = {

            lastProbeTS: initialProbTS, 
            lastNumRecords: 0, 
            totalNumRecords: 0
        }
    }

    fetchAndPublish(channel: MetricChannel, sourceConfiguration: SourceConfiguration) {

        let stats = this.channelStats[channel.id]
        let query = sourceConfiguration.query
        if (sourceConfiguration.isRanged) {

            Axios.post(this.rangeUrl, {
                params: {
                    query: query,
                    start: stats['lastProbeTS'],
                    end: stats['lastProbeTS'] + channel.getCaptureStepInS(),
                    step: channel.resolution,
                    timeout: channel.timeout
                }
            }).then(function(response) {

                this.processTimeSeries(channel, response)

            }).catch(function(err) {

                channel.updateStatus("Prom fetch of fetchAndPublish", MetricChannelStatus.SourceDirty)
                logger.error(err.message, err)

            }).finally(function() {

                // any followup

            })
        }

        // TODO implement instant queries

    }

    processTimeSeries(channel, rawData) {
        // 1. Publish

        if (rawData.status == 'success') {

            this.publish(channel, this.getMQMessage(rawData)) // Use a promise to do it

        } else {

            logger.error(`invalid timeseries data from Prom: ${rawData.status} for channel #${channel.id}`)
            channel.updateStatus(MetricChannelStatus.SourceDirty)
            
        }

        // 2. TODO Update Stats on success? what happens if Kafka goes down and comes back with a lot of obsolete data?
    }

    getMQMessage(rawData) {

        // TODO refactor it to another message processor which creates messages from different sources? Or should it be manager specific?
        let message = {
            sourceType: SourceType.PROM,
            data: rawData['data']
        }

        return message

    }

    publish(channel, message) {
        // TODO
        let promise = this.kafkaManager.promiseToPublish(channel.topic, message)

        promise.then(function(result) {

            logger.debug(`Prom manager publish result: ${result}`)
            this.onPublishSuccess(channel, message)

        }, function(err) {

            this.onPublishFailure(channel, message)

        })
    }

    onPublishSuccess(channel, data) {

        // TODO whether we update stats from success will depend on strategy of obsolete data
        let stats = this.channelStats[channel.id]
        stats['lastProbeTS']  = stats['lastProbeTS'] + channel.getCaptureStepInS()
        stats['lastNumRecords'] = data.length
        stats['totalNumRecords'] += data.length

        logger.debug(`Prom manager successfully published data for channel #${channel.id}`)

    }

    onPublishFailure(channel, data) {
        
        logger.error(`publishing failed for ${channel.id}`)
        channel.updateStatus('Prom on publish failure', MetricChannelStatus.KafkaDirty)

    }
}