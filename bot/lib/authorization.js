const { superUsers } = require('../config.json');

module.exports = {
  isAuthorized: (user, channel) => (
    // Allow super users in all instances
    superUsers.includes(user.id)
    // Or allow admins of non-DMChannel
    || (channel.type !== 'dm' && channel.permissionsFor(user).has('ADMINISTRATOR'))
  ),
  isCouncil: (user) => (
    user.roles && user.roles.cache.has('563049954256355331')
  ),
}