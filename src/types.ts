export type MsgType = 'url' | 'html' | 'urlList' | 'worker_ready'


export interface MessageObj {
    type: MsgType
    url?: string
    urlList?: Set<string>
    html?: string
}