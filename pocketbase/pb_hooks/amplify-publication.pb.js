function triggerAmplifyPublication(app, operation, recordId) {
  var webhookUrl = process.env.AMPLIFY_BUILD_WEBHOOK_URL;
  var response;
  if (typeof webhookUrl !== "string" || webhookUrl.trim() === "") {
    app
      .logger()
      .error(
        "Amplify publication webhook is not configured.",
        "operation",
        operation,
        "recordId",
        recordId,
      );
    return;
  }

  try {
    response = $http.send({
      body: "{}",
      headers: { "content-type": "application/json" },
      method: "POST",
      timeout: 10,
      url: webhookUrl,
    });
    if (response.statusCode < 200 || response.statusCode >= 300) {
      app
        .logger()
        .error(
          "Amplify publication webhook returned an unsuccessful response.",
          "operation",
          operation,
          "recordId",
          recordId,
          "statusCode",
          response.statusCode,
        );
      return;
    }
    app
      .logger()
      .info(
        "Amplify publication build requested.",
        "operation",
        operation,
        "recordId",
        recordId,
      );
  } catch (_) {
    app
      .logger()
      .error(
        "Amplify publication webhook could not be reached.",
        "operation",
        operation,
        "recordId",
        recordId,
      );
  }
}

function bindPublicationHook(register, operation) {
  // biome-ignore lint/complexity/useArrowFunction: PocketBase hook remains compatible with conservative JSVM syntax.
  register(function (event) {
    event.next();
    triggerAmplifyPublication(event.app, operation, event.record.id);
  }, "entries");
}

bindPublicationHook(onRecordAfterCreateSuccess, "create");
bindPublicationHook(onRecordAfterUpdateSuccess, "update");
bindPublicationHook(onRecordAfterDeleteSuccess, "delete");
