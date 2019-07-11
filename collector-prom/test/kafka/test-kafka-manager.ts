import {expect} from 'chai'
import {KafkaManager} from 'kafka-manager'
import 'mocha'
import {KafkaStatus} from 'kafka-status'

describe('KafkaManager Tests', function() {

    this.timeout(10000)

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

            expect(manager.clientStatus).equal(KafkaStatus.Ready)
            done()

        }, 2000)

    })

    it('must create a producer', function(done) {
        let producer = manager.getProducer("first")
        setTimeout(() => {
            expect(producer.status).equal(KafkaStatus.Ready)
            done()
        }, 5000)

        producer = manager.getProducer("second")
        setTimeout(() => {
            expect(producer.status).equal(KafkaStatus.Ready)
            done()
        }, 5000)
    })

})
