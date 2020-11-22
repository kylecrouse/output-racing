const log = require('log-update');
const chalk = require('chalk');

function Logger(msg) {
	this.frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
	this.index = -1
	this.interval = 80
	this.msg = msg
	this.interval = null;

  this.loop = () => {
    this.interval = setInterval(() => this.refresh(), this.interval);
  }
  
  this.update = (msg) => {
    this.msg = msg;
  }
  
  this.refresh = () => {
    this.index = this.index + 1 >= this.frames.length ? 0 : this.index + 1;
    log(`${this.frames[this.index]} ${this.msg}`);
  }
  
  this.success = (msg) => {
    log(`🏁 ${msg}`);
    this.done();
  }
    
  this.error = (msg) => {
    log(`🛑 ${chalk.red(msg)}`);
    this.done();
  }
  
  this.done = () => {
    clearInterval(this.interval);
    log.done();    
  }

  this.loop();
}

module.exports = Logger