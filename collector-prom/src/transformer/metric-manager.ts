import {inject, injectable} from 'inversify'
import * as lodash from 'lodash'
import { PromManager } from 'src/prometheus/prom-manager';
import { ConfigManager } from 'src/util/config-manager';
import { MetricChannel } from './metric-channel';
import { SourceType } from './source-types';

"use strict"
@injectable()
export class MetricManager {


    
    promManager: PromManager
    configManager: ConfigManager

    constructor(
        @inject('PromManager') promManager: PromManager,
        @inject('ConfigManager') configManager: ConfigManager

    ) {

        this.promManager = promManager
        this.configManager = configManager
        // Some stats and loading of initial configuration
        this.init()
    }

    init() {
        this.createDefaultChannels()
    }

    createDefaultChannels() {

        let sourceDir = this.configManager.get('metric-manager.source-dir')

        let conigs = this.configManager.readConfigDir(sourceDir)

        let self = this

        conigs.forEach(function(config){

            config.sources = self.getValidatedSources(config)
            let channel = new MetricChannel(config)

            self.setupChannel(channel)

        })

    }

    setupChannel(channel: MetricChannel) {

        // let self = this

        // channel.sourceConfigurations.forEach(function(source) {
        //     // Find the source manager
        //     switch(source['type']) {
        //         case SourceType.PROM: {
        //             return self.promManager.setupStreamForChannel(channel, source)
        //         }
        //     }
        // });

        channel.init(this.promManager)

    }

    getValidatedSources(config) {
        // inject default values to sources if something is not present
        let defaults = {
            resolution: config.resolution || 15.0,
            captureStep: config.captureStep || '5m',
            requestInterval: config.requestInterval || '30s',
            timeout: config.timeout || '30s'
        }

        for (let source of config['sources']) {
            lodash.defaultsDeep(source, defaults)
        }

        return config['sources']
    }
}