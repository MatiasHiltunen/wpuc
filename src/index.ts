
// @ts-ignore - esbuild feature to load worker file as string literal to later to be added to dom
import worker from '../temp/worker.txt'
import type { MessageObj } from './types'


// The same script runs on all the pages


declare global {
    var wrkr: Worker | undefined
    var includedPages: string[]
}

const isTop = window.self === window.top

// This run
const findOwnLinks = () => {

    const links = document.getElementsByTagName('a')
    const parentWindow = (window?.top as Window & typeof globalThis) ?? window;
    const origin = parentWindow.location.origin


    const allowedPages = parentWindow?.includedPages

    let refs = new Set()

    for (let link of links) {
        let ref = link.href

        /*   const url = new URL(ref) */

        /*    if (ref === origin || (!url.pathname.endsWith("/") && url.search.length === 0) ) {
    
               ref = ref + "/"
           }
    */
        if (ref.includes(origin + '/wp-')) {
            console.log("ignoring link:", ref)
            continue
        }



        if (ref.startsWith(origin)) {

            if (ref.includes('#')) {
                ref = ref.split('#')[0]
            }

            if (allowedPages.includes(ref)) {
                refs.add(ref)
            }

            link.addEventListener('click', (event) => {
                event.preventDefault()
                event.stopPropagation()
                parentWindow.wrkr!.postMessage({ url: ref, type: 'url' } as MessageObj)

            })

            /* addEventListener("beforeunload", (event) => {
                console.log("Removed event listener: ", link.href)
                link.removeEventListener('click', onLinkClick)
            }); */
        }
    }

    parentWindow.wrkr!.postMessage({ urlList: refs, type: 'urlList' } as MessageObj)
}



if (isTop) {

    window.onload = () => { }
    document.onload = () => { }

    const framing = (currentPageHtml): HTMLIFrameElement => {
        const iframe = document.createElement('iframe')
        iframe.style.cssText = `position:absolute;top:0;left:0;width:100dvw;height:100dvh;border:none;`
        iframe.referrerPolicy = 'strict-origin'
        iframe.name = 'wpuc-container'
        iframe.id = 'wpuc'
        iframe.srcdoc = currentPageHtml
        return iframe
    }


    const workerUrl = URL.createObjectURL(new Blob([worker], { type: 'text/javascript; charset=UTF-8' }))
    window.wrkr = new Worker(workerUrl);


    const body = document.createElement('body')
    const frame = framing(document.documentElement.innerHTML)
    body.appendChild(frame)
    document.body.replaceWith(body)

    /*     let isPopping = false */

    window.onpopstate = () => {
        console.log("Pop:", window.location.href)
        if (window.location.href.startsWith(window.location.origin)) {
            /*    isPopping = true
    */
            window.wrkr?.postMessage({ url: window.location.href, type: 'url' } as MessageObj)
        }
    };

    window.wrkr.onmessage = (e) => {

        const workerMessage = e.data as MessageObj

        if (workerMessage.type === 'worker_ready') {
            console.log("worker ready")
            return
        }

        if (workerMessage.type === 'html' && !!workerMessage.html) {


            if (frame.hasAttribute('srcdoc')) frame.removeAttribute('srcdoc')


            frame!.contentWindow!.document.open();
            frame!.contentWindow!.document.write(workerMessage.html);
            frame!.contentWindow!.document.close();


            window.history.pushState(null, '', workerMessage.url);

        }


    }

} else {
    console.log("not top, finding links..:")
    document.addEventListener('DOMContentLoaded', findOwnLinks)
}