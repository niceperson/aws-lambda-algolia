// for local testing purpose. to invoke lambda function by hitting the APi gateway
const func = require('./index');

const context = {
    source: 'local-dev-invoked',
    description: 'event called by API gateway',
};
const event = {
    'body-json': {
        "action":"tracking","query":{"keyword":"lola","link_type":"mall","link_pk":32572,"link_url":"/mall/32572-dr-lola-note-type-mask-5pcs-4-types-to-choose"}
    },
    params: {
        querystring: {
            keyword: 'lola'
        },
        header: {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "cache-control": "max-age=0",
            "Host": "9tmthswo76.execute-api.ap-southeast-1.amazonaws.com",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36",
            "X-Amzn-Trace-Id": "Root=1-5e4ce5b9-963db4e2d2c92dc0ce52cf0d",
            "X-Forwarded-For": "219.93.109.13",
            "X-Forwarded-Port": "443",
            "X-Forwarded-Proto": "https",
            'X-hermo-session-id': 'test',
            'hertoken': 'test',
        }
    },
    context: {
        'resource-path': '/search/tracking'
    }
};

async function main () {
    const mycall = await func.handler(event, context);

    console.log('from return value of the invoked function:')
    console.log(JSON.stringify(mycall));
}

main();