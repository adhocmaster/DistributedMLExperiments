import { Container, injectable, inject } from "inversify"
import * as kafka from "kafka-node"
import {logger} from 'logger'
import {KafkaProducer} from "kafka-producer"
import {KafkaStatus} from "kafka-status"

//@injectable()
export class KafkaManager {

    private _name: string;
    private _hosts: string[];
    private _producers: {}; // mapped by topic
    private _consumers: {}; // mapped by topic
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

    clientStatus() { return this._clientStatus }

    createClient() {
        this._clientStatus = KafkaStatus.Starting
        this._client = new kafka.KafkaClient(this._clientOptions)

        this._client.on('error', err => { 
            this._clientStatus = KafkaStatus.Dirty
            logger.info('Client dirty with status ' + this.clientStatus() )
            logger.info('Client dirty with status ' + this._clientStatus )
        })
        this._client.on('socket_error', err => { 
            this._clientStatus = KafkaStatus.Dirty
            logger.info('Client dirty with status ' + this.clientStatus() )
            logger.info('Client dirty with status ' + this._clientStatus )
        })
        this._client.on('ready', () => { 
            this._clientStatus = KafkaStatus.Ready
            logger.info('Client ready with status ' + this.clientStatus() )
            logger.info('Client ready with status ' + this._clientStatus )
        })
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