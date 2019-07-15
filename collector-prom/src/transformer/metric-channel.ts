import {MetricChannelStatus} from 'transformer/metric-channel-status'

"use strict"

export class MetricChannel {
    id: Number
    topic: string
    captureStep: string
    // promQuery: string
    sourceConfigurations: {}
    status: MetricChannelStatus

    constructor(id: Number=null, topic, sourceConfigurations, captureStep=null) {

        this.id = id
        this.topic = topic
        this.sourceConfigurations = sourceConfigurations // TODO validate source configurations
        this.captureStep = captureStep // TODO validate captureStep

    }

    init() {
        // creates a kafka producer and a input stream 
        return

    }

}