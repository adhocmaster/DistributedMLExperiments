import {expect} from 'chai'
import {KafkaManager} from 'kafka-manager'
import 'mocha'
import {KafkaStatus} from 'kafka-status'
import {Utility} from 'utility'

describe('KafkaManager Tests', function() {

    this.timeout(8000)

    let hosts = ["192.168.26.10:32400", "192.168.26.11:32400"]
    const manager = new KafkaManager("Test Kafka Manager", hosts)

    after('Shutting down manager', function(done) {

        manager.shutdown();
        setTimeout( () => {
            done()
        }, 2000)
    })

    it('client must be ready', function(done) {
        setTimeout( () => {

            expect(manager.clientStatus()).equal(KafkaStatus.Ready)
            done()

        }, 4000)

    })

})
