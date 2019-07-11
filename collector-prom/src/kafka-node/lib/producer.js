'use strict';

var util = require('util');
var BaseProducer = require('./baseProducer');

/** @inheritdoc */
function Producer (client, options, customPartitioner) {
  this.client = client
  BaseProducer.call(this, client, options, BaseProducer.PARTITIONER_TYPES.default, customPartitioner);
}

util.inherits(Producer, BaseProducer);

Producer.PARTITIONER_TYPES = BaseProducer.PARTITIONER_TYPES;

Producer.prototype.isReady = function() {
  console.log("Producer.isReady called: " + this.client.ready)
  return this.client.ready;
}

module.exports = Producer;
