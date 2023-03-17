interface D4HResponse<DataType> {
    statusCode: number
    data: DataType
    error: string
}

interface D4HError {
    statusCode: number
    error: string
}

export default class HttpUtils {
    private readonly _fetchLimit: number
    private readonly _token: string

    constructor(token: string, fetchLimit: number) {
        if (!token) {
            throw new Error('Token cannot be empty')
        }
        
        this._fetchLimit = fetchLimit
        this._token = token
    }

    async get<DataType>(url: URL): Promise<DataType> {
        const method = 'GET'
        const headers = {
            'Authorization': `Bearer ${this._token}`,
        }
    
        console.log(url)
    
        const rawResponse = await fetch(url.toString(), { method, headers })
        const response = await rawResponse.json() as D4HResponse<DataType>
    
        if (response.statusCode !== 200) {
            throw response as D4HError
        }
    
        return response.data
    }
    
    async getMany<DataType>(url: URL): Promise<DataType[]> {
        let results: DataType[] = []
        
        let offset = 0
        
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-constant-condition
        while (true) {
            const urlWithOffset = new URL(url)
            urlWithOffset.searchParams.append('offset', offset.toString())
            urlWithOffset.searchParams.append('limit', this._fetchLimit.toString())
    
            const newResults = await this.get<DataType[]>(urlWithOffset)
            results = results.concat(newResults)
            offset += this._fetchLimit
    
            if (newResults.length < this._fetchLimit) {
                break
            }
        }
        
        return results
    }
}
