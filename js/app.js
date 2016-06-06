App = Ember.Application.create();

App.Router.map(function () {
    this.resource('index', {path: '/'}, function () {
        this.resource('posts', {path: '/'});
        this.resource('post', {path: '/posts/:post_id'});
    });
});

App.ApplicationController = Ember.ObjectController.extend({
    url: 'https://script.google.com/macros/s/AKfycbzmS_WQ5yxHLqr3n4Iu7iiPKB-EGJE5kF3rKB1UValE3IW8noBA/exec'
});

App.IndexRoute = Ember.Route.extend({
    model: function () {
        var controller = this.controllerFor('index');
        return controller.query('?limit=' + controller.get('limit'));
    }
});

App.IndexController = Ember.ObjectController.extend({
    limit: 5,
    total: 0,
    hasMore: true,
    actions: {
        more: function () {
            var model = this.get('model');
            ;
            this.query('?limit=' + this.get('limit') + '&offset=' + (this.get('total'))).then(function (data) {
                data.posts.forEach(function (post) {
                    model.posts.pushObject(post);
                });
            });
        }
    },
    query: function (query) {
        var url = this.controllerFor('application').get('url') + query,
            self = this;
        return $.getJSON(url).then(function (data) {
            data.posts.forEach(function (post) {
                post.date = new Date(post.created);
                post.created = post.date.toLocaleString();
            });
            var total = self.get('total') + data.posts.length;
            if (total >= +data.meta.total) {
                self.set('hasMore', false);
            }
            self.set('total', total);
            return data;
        });
    }
});

App.PostsRoute = Ember.Route.extend({
    controllerName: 'index'
});

App.PostRoute = Ember.Route.extend({
    model: function (params) {
        var posts = this.modelFor('index').posts,
            id = +params.post_id;
        for (var i = 0, len = posts.length; i < len; i += 1) {
            if (posts[i].id === id) {
                return posts[i];
            }
        }
    }
});

var showdown = new Showdown.converter();

Ember.Handlebars.helper('format-markdown', function (input) {
    return new Handlebars.SafeString(showdown.makeHtml(input));
});