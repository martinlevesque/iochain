
function parse(body) {
  try {
    let content = (JSON.stringify(body)).replace(/[^\x00-\x7F]/g, '');

    return {
      'content': content,
      'amount': body.mc_gross - body.tax,
      'user_id': body.custom,
      'status': body.payment_status
    };

  } catch(err) {
    sails.log.error(err);
    return {};
  }
}

function isCompleted(parsedBody) {
  try {
    return parsedBody.status.toLowerCase() === 'completed';
  } catch(err) {
    sails.log.error(err);
    return false;
  }
}

module.exports = {
  parse,
  isCompleted
};
