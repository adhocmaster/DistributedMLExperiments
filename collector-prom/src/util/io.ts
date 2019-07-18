export class IO {
    static deepPrint(obj) {
        console.dir(obj, { depth: null })
    }

    static printAxiosError(err) {
        
        console.dir(err.config.params)
        console.dir(err.response.data)
        
    }
}