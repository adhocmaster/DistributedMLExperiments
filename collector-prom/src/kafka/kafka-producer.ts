import * as kafka from "kafka-node";
import {KafkaStatus} from "./kafka-status";
import {logger} from 'logger'
import {MessageProcessor} from 'src/kafka/kafka-message-processor'
import { interfaces } from "inversify";

export class KafkaProducer {

    _verbose: boolean;
    _topic: string;
    _status: KafkaStatus;
    _client: kafka.KafkaClient;
    _producer: kafka.Producer;
    _options: any;
    _counter: number; // won't work if  custom callback is used to send 
    _holder: KafkaProducer;

    constructor(client: kafka.KafkaClient, topic: string, options = null, verbose=false) {
        this._holder = this
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

    get ready() {
        return this._producer.isReady()
    }
    get status() { 
        if (this._producer.isReady())
            this._status = KafkaStatus.Ready
        return this._status 
    }

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
        let self = this
        this._client.refreshMetadata([this._topic], function(err?:Error) {
            self._status = KafkaStatus.Dirty
            if (!!err)
                logger.info('refreshMetadata failed onReady', err.message)
            else 
                logger.info('refreshMetadata completed')
        }) // Issue #354
        logger.info('Producer ready with status' + this.status)
    }

    connect() {
        logger.debug("connecting producer")
        let ctx = this
        this._producer = new kafka.Producer(this._client, this._options)
        this._producer.on('ready', function() { ctx.onReady() })
        this._producer.on('error', function(err) { ctx.onError(err) })
    }

    onSendComplete(err, data) {
        logger.debug( 'onSendComplete called' )
        if (err == null) {
            this._counter++
            logger.info('onSendCompleteData: ' + JSON.stringify(data))
        } else {
            logger.error('onSendCompleteError: ' + JSON.stringify(err))
        }
    }

    _sendReady(ctx, payloads, callback:(err:Error, data:any) => any = null) {

        if ( callback == null )
            ctx._producer.send(payloads, function(err, data) { ctx.onSendComplete(err, data) })
        else
            ctx._producer.send(payloads, callback)

    }

    sendPayLoads(payloads: any[], callback:(err:Error, data:any) => any = null) {

        logger.debug('Payloads: ' + JSON.stringify(payloads))

        let ctx = this
        if ( this.ready ) {

            logger.debug('Producer already ready')
            ctx._sendReady(ctx, payloads, callback)
        } else {

            logger.debug('Producer not ready. Listening to ready event')
            this._producer.on('ready', function() {
                ctx._sendReady(ctx, payloads, callback)
            })

        }

    }

    send(strMsg:string, callback:(err:Error, data:any) => any = null) {

        let payloads = MessageProcessor.fromString(this._topic, strMsg)
        this.sendPayLoads(payloads, callback)

    }

    // separate messages
    sendArr(strArr: string[], callback:(err:Error, data:any) => any = null) {
        let payloads = MessageProcessor.fromStringArr(this._topic, strArr)
        this.sendPayLoads(payloads, callback)

    }

    sendObj(obj: any, callback:(err:Error, data:any) => any = null) {

        let payloads = MessageProcessor.fromString(this._topic, JSON.stringify(obj))
        this.sendPayLoads(payloads, callback)

    }

    // all the items will become a single message.
    sendBatch(batch: string[], callback:(err:Error, data:any) => any = null) {

        let payloads = MessageProcessor.fromStringArrToSingleMessage(this._topic, batch)
        this.sendPayLoads(payloads, callback)

    }


    


}