import * as kafka from 'kafka-node'

export class MessageProcessor {

    static fromString(topic: string, strMsg: string, timestamp=Date.now()) {
        return [{
            topic: topic,
            messages: strMsg, // string[] | Array<KeyedMessage> | string | KeyedMessage
            timestamp: timestamp
        }]
    }
    static fromStringArr(topic: string, strMsgArr: string[], timestamp=Date.now()) {
        return [{
            topic: topic,
            messages: strMsgArr, // string[] | Array<KeyedMessage> | string | KeyedMessage
            timestamp: timestamp
        }]
    }
    static fromStringArrToSingleMessage(topic: string, strMsgArr: string[], timestamp=Date.now()) {
        return [{
            topic: topic,
            messages: JSON.stringify(strMsgArr), // string[] | Array<KeyedMessage> | string | KeyedMessage
            timestamp: timestamp,
            // key: null,
            // partition: null,
            // attributes: null
        }]
    }

    // stringFromMessage()

}