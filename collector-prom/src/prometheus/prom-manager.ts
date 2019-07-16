import { MetricChannel } from "src/transformer/metric-channel";
import Axios from 'axios'
import { SourceConfiguration } from "src/transformer/source-configuration";
import { inject } from "inversify";
import { ConfigManager } from "src/util/config-manager";
import { ChannelStats } from "src/transformer/channel-stats";

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
        this.channelStats[channel.id] = {

            lastProbeTS: (Date.UTC - channel.getrequestIntervalInMS), 
            lastNumRecords: 0, 
            totalNumRecords: 0
        }
    }

    fetchAndPublish(channel: MetricChannel, sourceConfiguration: SourceConfiguration) {

        let query = sourceConfiguration.query
        if (sourceConfiguration.isRanged) {

            Axios.get(this.rangeUrl, {
                params: {
                    query: query,
                    start: ,
                    end: ,
                    step ,
                    timeout:
                }
            })
        }


    }
}