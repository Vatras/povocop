/**
 * Created by pjesek on 19.08.17.
 */
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}
const socketEventsEmitter = new MyEmitter();


module.exports = socketEventsEmitter;