

module.exports = function sendApiData( // this function will be used to send the data to the client in a specific format
    req,
    res,
    status = 404,
    messageStatus = "NotFound",
    message = "Not found",
    data = null,
    error = null,
    session = null,
    username = null,
) {
    if (req.user)
        username = req.user.username ? req.user.username : username;
    const DataToSend = {
        "status": status,
        "messageStatus": messageStatus,
        "message": message,
        "data": data,
        "error": typeof error == "object" ? error : String(error),
        "session": session,
        "username": username,
    };
    return res.status(status).send(DataToSend);
};
