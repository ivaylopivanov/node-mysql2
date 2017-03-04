module.exports.AuthSwitchRequest = require('./auth_switch_request');
module.exports.AuthSwitchRequestMoreData = require('./auth_switch_response');
module.exports.AuthSwitchResponse = require('./auth_switch_request_more_data');
module.exports.BinlogDump = require('./binlog_dump');
module.exports.RegisterSlave = require('./register_slave');
module.exports.SSLRequest = require('./ssl_request');
module.exports.Handshake = require('./handshake');
module.exports.HandshakeResponse = require('./handshake_response');
module.exports.Query = require('./query');
module.exports.ResultSetHeader = require('./resultset_header');
module.exports.ColumnDefinition = require('./column_definition');
module.exports.TextRow = require('./text_row');
module.exports.BinaryRow = require('./binary_row');
module.exports.PrepareStatement = require('./prepare_statement');
module.exports.CloseStatement = require('./close_statement');
module.exports.PreparedStatementHeader = require('./prepared_statement_header');
module.exports.Execute = require('./execute');
module.exports.ChangeUser = require('./change_user');


var Buffer = require('safe-buffer').Buffer;

// simple packets:
var Packet = require('./packet');
module.exports.Packet = Packet;

module.exports.OK = function OK () {
};

module.exports.OK.toPacket = function (args, encoding) {
  args = args || {};
  var affectedRows = args.affectedRows || 0;
  var insertId = args.insertId || 0;
  var serverStatus = args.serverStatus || 0;
  var warningCount = args.warningCount || 0;
  var message = args.message || '';

  var length = 9 + Packet.lengthCodedNumberLength(affectedRows);
  length += Packet.lengthCodedNumberLength(insertId);

  var buffer = Buffer.allocUnsafe(length);
  var packet = new Packet(0, buffer, 0, length);
  packet.offset = 4;
  packet.writeInt8(0);
  packet.writeLengthCodedNumber(affectedRows);
  packet.writeLengthCodedNumber(insertId);
  packet.writeInt16(serverStatus);
  packet.writeInt16(warningCount);
  packet.writeString(message, encoding);
  packet._name = 'OK';
  return packet;
};

// warnings, statusFlags
module.exports.EOF = function EOF () {
};

module.exports.EOF.toPacket = function (warnings, statusFlags) {
  if (typeof warnings == 'undefined') {
    warnings = 0;
  }
  if (typeof statusFlags == 'undefined') {
    statusFlags = 0;
  }
  var packet = new Packet(0, Buffer.allocUnsafe(9), 0, 9);
  packet.offset = 4;
  packet.writeInt8(0xfe);
  packet.writeInt16(warnings);
  packet.writeInt16(statusFlags);
  packet._name = 'EOF';
  return packet;
};

module.exports.Error = function Error () {
};

module.exports.Error.toPacket = function (args, encoding) {
  var length = 13 + Buffer.byteLength(args.message, 'utf8');
  var packet = new Packet(0, Buffer.allocUnsafe(length), 0, length);
  packet.offset = 4;
  packet.writeInt8(0xff);
  packet.writeInt16(args.code);
  // TODO: sql state parameter
  packet.writeString('#_____', encoding);
  packet.writeString(args.message, encoding);
  packet._name = 'Error';
  return packet;
};
