import {MetricChannelStatus} from 'transformer/metric-channel-status'
import {injectable, inject} from 'inversify'
import {PromManager} from 'prometheus/prom-manager'
import {SourceConfiguration} from 'transformer/source-configuration'
import { SourceType } from './source-types';
import { logger } from 'src/logger';
"use strict"

export class MetricChannel {

    id: number
    topic: string
    resolution: number // floating point seconds.
    requestInterval: number // in ms. It's ignored if captureStep is setup.
    captureStep: string // in s=sec, m=min.
    captureStepAmount:number
    captureStepUnit: string
    timeout: string // prom duration syntax
    sourceConfigurations: SourceConfiguration[] // different metrics different configs
    status: MetricChannelStatus

    // Prom managers
    @inject('PromManager') promManager: PromManager // doesn't work in java, but should work in node even if we are gonna call the constructor

    constructor(id: number=null, sourceConfigurations: SourceConfiguration[]) {

        this.id = id
        this.topic = topic
        this.sourceConfigurations = sourceConfigurations // TODO validate source configurations
        this.resolution = resolution
        this.requestInterval = requestInterval
        this.captureStep = captureStep // TODO validate captureStep
        this.timeout = timeout

        this.status = MetricChannelStatus.Starting

        this.processCaptureStep()

    }

    updateStatus(updater: string, newStatus: MetricChannelStatus) {
        logger.debug( `${updater} is updating channel ${this.id}'s status to ${newStatus}`)
        this.status = newStatus
    }
    processCaptureStep() {
        // TODO implement
        this.captureStepAmount = 30
        this.captureStepUnit = 's'
    }

    getCaptureStepInS() {

        switch (this.captureStepUnit) {
            case 's': { return (this.captureStepAmount) }
            case 'm': { return (this.captureStepAmount * 60) }
            case 'h': { return (this.captureStepAmount * 3600) }
        }
    }

    getrequestIntervalInMS() {
        if (this.captureStep) {
            switch (this.captureStepUnit) {
                case 's': { return (this.captureStepAmount * 1000) }
                case 'm': { return (this.captureStepAmount * 60000) }
                case 'h': { return (this.captureStepAmount * 3600000) }
            }
        } else {
            return this.requestInterval
        }
    }
    init() {
        // creates a kafka producer and a input stream 
        for (let source of this.sourceConfigurations) {

            // Find the source manager
            switch(source['type']) {
                case SourceType.PROM: {
                    return this.promManager.setupStreamForChannel(this, source)
                }
            }

        }

    }

}