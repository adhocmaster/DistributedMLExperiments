import {expect} from 'chai'
import {KafkaManager} from 'kafka-manager'
import 'mocha'
import {KafkaStatus} from 'kafka-status'
import { logger } from 'src/logger';

describe("Kafka Producer", function() {
    this.timeout(60000)

    let hosts = ["192.168.26.10:32400", "192.168.26.11:32400"]
    const manager = new KafkaManager("Test Kafka Manager", hosts)


    after('Shutting down manager', function(done) {

        manager.shutdown();
        setTimeout( () => {
            done()
        }, 10000)
    })

    it('must publish a message to a new topic', function(done) {
        this.timeout(15000)
        let producer = manager.getProducer("node-" + Date.now().toString())
        producer.send("A message from node")
        logger.debug('message send requested. now will wait')
        setTimeout( () => {
            expect(producer._counter).equal(1)
            done()
        }, 12000)
    })

    it('must publish many messages to a topic', function(done) {
        this.timeout(60000)
        let producer = manager.getProducer("node-multi2")

        producer.send("message #" + 0)
        logger.debug(0 + ' requested. now will wait')

        for (let i = 1; i < 6; ++i) {

            let j = i
            setTimeout( () => {
                producer.send("message #" + j)
                logger.debug(j + ' requested. now will wait')
            }, 100 * i)

        }
        logger.debug('message send requested. now will wait')
        setTimeout( () => {
            expect(producer._counter).equal(5)
            done()
        }, 30000)
    })

})