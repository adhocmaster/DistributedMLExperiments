#[macro_use] extern crate log;
use rand;
use futures::{Future, lazy, Stream};
use tokio::runtime::current_thread;
use clap::{App, Arg};

use rdkafka::{Message, consumer::{Consumer, stream_consumer::StreamConsumer}, config::ClientConfig, message::OwnedMessage, producer::{FutureProducer, FutureRecord}};

use std::{
    thread,
    time::Duration
};


fn expensive_computation(msg: OwnedMessage) -> String {
    
    info!("Starting expensive on message {}", msg.offset());
    thread::sleep(Duration::from_millis(rand::random::<u64>() % 5000));
    info!("Expensive completed on message {}", msg.offset());

    match msg.payload_view::<str>() {

        Some(Ok(payload)) => format!("Payload len for {} is {}", payload, payload.len()),
        Some(Err(_)) => "Message payload is not a string".to_owned(),
        None => "No Payload".to_owned()

    }
    

}

fn run(brokers: &str, groupId: &str, inputTopic: &str, outputTopic: &str) {

    let consumer: StreamConsumer = ClientConfig::new()
        .set("group.id", groupId)
        .set("bootstrap.servers", brokers)
        .set("enable.partition.eof", "false")
        .set("session.timeout.ms", "6000")
        .set("enable.auto.commit", "false")
        .create()
        .expect("Consumer creation failed");
    
    consumer.subscribe(&[inputTopic]).expect("Can't subscribe to specified topic");


    // Create the `FutureProducer` to produce asynchronously.
    let producer: FutureProducer = ClientConfig::new()
        .set("bootstrap.servers", brokers)
        .set("produce.offset.report", "true")
        .set("message.timeout.ms", "5000")
        .create()
        .expect("Producer creation error");

    
    let mut threadPool = tokio::runtime::Builder::new()
        .name_prefix("pool-")
        .core_threads(4)
        .build()
        .unwrap();

    let mut ioThread = current_thread::Runtime::new().unwrap();
    let ioThreadHandle = ioThread.handle();
    
    let streamProcessor = consumer.start()
        .filter_map( |result| {
            match result {
                Ok(msg) => Some(msg),
                Err(kafkaError) => {
                    warn!("Error while receving from kafka {:?}", kafkaError);
                    None
                }
            }
        }).for_each(move |borrowed_msg| {

            let ownedMsg = borrowed_msg.detach();
            let outputTopic = outputTopic.to_string();
            let producer = producer.clone();
            let ioThreadHandle = ioThreadHandle.clone();
            let messageFuture = lazy(move || {
                let computationResult = expensive_computation(ownedMsg);
                let producerFuture = producer.send(
                    FutureRecord::to(&outputTopic)
                        .key("some key")
                        .payload(&computationResult),
                        0)
                    .then(|result| {
                        match result {
                            Ok(Ok(delivery)) => println!("Sent {:?}", delivery),
                            Ok(Err(e)) => println!("Error {:?}", e),
                            Err(_) => println!("Future cancelled")
                        }

                        Ok(())
                    });
                let _ = ioThreadHandle.spawn(producerFuture);
                Ok(())
                
            });

            threadPool.spawn(messageFuture);
            Ok(())

        });

    info!("Starting event loop");
    let _ = ioThread.block_on(streamProcessor);

    info!("Stream processing terminated");

}


fn main() {
    let matches = App::new("Async example")
        .version(option_env!("CARGO_PKG_VERSION").unwrap_or(""))
        .about("Asynchronous computation example")
        .arg(Arg::with_name("brokers")
             .short("b")
             .long("brokers")
             .help("Broker list in kafka format")
             .takes_value(true)
             .default_value("localhost:9092"))
        .arg(Arg::with_name("group-id")
             .short("g")
             .long("group-id")
             .help("Consumer group id")
             .takes_value(true)
             .default_value("example_consumer_group_id"))
        .arg(Arg::with_name("log-conf")
             .long("log-conf")
             .help("Configure the logging format (example: 'rdkafka=trace')")
             .takes_value(true))
        .arg(Arg::with_name("input-topic")
             .long("input-topic")
             .help("Input topic")
             .takes_value(true)
             .required(true))
        .arg(Arg::with_name("output-topic")
            .long("output-topic")
            .help("Output topic")
            .takes_value(true)
            .required(true))
        .get_matches();

    // setup_logger(true, matches.value_of("log-conf"));

    let brokers = matches.value_of("brokers").unwrap();
    let group_id = matches.value_of("group-id").unwrap();
    let input_topic = matches.value_of("input-topic").unwrap();
    let output_topic = matches.value_of("output-topic").unwrap();

    run(brokers, group_id, input_topic, output_topic);
}