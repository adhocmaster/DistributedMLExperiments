import {expect} from 'chai'
import 'mocha'
import "reflect-metadata"
import {IoC} from "src/inversify.config"
import {inject} from 'inversify'
import {ConfigManager} from 'src/util/config-manager'

describe('ConfigManager', function() {

    const config = IoC.get<ConfigManager>("ConfigManager")

    it("must display the version", function(){
        let version = config.get("version")
        expect(version.length).to.have.lengthOf.above(0)
    })

    it("must match the environment", function(){

        const environment = process.env.NODE_ENV || 'default'; 
        let environment = config.get("environment")
        expect(environment.length).to.equal(environment)
        

    })

    it("has the test prom host url set to 192.168.26.10", () => {

        let environment = config.get("environment")
        if (environment != 'development') {
            return
        }

        expect(config.get('prom.host')).to.equal('192.168.26.10')

    })

})