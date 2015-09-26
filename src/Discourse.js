import querystring from 'component-querystring';

const actionTypeEnum = {
  LIKE: 1,
  WAS_LIKED: 2,
  BOOKMARK: 3,
  NEW_TOPIC: 4,
  REPLY: 5,
  RESPONSE: 6,
  MENTION: 7,
  QUOTE: 9,
  STAR: 10,
  EDIT: 11,
  NEW_PRIVATE_MESSAGE: 12,
  GOT_PRIVATE_MESSAGE: 13
};

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  let error = new Error(response.statusText);
  error.response = response;
  throw error;
}

class Discourse {

  constructor(url, apiKey, apiUsername) {
    if (!fetch || !Promise) {
      throw Error('Can not find module Promise and fetch');
    }

    this.url = url;
    this.apiKey = apiKey;
    this.apiUsername = apiUsername;
  }

  makeUrl(url, parameters) {
    let newUrl = this.url + '/' + url +
      '?api_key=' + this.apiKey +
      '&api_username=' + this.apiUsername;

    if (parameters) {
      newUrl += '&' + querystring.stringify(parameters);
    }

    return newUrl;
  }

  get(url, parameters) {
    return fetch(this.makeUrl(url, parameters), {
      credentials: 'same-origin'
    })
      .then(checkStatus);
  }

  post(url, parameters) {
    return fetch(this.makeUrl(url), {
      method: 'post',
      credentials: 'same-origin',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(parameters)
    })
  }

  put(url, parameters) {
    return fetch(this.makeUrl(url), {
      method: 'put',
      body: parameters
    });
  }

  getUser(username) {
    return this.get('users/' + username + '.json')
      .then(response=> {
        let json = response.json();
        if (json.user && json.user.id) {
          return json;
        } else {
          return null;
        }
      });
  }

  login(username, password) {
    return this.post('session', {'login': username, 'password': password});
  }

  createCategory(category) {
    return this.post('categories', {
      method: 'post',
      body: {
        name: category.name,
        color: category.color || (~~(Math.random() * (1 << 24))).toString(16),
        text_color: category.text_color || 'FFFFFF',
        parent_category_id: category.parent_category_id || null
      }
    });
  }

  getCategories(parameters) {
    return this.get('categories.json', parameters)
      .then(res => res.json());
  }

  getCreatedTopics(username) {
    return this.get('user_actions.json', {
      username: username,
      filter: actionTypeEnum.NEW_TOPIC
    });
  }

}

export default Discourse;
