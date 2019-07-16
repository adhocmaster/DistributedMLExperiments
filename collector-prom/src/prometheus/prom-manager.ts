import { MetricChannel } from "src/transformer/metric-channel";
import * as axios from 'axios'

export class PromManager {

    liveChannels:{} //{ id: channel }
    channelStats: {} // {id: {lastProbeTS: remote UTC, lastNumRecords:, totalNumRecords:}}
    timers: {}

    /* 
    need to explicitly pass which sourceConfiguration to use as there can be multiple schema publishing to the same topic
    */
    setupStreamForChannel(channel: MetricChannel, sourceConfiguration) {

        if (channel.id in this.liveChannels) {
            let existingChannel = this.liveChannels[channel.id]
            throw Error(`Channel with id ${channel.id} already exists with status ${existingChannel.status}`)
        }
        // we need a process which makes a request at requestInterval if captureStep is not set. 
        let requestInterval = channel.getrequestIntervalInMS()

        // TODO streaming should be in child-processes/
        let self = this

        let timer = setInterval(function(){
            // this will be converted to a child process. It does not need to be a async task as the child process only do one task
            self.fetchAndPublish(channel, sourceConfiguration)
        }, requestInterval)


    }

    fetchAndPublish(channel: MetricChannel, sourceConfiguration) {

        let query = sourceConfiguration.query



    }
}