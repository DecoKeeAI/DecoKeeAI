/*
 * Copyright 2024 DecoKee
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Additional Terms for DecoKee:
 *
 * 1. Communication Protocol Usage
 *    DecoKee is provided subject to a commercial license and subscription
 *    as described in the Terms of Use (http://www.decokee.com/about/terms.html).
 *
 *    The components of this project related to the communication protocol
 *    (including but not limited to protocol specifications, implementation code, etc.)
 *    are restricted from commercial use, as such use would violate the project's usage policies.
 *    There are no restrictions for non-commercial uses.
 *
 *    (a) Evaluation Use
 *        An evaluation license is offered that provides a limited,
 *        evaluation license for internal and non-commercial use.
 *
 *        With a paid-up subscription you can incorporate new releases,
 *        updates and patches for the software into your products.
 *        If you do not have an active subscription, you cannot apply patches
 *        from the software to your products.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {axios} from '@/plugins/request';
import BaseWebEngineAdapter from './BaseWebEngineAdapter';

const REQUEST_TYPE = {
    SEARCH_WEB: "search",
    SCRAPE_WEB_PAGE: "scrape"
}

class FirecrawlEngineAdapter extends BaseWebEngineAdapter {
    constructor() {
        super();
    }

    search(searchString) {
        return new Promise((resolve, reject) => {
            console.log('FirecrawlEngineAdapter::search: ', searchString);
            axios(this._getRequestParam(REQUEST_TYPE.SEARCH_WEB, searchString))
                .then(response => {
                    console.log('FirecrawlEngineAdapter::searchResult: ', response);
                    if (response.success) {
                        resolve(response);
                    } else {
                        reject(response);
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    async scrape(webUrl) {
        return new Promise((resolve, reject) => {
            console.log('FirecrawlEngineAdapter::scrape: ', webUrl);
            axios(this._getRequestParam(REQUEST_TYPE.SCRAPE_WEB_PAGE, webUrl))
                .then(response => {
                    console.log('FirecrawlEngineAdapter::scrapeResult: ', response);
                    if (response.success) {
                        resolve(response);
                    } else {
                        reject(response);
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    _getRequestParam(requestType, requestString) {
        const token = 'fc-ab73c83391c54194819c2c468de6cdfa';

        switch (requestType) {
            case REQUEST_TYPE.SEARCH_WEB:
                return {
                    url: 'https://api.firecrawl.dev/v0/search',
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    data: {
                        query: requestString,
                        pageOptions: {
                            onlyMainContent: true,
                            fetchPageContent: true,
                            includeHtml: false,
                            includeRawHtml: false,
                        },
                        searchOptions: {
                            limit: 10,
                        },
                    },
                };
            case REQUEST_TYPE.SCRAPE_WEB_PAGE:
                return {
                    url: 'https://api.firecrawl.dev/v0/scrape',
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    data: {
                        url: requestString,
                        pageOptions: {
                            headers: {},
                            onlyIncludeTags: [],
                            removeTags: [],
                            onlyMainContent: true,
                            replaceAllPathsWithAbsolutePaths: false,
                            includeHtml: false,
                            includeRawHtml: false,
                            screenshot: false,
                            waitFor: 10000
                        },
                        extractorOptions: {
                            mode: 'markdown',
                            extractionPrompt: '',
                            extractionSchema: {}
                        },
                        timeout: 30000
                    },
                };
        }
    }
}

export default FirecrawlEngineAdapter;
