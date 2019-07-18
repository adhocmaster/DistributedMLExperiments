import * as lodash from 'lodash'
import * as yaml from 'js-yaml'
import * as fs from 'fs'
import {injectable} from 'inversify'
import {logger} from 'logger'
import { IO } from './io';

@injectable()
export class ConfigManager {

    data: {string: any}
    constructor() {

        const environment = process.env.NODE_ENV || 'default'; 

        // load default
        this.data = this.readEnvironment('default')
        this.data['environment'] = environment
        if (environment != 'default') {
            // load specific
            let environmentConfig = this.readEnvironment(environment)
            this.data = lodash.merge(this.data, environmentConfig)
        }
        IO.deepPrint(this.data)

    }

    readEnvironment(environment: string) {

        let path = `env/${environment}.yaml`
        logger.warn(`loading environment '${environment}' from '${path}'`)
        return this.readYamlFile(path);
    }

    readYamlFile(path: string) {
        return yaml.safeLoad(fs.readFileSync(path, 'utf8'));
    }

    readMultiYamlFile(path: string) {
        return yaml.safeLoadAll(fs.readFileSync(path, 'utf8'));
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

        let self = this
        return name.split('.').reduce((p,c) => {
            let val =  (p && p[c]) || orDefault
            return val
        }, self.data)
        
    }

    save(environment: string) {

        let path = `env/{$environment}.yaml`
        let dataStr = yaml.safeDump(this.data, {sortKeys: true})

        fs.writeFile(dataStr, path, 'utf8', function(err) {
            if(err) {

                logger.error(path + " file failed to be saved!");
                logger.error(err.message);
            }
            logger.warn(path + " file was overwritten!");
        });

    }

    readConfigDir(dir: string) {
        let paths = fs.readdirSync(dir)
        let configs = []

        paths.forEach(path => {
            configs = configs.concat( this.readMultiYamlFile(dir +'/' + path) )
        });

        return configs

    }

}