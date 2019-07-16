import { MetricChannel } from "src/transformer/metric-channel";
import Axios from 'axios'
import { SourceConfiguration } from "src/transformer/source-configuration";
import { inject } from "inversify";
import { ConfigManager } from "src/util/config-manager";
import { ChannelStats } from "src/transformer/channel-stats";
import { MetricChannelStatus } from "src/transformer/metric-channel-status";
import { logger } from "src/logger";

export class PromManager {
    
    host: string
    port: string
    instantUrl: string
    rangeUrl: string
    liveChannels:{} //{ id: channel }
    channelStats: {number: ChannelStats} // {id: {lastProbeTS: remote UTC, lastNumRecords:, totalNumRecords:}}
    timers: {}

    constructor(@inject('ConfigManager') configManager) {

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

    fetchAndPublish(channelId: number, sourceConfiguration: SourceConfiguration) {

        let channel = this.liveChannels[channelId] // TODO handle it if there is not channel
        let stats = this.channelStats[channelId]
        let query = sourceConfiguration.query
        if (sourceConfiguration.isRanged) {

            Axios.post(this.rangeUrl, {
                params: {
                    query: query,
                    start: stats['lastProbeTS'],
                    end: stats['lastProbeTS'] + channel.captureStep,
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

    processTimeSeries(channel, data) {
        // 1. Publish

        if (data.status == 'success') {

            this.publish(channel, data['data']['result'])

        } else {

            logger.error(`invalid timeseries data from Prom: ${data.status} for channel #${channel.id}`)
            channel.updateStatus(MetricChannelStatus.SourceDirty)
            
        }

        // 2. TODO Update Stats on success? what happens if Kafka goes down and comes back with a lot of obsolete data?
    }

    publish(channel, message) {
        // TODO
    }
}