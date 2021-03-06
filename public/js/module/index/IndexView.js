(function() {
  define(['backbone', 'module/index/template'], function(Backbone, template) {
    var IndexView;
    IndexView = Backbone.View.extend({
      el: '#index',
      events: {
        'click .submit': 'submit',
        'click .switch .btn': 'switch',
        'keypress .mail-input, .pass-input': 'inputPress'
      },
      render: function(callback, data) {
        var that;
        that = this;
        that.user = App.getUser();
        that.$el.html(template.page({
          user: that.user
        }));
        if (data === 'login') {
          that["switch"]('login');
        } else if (data === 'register') {
          that["switch"]('register');
        }
        _.defer(function() {
          return that.$el.find('.mail-input').focus();
        });
        return callback(that.$el);
      },
      validateEmail: function(email) {
        var emailRegex;
        emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return emailRegex.test(email);
      },
      showErrorTip: function($dom, tip) {
        $dom.tipsy({
          trigger: 'manual',
          fade: true,
          gravity: 's'
        }).attr('original-title', tip).tipsy('show').focus();
        return _.delay(function() {
          return $dom.tipsy('hide');
        }, 2500);
      },
      inputPress: function(event) {
        if (event.keyCode === 13) {
          return this.submit();
        }
      },
      submit: function() {
        var that;
        that = this;
        if (that.user) {
          return App.user.check_token().done(function() {
            return workspace.navigate('main', {
              trigger: true,
              replace: false
            });
          }).fail(function() {
            App.notify("账户登录失效，请重新登录");
            App.setUser(null);
            that.user = null;
            that.$el.find('.author').hide();
            return that.$el.find('.login').show();
          });
        } else {
          return that.submitHandle();
        }
      },
      submitHandle: function() {
        var $mail, $pass, invoke, mail, pass, that;
        that = this;
        $mail = that.$el.find('.mail-input');
        $pass = that.$el.find('.pass-input');
        mail = $.trim($mail.val());
        pass = $pass.val();
        if (this.isRegisterState) {
          if (!mail || !this.validateEmail(mail)) {
            this.showErrorTip($mail, '邮箱地址不正确');
            return;
          }
          if (!pass || pass.length < 6 || pass.length > 16) {
            this.showErrorTip($pass, '密码位数在6－16之间');
            return;
          }
        } else {
          if (!mail) {
            this.showErrorTip($mail, '请输入邮箱');
            return;
          }
          if (!pass) {
            this.showErrorTip($pass, '请输入密码');
            return;
          }
        }
        NProgress.start();
        invoke = that.isRegisterState ? App.user.register : App.user.login;
        return invoke({
          mail: mail,
          pass: pass
        }).done(function(data) {
          var page;
          App.setUser(data);
          page = 'main';
          if (that.isRegisterState) {
            page = 'setting';
          }
          return workspace.navigate(page, {
            trigger: true,
            replace: false
          });
        }).fail(function(data) {
          that.showErrorTip($mail, data);
          return $mail.focus();
        });
      },
      "switch": function(event) {
        var $loginBtn, $mailInput, $passInput, $registerBtn, $switchBtn, isRegisterState;
        $switchBtn = this.$el.find('.switch');
        $switchBtn.find('.btn').removeClass('active');
        $registerBtn = $switchBtn.find('.register-btn');
        $loginBtn = $switchBtn.find('.login-btn');
        if (event === 'login') {
          isRegisterState = false;
          $loginBtn.addClass('active');
        } else if (event === 'register') {
          isRegisterState = true;
          $registerBtn.addClass('active');
        } else {
          isRegisterState = true;
          if ($(event.target).hasClass('register-btn')) {
            $registerBtn.addClass('active');
          } else {
            $loginBtn.addClass('active');
            isRegisterState = false;
          }
        }
        $mailInput = this.$el.find('.mail-input');
        $passInput = this.$el.find('.pass-input');
        this.isRegisterState = isRegisterState;
        if (isRegisterState) {
          $mailInput.attr('placeholder', '设置邮箱');
          $passInput.attr('placeholder', '设置密码');
          workspace.navigate('register', {
            trigger: false,
            replace: true
          });
        } else {
          $mailInput.attr('placeholder', '电子邮箱');
          $passInput.attr('placeholder', '登录密码');
          workspace.navigate('login', {
            trigger: false,
            replace: true
          });
        }
        return $mailInput.focus();
      }
    });
    return IndexView;
  });

}).call(this);
