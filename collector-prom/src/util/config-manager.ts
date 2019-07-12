import * as lodash from 'lodash'
import * as yaml from 'js-yaml'
import * as fs from 'fs'
import {injectable} from 'inversify'
import * as logger from 'logger'

@injectable
export class ConfigManager {

    data: {string: any}
    constructor() {

        const environment = process.env.NODE_ENV || 'default'; 

        # load default
        this.data = load('default')
        this.data['environment'] = environment
        if (environment != 'default') {
            # load specific
            let environmentConfig = load(environment)
            this.data = _.merge(data, environmentConfig)
        }

    }

    load(environment: string) {
        path = `env/{$environment}.yaml`
        return yaml.safeLoad(fs.readFileSync(path, 'utf8'));
    }

    getStr(name: string, orDefault=null) {
        return String(this.get(name, orDefault))
    }
    getInt(name: string, orDefault=null) {
        return parseInt(this.get(name, orDefault))
    }
    getFloat(name: string, orDefault=null) {
        return parseFloat(this.get(name, orDefault))
    }
    getNum(name: string, orDefault=null) {
        return Number(this.get(name, orDefault))
    }
    get(name: string, orDefault=null) {

        if (name in data)
            return this.data[name]
        return orDefault
    }
    save(environment: string) {

        path = `env/{$environment}.yaml`
        dataStr = yaml.safeDump(this.data, {sortKeys: true})

        fs.writeFile(dataStr, path, 'utf8', function(err) {
            if(err) {

                logger.error(path + " file failed to be saved!");
                logger.error(err.message);
            }
            logger.warn(path + " file was overwritten!");
        }));

    }

}