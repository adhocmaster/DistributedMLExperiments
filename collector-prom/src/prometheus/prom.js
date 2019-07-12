/**
 * File Name:           prom.js
 * Description:         contains class to manage and get prometheus information
 * 
 * Last Modified:       03/28/2019
 * Requirement:         Prometheus URL access
 *                      axios
 *                        % npm install -S axios
 *
 *
 **/

"use strict"

const axios = require('axios')


class Prom {
    // all class level constants
    static get PROM_HOST() {
        return "prometheus.istio-system"
    }
    static get PROM_PORT() {
        return 9090
    }
    static get PROM_ID() {
        return "prometheus-default"
    }
    static get PROM_DURATION() {
        return ""
    }

    static get PROM_FS() {
        // Cluster filesystem usage
        // "sum (container_fs_usage_bytes{device=~\"^/dev/[sv]d[a-z][1-9]$\",id=\"/\",kubernetes_io_hostname=~\"^$Node$\"}) / sum (container_fs_limit_bytes{device=~\"^/dev/[sv]d[a-z][1-9]$\",id=\"/\",kubernetes_io_hostname=~\"^$Node$\"}) * 100"

    }
    static get PROM_CPU() {
        // examples:
        // container_cpu_usage_seconds_total{namespace="everest-app"}
        // http_requests_total{namespace="everest-app"}[5m]
        // sum(http_requests_total{method="GET"} offset 5m) 
        // curl 'http://localhost:9090/api/v1/query_range?query=up&start=2015-07-01T20:10:30.781Z&end=2015-07-01T20:11:00.781Z&step=15s
        //
        // Cluster CPU usage (1m avg)
        // "sum (rate (container_cpu_usage_seconds_total{id=\"/\",kubernetes_io_hostname=~\"^$Node$\"}[1m])) / sum (machine_cpu_cores{kubernetes_io_hostname=~\"^$Node$\"}) * 100"
        // Container used CPU
        // "sum (rate (container_cpu_usage_seconds_total{id=\"/\",kubernetes_io_hostname=~\"^$Node$\"}[1m]))"
        // CPU Cores total
        // "sum (machine_cpu_cores{kubernetes_io_hostname=~\"^$Node$\"})"
        // Pods CPU usage (1m avg)
        // "sum (rate (container_cpu_usage_seconds_total{image!=\"\",name=~\"^k8s_.*\",kubernetes_io_hostname=~\"^$Node$\"}[1m])) by (pod_name)"
        // System services CPU usage (1m avg)
        // "sum (rate (container_cpu_usage_seconds_total{systemd_service_name!=\"\",kubernetes_io_hostname=~\"^$Node$\"}[1m])) by (systemd_service_name)"
        // Containers CPU usage (1m avg)
        // "sum (rate (container_cpu_usage_seconds_total{image!=\"\",name=~\"^k8s_.*\",container_name!=\"POD\",kubernetes_io_hostname=~\"^$Node$\"}[1m])) by (container_name, pod_name)"
        // "sum (rate (container_cpu_usage_seconds_total{image!=\"\",name!~\"^k8s_.*\",kubernetes_io_hostname=~\"^$Node$\"}[1m])) by (kubernetes_io_hostname, name, image)"
        // "sum (rate (container_cpu_usage_seconds_total{rkt_container_name!=\"\",kubernetes_io_hostname=~\"^$Node$\"}[1m])) by (kubernetes_io_hostname, rkt_container_name)"
        // All processes CPU usage (1m avg)
        // "sum (rate (container_cpu_usage_seconds_total{id!=\"/\",kubernetes_io_hostname=~\"^$Node$\"}[1m])) by (id)"
        // 
        return ["container_cpu_usage_seconds_total", "container_cpu_load_average_10s", 
                "container_cpu_user_seconds_total", "container_cpu_system_seconds_total",]
        // "sum (rate (container_cpu_usage_seconds_total{image!=\"\",name=~\"^k8s_.*\",
        // container_name!=\"POD\",kubernetes_io_hostname=~\"^$Node$\"}[1m])) by (container_name, pod_name)",

    }
    static get PROM_MEM() {
        // Cluster memory usage
        // "sum (container_memory_working_set_bytes{id=\"/\",kubernetes_io_hostname=~\"^$Node$\"}) / sum (machine_memory_bytes{kubernetes_io_hostname=~\"^$Node$\"}) * 100"
        // Container used mem
        // "sum (container_memory_working_set_bytes{id=\"/\",kubernetes_io_hostname=~\"^$Node$\"})"
        // Total
        // "sum (machine_memory_bytes{kubernetes_io_hostname=~\"^$Node$\"})"
        // Pods memory usage
        // Wrong "sum (container_memory_working_set_bytes{image!=\"\",name=~\"^k8s_.*\",kubernetes_io_hostname=~\"^$Node$\"}) by (pod_name)"
        // "container_memory_usage_bytes"
        // System services memory usage
        // "sum (container_memory_working_set_bytes{systemd_service_name!=\"\",kubernetes_io_hostname=~\"^$Node$\"}) by (systemd_service_name)"
        // Containers memory usage
        // "sum (container_memory_working_set_bytes{image!=\"\",name=~\"^k8s_.*\",container_name!=\"POD\",kubernetes_io_hostname=~\"^$Node$\"}) by (container_name, pod_name)"
        // "sum (container_memory_working_set_bytes{image!=\"\",name!~\"^k8s_.*\",kubernetes_io_hostname=~\"^$Node$\"}) by (kubernetes_io_hostname, name, image)"
        // "sum (container_memory_working_set_bytes{rkt_container_name!=\"\",kubernetes_io_hostname=~\"^$Node$\"}) by (kubernetes_io_hostname, rkt_container_name)"
        // All processes memory usage
        // "sum (container_memory_working_set_bytes{id!=\"/\",kubernetes_io_hostname=~\"^$Node$\"}) by (id)"
        // 
        return ["container_memory_usage_bytes", "container_memory_working_set_bytes",
                "container_memory_failures_total", "container_memory_max_usage_bytes",
                "container_memory_failcnt"]
    }
    static get PROM_NET() {
        // Network I/O pressure
        // "sum (rate (container_network_receive_bytes_total{kubernetes_io_hostname=~\"^$Node$\"}[1m]))"
        // "- sum (rate (container_network_transmit_bytes_total{kubernetes_io_hostname=~\"^$Node$\"}[1m]))"

        // Pods network I/O (1m avg)
        // "sum (rate (container_network_receive_bytes_total{image!=\"\",name=~\"^k8s_.*\",kubernetes_io_hostname=~\"^$Node$\"}[1m])) by (pod_name)"
        // "- sum (rate (container_network_transmit_bytes_total{image!=\"\",name=~\"^k8s_.*\",kubernetes_io_hostname=~\"^$Node$\"}[1m])) by (pod_name)"
        // Containers network I/O (1m avg)
        // "sum (rate (container_network_receive_bytes_total{image!=\"\",name=~\"^k8s_.*\",kubernetes_io_hostname=~\"^$Node$\"}[1m])) by (container_name, pod_name)"
        // "- sum (rate (container_network_transmit_bytes_total{image!=\"\",name=~\"^k8s_.*\",kubernetes_io_hostname=~\"^$Node$\"}[1m])) by (container_name, pod_name)"
        // "sum (rate (container_network_receive_bytes_total{image!=\"\",name!~\"^k8s_.*\",kubernetes_io_hostname=~\"^$Node$\"}[1m])) by (kubernetes_io_hostname, name, image)"
        // "- sum (rate (container_network_transmit_bytes_total{image!=\"\",name!~\"^k8s_.*\",kubernetes_io_hostname=~\"^$Node$\"}[1m])) by (kubernetes_io_hostname, name, image)"
        // "sum (rate (container_network_transmit_bytes_total{rkt_container_name!=\"\",kubernetes_io_hostname=~\"^$Node$\"}[1m])) by (kubernetes_io_hostname, rkt_container_name)"
        // "- sum (rate (container_network_transmit_bytes_total{rkt_container_name!=\"\",kubernetes_io_hostname=~\"^$Node$\"}[1m])) by (kubernetes_io_hostname, rkt_container_name)"
        // 

        return ["container_network_transmit_bytes_total", 
                "container_network_transmit_errors_total", "container_network_transmit_packets_dropped_total",
                "container_network_transmit_packets_total",
                "container_network_receive_bytes_total",
                "container_network_receive_errors_total", "container_network_receive_packets_dropped_total",
                "container_network_receive_packets_total"]
    }
    static get PROM_CLUSTER() {
        return [""]
    }
    static get INCLUDED_NS() {
        //return ["kube-system", "istio-system", "everest", "kafka"]
        return ""
    }
    static get INCLUDED_APP() {
        //return ["kube-system", "istio-system", "everest", "kafka"]
        return ""
    }
    static get CAPTURE_STEP() {
        return "1m" // rate of 1 minute
    }
    static get PROM_JSON_KEY() {
        return 'collector-data'
    }
 
    constructor(host=Prom.PROM_HOST, port=Prom.PROM_PORT, id=Prom.PROM_ID) {
      this._verbose = false
      this._id = id
      this._host = host
      this._port = port
      this._url_query = 'http://' + this._host + ':' + this._port + '/api/v1/query?query='
      //this._url_query_range = 'http://' + this._host + ':' + this._port + '/api/v1/query_range?query='
      this._kafka = ''
      this._metrics = {'cluster_id': 'mycluster_id', 'cpuData': [], 'memData': [], 'netData': [], 'ts': 0}
      this._nss = []
      this._apps = []
      this._start_c = Date.now()
      this._end_c = Date.now()
      this._p_range= ''
      this._p_labels = ''

    }

    get id() {
      return this._id
    }
    get host() {
        return this._host
    }
    get port() {
        return this._port
    }
    get url_query() {
        return this._url_query
    }
    // get url_query_range() {
    //     return this._url_query_range
    // }
    get metrics() {
        return this._metrics
    }
    set verbose(on_or_off) {
        this._verbose = on_or_off
    }

    /**
     * Should be called everytime before calling the method 'collect'
     */
    set step_capture(step_c) {
        this._step_c = step_c
    }


    set set_kafka(kafka) {
        this._kafka = kafka
    }

    add_included_ns(ns) {
        //this._nslabel = ''
        this._nss.push(ns)
        // let labels = this._init_labels(this._nss)
        // if(labels !== '')
        //     this._nslabel = `namespace%3D%22${labels}%22`
    }

    add_included_app(app) {
        //this._applabel = ''
        this._apps.push(app)
        // let labels = this._init_labels(this._apps)
        // if(labels !== '')
        //     this._applabel = `app%3D%22${labels}%22`
    }

    // BUG BUG BUG
    make_plabel() {
        let plabels = ''
        let moreThanOne = false
        if(this._nss.length > 0) {
            plabels = '%7Bnamespace%3D%22'
            for(let ns of this._nss) {
                if(!moreThanOne) {
                    moreThanOne = true
                    plabels += ns
                } else {
                    plabels += `%2C${ns}`
                }
            }
            plabels += '%22%7D'
        }
        //console.log("--->> make_plabel: plabels " + plabels)
        return(plabels)
    }
    async _collect_mem() {
        let title = "Prom ID '" + this._id + "' _collect_mem"
        let json_data = {} 
        this._metrics.memData = []

        for(let element of Prom.PROM_MEM) {
            let p_query = this._url_query + element + this._p_labels
            if(this._verbose)
                console.log(title + " URL -> " + p_query)
            const response = await axios.get(p_query)
    
            const status = response.status
            if(status == 200) {
                const results = response.data.data.result
                let ts_milliseconds = (new Date).getTime()
                this._metrics.cluster_id = 'mycluster_id'
                this._metrics.ts = ts_milliseconds
                let _memData = new Object()

                for(let result of results) {
                    let metric = result.metric
                    let values = result.value
                    //if(this._verbose) {
                        // console.log('\n')
                        // console.log(JSON.stringify(response.data.data, null, 2))
                        // console.log(`MEM POD ---> ${metric.pod}`)
                        // console.log(`POD NAME ---> ${metric.pod_name}`)
                        // console.log(`NAMESPACE ---> ${metric.namespace}`)
                        // if(values[1] > 50000000)
                        //   console.log(`MEM VALUE > 50MB ---> ${metric.pod}@${metric.namespace} | ${values[1]} metric ${element}`)
                        //console.log(`PERCENT ---> ${values[1]}`)
                    //}
                    _memData[metric.pod_name] = {'containerName': metric.pod, 'ts': values[0], 'value': values[1],
                    'percentage': 0, 'podName': metric.pod_name, 'namespace': metric.namespace, 'metric': element}
                    //this._metrics.memData.push(memData)
                }
                if(results.length > 0) {
                    // now get the rate
                    p_query = this._url_query + 'rate%20%28' + element + this._p_labels + this._p_range + '%29'
                    if(this._verbose)
                        console.log(title + " Rate URL -> " + p_query)
                    const rresponse = await axios.get(p_query)
                    if(status == 200) {
                        const rresults = rresponse.data.data.result
                        for(let rresult of rresults) {
                            let rmetric = rresult.metric
                            let rvalues = rresult.value
                            //console.log(`MEM RATE VALUE ---> ${rvalues[1]}`)
                            if(rvalues[1] > 50000000)
                                console.log(`MEM RATE VALUE > 50MB ---> ${rmetric.pod}@${rmetric.namespace} | ${rvalues[1]} metric ${element}`)
                            _memData[rmetric.pod_name]['percentage'] = rvalues[1]
                        }
                    } else {
                        console.log(`WARNING: _collect_mem: http rest API request to ${p_query} status NOT 200 but ${status}`)
                    }
                    for(let i in _memData) {
                        //console.log("MEM DATA " + JSON.stringify(_memData[i], null, 0))
                        this._metrics.memData.push(_memData[i])
                    }
                }
            } else {
                console.log(`WARNING: _collect_mem: http rest API request to ${p_query} status NOT 200 but ${status}`)
                this._services = []
            }
        }
    }

    async _collect_net() {
        let title = "Prom ID '" + this._id + "' _collect_net"
        let json_data = {} 
        this._metrics.netData = []

        for(let element of Prom.PROM_NET) {
            let p_query = this._url_query + element + this._p_labels
            if(this._verbose)
                console.log(title + " URL -> " + p_query)
            const response = await axios.get(p_query)
    
            const status = response.status
            if(status == 200) {
                const results = response.data.data.result
                let ts_milliseconds = (new Date).getTime()
                this._metrics.cluster_id = 'mycluster_id'
                this._metrics.ts = ts_milliseconds
                let _netData = new Object()
                for(let result of results) {
                    let metric = result.metric
                    let values = result.value
                    //if(this._verbose) {
                        // console.log('\n')
                        // console.log(JSON.stringify(response.data.data, null, 2))
                        // console.log(`POD NET ---> ${metric.pod}`)
                        // console.log(`POD NAME ---> ${metric.pod_name}`)
                        // console.log(`NAMESPACE ---> ${metric.namespace}`)
                        // if(values[1] > 10000000)
                        //    console.log(`NET VALUE > 10MB ---> ${metric.pod}@${metric.namespace} | ${values[1]} metric ${element}`)
                        //console.log(`VALUE NET ---> ${values[1]})`
                    //}
                    _netData[metric.pod_name] = {'containerName': metric.pod, 'ts': values[0], 'value': values[1],
                    'percentage': 0,
                    'podName': metric.pod_name, 'namespace': metric.namespace, 'metric': element}
                    //this._metrics.netData.push(netData)                   
                }
                if(results.length > 0) {
                    // now get the rate
                    p_query = this._url_query + 'rate%20%28' + element + this._p_labels + this._p_range + '%29'
                    if(this._verbose)
                        console.log(title + " Rate URL -> " + p_query)
                    const rresponse = await axios.get(p_query)
                    if(status == 200) {
                        const rresults = rresponse.data.data.result
                        for(let rresult of rresults) {
                            let rmetric = rresult.metric
                            let rvalues = rresult.value
                            // if(this._verbose) {
                            if(rvalues[1] > 10000000)    
                               console.log(`NET RATE VALUE > 10 MB ---> ${rmetric.pod}@${rmetric.namespace} | ${rvalues[1]} metric ${element}`)
                            // }
                            _netData[rmetric.pod_name]['percentage'] = rvalues[1]
                        }
                    } else {
                        console.log(`WARNING: _collect_net: http rest API request to ${p_query} status NOT 200 but ${status}`)
                    }
                    for(let i in _netData) {
                        this._metrics.netData.push(_netData[i])
                    }
                }
            } else {
                console.log(`WARNING: _collect_net: http rest API request to ${p_query} status NOT 200 but ${status}`)
                this._services = []
            }
        }
 
    }

    async _collect_cpu() {
        let title = "Prom ID '" + this._id + "' _collect_cpu"
        let json_data = {} 
        this._metrics.cpuData = []

        for(let element of Prom.PROM_CPU) {
            let p_query = this._url_query + element + this._p_labels
            if(this._verbose)
                console.log(title + " URL -> " + p_query)
            const response = await axios.get(p_query)
    
            const status = response.status
            if(status == 200) {
                const results = response.data.data.result
                let ts_milliseconds = (new Date).getTime()
                this._metrics.cluster_id = 'mycluster_id'
                this._metrics.ts = ts_milliseconds
                let _cpuData = new Object()
                //console.log("CPU DATA LEN=" + results.length)
                for(let result of results) {
                    let metric = result.metric
                    let values = result.value
                    //if(this._verbose) {
                        // console.log('\n')
                        // console.log(JSON.stringify(response.data.data, null, 2))
                        // console.log(`POD ---> ${metric.pod}`)
                        // console.log(`POD NAME ---> ${metric.pod_name}`)
                        // console.log(`NAMESPACE ---> ${metric.namespace}`)
                        // console.log(`VALUE CPU ---> ${values}`)
                        // if(values[1] > 100)
                        //    console.log(`CPU VALUE > 100 ---> ${metric.pod}@${metric.namespace} | ${values[1]} metric ${element}`)
                    //}
                    _cpuData[metric.pod_name] = {'containerName': metric.pod, 'ts': values[0], 'value': values[1], 
                    'percentage': 0,
                    'podName': metric.pod_name, 'namespace': metric.namespace, 'metric': element}
                    //this._metrics.cpuData.push(cpuData)
                }
                if(results.length > 0) {
                    // now get the rate
                    p_query = this._url_query + 'rate%20%28' + element + this._p_labels + this._p_range + '%29'
                    if(this._verbose)
                        console.log(title + " Rate URL -> " + p_query)
                    const rresponse = await axios.get(p_query)
                    if(status == 200) {
                        const rresults = rresponse.data.data.result
                        for(let rresult of rresults) {
                            let rmetric = rresult.metric
                            let rvalues = rresult.value
                            if(rvalues[1] > 0.7)
                                console.log(`CPU RATE VALUE > 0.7 ---> ${rmetric.pod}@${rmetric.namespace} | ${rvalues[1]} metric ${element}`)
                            _cpuData[rmetric.pod_name]['percentage'] = rvalues[1]
                        }
                    } else {
                        console.log(`WARNING: _collect_cpu: http rest API request to ${p_query} status NOT 200 but ${status}`)
                    }
                    for(let i in _cpuData) {
                        this._metrics.cpuData.push(_cpuData[i])
                    }
                }
            } else {
                console.log(`WARNING: _collect_cpu: http rest API request to ${p_query} status NOT 200 but ${status}`)
                this._services = []
            }
        }
    }
    async _collect0() {

        let res = false
        try {
            // let _esc_start_c = this._start_c.toISOString().replace(/:/, '%3A')
            // let _esc_end_c = this._end_c.toISOString().replace(/:/, '%3A')
            //this._p_range=`%26start%3D${_esc_start_c}%26end%3D${_esc_end_c}%26step%3D${this._step_c}`
            this._p_range = `%5B${this._step_c}%5D`
            this._p_labels = this.make_plabel()
            //console.log("--->> make_plabel: plabels " + this._p_labels)

            await this._collect_cpu()
            await this._collect_mem()
            await this._collect_net()
            //console.log("COLLECT FINISHED")
        } catch (error) {
            console.log(`ERROR: _collect0: http rest API request to ${this._url_query} return errors: ${error}`)
            res = false
        }
        return res
    }
    
    async collect() {
        await this._collect0()
    }
}

module.exports = Prom
