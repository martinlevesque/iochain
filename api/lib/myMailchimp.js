
let Mailchimp = require('mailchimp-api-3');
let request = require('request');

if ( ! process.env.MAILCHIMP_KEY) {
  throw new Error('Missing mailchimp key');
}

class MyMailchimp {
  contructor() {
  }

  init() {
    return new Promise((resolve) => {
      this.api = new Mailchimp(process.env.MAILCHIMP_KEY);

      this.api._request = function (options) {
        let { path, method, body, query } = options;
        return new Promise((resolve, reject) => {
          let obj = {
            method: method,
            url: this.__baseUrl + path,
            auth: {
              user: 'any',
              password: this.__apiKey
            },
            json: body,
            qs: query,
            headers: {
              'User-Agent': 'mailchimp-api-3 : https://github.com/art2cool/mailchimp-api-3'
            }
          };
          request(obj, (err, response) => {
            if (err) {
              reject(err);
              return;
            }
            // This is dirty, but works
            if (response.body.type && response.body.type.indexOf('error') !== -1) {
              reject(response.body);
              return;
            }

            let result = response.body;
            console.log('result = ');
            console.log(result);

            if (typeof response.body === 'string') {
              result = JSON.parse(response.body);
            }

            resolve(result);
          });
        });


      };

      resolve();
    });
  }

  getLists() {
    try {
      return this.api.lists.getAll();
    } catch(err) {
      console.log(err);
    }
  }

  async getList(name) {
    let lists = (await this.getLists()).lists;

    return lists.find(l => l.name === name);
  }

  rawSubscribe(email, listId) {
    return this.api.members.create(listId, {
      email_address: email,
      status: 'subscribed'
    });
  }

  async subscribe(email, listName) {

    try {
      let list = await this.getList(listName);

      if ( ! list) {
        throw new Error('Invalid list');
      }

      await this.rawSubscribe(email, list.id);

    } catch(err) {
      console.error(err);
    }
  }

}

module.exports = MyMailchimp;
