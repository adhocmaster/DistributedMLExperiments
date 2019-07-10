import * as kafka from "kafka-node";
import {KafkaStatus} from "./kafka-status";
import {logger} from 'logger'

export class KafkaProducer {

    _verbose: boolean;
    _topic: string;
    _status: KafkaStatus;
    _client: kafka.KafkaClient;
    _producer: kafka.Producer;
    _options: any;

    constructor(client: kafka.KafkaClient, topic: string, options = null, verbose=false) {
        this._client = client
        this._topic = topic
        this._status = KafkaStatus.Starting
        this._options = options
        this._verbose = verbose
        this.connect()
    }

    get topic() {
        return this._topic
    }

    set verbose(on_or_off) {
        this._verbose = on_or_off
    }
    set topic(new_topic) {
        this._topic = new_topic
    }

    onError(err) {
        // TODO integrate logger.
        logger.error(err.message)
    }

    onReady() {
        this._status = KafkaStatus.Ready
        this._client.refreshMetadata([this._topic]) // Issue #354
    }

    connect() {
        this._producer = new kafka.Producer(this._client, this._options)
        this._producer.on('ready', this.onReady)
        this._producer.on('error', this.onError)
    }


}