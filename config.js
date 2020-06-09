'use strict';

const algolia_application_id = process.env.ALGOLIA_APPLICATION_ID || null;
const algolia_admin_key = process.env.ALGOLIA_ADMIN_KEY || null;
const algolia_search_key = process.env.ALGOLIA_SEARCH_KEY || null;


module.exports = {
    algolia: {
        appid: algolia_application_id,
        admin: algolia_admin_key,
        search: algolia_search_key,
    },
}