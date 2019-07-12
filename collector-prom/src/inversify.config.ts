import "reflect-metadata";
import { Container } from "inversify";
import {KafkaManager} from "src/kafka/kafka-manager"
import {ConfigManager} from 'src/util/config-manager'

const IoC = new Container()
const configManager = new ConfigManager()
IoC.bind<ConfigManager>("ConfigManager").toConstantValue(configManager)

// let hosts = ["192.168.26.10:32400", "192.168.26.11:32400"]
// TODO read from environment or configs

setupKafka()

function setupKafka() {

    let hostPortArray = configManager.get('kafka.hosts')
    let hosts = []
    for ( let hostObj of hostPortArray ) {
        hosts.push( hostObj['host'] + ':' + hostObj['port'] )
    }

    const clientOptions = configManager.get('kafka.clientOptions')

    const kafkaManager = new KafkaManager("Test Kafka Manager", hosts, clientOptions)
    IoC.bind<KafkaManager>("KafkaManager").toConstantValue(kafkaManager)
}

export { IoC }

