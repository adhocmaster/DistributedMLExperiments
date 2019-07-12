import "reflect-metadata";
import { Container } from "inversify";
import {KafkaManager} from "src/kafka/kafka-manager"
import {ConfigManager} from 'config-manager'

const IoC = new Container()
const configManager = new ConfigManager()
IoC.bind<ConfigManager>("ConfigManager").toConstantValue(configManager)

let hosts = ["192.168.26.10:32400", "192.168.26.11:32400"]
// TODO read from environment or configs

const clientOptions = {
    connectTimeout: 2000,
    requestTimeout: 5000,
    maxAsyncRequests:1000
}
const kafkaManager = new KafkaManager("Test Kafka Manager", hosts, clientOptions)
IoC.bind<KafkaManager>("KafkaManager").toConstantValue(kafkaManager)

export { IoC }

