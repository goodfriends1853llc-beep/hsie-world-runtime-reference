function typeMatches(value, type) {
  switch (type) {
    case 'null': return value === null;
    case 'array': return Array.isArray(value);
    case 'object': return value !== null && typeof value === 'object' && !Array.isArray(value);
    case 'string': return typeof value === 'string';
    case 'number': return typeof value === 'number' && Number.isFinite(value);
    case 'integer': return Number.isInteger(value);
    case 'boolean': return typeof value === 'boolean';
    default: return true;
  }
}

function validateFormat(format, value) {
  if (format === 'date-time') {
    return /^\d{4}-\d{2}-\d{2}T/.test(value) && !Number.isNaN(Date.parse(value));
  }
  if (format === 'uri') {
    return /^[A-Za-z][A-Za-z0-9+.-]*:[^\s]+$/.test(value);
  }
  return true;
}

export function validateJsonSchema(schema, value, path = '$') {
  const errors = [];

  if (schema.oneOf) {
    const variants = schema.oneOf.map((candidate) => validateJsonSchema(candidate, value, path));
    const passing = variants.filter((candidate) => candidate.length === 0).length;
    if (passing !== 1) errors.push(`${path}: expected exactly one oneOf branch; got ${passing}`);
    return errors;
  }

  if (Object.prototype.hasOwnProperty.call(schema, 'const') && value !== schema.const) {
    errors.push(`${path}: const mismatch`);
  }

  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((type) => typeMatches(value, type))) {
      return [`${path}: expected type ${types.join('|')}`];
    }
  }

  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`${path}: minLength ${schema.minLength}`);
    }
    if (schema.pattern && !(new RegExp(schema.pattern)).test(value)) {
      errors.push(`${path}: pattern mismatch`);
    }
    if (schema.format && !validateFormat(schema.format, value)) {
      errors.push(`${path}: invalid ${schema.format}`);
    }
  }

  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${path}: below minimum`);
    if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) errors.push(`${path}: below exclusiveMinimum`);
  }

  if (Array.isArray(value)) {
    if (schema.uniqueItems) {
      const seen = new Set();
      for (const item of value) {
        const key = JSON.stringify(item);
        if (seen.has(key)) errors.push(`${path}: duplicate array item`);
        seen.add(key);
      }
    }
    if (schema.items) {
      value.forEach((item, index) => errors.push(...validateJsonSchema(schema.items, item, `${path}[${index}]`)));
    }
  }

  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    if (schema.required) {
      for (const key of schema.required) {
        if (!(key in value)) errors.push(`${path}: missing required property ${key}`);
      }
    }

    if (schema.additionalProperties === false && schema.properties) {
      for (const key of Object.keys(value)) {
        if (!(key in schema.properties)) errors.push(`${path}: unexpected property ${key}`);
      }
    }

    if (schema.properties) {
      for (const [key, propertySchema] of Object.entries(schema.properties)) {
        if (key in value) errors.push(...validateJsonSchema(propertySchema, value[key], `${path}.${key}`));
      }
    }
  }

  return errors;
}

export function assertSchemaValid(schema, value, label) {
  const errors = validateJsonSchema(schema, value);
  if (errors.length) {
    throw new Error(`${label} failed schema validation:\n- ${errors.join('\n- ')}`);
  }
}
