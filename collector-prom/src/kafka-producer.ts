import * as kafka from "kafka-node";
import {KafkaStatus} from "./kafka-status";
import {logger} from 'logger'
import {MessageProcessor} from 'kafka-message-processor'
import { interfaces } from "inversify";

export class KafkaProducer {

    _verbose: boolean;
    _topic: string;
    _status: KafkaStatus;
    _client: kafka.KafkaClient;
    _producer: kafka.Producer;
    _options: any;
    _counter: number;

    constructor(client: kafka.KafkaClient, topic: string, options = null, verbose=false) {
        this._client = client
        this._topic = topic
        this._status = KafkaStatus.Starting
        this._options = options
        this._verbose = verbose
        this._counter = 0
        this.connect()
    }

    get topic() {
        return this._topic
    }

    get status() { return this._status }

    set verbose(on_or_off) {
        this._verbose = on_or_off
    }
    set topic(new_topic) {
        this._topic = new_topic
    }

    onError(err) {
        // TODO integrate logger.
        this._status = KafkaStatus.Dirty
        logger.error(err.message)
        logger.info("Producer error with status " + this.status)
    }

    onReady() {
        this._status = KafkaStatus.Ready
        this._client.refreshMetadata([this._topic]) // Issue #354
        logger.info('Producer ready with status' + this.status)
    }

    connect() {
        logger.debug("connecting producer")
        this._producer = new kafka.Producer(this._client, this._options)
        this._producer.on('ready', this.onReady)
        this._producer.on('error', this.onError)
    }

    onSendComplete(err, data) {
        if (err == null) {
            this._counter++
            logger.info(data)
        } else {
            logger.error(err)
        }
    }

    send(strMsg) {

        let payload = MessageProcessor.fromString(this._topic, strMsg)
        if ( this._status == KafkaStatus.Ready )
            this._producer.send(payload, this.onSendComplete)
        else
            throw Error('Producer not ready')

    }


}