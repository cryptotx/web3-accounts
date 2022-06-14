import {APIConfig} from "./types";
import QueryString from "querystring";
import {checkURL, fetchJson} from "./hepler";

export class BaseFetch {
    /**
     * Page size to use for fetching orders
     */
    public apiBaseUrl: string
    public apiKey: string | undefined
    public proxyUrl: string | undefined
    public apiTimeout: number | undefined
    // public chain: string
    /**
     * Logger function to use when debugging
     */
    public logger: (arg: string) => void = console.log

    constructor(config: APIConfig) {
        const {apiBaseUrl, apiKey, proxyUrl, apiTimeout} = config
        this.apiBaseUrl = apiBaseUrl || ""
        if (!checkURL(this.apiBaseUrl)) throw new Error("apiBaseUrl:" + apiBaseUrl)
        this.apiKey = apiKey
        this.proxyUrl = proxyUrl
        this.apiTimeout = apiTimeout || 5000
    }

    /**
     * Get JSON data from API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param query Data to send. Will be stringified using QueryString
     */
    async get(apiPath, query = {}, opts: RequestInit = {}) {
        const qs = QueryString.stringify(query)
        const url = `${apiPath}?${qs}`
        const response = await this._fetch(url, opts)
        return response.json()
    }

    async getQueryString(apiPath: string, qs: string, opts: RequestInit = {}) {
        const url = `${apiPath}?${qs}`
        // return this._fetch(url)
        const response = await this._fetch(url, opts)
        return response.json()
    }

    async getURL(url: string, opts: RequestInit = {}, timeout?: number) {
        const response = await fetchJson(url, {opts, timeout: timeout || this.apiTimeout, proxyUrl: this.proxyUrl})
        return response.json()
    }

    static async


    /**
     * POST JSON data to API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param body Data to send. Will be JSON.stringified
     * @param opts RequestInit opts, similar to Fetch API. If it contains
     *  a body, it won't be stringified.
     */
    public async post(apiPath: string, body?: { [key: string]: any }, opts: RequestInit = {}): Promise<any> {
        const fetchOpts = {
            ...opts,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                ...(opts.headers || {})
            }
        } as RequestInit

        // return post(this.apiBaseUrl, apiPath, body)

        const response = await this._fetch(apiPath, fetchOpts)
        if (response.ok) {
            const resJson: any = await response.json()
            if (resJson.data) {
                return resJson.data
            } else {
                return resJson
            }
        } else {
            return response
        }
    }


    /**
     * PUT JSON data to API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param body Data to send
     * @param opts RequestInit opts, similar to Fetch API. If it contains
     *  a body, it won't be stringified.
     */
    public async put(apiPath: string, body: any, opts: RequestInit = {}) {
        return this.post(apiPath, body, {
            method: 'PUT',
            ...opts
        })
    }


    /**
     * Get from an API Endpoint, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param opts RequestInit opts, similar to Fetch API
     */
    private async _fetch(apiPath: string, opts: RequestInit = {}, timeout?: number) {
        const apiBase = this.apiBaseUrl
        const finalUrl = `${apiBase}${apiPath}`

        return fetchJson(finalUrl, {opts, timeout: timeout || this.apiTimeout, proxyUrl: this.proxyUrl})
    }

    public throwOrContinue(error: Error, retries: number) {
        const isUnavailable = !!error.message && (error.message.includes('503') || error.message.includes('429'))
        if (retries <= 0 || !isUnavailable) {
            throw error
        }
    }
}
