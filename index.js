'use stict';

const uaParser = require('ua-parser-js');
const algoliaSearch = require('algoliasearch');
const algoliaConfig = require('./config').algolia;
const algoliaClient = algoliaSearch(algoliaConfig.appid, algoliaConfig.admin);



//-----------------------------------------------------------------------| handler
exports.handler = async function(event, context) {
    // lazy custom hardcoded routing. quick and dirty (QND)
    const path = event.context['resource-path'];
    switch(path) {
        case "/search":
        case "/app/search":
            return search(event);
        case "/search/suggestion":
        case "/app/search/suggestion":
            return suggest(event);
        case "/search/tracking":
        case "/app/search/tracking":
            return tracking(event);
        default:
            return null;
    }
}



//-----------------------------------------------------------------------| search endpoint
async function search(event) {
    // getting the required stuffs
    const keyword = event.params.querystring.keyword;
    const header = event.params.header;

    // preparing for algolia
    const queries = [
        {
            indexName: 'product_index',
            query: keyword,
            params: {
                hitsPerPage: 100
            }
        },
    ];

    // hitting algolia
    try {
        const option = await prepareAlgoliaHeader(header);
        const searchReq = await algoliaClient.search(queries, option);
        return searchReq;
    } catch (e) {
        console.log(e);
        return e;
    }
}



//-----------------------------------------------------------------------| suggest endpoint
async function suggest(event) {
    // getting the required stuffs
    const keyword = event.params.querystring.keyword;
    const header = event.params.header;

    // preparing for algolia
    const queries = [
        {
            indexName: 'flagship_index',
            query: keyword,
            params: {
                hitsPerPage: 10
            }
        },
        {
            indexName: 'brand_index',
            query: keyword,
            params: {
                hitsPerPage: 10
            }
        },
        {
            indexName: 'product_index',
            query: keyword,
            params: {
                hitsPerPage: 25
            }
        },
    ];

    // hitting algolia
    try {
        const option = await prepareAlgoliaHeader(header);
        const searchReq = await algoliaClient.search(queries, option);

        if (searchReq.results) {
            const output = await parseAlgoliaResult(searchReq.results);

            if (output.length === 0) {
                throw 'No Results Found';
            }
            return output;
        }

    } catch (e) {
        console.log(e);
        return e;
    }
}



//-----------------------------------------------------------------------| tracking endpoint
async function tracking(event) {

    // prepare necessities
    const body = event['body-json'];
    const header = event.params.header;
    const query = body.query;
    if (query.keyword === null) {
        query.keyword = body.keyword || null;
    }

    // hitting s3
    try {
        const tracking = await parseUserAgent(query, header);
        keepTrackingtoS3(tracking);
        return tracking;
    } catch (e) {
        console.log(e);
        return e;
    }

}



//-----------------------------------------------------------------------| helpers & utilities
async function keepTrackingtoS3(data) {
    console.log(data)
}

async function parseUserAgent(query, header) {

    const userAgent = uaParser(header['User-Agent']);
    const user_id = await getUserIdFromHertoken(header);
    let tracking = {
        type: 'input',
        query_method: 'algolia',
        user_id: user_id,
    };
    Object.assign(tracking, query)
    Object.assign(tracking, header);
    Object.assign(tracking, userAgent);

    // do some cleanup
    delete tracking['hertoken'];
    delete tracking['accept'];
    delete tracking['accept-encoding'];
    delete tracking['accept-language'];
    delete tracking['cache-control'];
    delete tracking['sec-fetch-mode'];
    delete tracking['sec-fetch-site'];
    delete tracking['sec-fetch-user'];
    delete tracking['upgrade-insecure-requests'];

    return tracking;
}

async function getUserIdFromHertoken(header) {
    let user_id = 0;

    if (header.hasOwnProperty('hertoken')) {
        let buffer = Buffer.from(header.hertoken.split('.')[0], 'Base64');
        let jsonToken = JSON.parse(buffer);
        user_id = jsonToken.id;
    }

    return user_id;
}

async function parseAlgoliaResult(result) {
    const output = [];

    let myType;
    let myTitle;

    result.forEach((obj) => {
        switch(obj.index) {
            case 'product_index':
                myType = 'mall';
                myTitle = 'Product';
            break;
            case 'brand_index':
                myType = 'brand';
                myTitle = 'Brand';
            break;
            case 'flagship_index':
                myType = 'flagship';
                myTitle = 'Official Flagship';
            break;
        }

        if (obj.hits.length) {
            output.push({
                type: myType,
                title: myTitle,
                items: obj.hits,
            })
        }
    });

    return output;
}

async function prepareAlgoliaHeader(headers) {
    const algoliaXForwardedFor = headers['X-Forwarded-For'] || headers['Host'];
    const algoliaUserToken = headers['hertoken'] || headers['x-hermo-session-id'] || algoliaXForwardedFor;
    const option = {
        headers: {
            'X-Algolia-UserToken': algoliaUserToken,
            'X-Forwarded-For': algoliaXForwardedFor,
        }
    };
    return option;
}