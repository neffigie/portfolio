// PocketBase serializes each registered callback into an isolated JSVM context.
// Keep every handler self-contained: outer helpers and closures are unavailable.

// biome-ignore lint/complexity/useArrowFunction: PocketBase hook remains compatible with conservative JSVM syntax.
onRecordAfterCreateSuccess(function (event) {
  var operation = "create";
  var recordId = event.record.id;
  var webhookUrl;
  var response;

  event.next();
  webhookUrl = process.env.AMPLIFY_BUILD_WEBHOOK_URL;
  if (typeof webhookUrl !== "string" || webhookUrl.trim() === "") {
    event.app
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
      event.app
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
    event.app
      .logger()
      .info(
        "Amplify publication build requested.",
        "operation",
        operation,
        "recordId",
        recordId,
      );
  } catch (_) {
    event.app
      .logger()
      .error(
        "Amplify publication webhook could not be reached.",
        "operation",
        operation,
        "recordId",
        recordId,
      );
  }
}, "entries");

// biome-ignore lint/complexity/useArrowFunction: PocketBase hook remains compatible with conservative JSVM syntax.
onRecordAfterUpdateSuccess(function (event) {
  var operation = "update";
  var recordId = event.record.id;
  var webhookUrl;
  var response;

  event.next();
  webhookUrl = process.env.AMPLIFY_BUILD_WEBHOOK_URL;
  if (typeof webhookUrl !== "string" || webhookUrl.trim() === "") {
    event.app
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
      event.app
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
    event.app
      .logger()
      .info(
        "Amplify publication build requested.",
        "operation",
        operation,
        "recordId",
        recordId,
      );
  } catch (_) {
    event.app
      .logger()
      .error(
        "Amplify publication webhook could not be reached.",
        "operation",
        operation,
        "recordId",
        recordId,
      );
  }
}, "entries");

// biome-ignore lint/complexity/useArrowFunction: PocketBase hook remains compatible with conservative JSVM syntax.
onRecordAfterDeleteSuccess(function (event) {
  var operation = "delete";
  var recordId = event.record.id;
  var webhookUrl;
  var response;

  event.next();
  webhookUrl = process.env.AMPLIFY_BUILD_WEBHOOK_URL;
  if (typeof webhookUrl !== "string" || webhookUrl.trim() === "") {
    event.app
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
      event.app
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
    event.app
      .logger()
      .info(
        "Amplify publication build requested.",
        "operation",
        operation,
        "recordId",
        recordId,
      );
  } catch (_) {
    event.app
      .logger()
      .error(
        "Amplify publication webhook could not be reached.",
        "operation",
        operation,
        "recordId",
        recordId,
      );
  }
}, "entries");
