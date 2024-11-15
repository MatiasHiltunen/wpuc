import type { MessageObj } from "./types"

type CustomCache = {
    url: string,
    html: string
}
const temp: Record<string, CustomCache> = {}

self.postMessage({type: 'worker_ready'} as MessageObj)


onmessage = (e) => {


    const msg = e.data as MessageObj

    /* console.log(msg) */

    if (msg.type === 'html') {
        
        if(!msg.url || !msg.html) {
            return console.log("no data with html message")
        }

        temp[msg.url] = msg as CustomCache
        return
    }

    if (msg.type === 'url') {

        if(msg.url == null) return

        const url = msg.url
        console.log("Get html from worker for url: ", msg.url)

        if (temp[url] == null) {
            fetch(url).then(response => response.text()).then(text => {
                temp[url] = {
                    url,
                    html: text
                }

                self.postMessage({html: temp[url].html, type: 'html', url} as MessageObj)
            }).catch(console.error)
            return
        }

        self.postMessage({html: temp[msg.url].html, type: 'html', url} as MessageObj)
        return

    }


    if (msg.type === 'urlList') {
        if(msg.urlList == null) return
        let promises: Promise<void>[] = []

        for (let link of msg.urlList) {
            if (temp[link] != null) continue

            temp[link] = { url: link, html: '' }
            promises.push((async () => {
                const response = await fetch(link)

                temp[link].html = await response.text()
            })())
        }

        Promise.allSettled(promises).then((data)=>{
            console.log(data)
        }).catch(console.error)
    }
}

