import { Container, injectable, inject } from "inversify"
import * as kafka from "kafka-node"
import {KafkaProducer} from "./kafka-producer"

@injectable()
class KafkaManager {

    private _name: string;
    private _hosts: string[];
    private _producers: {}; // mapped by topic
    private _consumers: {}; // mapped by topic
    private _clientOptions: any;
    private _client: kafka.KafkaClient;
    private _defaultProducerOptions: any;

    constructor(name='Default KafkaManager', hosts=[], clientOptions = {}) {

        this._defaultProducerOptions = {
                requireAcks: 1,
                ackTimeoutMs: 100,
                partitionerType: 2
            }

        this._name = name
        this._hosts = hosts

        let csHosts = {kafkaHost: this.getCSHosts()}
        this._clientOptions = {...csHosts, ...clientOptions}

        this.createClient()
    }

    getCSHosts() {
        return this._hosts.join()
    }

    get hosts() { return this._hosts }
    addHost(host: string) {
        this._hosts.push(host)
    }

    createClient() {
        this._client = new kafka.KafkaClient(this._clientOptions)
    }

    getProducer(topic: string, options=null) {

        if (topic in this._producers) {
            return this._producers[topic]
        } else {
            return this.createManagedProducer(topic, options)
        }

    }

    createManagedProducer(topic: string, options: any) {

        if (options == null || Object.keys(options).length === 0) {
            options = this._defaultProducerOptions
        }
        
        let producer = new KafkaProducer(this._client, topic, options)
        this._producers[topic] = producer
        return producer

    }


}