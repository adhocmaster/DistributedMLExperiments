import {expect} from 'chai'
import {KafkaManager} from 'kafka-manager'
import 'mocha'
import {KafkaStatus} from 'kafka-status'

describe("Kafka Producer", function() {
    this.timeout(5000)

    let hosts = ["192.168.26.10:32400", "192.168.26.11:32400"]
    const manager = new KafkaManager("Test Kafka Manager", hosts)


    after('Shutting down manager', function(done) {

        manager.shutdown();
        setTimeout( () => {
            done()
        }, 2000)
    })

    it('must publish a message', function(done) {
        this.timeout(15000)
        let producer = manager.getProducer("first")
        producer.send("A message from node")
        setTimeout( () => {
            done()
        }, 12000)
    })

})