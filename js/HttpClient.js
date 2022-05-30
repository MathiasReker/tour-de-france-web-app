'use strict';

class HttpClient {

  #endpoint;

  constructor(endpoint) {
    this.#endpoint = endpoint;
  }

  #request(requestOptions) {
    const options = {
      'redirect': 'follow', 'headers': {
        'Content-type': 'application/json'
      }
    };

    const mergedOptions = {
      ...options, ...requestOptions
    };

    return fetch(this.#endpoint, mergedOptions).then(response => response.json());
  }

  post(body) {
    const requestOptions = {
      'method': 'POST', 'body': JSON.stringify(body)
    };

    return this.#request(requestOptions);
  }

  get() {
    const requestOptions = {
      'method': 'GET'
    };

    return this.#request(requestOptions);
  }

  put(body) {
    const requestOptions = {
      'method': 'PUT', 'body': JSON.stringify(body)
    };

    return this.#request(requestOptions);
  }

  delete() {
    const requestOptions = {
      'method': 'DELETE'
    };

    return this.#request(requestOptions);
  }
}
