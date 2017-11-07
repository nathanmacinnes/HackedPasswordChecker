(function ($) {
  $(document).on('change', 'input[type=password]', function (event) {
    var
      $inputs,
      $passwordElement = $(event.target),
      $usernameElement,
      username;

    // Find the input immediately before the password to get the username
    $inputs = $('input:not([type=hidden]');
    $usernameElement = $inputs.eq($inputs.index($passwordElement) - 1);

    chrome.runtime.sendMessage({
      username: $usernameElement && $usernameElement.val(),
      password: $passwordElement.val(),
      hostname: window.location.hostname
    }, highlightPwnedField);

    function highlightPwnedField(response) {
      /*
        This may not execute, as the user will probably navigate away from the
        page (submit the login form) before the HIBP query comes back, but lets
        have it here just in case.
      */
      if (response.password) {
        $passwordElement.css({
          'box-Shadow': '0 0 5px rgba(255, 70, 70, 1)',
          'border': '1px solid rgba(255, 70, 70, 1)'
        });
        return;
      }
      $passwordElement.css({
        'box-Shadow': null,
        'border': null
      });
    }
  });
}(jQuery));
