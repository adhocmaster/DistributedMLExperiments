import {expect} from 'chai'
import 'mocha'
import "reflect-metadata"
import {IoC} from "src/inversify.config"
import {inject} from 'inversify'
import {ConfigManager} from 'src/util/config-manager'
import { logger } from 'src/logger';
import {IO} from 'util/io'

describe('ConfigManager', function() {

    const config = IoC.get<ConfigManager>("ConfigManager")

    it("must display the version", function(){
        let version = config.get("version")
        console.log(version)
        expect(version).to.have.lengthOf.above(0)
    })

    it("must match the environment", function(){

        const environment = process.env.NODE_ENV || 'default'; 
        let environmentFromConfig = config.get("environment")
        expect(environment).to.equal(environmentFromConfig)
        

    })

    it("has the development prom host url set to 192.168.26.10:9090", () => {

        let environment = config.get("environment")
        if (environment != 'development') {
            logger.warn('Test is not in development environment.')
            return
        }

        expect(config.get('prom.host')).to.equal('192.168.26.10')
        expect(config.get('prom.port')).to.equal(9090)

    })

    it("reads all the configs in a directory and creates an array with each element representing a file", () => {
        let dir = 'source-configs'
        let configs = config.readConfigDir(dir)
        // logger.debug( JSON.stringify( configs ) )
        // console.dir(configs, {depth:5})

        IO.deepPrint(configs)
        expect(configs).to.have.lengthOf.above(0)
    })

})