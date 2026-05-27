const AuditLog = require('../models/auditLog');

const writeAudit = ({ user_id = null, action, description, entity_type, entity_id }) => {
  AuditLog.create({
    user_id,
    service_name: 'appointment-service',
    action,
    description,
    entity_type,
    entity_id
  }).catch(() => {});
};

module.exports = { writeAudit };
