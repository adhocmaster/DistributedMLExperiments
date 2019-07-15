import { MetricChannel } from "src/transformer/metric-channel";

export class PromManager {

    liveChannels:{}

    setupStreamForChannel(channel: MetricChannel) {
        // we need a process which makes a request at requestRate if captureStep is not set. 
        let requestRate = channel.getRequestRateInMS()
        
    }
}