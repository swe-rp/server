var admin = require('firebase-admin');

/**
 * Lets you send a notification through FCM, with the notification
 * JSON having a title and body member.
 * @param {String} topic 
 * @param {JSON} notification 
 */
let sendNotification = (topic, notification) => {
    const payload = {
        topic: topic,
        notification: notification
    };
    return new Promise((resolve, reject) => {
        admin.messaging().send(payload)
            .then((response) => {
                resolve("Created message: " + response);
            })
            .catch((err) => {
                reject("Error: " + err);
            });
    });
}

/**
 * Subscribes a particular token to a topic.
 * @param {String} topic 
 * @param {String} token 
 */
let subscribeToTopic = (topic, token) => {
    return new Promise((resolve, reject) => {
        admin.messaging().subscribeToTopic([token], topic)
            .then((response) => {
                resolve("Created topic: " + response);
            })
            .catch((err) => {
                reject("Error: " + err);
            })
    })
}

module.exports = {
    sendNotification,
    subscribeToTopic
};