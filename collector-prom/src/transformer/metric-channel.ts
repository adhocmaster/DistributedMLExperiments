import {MetricChannelStatus} from 'transformer/metric-channel-status'
import {injectable, inject} from 'inversify'
import {PromManager} from 'prometheus/prom-manager'

"use strict"

export class MetricChannel {
    id: number
    topic: string
    requestRate: number // in ms. It's ignored if captureStep is setup.
    captureStep: string // in s=sec, m=min.
    captureStepAmount:number
    captureStepUnit: string
    // promQuery: string
    sourceConfigurations: {}
    status: MetricChannelStatus

    // Prom managers
    promManager: PromManager

    constructor(id: number=null, topic, sourceConfigurations, requestRate=1000, captureStep=null) {

        this.id = id
        this.topic = topic
        this.sourceConfigurations = sourceConfigurations // TODO validate source configurations
        this.captureStep = captureStep // TODO validate captureStep

        this.processCaptureStep()

    }
    processCaptureStep() {
        // TODO implement
        this.captureStepAmount = 30
        this.captureStepUnit = 's'
    }

    getRequestRateInMS() {
        if (this.captureStep) {
            switch (this.captureStepUnit) {
                case 's': { return (this.captureStepAmount * 1000) }
                case 'm': { return (this.captureStepAmount * 60000) }
                case 'h': { return (this.captureStepAmount * 3600000) }
            }
        } else {
            return this.requestRate
        }
    }
    init() {
        // creates a kafka producer and a input stream 
        for (let source in this.sourceConfigurations) {

            // Find the source manager
            switch(source['type']) {
                case 'prom': {
                    return this.promManager.setupStreamForChannel(this)
                }
            }

        }

    }

}