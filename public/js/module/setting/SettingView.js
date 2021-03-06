(function() {
  define(['backbone', 'module/setting/template'], function(Backbone, template) {
    var SettingView;
    SettingView = Backbone.View.extend({
      className: 'setting',
      events: {
        'click .write': 'write',
        'click .submit': 'submit',
        'change #mail': 'updateMail',
        'change #link': 'updateLink',
        'change #pass': 'updatePass',
        'change #name': 'updateName',
        'change #nick': 'updateNick',
        'change #motto': 'updateMotto',
        'change #avatar': 'updateAvatar'
      },
      initialize: function() {},
      submit: function() {
        return window.location.href = '/#main';
      },
      updateValue: function(key, value) {
        return App.user.config({
          key: key,
          value: value
        }).done(function(data) {
          $.localStorage(key, value);
          return App.notify('修改成功');
        });
      },
      updateMail: function() {
        var mail;
        mail = $('#mail').val();
        return this.updateValue('mail', mail);
      },
      updateLink: function() {
        var link;
        link = $('#link').val();
        return this.updateValue('link', link);
      },
      updateNick: function() {
        var nick;
        nick = $('#nick').val();
        return this.updateValue('nick', nick);
      },
      updateMotto: function() {
        var motto;
        motto = $('#motto').val();
        return this.updateValue('motto', motto);
      },
      render: function(callback) {
        var user;
        NProgress.start();
        user = App.getUser();
        if (user) {
          user.registered = true;
        }
        this.$el.html(template.page(user));
        NProgress.done();
        return callback(this.$el);
      },
      updateAvatar: function(event) {
        var file, reader, that;
        that = this;
        file = event.target.files[0];
        if (!/image\/\w+/.test(file.type)) {
          App.notify('请选择图片');
          return;
        }
        reader = new FileReader();
        reader.readAsDataURL(file);
        return reader.onload = function(event) {
          that.$el.find('img.preview')[0].src = this.result;
          return that.updateValue('avatar', this.result);
        };
      },
      updateName: function(event) {
        var name;
        name = $('#name').val();
        return this.updateValue('name', name);
      }
    });
    return SettingView;
  });

}).call(this);
