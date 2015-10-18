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

  actionTypeEnum = actionTypeEnum;

  constructor(url, apiKey, apiUsername) {
    if (!fetch || !Promise) {
      throw Error('Can not find module Promise and fetch');
    }

    this.url = url;
    this.apiKey = apiKey;
    this.apiUsername = apiUsername;
  }

/////////////////////
// HELPERS
/////////////////////

  makeUrl(url, parameters) {
    let newUrl = `${this.url}/${url}?api_key=${this.apiKey}&api_username=${this.apiUsername}`;

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
      .then(checkStatus);
  }

  put(url, parameters) {
    return fetch(this.makeUrl(url), {
      method: 'put',
      body: parameters
    })
      .then(checkStatus);
  }

  delete(url, parameters) {
    return fetch(this.makeUrl(url), {
      method: 'delete',
      body: parameters
    })
      .then(checkStatus);
  }

/////////////////////
// USERS
/////////////////////

  createUser(user) {
    return this.post('users', {
      'name': user.name,
      'email': user.email,
      'username': user.username,
      'password': user.password,
      'active': user.active
    });
  }

  getUser(username) {
    return this.get(`users/${username}.json`)
      .then(response=> {
        let json = response.json();
        if (json.user && json.user.id) {
          return json;
        } else {
          return null;
        }
      });
  }

  approveUser(id, username) {
    return this.put(`admin/users/${id}/approve`,
      {context: `admin/users/${username}`}
    );
  }

  activateUser(id, username) {
    return this.put(`admin/users/${id}/activate`,
      {context: `admin/users/${username}`}
    );
  }

  deleteUser(id, username) {
    return this.delete(`${id}.json`,
      {context: `admin/users/${username}`}
    );
  }

  login(username, password) {
    return this.post('session', {'login': username, 'password': password});
  }

  logout(username) {
    return this.delete(`session/${username}`, {});
  }

  fetchConfirmationValue() {
    // discourse api should bypass the honeypot since it is a trusted user (confirmed via api key)
    return this.get('users/hp.json', {});
  }


///////////////////////
// TOPICS AND REPLIES
///////////////////////

  createTopic(title, raw, category) {
    return this.post('posts', {
      'title': title,
      'raw': raw,
      'category': category,
      'archetype': 'regular'
    });
  }

  getCreatedTopics(username) {
    return this.get('user_actions.json', {
      username: username,
      filter: actionTypeEnum.NEW_TOPIC
    });
  }

  replyToTopic(raw, topic_id) {
    return this.post('posts', {'raw': raw, 'topic_id': topic_id});
  }

  replyToPost(raw, topic_id, reply_to_post_number) {
    return this.post('posts', {
      'raw': raw,
      'topic_id': topic_id,
      'reply_to_post_number': reply_to_post_number
    });
  }

  getTopicAndReplies(topic_id) {
    return this.get('t/' + topic_id + '.json', {});
  }

  deleteTopic(topic_id) {
    return this.delete('t/' + topic_id, {});
  }

  updateTopic(slug, topic_id, title, category) {
    return this.put('t/' + slug + '/' + topic_id, {
      title: title,
      category: category
    });
  }

  updatePost(post_id, raw, edit_reason) {
    return this.put(
      'posts/' + post_id,
      {'post[raw]': raw, 'post[edit_reason]': edit_reason}
    );
  }

/////////////////////
// PRIVATE MESSAGES
/////////////////////

// NOTE - It appears as though private messages are really just topics with a private flag. The original pm is assigned
// a topic_id (and a post_id) and each reply is given a post_id.


  createPrivateMessage(title, raw, target_usernames) {
    return this.post('posts',
      {
        'title': title,
        'raw': raw,
        'target_usernames': target_usernames,
        'archetype': 'private_message'
      }
    );
  }

  getPrivateMessages(username) {
    return this.get('topics/private-messages/' + username + '.json', {});
  }

  getUnreadPrivateMessages(username, callback) {
    return this.get(
      'topics/private-messages-unread/' + username + '.json',
      {}
    );
  }

  getPrivateMessageThread(topic_id) {
    return this.getTopicAndReplies(topic_id);
  }

  getSentPrivateMessages(username) {
    return this.get('user_actions.json',
      {
        username: username,
        filter: actionTypeEnum.NEW_PRIVATE_MESSAGE
      }
    );
  }

  getReceivedPrivateMessages(username) {
    return this.get('user_actions.json',
      {
        username: username,
        filter: actionTypeEnum.GOT_PRIVATE_MESSAGE
      }
    );
  }

  replyToPrivateMessage(raw, topic_id) {
    return this.post('posts', {'raw': raw, 'topic_id': topic_id});
  }

/////////////////////
// SEARCH
/////////////////////

  searchForUser(username, callback) {
    return this.get('users/search/users.json', {term: username});
  }

  search(term) {
    return this.get('search.json', {term: term});
  }

///////////////
// CATEGORIES
///////////////

  createCategory(category) {
    return this.post('categories', {
      name: category.name,
      color: category.color || (~~(Math.random() * (1 << 24))).toString(16),
      text_color: category.text_color || 'FFFFFF',
      parent_category_id: category.parent_category_id || null
    });
  }

  getCategories(parameters) {
    return this.get('categories.json', parameters)
      .then(res => res.json());
  }

/////////////////////
// Synchronous HELPER
////////////////////


  getSync(url, parameters) {
    return this.get(url, parameters);
  }

  postSync(url, parameters) {
    return this.post(url, parameters);
  }

  putSync(url, parameters) {
    return this.put(url, parameters);
  }

  deleteSync(url, parameters) {
    return this.delete(url, parameters);
  }


///////////////////////////////////
// Synchronous TOPICS AND REPLIES
///////////////////////////////////

  createTopicSync(title, raw, category) {
    return this.postSync('posts', {'title': title, 'raw': raw, 'category': category, 'archetype': 'regular'});
  }

  getCreatedTopicsSync(username) {
    return this.getSync('topics/created-by/' + (username || this.api_username) + '.json');
  }

  updatePostSync(post_id, raw, edit_reason) {
    return this.putSync('posts/' + post_id, {
      post: {
        raw: raw,
        edit_reason: edit_reason
      }
    });
  }

}

export default Discourse;
