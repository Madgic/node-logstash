var base_filter = require('../lib/base_filter'),
  util = require('util');

function FilterPhpErrorMadgic() {
  base_filter.BaseFilter.call(this);
  this.mergeConfig({
    name: 'FilterPhpErrorMadgic',
  });
}

util.inherits(FilterPhpErrorMadgic, base_filter.BaseFilter);

FilterPhpErrorMadgic.prototype.process = function(data) {
  if (data.message.match(/PHP_ERROR/)) {
    return false;
  }
  if (data.message.match(/Uncaught exception/) && data.message.match(/Bad file descriptor/)) {
    data.aerospike_error = 'bad_file_descriptor';
    return data;
  }
  if (data.message.match(/AEROSPIKE_ERR_RECORD_BUSY/)) {
    this.last_error = 'record_busy';
    this.wait_call_user_func_array = true;
    return false;
  }
  if (this.wait_call_user_func_array && data.message.match(/call_user_func_array/)) {
    this.wait_call_user_func_array = false;
    data.aerospike_error = this.last_error;
    data.message = this.last;
    return data;
  }
  this.last = data.message;
  return false;
};

exports.create = function() {
  return new FilterPhpErrorMadgic();
};
