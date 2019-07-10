export class Utility {
    static _delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }

    static async wait(ms: number) {
        // Do something before delay
        console.log('before delay')

        await Utility._delay(1000);

        // Do something after
        console.log('after delay')
    }

    static sleep(ms: number) {
        console.log('before delay')
        var waitTill = new Date(new Date().getTime() + ms);
        while(waitTill > new Date()){}
        console.log('after delay')
    }

}