(function ($) {
  var
    app = chrome.extension.getBackgroundPage().app,
    $header = $('header'),
    $template = $('template'),
    pwnCache = '';

  app.onPwnAdded(addPwnageToPopup);
  app.onPwnRemoved(removePwnageFromPopup);

  $(document).on('click', 'article .password', function (event) {
    $(event.target).toggleClass('hidden');
  });

  $('.random').parent().each(function (index, element) {
    var
      children = $(element).children('.random').removeClass('.visible'),
      count,
      random;
    count = children.length;
    random = Math.floor(Math.random() * count);
    children.eq(random).addClass('visible');
  });

  function addPwnageToPopup(id, pwnage) {
    var
      existing,
      $pwnageElement;
    existing = [].find.call($('article'), function (element) {
      return $(element).data('pwnId') === id;
    });
    if (existing) {
      $pwnageElement = $(existing);
    } else {
      $pwnageElement = $($template.html()).insertAfter($template);
      $pwnageElement.data('pwnId', id);
    }
    if (pwnage.username === undefined || pwnage.username === '') {
      $pwnageElement.find('.username').parent().hide();
    }
    $pwnageElement.find('.username').text(pwnage.username);
    $pwnageElement.find('.password').text(pwnage.password);
    $pwnageElement.find('.domain').text(pwnage.domain);
    $pwnageElement.on('click', '.remove', function () {
      $pwnageElement.remove();
      app.removePwn(id);
      pluralize();
    });
    pluralize();
  }
  function removePwnageFromPopup(id) {
    [].some.call($('article'), function (element) {
      if ($(element).data('pwnId') === id) {
        $(element).remove();
        return true;
      }
    });
  }

  function pluralize() {
    if ($('article').length === 0) {
      $('.no-pwnage').addClass('visible');
      return;
    }
    $('.no-pwnage').removeClass('visible');
    if ($('article').length > 1) {
      $(document.body).addClass('pluralize');
      return;
    }
    $(document.body).removeClass('pluralize');
  }

}(jQuery));
