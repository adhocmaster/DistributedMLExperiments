import {inject, injectable} from 'inversify'
import * as lodash from 'lodash'
import { PromManager } from 'src/prometheus/prom-manager';
import { ConfigManager } from 'src/util/config-manager';

"use strict"
@injectable()
export class MetricManager {

    @inject('PromManager') promManager: PromManager 
    @inject('ConfigManager') configManager: ConfigManager

    constructor() {
        // Some stats and loading of initial configuration
        this.init()
    }

    init() {
        this.createDefaultChannels()
    }

    createDefaultChannels() {

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