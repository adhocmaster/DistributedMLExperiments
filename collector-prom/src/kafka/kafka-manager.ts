import { Container, injectable, inject } from "inversify"
import * as kafka from "kafka-node"
import {logger} from 'logger'
import {KafkaProducer} from "src/kafka/kafka-producer"
import {KafkaStatus} from "src/kafka/kafka-status"

@injectable()
export class KafkaManager {

    private _name: string;
    private _hosts: string[];
    private _producers: any; // mapped by topic
    private _consumers: any; // mapped by topic
    private _clientOptions: any;
    private _client: kafka.KafkaClient;
    private _defaultProducerOptions: {};
    private _clientStatus: KafkaStatus;

    constructor(name='Default KafkaManager', hosts=[], clientOptions = {}) {

        this._defaultProducerOptions = {
                requireAcks: 1,
                ackTimeoutMs: 100,
                partitionerType: 2
            }

        this._name = name
        this._hosts = hosts

        this._producers = {}
        this._consumers = {}

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

    get clientStatus() { return this._clientStatus }

    createClient() {
        this._clientStatus = KafkaStatus.Starting
        this._client = new kafka.KafkaClient(this._clientOptions)
        let self = this
        this._client.on('error', function(err) { 
            self._clientStatus = KafkaStatus.Dirty
            logger.info('Client dirty with error: ' + err.message)
        })
        this._client.on('socket_error', function(err) { 
            self._clientStatus = KafkaStatus.Dirty
            logger.info('Client dirty with error: ' + err.message)
        })
        this._client.on('ready', function() { 
            self._clientStatus = KafkaStatus.Ready
            logger.info('Client ready with status ' + self.clientStatus )
        })
    }

    getProducer(topic: string, options=null): KafkaProducer {

        if (topic in this._producers) {
            return this._producers[topic]
        } else {
            return this.createManagedProducer(topic, options)
        }

    }

    createManagedProducer(topic: string, options: any): KafkaProducer {

        if (options == null || Object.keys(options).length === 0) {
            options = this._defaultProducerOptions
        }
        
        let producer = new KafkaProducer(this._client, topic, options)
        this._producers[topic] = producer
        return producer

    }

    shutdown() {

        for (let topic in this._producers) {
            try {
                this._producers[topic].close()
            } catch (e) {
                // ignore
            }
        }

        this._producers = {}
        
        try {
            this._client.close()
        } catch (e) {
            // ignore
        }

    }


}