import "reflect-metadata";
import { Container } from "inversify";
import {KafkaManager} from "src/kafka/kafka-manager"
import {ConfigManager} from 'src/util/config-manager'
import { PromManager } from "./prometheus/prom-manager";
import { MetricManager } from "./transformer/metric-manager";

const IoC = new Container()

const configManager = new ConfigManager()
IoC.bind<ConfigManager>("ConfigManager").toConstantValue(configManager)

setupKafka()
IoC.bind<PromManager>("PromManager").toConstantValue(IoC.resolve<PromManager>(PromManager))
// IoC.resolve<PromManager>(PromManager)
IoC.bind<MetricManager>('MetricManager').toConstantValue(IoC.resolve<MetricManager>(MetricManager))

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

