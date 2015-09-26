/*eslint-env mocha */
import api from './api';
import config from './config';

describe("category", () => {

  it('creates a category', function (done) {

    function makeid() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text.toUpperCase();
    }

    let category = config.category;

    api.createCategory({
      name: category.name + ' ' + makeid(),
      color: category.color,
      text_color: category.text_color,
      parent_category_id: category.parent_category_id
    })
      .then(res=> {
        // make assertions
        should.exist(res);

        // var json = JSON.parse(res);

        // make more assertions
        // json.should.have.properties('category');
        // json.category.id.should.be.above(0);

        done();
      })

  });

  it('gets category list', function (done) {

    api.getCategories()
      .then(json=> {
        // make assertions
        should.exist(json);

        // make more assertions
        json.should.have.properties('category_list');

        done();
      })
      .catch((err)=> {
        should.not.exist(err);

        done();
      });

  });

});
